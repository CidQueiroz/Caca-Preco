"""
Medium Path: Scrapy
Estratégia intermediária para sites que precisam de um motor de scraping mais robusto,
mas sem a necessidade de renderização completa de JavaScript como no Playwright.
"""
import scrapy
import logging
from ..utils.price_utils import parse_brazilian_price

logger = logging.getLogger(__name__)


class MediumPathSpider(scrapy.Spider):
    """Medium Path: Scrapy Spider"""
    
    name = 'medium_path_spider'
    
    def __init__(self, *args, **kwargs):
        super(MediumPathSpider, self).__init__(*args, **kwargs)
        self.url = getattr(self, 'url', None)
        self.usuario_id = getattr(self, 'usuario_id', None)
        self.log_file = kwargs.get('log_file', 'scrapy_output.log')
        self.custom_settings = {
            'LOG_FILE': self.log_file,
            'LOG_LEVEL': 'INFO',
            'USER_AGENT': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }

    def start_requests(self):
        if not self.url or not self.usuario_id:
            self.logger.error("URL e usuario_id são obrigatórios")
            return
        
        yield scrapy.Request(url=self.url, callback=self.parse)

    def parse(self, response):
        """Extrai dados do produto da página"""
        logger.info(f"[MEDIUM PATH] Iniciando: {response.url}")

        nome = self._extract_name(response)
        preco = self._extract_price(response)
        
        if nome and preco:
            logger.info(f"[MEDIUM PATH] ✓ {nome} - R$ {preco:.2f}")
            yield {
                'nome_produto': nome,
                'preco_atual': preco,
                'url_produto': response.url,
                'usuario_id': self.usuario_id
            }
        else:
            logger.warning(f"[MEDIUM PATH] ✗ Dados incompletos. Nome: {nome}, Preço: {preco}")

    def _extract_name(self, response):
        """Extrai nome do produto"""
        selectors = [
            'h1.ui-pdp-title::text',
            'span#productTitle::text',
            'h1[data-testid="heading-product-title"]::text',
            'h1[class*="product"]::text',
            'h1[class*="title"]::text',
            'h1::text'
        ]
        
        for selector in selectors:
            name = response.css(selector).get()
            if name and len(name.strip()) > 5:
                return name.strip()
        return None

    def _extract_price(self, response):
        """Extrai preço do produto"""
        # Tenta encontrar o preço em texto puro primeiro
        import re
        price_text = response.xpath("//body").re_first(r'R\$\s*[\d.,]+')
        if price_text:
            try:
                return parse_brazilian_price(price_text)
            except ValueError:
                pass

        # Se não encontrar, tenta os seletores CSS
        selectors = [
            'span.andes-money-amount__fraction::text',
            'p[data-testid="price-value"]::text',
            'span.a-price-whole::text',
            'div[class*="price"]::text',
            'span[class*="price"]::text',
        ]
        
        for selector in selectors:
            price = response.css(selector).get()
            if price:
                try:
                    return parse_brazilian_price(price)
                except ValueError:
                    continue
        
        return None

