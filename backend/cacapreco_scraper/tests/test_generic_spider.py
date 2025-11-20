import unittest
from cacapreco_scraper.cacapreco_scraper.spiders.generic_scrapy_spider import GenericScrapySpider

class TestGenericScrapySpider(unittest.TestCase):
    def test_spider_instantiation(self):
        spider = GenericScrapySpider(start_urls='http://example.com', price_selector='.price', name_selector='.name', usuario_id=1)
        self.assertIsInstance(spider, GenericScrapySpider)
        self.assertEqual(spider.start_urls, ['http://example.com'])
        self.assertEqual(spider.price_selector, '.price')
        self.assertEqual(spider.name_selector, '.name')
        self.assertEqual(spider.usuario_id, 1)

if __name__ == '__main__':
    unittest.main()
