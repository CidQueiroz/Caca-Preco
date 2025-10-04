from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
import re
import logging

logger = logging.getLogger(__name__)

def extract_with_playwright(url: str) -> dict | None:
    """
    Tenta extrair dados da página usando Playwright como uma etapa intermediária.
    """
    logger.info(f"MEDIUM_PATH: Iniciando extração com Playwright para {url}")
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(url, timeout=60000) # Timeout de 60 segundos
            
            # Espera um seletor comum de produto para garantir que a página carregou
            page.wait_for_selector('h1, #productTitle, .ui-pdp-title', timeout=30000)

            html_content = page.content()
            soup = BeautifulSoup(html_content, 'html.parser')
            browser.close()

            # Reutiliza a mesma lógica de extração do scraper original
            # --- Extração do Nome do Produto ---
            nome_produto = None
            selectors_nome = ['span#productTitle', 'h1#title', 'h1.ui-pdp-title', 'h1[class*="title"]']
            for selector in selectors_nome:
                nome_tag = soup.select_one(selector)
                if nome_tag:
                    nome_produto = nome_tag.get_text(strip=True)
                    logger.info(f"MEDIUM_PATH: Nome encontrado via seletor '{selector}'.")
                    break

            # --- Extração do Preço ---
            preco_atual = None
            preco_str = None
            selectors_preco = ['#corePrice_feature_div span.a-offscreen', '#price_inside_buybox', '.a-price-whole', '.andes-money-amount__fraction']
            for selector in selectors_preco:
                preco_tag = soup.select_one(selector)
                if preco_tag:
                    # Tratamento especial para preço da Amazon (whole + fraction)
                    if 'a-price-whole' in selector:
                        inteiro = preco_tag.get_text(strip=True)
                        fracao_tag = soup.select_one('.a-price-fraction')
                        fracao = fracao_tag.get_text(strip=True) if fracao_tag else '00'
                        preco_str = f"{inteiro}{fracao}"
                    else:
                        preco_str = preco_tag.get_text(strip=True)
                    
                    logger.info(f"MEDIUM_PATH: Preço encontrado via seletor '{selector}'.")
                    break

            if preco_str:
                preco_limpo = re.sub(r'[^\d,]', '', preco_str).replace(',', '.')
                if preco_limpo:
                    preco_atual = float(preco_limpo)

            if not nome_produto or preco_atual is None:
                logger.warning(f"MEDIUM_PATH: Falha ao extrair nome ou preço com Playwright. Nome: {nome_produto}, Preço: {preco_atual}")
                return None

            logger.info(f"MEDIUM_PATH SUCESSO: Nome='{nome_produto}', Preço={preco_atual}")
            return {'nome_produto': nome_produto, 'preco_atual': preco_atual}

    except Exception as e:
        logger.error(f"MEDIUM_PATH ERRO: Ocorreu um erro inesperado com Playwright: {e}")
        return None
