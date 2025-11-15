import os
import sys
import django
from asgiref.sync import sync_to_async

# Adiciona o caminho do projeto Django ao sys.path
# Isso é necessário para que o Scrapy encontre as configurações e modelos do Django
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))
os.environ['DJANGO_SETTINGS_MODULE'] = 'core.settings'
django.setup()

from scraper.models import ScrapedData
from api.models import Usuario

class DjangoPipeline:
    @sync_to_async
    def _save_item_to_db(self, item, spider):
        """
        Método síncrono para interagir com o banco de dados Django.
        """
        usuario_id = item.get('usuario_id')
        url = item.get('url_produto')
        nome = item.get('nome_produto')
        preco = item.get('preco_atual')

        if not all([usuario_id, url, nome, preco]):
            spider.logger.error(f"Item incompleto recebido pela pipeline: {item}. Descartando.")
            return

        try:
            user = Usuario.objects.get(id=usuario_id)
            ScrapedData.objects.create(
                user=user,
                url=url,
                product_name=nome,
                product_price=preco
            )
            spider.logger.info(f"✅ Item salvo no banco de dados: {nome}")
        except Usuario.DoesNotExist:
            spider.logger.error(f"Usuário com ID {usuario_id} não encontrado. Item não salvo.")
        except Exception as e:
            spider.logger.error(f"Erro ao salvar item no banco de dados: {e}")

    async def process_item(self, item, spider):
        """
        Processa o item de forma assíncrona, chamando o método síncrono de forma segura.
        """
        await self._save_item_to_db(item, spider)
        return item
