import os
import sys
import hashlib
import json
from datetime import datetime
from urllib.parse import urlparse, urlunparse
from crochet import setup, wait_for
from asgiref.sync import sync_to_async

from scrapy.crawler import CrawlerRunner
from scrapy.utils.project import get_project_settings

# Adiciona o caminho do projeto Django e do Scrapy ao sys.path
# para que possamos importar seus módulos
django_project_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
scraper_project_path = os.path.abspath(os.path.join(django_project_path, 'cacapreco_scraper'))
sys.path.insert(0, django_project_path)
sys.path.insert(0, scraper_project_path)

# Configura o Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
import django
django.setup()

# Agora podemos importar os módulos do Django e do Scrapy
from api.scraper import extract_product_info
from cacapreco_scraper.spiders.selenium_spider import SeleniumSpider
from api.models import ProdutosMonitoradosExternos, Vendedor

# Configura o crochet para rodar o Scrapy em um thread separado no contexto do Django
setup()

def _get_canonical_url_hash(url):
    """Gera o hash SHA-256 de uma URL canônica para consistência com o pipeline."""
    parsed_url = urlparse(url)
    canonical_url = urlunparse((parsed_url.scheme, parsed_url.netloc, parsed_url.path, '', '', ''))
    return hashlib.sha256(canonical_url.encode('utf-8')).hexdigest()

@sync_to_async
def _get_product_from_db(url, usuario_id):
    """Busca o produto no banco de dados após o scraping."""
    try:
        vendedor = Vendedor.objects.get(pk=usuario_id)
        url_hash = _get_canonical_url_hash(url)
        produto = ProdutosMonitoradosExternos.objects.get(vendedor=vendedor, url_hash=url_hash)
        return {
            'usuario_id': produto.vendedor.id,
            'url_produto': produto.url_produto,
            'nome_produto': produto.nome_produto,
            'preco_atual': produto.preco_atual,
        }
    except (Vendedor.DoesNotExist, ProdutosMonitoradosExternos.DoesNotExist):
        return None
    except Exception as e:
        print(f"Erro ao buscar produto no DB: {e}")
        return None

@sync_to_async
def _save_fast_path_result(url, usuario_id, fast_path_result):
    """
    Função assíncrona para salvar o resultado do Fast Path no banco de dados.
    Se falhar, salva em um arquivo de log de fallback.
    """
    try:
        vendedor = Vendedor.objects.get(pk=usuario_id)
        url_hash = _get_canonical_url_hash(url)
        produto, created = ProdutosMonitoradosExternos.objects.update_or_create(
            vendedor=vendedor,
            url_hash=url_hash,
            defaults={
                'url_produto': url,
                'nome_produto': fast_path_result['nome_produto'],
                'preco_atual': fast_path_result['preco_atual'],
            }
        )
        print(f"Sucesso ao salvar no DB. Produto {'criado' if created else 'atualizado'}.")
        return True
    except Exception as e:
        print(f"ERRO ao salvar resultado do Fast Path no DB: {e}")
        
        # LÓGICA DE FALLBACK PARA ARQUIVO DE LOG
        try:
            fallback_data = {
                'timestamp': datetime.utcnow().isoformat() + 'Z',
                'error': str(e),
                'usuario_id': usuario_id,
                'url': url,
                'scraped_data': fast_path_result
            }
            # O 'a' significa 'append' (anexar), para não sobrescrever falhas anteriores.
            # O arquivo será criado na raiz do backend.
            with open("db_fallback.log", "a", encoding="utf-8") as f:
                f.write(json.dumps(fallback_data, ensure_ascii=False) + '\n')
            print("INFO: Dados da falha de DB salvos em 'db_fallback.log'")
        except Exception as file_e:
            print(f"ERRO CRÍTICO: Falha ao salvar no banco de dados E no arquivo de fallback: {file_e}")
            
        return False

def get_product_data(url: str, usuario_id: str):
    """
    Orquestrador de scraping com lógica refinada:
    - Se a extração falhar, usa o Slow Path.
    - Se a extração funcionar mas o DB falhar, retorna os dados com um aviso.
    """
    print("--- Iniciando Fast Path (Requests + BeautifulSoup) ---")
    fast_path_result = extract_product_info(url)

    # Cenário 1: Fast Path conseguiu extrair os dados
    if fast_path_result and fast_path_result.get('preco_atual') is not None:
        print("--- SUCESSO no Fast Path (Extração) ---")
        
        saved_successfully = _save_fast_path_result(url, usuario_id, fast_path_result)
        
        if saved_successfully:
            print("--- SUCESSO no Fast Path (Salvo no DB) ---")
            return {'status': 'success', 'data': fast_path_result}
        else:
            # A extração funcionou, mas o DB falhou. Retorna os dados sem monitorar.
            print("--- FALHA ao salvar no DB. Retornando dados sem monitoramento. ---")
            return {'status': 'scraped_but_not_saved', 'data': fast_path_result}

    # Cenário 2: Fast Path falhou na extração, acionar Slow Path
    print("--- Falha na extração do Fast Path. Iniciando Slow Path (Scrapy + Selenium) ---")
    
    _run_selenium_spider_and_wait(url, usuario_id)
    
    print("--- Slow Path finalizado. Buscando resultado no banco de dados. ---")
    produto_final = _get_product_from_db(url, usuario_id)

    if produto_final:
        print("--- SUCESSO no Slow Path (dados obtidos do DB) ---")
        return {'status': 'success', 'data': produto_final}
    
    print("--- FALHA GERAL (Fast e Slow Path não encontraram dados) ---")
    return {'status': 'failed', 'data': None}

@wait_for(timeout=300.0) # Timeout de 5 minutos
def _run_selenium_spider_and_wait(url: str, usuario_id: str):
    """
    Função interna para rodar o spider Selenium e esperar sua conclusão.
    Não retorna nada, pois o pipeline salva o resultado.
    """
    # Obtém as configurações do projeto Scrapy
    settings_path = 'cacapreco_scraper.settings'
    os.environ['SCRAPY_SETTINGS_MODULE'] = settings_path
    settings = get_project_settings()

    runner = CrawlerRunner(settings)
    
    # Inicia o spider passando os argumentos necessários
    deferred = runner.crawl(SeleniumSpider, url=url, usuario_id=usuario_id)
    return deferred
