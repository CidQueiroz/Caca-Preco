import scrapy
import json
import time
import re
import undetected_chromedriver as uc
from selenium.webdriver.chrome.service import Service as ChromeService
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from bs4 import BeautifulSoup
from scrapy.http import HtmlResponse
import sys # Added this line

from ..settings import USER_AGENTS

class SeleniumSpider(scrapy.Spider):
    name = 'selenium_spider'

    def start_requests(self):
        self.url = getattr(self, 'url', None)
        self.usuario_id = getattr(self, 'usuario_id', None)

        if not self.url or not self.usuario_id:
            self.logger.error("A URL e o usuario_id são obrigatórios")
            return

        options = Options()
        options.add_argument('--headless')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-gpu')
        options.add_argument('--disable-extensions')
        options.add_argument('--disable-infobars')
        options.add_argument('--start-maximized')
        options.add_argument('--disable-notifications')
        options.add_argument('--disable-popup-blocking')
        driver = None

        try:
            self.logger.info(f"Iniciando o scraping para a URL: {self.url}")
            driver = uc.Chrome(service=ChromeService(ChromeDriverManager().install()), options=options)
            driver.get(self.url)
            
            # Espera explícita aprimorada
            WebDriverWait(driver, 40).until(
                EC.any_of(
                    EC.presence_of_element_located((By.CSS_SELECTOR, 'script[type="application/ld+json"]')),
                    EC.presence_of_element_located((By.CSS_SELECTOR, 'h1.ui-pdp-title')),
                    EC.presence_of_element_located((By.CSS_SELECTOR, 'span.andes-money-amount__fraction'))
                )
            )
            self.logger.info("Página carregada e elementos de dados encontrados.")

            # Adiciona um tempo extra para garantir que scripts dinâmicos carreguem
            time.sleep(5)

            response = HtmlResponse(url=self.url, body=driver.page_source, encoding='utf-8')
            yield from self.parse_product_page(response, driver)
        except Exception as e:
            self.logger.error(f"Ocorreu um erro durante o scraping com Selenium: {e}")
            # Adicionado para depuração: Salva uma imagem da tela no momento do erro.
            if driver:
                screenshot_path = 'screenshot_falha_selenium.png'
                driver.save_screenshot(screenshot_path)
                self.logger.info(f"Screenshot da falha salvo como '{screenshot_path}'")
        finally:
            if driver:
                try:
                    driver.quit()
                    self.logger.info("Driver do Selenium finalizado.")
                except OSError as e:
                    self.logger.warning(f"Erro ao finalizar o driver do Selenium (pode ser ignorado se o processo já foi encerrado): {e}")
                finally:
                    driver = None

    def parse_product_page(self, response, driver):
        soup = BeautifulSoup(response.body, 'html.parser')

        nome_produto = None
        preco_produto_str = None

        # --- 1. Tenta extrair dados do JSON-LD (mais confiável) ---
        try:
            json_ld_script = soup.find('script', type='application/ld+json')
            if json_ld_script:
                data = json.loads(json_ld_script.string)
                if data.get('@type') == 'Product':
                    nome_produto = data.get('name')
                    offers = data.get('offers', {})
                    if isinstance(offers, list):
                        offers = offers[0] if offers else {}
                    
                    price = offers.get('price') or offers.get('lowPrice')
                    if price:
                        preco_produto_str = str(price)
                        self.logger.info(f"Dados extraídos via JSON-LD: Nome='{nome_produto}', Preço='{preco_produto_str}'")
        except Exception as e:
            self.logger.warning(f"Não foi possível extrair dados do JSON-LD: {e}")

        # --- 2. Se o JSON-LD falhar ou não contiver os dados, usa seletores CSS ---
        if not nome_produto:
            selectors_nome = [
                'h1.ui-pdp-title', 'span#productTitle', 'h1[class*="product_title__"]',
                'h1.dsvia-h1', 'h1'
            ]
            for selector in selectors_nome:
                resultado = soup.select_one(selector)
                if resultado:
                    nome_produto = resultado.text.strip()
                    self.logger.info(f"Nome do produto encontrado via seletor CSS: '{selector}'")
                    break

        if not preco_produto_str:
            selectors_preco = [
                'div.ui-pdp-price__main-container span.andes-money-amount__fraction',
                'p[data-testid="product-price-value"]',
                'span.dsvia-price-value',
                'h4[class*="finalPrice__"]',
                
                'span.a-price-whole',
                'span.andes-money-amount__fraction',
                'div[class*="product-price"]',
                'span[class*="price"]', 
                'div[class*="price"]',
                'div[class*="Price__price__"]',
                'span[class*="Price__price__"]',
                'div[class*="ProductPrice__container__"]',
            ]
            for selector in selectors_preco:
                resultado = soup.select_one(selector)
                if resultado:
                    preco_bruto = resultado.text.strip()
                    # Regex mais robusto para extrair o valor numérico
                    match = re.search(r'(\d[\d,. ]*\d)', preco_bruto.replace('.', ''))
                    if match:
                        preco_produto_str = match.group(0).replace(',', '.')
                        self.logger.info(f"Preço encontrado via seletor CSS: '{selector}' -> '{preco_produto_str}'")
                        break

        self.logger.info(f"DEBUG: Valores antes da condição final: nome_produto='{nome_produto}', preco_produto_str='{preco_produto_str}'")
        if nome_produto and preco_produto_str:
            # Limpeza e conversão do preço
            # Remove tudo que não for dígito, vírgula ou ponto, e substitui vírgula por ponto para float
            preco_limpo = re.sub(r'[^\d,.]', '', str(preco_produto_str)).replace(',', '.')
            try:
                preco_final = float(preco_limpo)
            except ValueError as e:
                self.logger.error(f"FALHA: Erro ao converter preço para float: '{preco_limpo}'. Erro: {e}")
                driver.save_screenshot('screenshot_falha_preco.png')
                self.logger.info("Screenshot da falha de preço salvo como 'screenshot_falha_preco.png'")
                return # Exit if price conversion fails

            yield {
                'usuario_id': getattr(self, 'usuario_id', None),
                'url_produto': response.url,
                'nome_produto': nome_produto,
                'preco_atual': preco_final
            }
        else:
            self.logger.error(f"FALHA: Não foi possível extrair nome e/ou preço para a URL: {response.url}")
            driver.save_screenshot('screenshot_falha.png')
            self.logger.info("Screenshot da falha salvo como 'screenshot_falha.png'")