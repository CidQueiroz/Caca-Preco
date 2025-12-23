import scrapy

class ProductItem(scrapy.Item):
    usuario_id = scrapy.Field()
    url_produto = scrapy.Field()
    nome_produto = scrapy.Field()
    preco_atual = scrapy.Field()
    spider_name = scrapy.Field()
    scraped_at = scrapy.Field()