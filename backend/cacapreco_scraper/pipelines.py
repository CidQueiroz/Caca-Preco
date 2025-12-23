import os
import sys
import django
from twisted.internet import defer
from twisted.internet.threads import deferToThread
from asgiref.sync import sync_to_async
from django.utils import timezone
from itemadapter import ItemAdapter


# Configuração do Django
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from scraper.models import ProdutosMonitoradosExternos, ScrapedData
from api.models import Vendedor
from django.contrib.auth import get_user_model

User = get_user_model()
logger = logging.getLogger(__name__)

class DjangoPipeline:
    def __init__(self):
        self.items_saved = 0
        self.items_failed = 0
    
    @defer.inlineCallbacks
    def process_item(self, item, spider):
        # Transforma Item Scrapy em dict
        adapter = ItemAdapter(item)
        data = adapter.asdict()
        
        # Chama o salvamento síncrono (Django ORM não é async safe por padrão no Scrapy antigo)
        self._save_to_db(data, spider)
        return item
    
    def _save_to_db(self, data, spider):
        try:
            usuario_id = data.get('usuario_id')
            url = data.get('url_produto')
            nome = data.get('nome_produto')
            preco = data.get('preco_atual')

            if not all([usuario_id, url, nome, preco]):
                return

            # 1. Salva log bruto (ScrapedData)
            user = User.objects.get(pk=usuario_id)
            ScrapedData.objects.create(
                user=user,
                url=url,
                product_name=nome,
                product_price=preco
            )

            # 2. Atualiza monitoramento se for Vendedor
            # Tenta achar o vendedor associado a este usuário
            try:
                vendedor = Vendedor.objects.get(usuario=user)
                # Tenta atualizar o produto monitorado
                # Nota: A lógica aqui depende de como você identifica univocamente o produto
                # Estou usando a URL como chave
                obj, created = ProdutosMonitoradosExternos.objects.update_or_create(
                    vendedor=vendedor,
                    url_produto=url,
                    defaults={
                        'nome_produto': nome,
                        'preco_atual': preco,
                        'ultima_coleta': timezone.now()
                    }
                )
                logger.info(f"Produto monitorado atualizado: {obj.nome_produto}")
            except Vendedor.DoesNotExist:
                pass # É apenas um usuário comum, não vendedor

        except Exception as e:
            logger.error(f"Erro ao salvar no banco: {e}")


    def close_spider(self, spider):
        """Chamado quando o spider é fechado"""
        spider.logger.info(
            f"Pipeline finalizada - "
            f"Salvos: {self.items_saved} | "
            f"Falhas: {self.items_failed}"
        )


class ValidationPipeline:
    """
    Pipeline para validar e limpar dados antes de salvar.
    Deve ser executada ANTES da DjangoPipeline.
    """
    
    def process_item(self, item, spider):
        """Valida e limpa os dados"""
        
        # Valida campos obrigatórios
        required_fields = ['usuario_id', 'url_produto', 'nome_produto', 'preco_atual']
        for field in required_fields:
            if field not in item or item[field] is None:
                spider.logger.error(f"Campo obrigatório ausente: {field}")
                raise ValueError(f"Campo obrigatório ausente: {field}")
        
        # Limpa nome do produto
        nome = item['nome_produto'].strip()
        if len(nome) < 3:
            raise ValueError(f"Nome do produto muito curto: '{nome}'")
        item['nome_produto'] = nome
        
        # Valida preço
        try:
            preco = float(item['preco_atual'])
            if preco <= 0:
                raise ValueError(f"Preço inválido: {preco}")
            if preco > 1000000:  # Sanity check
                spider.logger.warning(f"Preço muito alto (suspeito): R$ {preco:.2f}")
            item['preco_atual'] = preco
        except (ValueError, TypeError) as e:
            raise ValueError(f"Preço inválido: {item['preco_atual']} - {e}")
        
        # Valida URL
        url = item['url_produto']
        if not url.startswith('http'):
            raise ValueError(f"URL inválida: {url}")
        
        spider.logger.debug(f"Item validado: {nome} - R$ {preco:.2f}")
        return item


class DebugPipeline:
    """
    Pipeline de debug para ver os itens antes de salvar.
    Útil para desenvolvimento.
    """
    
    def process_item(self, item, spider):
        """Loga informações do item"""
        spider.logger.info("=" * 60)
        spider.logger.info("ITEM SCRAPED:")
        for key, value in item.items():
            spider.logger.info(f"  {key}: {value}")
        spider.logger.info("=" * 60)
        return item