import requests
from bs4 import BeautifulSoup
import logging
import re
from ..utils.price_utils import parse_brazilian_price

logger = logging.getLogger(__name__)

class FastPathScraper:
    USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    
    def scrape(self, url: str, usuario_id: int = None) -> dict:
        try:
            headers = {'User-Agent': self.USER_AGENT}
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # 1. Extração do Nome
            nome = self._extract_name(soup)
            
            # 2. Extração Inteligente do Preço
            preco = self._extract_smart_price(soup, url)
            
            if nome and preco:
                return {
                    'nome_produto': nome,
                    'preco_atual': preco,
                    'url_produto': url,
                    'usuario_id': usuario_id
                }
            return None
            
        except Exception as e:
            logger.error(f"[FAST PATH] Erro: {e}")
            return None

    def _extract_name(self, soup):
        selectors = ['h1.ui-pdp-title', 'h1', 'span#productTitle']
        for sel in selectors:
            el = soup.select_one(sel)
            if el: return el.text.strip()
        return None

    def _extract_smart_price(self, soup, url):
        """
        Estratégia:
        1. Tenta achar o preço principal via meta tags (mais confiável).
        2. Se falhar, coleta TODOS os números que parecem preço na tela.
        3. Retorna o MENOR preço encontrado (assume que o menor é o preço de venda, e o maior é o 'De:').
        """
        
        # Tenta Meta Tag (Mercado Livre e Magalu usam muito)
        meta_price = soup.find('meta', {'itemprop': 'price'})
        if meta_price:
            try:
                return float(meta_price['content'])
            except:
                pass

        # Fallback: Procura textual
        # Pega textos que tenham formato de dinheiro: R$ XX,XX
        candidates = []
        
        # Regex busca: R$ espaço opcional, digitos/pontos, virgula, 2 digitos
        price_texts = soup.find_all(string=re.compile(r'R\$\s*[\d.]+,\d{2}'))
        
        for text in price_texts:
            val = parse_brazilian_price(text)
            if val and val > 10: # Ignora valores muito baixos (parcelas falsas)
                candidates.append(val)
        
        # Procura também em classes específicas de preço (caso o regex falhe)
        css_selectors = [
            'span.andes-money-amount__fraction', # ML
            'span.a-price-whole', # Amazon
            '[data-testid="price-value"]' # Magalu
        ]
        
        for sel in css_selectors:
            elements = soup.select(sel)
            for el in elements:
                val = parse_brazilian_price(el.text)
                if val and val > 10:
                    candidates.append(val)

        if candidates:
            # A Mágica: Pega o MENOR valor encontrado que seja > 0
            # Isso elimina o preço "De: 8000" e fica com o "Por: 5000"
            return min(candidates)
            
        return None