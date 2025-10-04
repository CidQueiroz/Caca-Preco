
import scrapy

class GenericScrapySpider(scrapy.Spider):
    name = 'generic_scrapy_spider'

    def __init__(self, start_urls=None, price_selector=None, name_selector=None, *args, **kwargs):
        """
        Spider Scrapy genérico que recebe URLs e seletores como argumentos.
        Ideal para sites que não exigem renderização de JavaScript.

        Args:
            start_urls (str): Uma string de URLs separadas por vírgula.
            price_selector (str): O seletor CSS para o preço.
            name_selector (str): O seletor CSS para o nome do produto.
        """
        super(GenericScrapySpider, self).__init__(*args, **kwargs)
        self.start_urls = start_urls.split(',') if start_urls else []
        self.price_selector = price_selector
        self.name_selector = name_selector
        
        if not all([self.start_urls, self.price_selector, self.name_selector]):
            raise ValueError("Os argumentos 'start_urls', 'price_selector', e 'name_selector' são obrigatórios.")

    def parse(self, response):
        """
        Método de parse padrão do Scrapy.
        """
        self.logger.info(f"--- Estratégia: Scrapy Puro na URL: {response.url} ---")
        
        name = response.css(self.name_selector).get()
        price = response.css(self.price_selector).get()

        if name and price:
            self.logger.info(f"--- Sucesso: Dados encontrados com Scrapy: {name.strip()} - {price.strip()} ---")
            yield {
                'url': response.url,
                'name': name.strip(),
                'price': price.strip(),
                'strategy': 'scrapy_pure'
            }
        else:
            self.logger.error(f"--- Falha: Não foi possível encontrar nome ou preço na URL {response.url} ---")
            yield {
                'url': response.url,
                'error': 'Selectors did not find content',
                'strategy': 'scrapy_pure'
            }
