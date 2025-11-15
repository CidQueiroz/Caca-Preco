"""
Orquestrador de Scraping - Escolhe automaticamente entre Fast, Medium e Long Path
"""
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse
import logging

logger = logging.getLogger(__name__)


class ScraperOrchestrator:
    """
    Orquestra a estratégia de scraping baseado em:
    - Domínio do site
    - Presença de JavaScript
    - Histórico de sucesso/falha
    """
    
    # Sites que SEMPRE precisam de JS (Long Path)
    REQUIRES_JS = [
        'shopee.com.br',
        'aliexpress.com',
        'shein.com',
        'wish.com',
    ]
    
    # Sites que funcionam bem com Scrapy (Medium Path)
    SCRAPY_FRIENDLY = [
        'kabum.com.br',
        'pichau.com.br',
        'terabyteshop.com.br',
    ]
    
    # Sites que funcionam com requests (Fast Path)
    SIMPLE_SITES = [
        'olx.com.br',
        'mercadolivre.com.br',  # Algumas páginas funcionam sem JS
    ]
    
    @classmethod
    def choose_strategy(cls, url: str, force_strategy: str = None) -> str:
        """
        Escolhe a melhor estratégia de scraping.
        
        Args:
            url: URL do produto
            force_strategy: Força uma estratégia específica ('fast', 'medium', 'long')
        
        Returns:
            'fast', 'medium' ou 'long'
        """
        if force_strategy:
            return force_strategy
        
        domain = urlparse(url).netloc
        
        # Verifica domínios conhecidos
        for js_site in cls.REQUIRES_JS:
            if js_site in domain:
                logger.info(f"[STRATEGY] {domain} requer JS → LONG PATH")
                return 'long'
        
        for scrapy_site in cls.SCRAPY_FRIENDLY:
            if scrapy_site in domain:
                logger.info(f"[STRATEGY] {domain} funciona com Scrapy → MEDIUM PATH")
                return 'medium'
        
        for simple_site in cls.SIMPLE_SITES:
            if simple_site in domain:
                logger.info(f"[STRATEGY] {domain} é simples → FAST PATH")
                return 'fast'
        
        # Sites desconhecidos: tenta Fast → Medium → Long
        logger.info(f"[STRATEGY] {domain} desconhecido → Testando FAST PATH primeiro")
        
        if cls._test_fast_path(url):
            return 'fast'
        else:
            logger.info(f"[STRATEGY] Fast falhou → MEDIUM PATH")
            return 'medium'
    
    @classmethod
    def _test_fast_path(cls, url: str) -> bool:
        """
        Testa se o Fast Path consegue extrair dados.
        Retorna True se funcionar, False caso contrário.
        """
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
            response = requests.get(url, headers=headers, timeout=10)
            
            if response.status_code != 200:
                return False
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Verifica se tem conteúdo útil (não é uma página vazia)
            has_price = bool(soup.find(string=lambda t: 'R$' in str(t)))
            has_product_title = bool(soup.find(['h1', 'h2']))
            
            return has_price and has_product_title
            
        except Exception as e:
            logger.warning(f"[STRATEGY] Teste Fast Path falhou: {e}")
            return False
    
    @classmethod
    def execute_scraping(cls, url: str, usuario_id: int, strategy: str = None):
        """
        Executa o scraping usando a estratégia escolhida.
        
        Args:
            url: URL do produto
            usuario_id: ID do usuário
            strategy: Estratégia forçada ou None para escolha automática
        
        Returns:
            Dicionário com dados do produto ou None em caso de falha
        """
        from .fast_path import FastPathScraper
        from .medium_path import run_scrapy_spider
        from .long_path import run_playwright_spider
        
        chosen_strategy = cls.choose_strategy(url, strategy)
        
        try:
            if chosen_strategy == 'fast':
                logger.info("[EXECUTOR] Executando FAST PATH")
                scraper = FastPathScraper()
                result = scraper.scrape(url, usuario_id)
                
                if result:
                    return result
                else:
                    # Fallback para Medium Path
                    logger.warning("[EXECUTOR] Fast falhou → Tentando MEDIUM PATH")
                    return run_scrapy_spider(url, usuario_id)
            
            elif chosen_strategy == 'medium':
                logger.info("[EXECUTOR] Executando MEDIUM PATH")
                result = run_scrapy_spider(url, usuario_id)
                
                if result:
                    return result
                else:
                    # Fallback para Long Path
                    logger.warning("[EXECUTOR] Medium falhou → Tentando LONG PATH")
                    return run_playwright_spider(url, usuario_id)
            
            else:  # long
                logger.info("[EXECUTOR] Executando LONG PATH")
                return run_playwright_spider(url, usuario_id)
        
        except Exception as e:
            logger.error(f"[EXECUTOR] Erro fatal no scraping: {e}")
            return None


# ============= FAST PATH SCRAPER =============
class FastPathScraper:
    """
    Fast Path: requests + BeautifulSoup
    Mais rápido, consome menos recursos
    """
    
    def scrape(self, url: str, usuario_id: int) -> dict:
        """Executa scraping simples com requests"""
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml',
                'Accept-Language': 'pt-BR,pt;q=0.9',
            }
            
            response = requests.get(url, headers=headers, timeout=15)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Extrai dados básicos
            nome = self._extract_name(soup)
            preco = self._extract_price(soup)
            
            if nome and preco:
                logger.info(f"[FAST PATH] ✓ Sucesso: {nome} - R$ {preco}")
                return {
                    'usuario_id': usuario_id,
                    'url_produto': url,
                    'nome_produto': nome,
                    'preco_atual': preco
                }
            else:
                logger.warning(f"[FAST PATH] ✗ Dados incompletos: nome={bool(nome)}, preco={bool(preco)}")
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
        
        # Busca por texto contendo R$
        price_text = soup.find(string=re.compile(r'R\$\s*[\d.,]+'))
        
        if price_text:
            match = re.search(r'R\$\s*([\d.,]+)', price_text)
            if match:
                price_str = match.group(1).replace('.', '').replace(',', '.')
                try:
                    return float(price_str)
                except:
                    pass
        
        # Seletores CSS comuns
        selectors = [
            'span.andes-money-amount__fraction',
            'p[data-testid="price-value"]',
            'span.a-price-whole',
            'div[class*="price"]',
        ]
        
        for selector in selectors:
            el = soup.select_one(selector)
            if el:
                match = re.search(r'([\d.,]+)', el.text)
                if match:
                    price_str = match.group(1).replace('.', '').replace(',', '.')
                    try:
                        return float(price_str)
                    except:
                        continue
        
        return None


# ============= HELPER FUNCTIONS =============
def run_scrapy_spider(url: str, usuario_id: int):
    """Executa o Generic Scrapy Spider (Medium Path)"""
    from scrapy.crawler import CrawlerProcess
    from scrapy.utils.project import get_project_settings
    # Implementar lógica de execução do Scrapy
    # Retorna dicionário com resultado ou None
    pass


def run_playwright_spider(url: str, usuario_id: int):
    """Executa o Playwright Spider (Long Path)"""
    from scrapy.crawler import CrawlerProcess
    # Implementar lógica de execução do Playwright Spider
    # Retorna dicionário com resultado ou None
    pass