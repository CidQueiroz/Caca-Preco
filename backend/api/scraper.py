import cloudscraper
from bs4 import BeautifulSoup
import re
import logging

# Configure logging para aparecer no console do Django
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def extract_product_info(url: str) -> dict:
    """
    Extrai o nome e o preço do produto de uma URL usando cloudscraper para contornar proteções.
    """
    # O cloudscraper gerencia seus próprios headers, então não precisamos mais definir um User-Agent etc.
    scraper = cloudscraper.create_scraper()

    try:
        logger.info(f"FAST_PATH: Enviando requisição com cloudscraper para {url}")
        response = scraper.get(url, timeout=15) # Timeout um pouco maior para o desafio do Cloudflare
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')

        # --- Extração do Nome do Produto com Fallbacks ---
        nome_produto = None
        nome_tag = soup.find('span', {'id': 'productTitle'})
        if nome_tag:
            nome_produto = nome_tag.get_text(strip=True)
            logger.info("FAST_PATH: Nome encontrado via #productTitle.")
        else:
            nome_tag = soup.find('h1', {'id': 'title'})
            if nome_tag:
                nome_produto = nome_tag.get_text(strip=True)
                logger.info("FAST_PATH: Nome encontrado via #title.")

        # --- Extração do Preço com Fallbacks ---
        preco_atual = None
        preco_str = None
        preco_inteiro_tag = soup.find('span', {'class': 'a-price-whole'})
        preco_fracao_tag = soup.find('span', {'class': 'a-price-fraction'})
        if preco_inteiro_tag and preco_fracao_tag:
            preco_str = f"{preco_inteiro_tag.get_text(strip=True)}{preco_fracao_tag.get_text(strip=True)}"
            logger.info(f"FAST_PATH: Preço encontrado via 'a-price-whole': {preco_str}")
        else:
            preco_tag = soup.select_one('#corePrice_feature_div span.a-offscreen, #price_inside_buybox')
            if preco_tag:
                preco_str = preco_tag.get_text(strip=True)
                logger.info(f"FAST_PATH: Preço encontrado via seletor alternativo: {preco_str}")

        if preco_str:
            preco_limpo = re.sub(r'[^\d,]', '', preco_str).replace(',', '.')
            if preco_limpo:
                preco_atual = float(preco_limpo)

        if not nome_produto or preco_atual is None:
            logger.warning(f"FAST_PATH: Falha ao extrair nome ou preço. Nome: {nome_produto}, Preço: {preco_atual}")
            debug_html_path = "fast_path_failure.html"
            with open(debug_html_path, "w", encoding="utf-8") as f:
                f.write(soup.prettify())
            logger.warning(f"FAST_PATH: O HTML recebido foi salvo em '{debug_html_path}' para análise.")
            return None

        logger.info(f"FAST_PATH SUCESSO: Nome='{nome_produto}', Preço={preco_atual}")
        return {'nome_produto': nome_produto, 'preco_atual': preco_atual}

    except Exception as e:
        logger.error(f"FAST_PATH ERRO: Ocorreu um erro inesperado ao processar {url}: {e}")
        return None