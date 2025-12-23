
import scrapy

class GenericScrapySpider(scrapy.Spider):
    name = 'generic_scrapy_spider'

    def __init__(self, start_urls=None, price_selector=None, name_selector=None, usuario_id=None, *args, **kwargs):
        """
        Spider Scrapy genérico que recebe URLs, seletores e um ID de usuário como argumentos.
        Ideal para sites que não exigem renderização de JavaScript.

        Args:
            start_urls (str): Uma string de URLs separadas por vírgula.
            price_selector (str): O seletor CSS para o preço.
            name_selector (str): O seletor CSS para o nome do produto.
            usuario_id (str): O ID do usuário que está solicitando o scraping.
        """
        super(GenericScrapySpider, self).__init__(*args, **kwargs)
        self.start_urls = start_urls.split(',') if start_urls else []
        self.price_selector = price_selector
        self.name_selector = name_selector
        self.usuario_id = usuario_id
        
        if not all([self.start_urls, self.price_selector, self.name_selector, self.usuario_id]):
            raise ValueError("Os argumentos 'start_urls', 'price_selector', 'name_selector' e 'usuario_id' são obrigatórios.")

    def get_dynamic_selectors(self, url):
        """Retorna seletores baseados no domínio - FALLBACK INTELIGENTE"""
        domain_selectors = {
            'mercadolivre.com': {
                'name': 'h1.ui-pdp-title',
                'price': 'span.andes-money-amount__fraction'
            },
            'amazon.com': {
                'name': 'span#productTitle', 
                'price': 'span.a-price-whole'
            },
            'magazineluiza.com': {
                'name': 'h1[data-testid="heading-product-title"]',
                'price': 'p[data-testid="price-value"]'
            },
            'kabum.com.br': {
                'name': 'h1[class*="nameProduct"]',
                'price': 'h4[class*="finalPrice"]'
            }
        }
        
        for domain, selectors in domain_selectors.items():
            if domain in url:
                return selectors
        
        return None

    def parse(self, response):
        # Tenta seletores dinâmicos primeiro
        dynamic_selectors = self.get_dynamic_selectors(response.url)
        if dynamic_selectors:
            name_selector = dynamic_selectors['name']
            price_selector = dynamic_selectors['price']
        else:
            # Usa os seletores padrão passados como argumento
            name_selector = self.name_selector
            price_selector = self.price_selector
        
        name = response.css(name_selector).get()
        price = response.css(price_selector).get()

        if name and price:
            self.logger.info(f"--- Sucesso: Dados encontrados com Scrapy: {name.strip()} - {price.strip()} ---")
            
            # Monta o item no formato esperado pela DjangoPipeline
            yield {
                'usuario_id': self.usuario_id,
                'url_produto': response.url,
                'nome_produto': name.strip(),
                'preco_atual': price.strip().replace('.', '').replace(',', '.'), # Limpa e formata o preço
            }
        else:
            self.logger.error(f"--- Falha: Não foi possível encontrar nome ou preço na URL {response.url} ---")
            # Não envia item para a pipeline se estiver incompleto
            pass
