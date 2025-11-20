"""
Pipeline do Scrapy para salvar itens no Django
"""
import os
import sys
import django
from twisted.internet import defer
from twisted.internet.threads import deferToThread

# Configuração do Django
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()


class DjangoPipeline:
    """
    Pipeline que salva os itens scraped no banco Django.
    Usa deferToThread para evitar conflitos de async/sync.
    """
    
    def __init__(self):
        self.items_saved = 0
        self.items_failed = 0
    
    @defer.inlineCallbacks
    def process_item(self, item, spider):
        """
        Processa cada item scraped.
        Usa defer.inlineCallbacks para compatibilidade com Twisted.
        """
        try:
            # Executa save em thread separada (evita blocking)
            result = yield deferToThread(self._save_item_to_db, item, spider)
            
            if result:
                self.items_saved += 1
                spider.logger.info(f"✓ Item salvo no banco: {item.get('nome_produto', 'N/A')}")
            else:
                self.items_failed += 1
                spider.logger.warning(f"✗ Falha ao salvar item: {item.get('nome_produto', 'N/A')}")
            
            return item
            
        except Exception as e:
            self.items_failed += 1
            spider.logger.error(f"Erro ao processar item na pipeline: {e}")
            # Não levanta exceção para não parar o spider
            return item
    
    def _save_item_to_db(self, item, spider):
        """
        Função síncrona que salva o item no Django.
        Executada em thread separada via deferToThread.
        """
        try:
            from produtos.models import Produto, Usuario, HistoricoPreco
            from django.utils import timezone
            
            # Validação dos dados
            usuario_id = item.get('usuario_id')
            url_produto = item.get('url_produto')
            nome_produto = item.get('nome_produto')
            preco_atual = item.get('preco_atual')
            
            if not all([usuario_id, url_produto, nome_produto, preco_atual]):
                spider.logger.error(f"Item com dados incompletos: {item}")
                return False
            
            # Busca ou cria o usuário
            try:
                usuario = Usuario.objects.get(id=usuario_id)
            except Usuario.DoesNotExist:
                spider.logger.error(f"Usuário {usuario_id} não encontrado")
                return False
            
            # Busca ou cria o produto
            produto, created = Produto.objects.get_or_create(
                url=url_produto,
                usuario=usuario,
                defaults={
                    'nome': nome_produto,
                    'preco_atual': preco_atual,
                    'preco_inicial': preco_atual,
                    'ultima_atualizacao': timezone.now(),
                }
            )
            
            # Se produto já existe, atualiza o preço
            if not created:
                # Só atualiza se o preço mudou
                if produto.preco_atual != preco_atual:
                    produto.preco_atual = preco_atual
                    produto.ultima_atualizacao = timezone.now()
                    produto.save()
                    
                    spider.logger.info(
                        f"Preço atualizado: {produto.nome} | "
                        f"R$ {produto.preco_atual:.2f}"
                    )
            
            # Cria registro no histórico
            HistoricoPreco.objects.create(
                produto=produto,
                preco=preco_atual,
                data_coleta=timezone.now()
            )
            
            return True
            
        except Exception as e:
            spider.logger.error(f"Erro ao salvar item no banco de dados: {e}")
            return False
    
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