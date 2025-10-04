# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://docs.scrapy.org/en/latest/topics/item-pipeline.html

import hashlib
from urllib.parse import urlparse, urlunparse
from scraper.models import ProdutosMonitoradosExternos, HistoricoPrecos
from api.models import Vendedor
from asgiref.sync import sync_to_async

class DjangoPipeline:
    """
    Pipeline para salvar os itens raspados no banco de dados Django.
    """

    def get_canonical_url_hash(self, url):
        """Gera o hash SHA-256 de uma URL canônica."""
        parsed_url = urlparse(url)
        canonical_url = urlunparse((parsed_url.scheme, parsed_url.netloc, parsed_url.path, '', '', ''))
        return hashlib.sha256(canonical_url.encode('utf-8')).hexdigest()

    async def process_item(self, item, spider):
        """
        Processa e salva o item no banco de dados de forma assíncrona.
        """
        try:
            vendedor = await sync_to_async(Vendedor.objects.get)(pk=item['usuario_id'])
            
            url = item['url_produto']
            nome_produto = item.get('nome_produto', 'Nome não encontrado')
            preco_atual = item.get('preco_atual') # Vem do spider como float ou None

            # O método save() do modelo ProdutosMonitoradosExternos já cuida da geração do hash.
            # Usamos update_or_create para manter a lógica atômica.
            url_hash = self.get_canonical_url_hash(url)

            produto, created = await sync_to_async(ProdutosMonitoradosExternos.objects.update_or_create)(
                vendedor=vendedor,
                url_hash=url_hash,  # A busca é feita pelo hash
                defaults={
                    'url_produto': url,
                    'nome_produto': nome_produto,
                    'preco_atual': preco_atual,
                }
            )

            # Se o preço foi extraído com sucesso, cria um registro no histórico
            if preco_atual is not None:
                await sync_to_async(HistoricoPrecos.objects.create)(
                    produto_monitorado=produto,
                    preco=preco_atual
                )
                spider.logger.info(f"Histórico de preço salvo para o produto ID {produto.id} (Preço: {preco_atual}).")

            if created:
                spider.logger.info(f"Novo produto monitorado criado (ID: {produto.id}) para o vendedor {vendedor.nome_loja}.")
            else:
                spider.logger.info(f"Produto monitorado atualizado (ID: {produto.id}) para o vendedor {vendedor.nome_loja}.")

        except Vendedor.DoesNotExist:
            spider.logger.error(f"FALHA NO PIPELINE: Vendedor com ID {item['usuario_id']} não foi encontrado.")
        except Exception as e:
            spider.logger.error(f"FALHA NO PIPELINE: Ocorreu um erro inesperado ao processar o item para a URL {item.get('url_produto')}: {e}")

        return item