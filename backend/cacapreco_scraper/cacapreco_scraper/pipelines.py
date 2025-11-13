import os
import sys
import django

# Adiciona o caminho do projeto Django ao sys.path
# Isso é necessário para que o Scrapy encontre as configurações e modelos do Django
sys.path.append(os.path.join(os.path.dirname(__file__), '..', '..'))
os.environ['DJANGO_SETTINGS_MODULE'] = 'core.settings'
django.setup()

from scraper.models import ScrapedData
from api.models import Usuario

class DjangoPipeline:
    def process_item(self, item, spider):
        # O 'item' aqui é o dicionário que o spider retorna (yield)
        usuario_id = item.get('usuario_id')
        url = item.get('url_produto')
        nome = item.get('nome_produto')
        preco = item.get('preco_atual')

        if not all([usuario_id, url, nome, preco]):
            spider.logger.error(f"Item incompleto recebido pela pipeline: {item}. Descartando.")
            return item

        try:
            user = Usuario.objects.get(id=usuario_id)
            ScrapedData.objects.create(
                user=user,
                url=url,
                product_name=nome,
                product_price=preco
            )
            spider.logger.info(f"Item salvo no banco de dados: {nome}")
        except Usuario.DoesNotExist:
            spider.logger.error(f"Usuário com ID {usuario_id} não encontrado. Item não salvo.")
        except Exception as e:
            spider.logger.error(f"Erro ao salvar item no banco de dados: {e}")
        
        return item
