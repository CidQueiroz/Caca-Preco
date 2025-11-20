"""
Fast Path: requests + BeautifulSoup
Estratégia mais rápida para sites simples sem JavaScript.
"""
import requests
from bs4 import BeautifulSoup
import logging
from ..utils.price_utils import parse_brazilian_price

logger = logging.getLogger(__name__)


class FastPathScraper:
    """Fast Path: requests + BeautifulSoup"""
    
    USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    
    def scrape(self, url: str, usuario_id: int = None) -> dict:
        """Executa scraping simples com requests"""
        try:
            logger.info(f"[FAST PATH] Iniciando: {url}")
            
            headers = {
                'User-Agent': self.USER_AGENT,
                'Accept': 'text/html,application/xhtml+xml',
                'Accept-Language': 'pt-BR,pt;q=0.9',
            }
            
            response = requests.get(url, headers=headers, timeout=15)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            nome = self._extract_name(soup)
            preco = self._extract_price(soup)
            
            if nome and preco:
                logger.info(f"[FAST PATH] ✓ {nome} - R$ {preco:.2f}")
                result = {
                    'nome_produto': nome,
                    'preco_atual': preco,
                    'url_produto': url,
                }
                if usuario_id:
                    result['usuario_id'] = usuario_id
                return result
            else:
                logger.warning(f"[FAST PATH] ✗ Dados incompletos")
                return None
                
        except Exception as e:
            logger.error(f"[FAST PATH] Erro: {e}")
            return None
    
    def _extract_name(self, soup):
        """Extrai nome do produto"""
        selectors = [
            'h1.ui-pdp-title',
            'span#productTitle',
            'h1[data-testid="heading-product-title"]',
            'h1[class*="product"]',
            'h1[class*="title"]',
            'h1'
        ]
        
        for selector in selectors:
            el = soup.select_one(selector)
            if el and len(el.text.strip()) > 5:
                return el.text.strip()
        return None
    
    def _extract_price(self, soup):
        """Extrai preço do produto"""
        import re
        
        price_text = soup.find(string=re.compile(r'R\$\s*[\d.,]+'))
        
        if price_text:
            try:
                return parse_brazilian_price(price_text)
            except ValueError:
                pass
        
        selectors = [
            'span.andes-money-amount__fraction',
            'p[data-testid="price-value"]',
            'span.a-price-whole',
            'div[class*="price"]',
            'span[class*="price"]',
        ]
        
        for selector in selectors:
            el = soup.select_one(selector)
            if el:
                try:
                    return parse_brazilian_price(el.text)
                except ValueError:
                    continue
        
        return None