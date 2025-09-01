# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://docs.scrapy.org/en/latest/topics/item-pipeline.html

import re
import hashlib
from urllib.parse import urlparse, urlunparse
from api.models import ProdutosMonitoradosExternos, Vendedor, HistoricoPrecos
from asgiref.sync import sync_to_async

class DjangoPipeline:
    def get_canonical_url(self, url):
        """Gera uma URL canônica removendo parâmetros de consulta e fragmentos."""
        parsed_url = urlparse(url)
        # Reconstrói a URL apenas com scheme, netloc e path
        canonical_url = urlunparse((parsed_url.scheme, parsed_url.netloc, parsed_url.path, '', '', ''))
        return canonical_url

    async def process_item(self, item, spider):
        try:
            # O ID do vendedor é o mesmo que o ID do usuário
            vendedor = await sync_to_async(Vendedor.objects.get)(pk=item['usuario_id'])
            
            # --- Lógica da URL Canônica e Hash ---
            original_url = item['url_produto']
            canonical_url = self.get_canonical_url(original_url)
            url_hash = hashlib.sha256(canonical_url.encode('utf-8')).hexdigest()

            # Limpa o preço para garantir que seja um número flutuante válido
            preco_final = None
            if item.get('preco_str'):
                # Remove tudo que não for dígito ou vírgula
                preco_limpo_str = re.sub(r'[^\d,]', '', item['preco_str'])
                # Substitui a última vírgula por um ponto para conversão para float
                if ',' in preco_limpo_str:
                    partes = preco_limpo_str.rsplit(',', 1)
                    preco_formatado = partes[0].replace(',', '') + '.' + partes[1]
                else:
                    preco_formatado = preco_limpo_str
                
                try:
                    preco_final = float(preco_formatado)
                except (ValueError, TypeError):
                    spider.logger.warning(f"Não foi possível converter o preço '{item['preco_str']}' para float.")
                    preco_final = None

            # Atualiza ou cria o objeto no banco de dados de forma assíncrona
            produto, created = await sync_to_async(ProdutosMonitoradosExternos.objects.update_or_create)(
                vendedor=vendedor,
                url_hash=url_hash,
                defaults={
                    'url_produto': original_url,
                    'nome_produto': item.get('nome_produto', 'Nome não encontrado'),
                    'preco_atual': preco_final
                }
            )

            # Se o preço foi extraído com sucesso, cria um registro no histórico
            if preco_final is not None:
                await sync_to_async(HistoricoPrecos.objects.create)(
                    produto_monitorado=produto,
                    preco=preco_final
                )
                spider.logger.info(f"Registro de histórico de preço criado para o produto ID {produto.id}.")

            if created:
                spider.logger.info(f"Produto novo criado com ID {produto.id} para o vendedor (usuário ID {vendedor.pk}).")
            else:
                spider.logger.info(f"Produto ID {produto.id} atualizado com sucesso para o vendedor (usuário ID {vendedor.pk})!")

        except Vendedor.DoesNotExist:
            spider.logger.error(f"Vendedor com usuário ID {item['usuario_id']} não encontrado no banco.")
        except Exception as e:
            spider.logger.error(f"Erro ao salvar no banco: {e}")

        return item