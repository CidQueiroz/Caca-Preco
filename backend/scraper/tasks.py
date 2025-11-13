from celery import shared_task
import subprocess
from pathlib import Path
import requests
from bs4 import BeautifulSoup
from .models import ScrapedData
from django.contrib.auth import get_user_model
from .scraping_service import fast_path_scrape, medium_path_scrape, long_path_scrape, save_monitoring_data, get_specific_selectors # Import new functions
import logging
import json # Import json for parsing Scrapy output

logger = logging.getLogger(__name__)

@shared_task
def run_long_path_scrape(url, user_id):
    """
    Executa o spider Scrapy/Selenium como um processo separado a partir de uma tarefa Celery.
    """
    # O diretório onde o comando 'scrapy' será executado
    scrapy_project_dir = Path(__file__).resolve().parent.parent / 'cacapreco_scraper'
    
    # Comando para executar o spider, passando os argumentos
    command = [
        'xvfb-run', '--auto-servernum', '--server-args', '-screen 0 1280x1024x24', # Added xvfb-run for headless browser
        'scrapy',
        'crawl',
        'selenium_spider',
        '-a', f'url={url}',
        '-a', f'usuario_id={user_id}',
        '-o', '-:json' # Output as JSON to stdout using the URI:FORMAT syntax
    ]
    
    try:
        # Executa o comando a partir do diretório do projeto Scrapy
        # O log do Scrapy será capturado pelo Celery worker
        process = subprocess.run(
            command,
            cwd=str(scrapy_project_dir),
            capture_output=True,
            text=True,
            check=True,  # Lança uma exceção se o processo falhar
            timeout=300 # 5 minutes timeout
        )
        
        logger.info(f"--- LONG PATH STDERR: {process.stderr} ---")
        
        # Parse the JSON output from Scrapy
        scraped_items = json.loads(process.stdout)
        if scraped_items:
            data = scraped_items[0]
            return {"status": "success", "message": "Scraping concluído e dados salvos.", "data": data}
        else:
            logger.error(f"LONG PATH: A saída do spider era um array JSON vazio para a URL: {url}")
            return {"status": "error", "message": f"LONG PATH: Spider executado, mas não produziu saída para a URL: {url}"}

    except subprocess.CalledProcessError as e:
        error_message = f"Erro ao executar o scraping para a URL {url}. Erro: {e.stderr}"
        logger.error(error_message)
        return {"status": "error", "message": error_message}
    except FileNotFoundError:
        error_message = "Erro: O comando 'scrapy' não foi encontrado. Verifique se o Scrapy está instalado no ambiente do Celery worker."
        logger.error(error_message)
        return {"status": "error", "message": error_message}
    except subprocess.TimeoutExpired:
        error_message = f"LONG PATH: Timeout ao executar o spider para a URL {url}."
        logger.error(error_message)
        return {"status": "error", "message": error_message}
    except json.JSONDecodeError:
        error_message = f"LONG PATH: Falha ao decodificar a saída JSON do spider para a URL: {url}. Saída: {process.stdout}"
        logger.error(error_message)
        return {"status": "error", "message": error_message}
    except Exception as e:
        error_message = f"LONG PATH: Erro inesperado ao executar o spider para a URL {url}: {e}"
        logger.error(error_message)
        return {"status": "error", "message": error_message}

@shared_task(bind=True)
def run_scraping_pipeline(self, url, user_id):
    User = get_user_model()
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        logger.error(f"User with ID {user_id} not found.")
        return {"status": "error", "message": f"User with ID {user_id} not found."}

    scraped_data = None
    
    # Obter seletores específicos para a URL
    specific_selectors = get_specific_selectors(url)
    name_selector = None
    price_selector = None
    if specific_selectors:
        name_selector = specific_selectors['nome'][0] if specific_selectors['nome'] else None
        price_selector = specific_selectors['preco'][0] if specific_selectors['preco'] else None

    # Tenta Fast Path
    logger.info(f"Attempting Fast Path for URL: {url}")
    result_fast = fast_path_scrape(url)
    if result_fast and result_fast[0] and result_fast[1]: # Check if name and price are returned
        scraped_data = {'nome_produto': result_fast[0], 'preco_atual': result_fast[1]}
        logger.info(f"Fast Path successful for URL: {url}")
    else:
        # Tenta Medium Path
        if name_selector and price_selector:
            logger.info(f"Fast Path failed. Attempting Medium Path for URL: {url}")
            result_medium = medium_path_scrape(url, name_selector, price_selector)
            if result_medium and result_medium[0] and result_medium[1]:
                scraped_data = {'nome_produto': result_medium[0], 'preco_atual': result_medium[1]}
                logger.info(f"Medium Path successful for URL: {url}")
            else:
                # Tenta Long Path
                logger.info(f"Medium Path failed. Attempting Long Path for URL: {url}")
                result_long = run_long_path_scrape(url, user_id) # Call the Celery task directly
                if result_long and result_long.get('status') == 'success':
                    scraped_data = result_long['data']
                    logger.info(f"Long Path successful for URL: {url}")
                else:
                    logger.error(f"All scraping paths failed for URL: {url}")
                    return {"status": "error", "message": "Falha ao raspar os dados após todas as tentativas."}
        else:
            logger.warning(f"No specific selectors found for URL: {url}. Skipping Medium Path and attempting Long Path.")
            # Tenta Long Path diretamente se não houver seletores para o Medium Path
            result_long = run_long_path_scrape(url, user_id)
            if result_long and result_long.get('status') == 'success':
                scraped_data = result_long['data']
                logger.info(f"Long Path successful for URL: {url}")
            else:
                logger.error(f"All scraping paths failed for URL: {url}")
                return {"status": "error", "message": "Falha ao raspar os dados após todas as tentativas."}

    if scraped_data:
        # Save data using the service function
        monitoring_result = save_monitoring_data(
            url_produto=url,
            nome_produto=scraped_data.get('nome_produto'),
            preco_atual=scraped_data.get('preco_atual'),
            usuario_id=user_id
        )
        if monitoring_result:
            return {"status": "success", "message": "Scraping concluído e dados salvos.", "data": scraped_data}
        else:
            return {"status": "error", "message": "Scraping concluído, mas falha ao salvar os dados."}
    else:
        return {"status": "error", "message": "Falha ao raspar os dados."}
