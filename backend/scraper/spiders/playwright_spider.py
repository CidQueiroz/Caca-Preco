import scrapy
import json
import re
import random
from playwright.sync_api import sync_playwright, TimeoutError as PlaywrightTimeout
from bs4 import BeautifulSoup
from scrapy.http import HtmlResponse
from ..scrapy_settings import USER_AGENTS
import sys
import os

# Adiciona o diretório correto ao path para imports
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

# Adiciona o diretório correto ao path para imports
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

# Import da função de conversão de preço
try:
    from scraper.utils.price_utils import parse_brazilian_price
except ImportError:
    # Fallback caso o import falhe
    import re
    def parse_brazilian_price(price_str):
        if not price_str:
            raise ValueError("String vazia")
        clean_str = re.sub(r'[^\d,.]', '', str(price_str).strip())
        if ',' in clean_str:
            if '.' in clean_str:
                clean_str = clean_str.replace('.', '').replace(',', '.')
            else:
                clean_str = clean_str.replace(',', '.')
        return float(clean_str)


# Definir USER_AGENTS aqui se não existir em settings
USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
]

class PlaywrightSpider(scrapy.Spider):
    """
    Long Path Spider usando Playwright.
    Mais rápido, estável e moderno que Selenium.
    """
    name = 'playwright_spider'

    def __init__(self, *args, **kwargs):
        super(PlaywrightSpider, self).__init__(*args, **kwargs)
        self.url = getattr(self, 'url', None)
        self.usuario_id = getattr(self, 'usuario_id', None)
        self.log_file = kwargs.get('log_file', 'scrapy_output.log')

    def start_requests(self):
        if not self.url or not self.usuario_id:
            self.logger.error("URL e usuario_id são obrigatórios")
            return
        
        yield scrapy.Request(url='http://example.com', callback=self.parse, dont_filter=True)

    def parse(self, response):
        """Executa o scraping usando Playwright"""
        with sync_playwright() as p:
            try:
                self.logger.info(f"[LONG PATH - Playwright] Iniciando scraping: {self.url}")
                
                # Lança o navegador
                browser = p.chromium.launch(
                    headless=True,  # Modo headless para produção
                    args=[
                        '--no-sandbox',
                        '--disable-setuid-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-blink-features=AutomationControlled',
                    ]
                )
                
                # Cria contexto com user agent aleatório
                context = browser.new_context(
                    user_agent=random.choice(USER_AGENTS),
                    viewport={'width': 1920, 'height': 1080},
                    locale='pt-BR',
                )
                
                # Abre nova página
                page = context.new_page()
                
                # Intercepta detecção de automação
                page.add_init_script("""
                    Object.defineProperty(navigator, 'webdriver', {
                        get: () => undefined
                    });
                """)
                
                # Navega para a URL
                page.goto(self.url, wait_until='networkidle', timeout=40000)
                
                # Aguarda elementos críticos carregarem
                self._wait_for_product_elements(page)
                
                # Pequeno delay aleatório (anti-bot)
                page.wait_for_timeout(random.randint(1500, 3000))
                
                # Pega o HTML renderizado
                html_content = page.content()
                
                # Cria response do Scrapy
                playwright_response = HtmlResponse(
                    url=self.url, 
                    body=html_content, 
                    encoding='utf-8'
                )
                
                # Processa a página
                yield from self.parse_product_page(playwright_response, page)
                
            except PlaywrightTimeout as e:
                self.logger.error(f"[LONG PATH] Timeout ao carregar: {e}")
                if 'page' in locals():
                    page.screenshot(path='screenshot_timeout.png')
                    
            except Exception as e:
                self.logger.error(f"[LONG PATH] Erro durante scraping: {e}")
                if 'page' in locals():
                    page.screenshot(path='screenshot_erro.png')
                    
            finally:
                if 'browser' in locals():
                    browser.close()
                    self.logger.info("[LONG PATH] Navegador fechado")

    def _wait_for_product_elements(self, page):
        """Aguarda elementos essenciais do produto"""
        try:
            # Tenta aguardar JSON-LD (mais confiável)
            page.wait_for_selector('script[type="application/ld+json"]', timeout=10000)
            self.logger.info("JSON-LD encontrado")
        except:
            self.logger.warning("JSON-LD não encontrado, usando seletores HTML")
            
        # Aguarda pelo menos um seletor de preço comum
        selectors_preco = [
            'span.andes-money-amount__fraction',  # Mercado Livre
            'p[data-testid="price-value"]',       # Magazine Luiza
            'span.a-price-whole',                  # Amazon
            'div[class*="price"]',                 # Genérico
            'span[class*="price"]',                # Genérico
        ]
        
        for selector in selectors_preco:
            try:
                page.wait_for_selector(selector, timeout=5000)
                self.logger.info(f"Elemento de preço encontrado: {selector}")
                break
            except:
                continue

    def get_specific_selectors(self, url):
        """
        Retorna seletores específicos por domínio.
        Mesma lógica do selenium_spider.py
        """
        # Mercado Livre
        if 'mercadolivre.com' in url:
            return {
                'nome': ['h1.ui-pdp-title'],
                'preco': [
                    'div.ui-pdp-price__main-container span.andes-money-amount__fraction',
                    'span.andes-money-amount__fraction'
                ]
            }
        
        # Amazon
        if 'amazon.com' in url:
            return {
                'nome': ['span#productTitle'],
                'preco': [
                    'span.a-price-whole',
                    'div[data-cy="price-recipe"] .a-price-whole',
                    '#corePrice_feature_div span.a-offscreen',
                ]
            }
        
        # Magazine Luiza
        if 'magazineluiza.com' in url:
            return {
                'nome': [
                    'h1[data-testid="heading-product-title"]',
                    'h1.header-product__title'
                ],
                'preco': [
                    'p[data-testid="price-value"]',
                    'span.price-template__text'
                ]
            }
        
        # Grupo B2W (Americanas, Submarino, Shoptime)
        if any(x in url for x in ['americanas.com', 'submarino.com', 'shoptime.com']):
            return {
                'nome': [
                    'h1[class*="src__Title"]',
                    'h1.product-title__Title-sc-1hlrxcw-0'
                ],
                'preco': [
                    'div[class*="src__BestPrice"]',
                    'div[class*="price__SalesPrice"]'
                ]
            }
        
        # Grupo Via (Casas Bahia, Ponto, Extra)
        if any(x in url for x in ['casasbahia.com', 'pontofrio.com', 'extra.com']):
            return {
                'nome': [
                    'h1.css-1j4z0b6',
                    'h1.product-title'
                ],
                'preco': [
                    '.product-price-value',
                    '.product-price'
                ]
            }
        
        # KaBuM
        if 'kabum.com.br' in url:
            return {
                'nome': ['h1[class*="nameProduct"]'],
                'preco': ['h4[class*="finalPrice"]']
            }
        
        # AliExpress
        if 'aliexpress.com' in url:
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
        
        # Shopee
        if 'shopee.com.br' in url:
            return {
                'nome': ['div._44qCZd > span'],
                'preco': ['div.flex.items-center > div._9_6_3J']
            }
        
        return None

    def parse_product_page(self, response, page):
        """Extrai dados do produto"""
        soup = BeautifulSoup(response.body, 'html.parser')
        
        nome_produto = None
        preco_produto_str = None
        
        # TENTATIVA 1: JSON-LD (mais confiável)
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
                        self.logger.info(f"[JSON-LD] Nome: '{nome_produto}', Preço: '{preco_produto_str}'")
        except Exception as e:
            self.logger.warning(f"Falha no JSON-LD: {e}")
        
        # TENTATIVA 2: Seletores específicos do domínio
        if not nome_produto or not preco_produto_str:
            specific_selectors = self.get_specific_selectors(response.url)
            if specific_selectors:
                self.logger.info("Usando seletores específicos do domínio")
                
                if not nome_produto:
                    for selector in specific_selectors['nome']:
                        el = soup.select_one(selector)
                        if el:
                            nome_produto = el.text.strip()
                            break
                
                if not preco_produto_str:
                    for selector in specific_selectors['preco']:
                        el = soup.select_one(selector)
                        if el:
                            preco_produto_str = el.text.strip()
                            break
        
        # TENTATIVA 3: Seletores genéricos (fallback)
        if not nome_produto:
            selectors_nome = [
                'h1.ui-pdp-title', 'span#productTitle', 'h1[class*="product"]',
                'h1[class*="title"]', 'h1[class*="name"]', 'h1'
            ]
            for selector in selectors_nome:
                el = soup.select_one(selector)
                if el and len(el.text.strip()) > 5:
                    nome_produto = el.text.strip()
                    self.logger.info(f"Nome encontrado: '{selector}'")
                    break
        
        if not preco_produto_str:
            selectors_preco = [
                'span.andes-money-amount__fraction',
                'p[data-testid="price-value"]',
                'span.a-price-whole',
                'h4[class*="finalPrice"]',
                'div[class*="price"]',
                'span[class*="price"]',
            ]
            for selector in selectors_preco:
                el = soup.select_one(selector)
                if el:
                    preco_produto_str = el.text.strip()
                    self.logger.info(f"Preço encontrado: '{selector}'")
                    break
        
        # ===== VALIDAÇÃO E LIMPEZA (CORRIGIDO) =====
        if nome_produto and preco_produto_str:
            try:
                # ✅ USA A FUNÇÃO CORRETA DE CONVERSÃO
                preco_final = parse_brazilian_price(preco_produto_str)
                self.logger.info(f"✓ SUCESSO! Produto: '{nome_produto}' | Preço: R$ {preco_final:.2f}")
                
                yield {
                    'usuario_id': self.usuario_id,
                    'url_produto': self.url,
                    'nome_produto': nome_produto,
                    'preco_atual': preco_final
                }
                return
                
            except ValueError as e:
                self.logger.error(f"Erro ao converter preço '{preco_produto_str}': {e}")
        else:
            self.logger.error(f"✗ FALHA! Nome: {bool(nome_produto)} | Preço: {bool(preco_produto_str)}")
            
            # Salva debug
            try:
                with open('/tmp/playwright_failure.html', 'w', encoding='utf-8') as f:
                    f.write(response.body.decode('utf-8'))
                page.screenshot(path='screenshot_falha_playwright.png')
                self.logger.info("Debug salvo: /tmp/playwright_failure.html e screenshot")
            except Exception as e:
                self.logger.error(f"Erro ao salvar debug: {e}")