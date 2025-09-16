import scrapy
import json
import time
import re
import random
import shutil
import undetected_chromedriver as uc
from selenium.webdriver.chrome.service import Service as ChromeService
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from bs4 import BeautifulSoup
from scrapy.http import HtmlResponse
from ..settings import USER_AGENTS

class SeleniumSpider(scrapy.Spider):
    name = 'selenium_spider'

    def __init__(self, *args, **kwargs):
        super(SeleniumSpider, self).__init__(*args, **kwargs)
        self.url = getattr(self, 'url', None)
        self.usuario_id = getattr(self, 'usuario_id', None)
        self.log_file = kwargs.get('log_file', 'scrapy_output.log')

    def start_requests(self):
        if not self.url or not self.usuario_id:
            self.logger.error("A URL e o usuario_id são obrigatórios")
            return
        
        yield scrapy.Request(url='http://example.com', callback=self.parse, dont_filter=True)

    def parse(self, response):
        options = Options()
        
        chrome_executable_path = (
            shutil.which('google-chrome') or
            shutil.which('chromium-browser') or
            shutil.which('chrome')
        )

        if not chrome_executable_path:
            self.logger.error("Navegador Chrome/Chromium não encontrado. Instale-o ou defina o caminho no spider.")
            return

        options.binary_location = chrome_executable_path
        options.add_argument(f'user-agent={random.choice(USER_AGENTS)}')
        options.add_argument('--no-sandbox')
        options.add_argument('--disable-gpu')
        options.add_argument('--start-maximized')
        options.add_argument('--disable-dev-shm-usage')
        options.add_argument('--disable-extensions')
        options.add_argument('--disable-infobars')
        options.add_argument('--disable-notifications')
        options.add_argument('--disable-popup-blocking')
        driver = None

        try:
            self.logger.info(f"Iniciando o scraping com Selenium para a URL: {self.url}")
            driver = uc.Chrome(
                service=ChromeService(ChromeDriverManager().install()),
                options=options,
                headless=False
            )
            driver.get(self.url) # type: ignore
            
            WebDriverWait(driver, 40).until(
                EC.all_of(
                    EC.presence_of_element_located((By.CSS_SELECTOR, 'script[type="application/ld+json"]')),
                    EC.presence_of_element_located((By.CSS_SELECTOR, 'h1.ui-pdp-title')),
                    EC.presence_of_element_located((By.CSS_SELECTOR, 'span.andes-money-amount__fraction'))
                )
            )
            self.logger.info("Página carregada e elementos de dados encontrados.")

            time.sleep(random.uniform(1.5, 5.0))

            selenium_response = HtmlResponse(url=self.url, body=driver.page_source, encoding='utf-8')
            yield from self.parse_product_page(selenium_response, driver)   
        except Exception as e:
            self.logger.error(f"Ocorreu um erro durante o scraping com Selenium: {e}")
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

    def get_specific_selectors(self, url):
        """
        MELHORIA: Estratégia de Especialização por Domínio.
        Retorna um dicionário com listas de seletores específicos para cada site.
        """
        # GRUPO B2W (Americanas, Submarino, Shoptime) - Estruturas costumam ser parecidas
        if 'americanas.com' in url or 'submarino.com' in url or 'shoptime.com' in url:
            self.logger.info("Detectado site do grupo B2W.")
            return {
                'nome': [
                    'h1[class*="src__Title"]', # Padrão mais novo
                    'h1.product-title__Title-sc-1hlrxcw-0' # Padrão antigo
                ],
                'preco': [
                    'div[class*="src__BestPrice"]', # Padrão mais novo
                    'div[class*="price__SalesPrice"]' # Padrão antigo
                ]
            }
        
        # GRUPO VIA (Casas Bahia, Ponto, Extra) - Estruturas muito similares
        if 'casasbahia.com' in url or 'pontofrio.com' in url or 'extra.com' in url:
            self.logger.info("Detectado site do grupo Via.")
            return {
                'nome': [
                    'h1.css-1j4z0b6', # Padrão mais recente (classes geradas)
                    'h1.product-title' # Padrão mais comum
                ],
                'preco': [
                    '.product-price-value', # Preço principal
                    '.product-price' # Contêiner geral do preço
                ]
            }
            
        # MERCADO LIVRE
        if 'mercadolivre.com' in url:
            self.logger.info("Detectado Mercado Livre.")
            return {
                'nome': ['h1.ui-pdp-title'],
                'preco': [
                    'div.ui-pdp-price__main-container span.andes-money-amount__fraction',
                    'span.andes-money-amount__fraction' # Seletor mais genérico
                ]
            }
            
        # AMAZON
        if 'amazon.com' in url:
            self.logger.info("Detectado Amazon.")
            return {
                'nome': ['span#productTitle'],
                'preco': [
                    'span.a-price-whole',
                    'div[data-cy="price-recipe"] .a-price-whole',
                    '#corePrice_feature_div span.a-offscreen', # Outro padrão comum
                    '#price_inside_buybox'
                ]
            }
            
        # MAGAZINE LUIZA
        if 'magazineluiza.com' in url:
            self.logger.info("Detectado Magazine Luiza.")
            return {
                'nome': [
                    'h1[data-testid="heading-product-title"]', # Padrão atual
                    'h1.header-product__title' # Padrão antigo
                ],
                'preco': [
                    'p[data-testid="price-value"]', # Padrão atual
                    'span.price-template__text' # Padrão antigo
                ]
            }

        # KABUM!
        if 'kabum.com.br' in url:
            self.logger.info("Detectado KaBuM!.")
            return {
                'nome': ['h1[class*="nameProduct"]'],
                'preco': ['h4[class*="finalPrice"]']
            }
            
        # PICHAU
        if 'pichau.com.br' in url:
            self.logger.info("Detectado Pichau.")
            return {
                'nome': ['h1[class*="productName"]'],
                'preco': ['div[class*="productPrice"]']
            }
            
        # ALIEXPRESS
        if 'aliexpress.com' in url:
            self.logger.info("Detectado AliExpress.")
            return {
                'nome': [
                    'h1[data-pl="product-title"]',
                    'h1.product-title-text'
                ],
                'preco': [
                    'div.product-price-value',
                    'span.uniform-banner-box-price'
                ]
            }
            
        # SHOPEE
        if 'shopee.com.br' in url:
            self.logger.info("Detectado Shopee.")
            return {
                'nome': ['div._44qCZd > span'], # Classes ofuscadas, a estrutura é mais estável
                'preco': ['div.flex.items-center > div._9_6_3J']
            }

        # Adicione outros `if` para mais sites aqui...
        return None # Retorna None se não for um site mapeado

    def parse_product_page(self, response, driver):
        soup = BeautifulSoup(response.body, 'html.parser')

        nome_produto = None
        preco_produto_str = None

        try:
            json_ld_script = soup.find('script', type='application/ld+json')
            if json_ld_script:
                data = json.loads(json_ld_script.string) # type: ignore
                if data.get('@type') == 'Product':
                    nome_produto = data.get('name')
                    offers = data.get('offers', {})
                    if isinstance(offers, list): offers = offers[0] if offers else {}
                    price = offers.get('price') or offers.get('lowPrice')
                    if price:
                        preco_produto_str = str(price)
                        self.logger.info(f"Dados extraídos via JSON-LD: Nome='{nome_produto}', Preço='{preco_produto_str}'")
        except Exception as e:
            self.logger.warning(f"Não foi possível extrair dados do JSON-LD: {e}. Tentando seletores HTML.")
        
        specific_selectors = self.get_specific_selectors(response.url)
        if specific_selectors:
            self.logger.info(f"Usando seletores específicos para o domínio: {response.url}")
            if not nome_produto:
                for selector in specific_selectors['nome']:
                    el = soup.select_one(selector)
                    if el: nome_produto = el.text.strip(); break
            if not preco_produto_str:
                for selector in specific_selectors['preco']:
                    el = soup.select_one(selector)
                    if el: preco_produto_str = el.text.strip(); break


        if not nome_produto or not preco_produto_str:
            self.logger.info("Usando seletores genéricos como fallback.")
            # NOME (Fallback)

            selectors_nome = [
                'h1.ui-pdp-title', 'span#productTitle', 'h1[class*="product_title__"]',
                'h1.dsvia-h1', 'id#productTitle', 'h1', 'h1[class*="title"]', 'h1[class*="name"]'
            ]
            for selector in selectors_nome:
                resultado = soup.select_one(selector)
                if resultado:
                    nome_produto = resultado.text.strip()
                    self.logger.info(f"Nome do produto encontrado via seletor CSS: '{selector}'")
                    break

        if not preco_produto_str:
            # Lista Híbrida de Seletores de Preço
            selectors_preco = [
                'div.ui-pdp-price__main-container span.andes-money-amount__fraction',
                'p[data-testid="product-price-value"]',
                'span.dsvia-price-value',
                'h4[class*="finalPrice__"]',
                'a-price-whole',
                'span.a-price-whole',
                'span.andes-money-amount__fraction',
                'div[class*="product-price"]',
                'span[class*="price"]', 
                'div[class*="price"]',
                'div[class*="Price__price__"]',
                'span[class*="Price__price__"]',
                'div[class*="ProductPrice__container__"]',
                'p[data-testid="product-price-value"]', 
                'span.dsvia-price-value',
                'h4[class*="finalPrice__"]',
                'span[class*="Price__price__"]',
                '//span[contains(text(), "R$")]',
                '//p[contains(text(), "R$")]'
            ]
            
            for selector in selectors_preco:
                try:
                    # Usamos select_one para CSS e xpath para XPath
                    el = response.css(selector)[0] if not selector.startswith('/') else response.xpath(selector)[0]
                    preco_produto_str = el.get().strip()
                    if preco_produto_str: break
                except (IndexError, AttributeError):
                    continue

        self.logger.info(f"DEBUG: Valores antes da condição final: nome_produto='{nome_produto}', preco_produto_str='{preco_produto_str}'")

        # --- ETAPA 4: LIMPEZA E VALIDAÇÃO FINAL DOS DADOS ---
        if nome_produto and preco_produto_str:
            # MELHORIA: Regex mais robusto para limpar o preço
            preco_limpo = re.search(r'(\d[\d,.]*\d)', preco_produto_str.replace('.', ''))
            if preco_limpo:
                try:
                    preco_final = float(preco_limpo.group(0).replace(',', '.'))
                    self.logger.info(f"SUCESSO! Produto: '{nome_produto}', Preço: {preco_final}")
                    yield {
                        'usuario_id': self.usuario_id, 'url_produto': self.url,
                        'nome_produto': nome_produto, 'preco_atual': preco_final
                    }
                    return # Encerra o método com sucesso
                except ValueError as e:
                    self.logger.error(f"FALHA na conversão do preço: '{preco_limpo.group(0)}'. Erro: {e}")
            else:
                self.logger.error(f"FALHA: Regex não encontrou um padrão de preço válido em '{preco_produto_str}'")

        else:
            self.logger.error(f"FALHA: Não foi possível extrair nome e/ou preço para a URL: {self.url}")
            driver.save_screenshot('screenshot_falha.png')
            self.logger.info("Screenshot da falha salvo como 'screenshot_falha.png'")
