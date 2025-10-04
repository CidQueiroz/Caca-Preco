
from celery import shared_task
import logging
import asyncio
from requests.exceptions import RequestException

try:
    # Tenta importar o erro de Timeout do Playwright
    from playwright.async_api import TimeoutError as PlaywrightTimeoutError
except ImportError:
    # Se o Playwright não estiver instalado, cria uma classe de exceção dummy
    # para evitar que o programa quebre na inicialização.
    class PlaywrightTimeoutError(Exception):
        pass

# Funções do serviço de scraping original
from .scraping_service import (
    fast_path_scrape,
    long_path_scrape,
    get_specific_selectors,
    save_monitoring_data as sync_save_monitoring_data
)

# Novas estratégias que criamos
from .scraping_strategies import (
    scrape_with_internal_api,
    scrape_with_requests_html,
    scrape_with_playwright_stealth
)

# Define exceções que são recuperáveis e devem acionar uma nova tentativa
RETRYABLE_EXCEPTIONS = (RequestException, PlaywrightTimeoutError)

@shared_task(
    bind=True,
    autoretry_for=RETRYABLE_EXCEPTIONS,
    retry_kwargs={'max_retries': 3, 'countdown': 60},  # 3 retentativas com 1 min de espera entre elas
    task_time_limit=900,  # Timeout global de 15 minutos para a tarefa
    acks_late=True # Garante que a tarefa só seja confirmada após o sucesso
)
def run_scraping_pipeline(self, url: str, user_id: int):
    """
    Tarefa Celery que orquestra o pipeline de scraping, com retentativas automáticas e validação.
    """
    # Log aprimorado para incluir a contagem de tentativas
    retry_count = self.request.retries
    max_retries = self.request.retries + 4 # Correção aqui
    logging.info(f"PIPELINE: Iniciando para a URL: {url} (Usuário: {user_id}) - Tentativa {retry_count + 1}/{max_retries}")

    try:
        scraped_data = None
        strategy_used = None

        # --- ESTRATÉGIA 1: FAST-PATH (REQUESTS + BEAUTIFULSOUP) ---
        scraped_data = fast_path_scrape(url)
        if scraped_data:
            strategy_used = 'fast_path'

        # --- ESTRATÉGIA 2: MEDIUM-PATH (APIs, RENDERIZAÇÃO LEVE) ---
        if not scraped_data:
            logging.info("PIPELINE: Fast-path falhou. Tentando estratégias de Medium-path.")
            selectors = get_specific_selectors(url)
            
            if selectors and selectors.get('api_url'):
                logging.info("PIPELINE: Tentando estratégia de API Interna.")
                api_result = scrape_with_internal_api(selectors['api_url'])
                if api_result and api_result['success']:
                    # A lógica para processar o resultado da API precisa ser implementada
                    pass
            
            if not scraped_data and selectors:
                logging.info("PIPELINE: Tentando estratégia com requests-html.")
                name_selector = selectors['nome'][0] if selectors.get('nome') else None
                price_selector = selectors['preco'][0] if selectors.get('preco') else None

                if name_selector and price_selector:
                    html_result = scrape_with_requests_html(url, price_selector, name_selector)
                    if html_result and html_result['success']:
                        scraped_data = (html_result['data']['name'], float(html_result['data']['price'].replace('.', '').replace(',', '.')))
                        strategy_used = 'requests_html'

        # --- ESTRATÉGIA 3: LONG-PATH (NAVEGADOR COMPLETO) ---
        if not scraped_data:
            logging.info("PIPELINE: Medium-path falhou. Tentando estratégias de Long-path.")
            selectors = get_specific_selectors(url)

            if selectors:
                logging.info("PIPELINE: Tentando estratégia com Playwright-Stealth.")
                name_selector = selectors['nome'][0] if selectors.get('nome') else None
                price_selector = selectors['preco'][0] if selectors.get('preco') else None

                if name_selector and price_selector:
                    playwright_result = asyncio.run(scrape_with_playwright_stealth(url, price_selector, name_selector))
                    if playwright_result and playwright_result['success']:
                        scraped_data = (playwright_result['data']['name'], float(playwright_result['data']['price'].replace('.', '').replace(',', '.')))
                        strategy_used = 'playwright_stealth'

            if not scraped_data:
                logging.info("PIPELINE: Playwright falhou. Tentando fallback final com Selenium Scrapy.")
                scraped_data = long_path_scrape(url, str(user_id))
                if scraped_data:
                    strategy_used = 'selenium_scrapy'

        # --- FASE FINAL: VALIDAÇÃO E SALVAMENTO ---
        if not scraped_data:
            logging.warning(f"PIPELINE: FALHA - Todos os caminhos de scraping falharam para a URL: {url}")
            return {'status': 'FAILURE', 'reason': 'Não foi possível extrair os dados do produto. O site pode estar bloqueando o acesso ou a estrutura da página mudou.'}

        nome_produto, preco_atual = scraped_data

        # --- ETAPA DE VALIDAÇÃO DOS DADOS EXTRAÍDOS ---
        if not nome_produto or not isinstance(nome_produto, str) or len(nome_produto.strip()) == 0:
            logging.error(f"PIPELINE: FALHA DE VALIDAÇÃO - Nome do produto inválido: '{nome_produto}' para URL: {url}")
            return {'status': 'FAILURE', 'reason': f'Nome do produto extraído é inválido.'}

        if not preco_atual or not isinstance(preco_atual, (int, float)) or preco_atual <= 0:
            logging.error(f"PIPELINE: FALHA DE VALIDAÇÃO - Preço do produto inválido: '{preco_atual}' para URL: {url}")
            return {'status': 'FAILURE', 'reason': f'Preço extraído é inválido ou zero.'}

        nome_produto = nome_produto.strip()
        logging.info(f"PIPELINE: Sucesso via '{strategy_used}'. Produto: '{nome_produto}', Preço: {preco_atual}")

        # Usando a função de salvamento síncrona diretamente
        save_result = sync_save_monitoring_data(url, nome_produto, preco_atual, user_id)

        if save_result:
            logging.info(f"PIPELINE: SUCESSO - Dados para a URL {url} salvos com sucesso.")
            return {'status': 'SUCCESS', 'message': f'O produto foi monitorado com sucesso!'}
        else:
            logging.error(f"PIPELINE: FALHA - Erro ao salvar os dados para a URL: {url}.")
            return {'status': 'FAILURE', 'reason': 'Os dados foram extraídos, mas ocorreu um erro interno ao salvá-los.'}
            
    except Exception as e:
        # O `autoretry_for` cuida da lógica de retentativa.
        # Este bloco `except` captura a exceção final se todas as tentativas falharem,
        # ou qualquer outra exceção não esperada que não seja recuperável.
        logging.critical(f"PIPELINE: Erro crítico ou final após {retry_count + 1} tentativas para a URL {url}: {e}", exc_info=True)
        return {'status': 'FAILURE', 'reason': 'Ocorreu um erro grave e não recuperável durante o processo.'}
