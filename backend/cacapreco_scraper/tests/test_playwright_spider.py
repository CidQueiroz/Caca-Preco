import unittest
from cacapreco_scraper.cacapreco_scraper.spiders.playwright_spider import PlaywrightSpider

class TestPlaywrightSpider(unittest.TestCase):
    def test_spider_instantiation(self):
        spider = PlaywrightSpider(start_urls=['http://example.com'], usuario_id=1)
        self.assertIsInstance(spider, PlaywrightSpider)
        self.assertEqual(spider.start_urls, ['http://example.com'])
        self.assertEqual(spider.usuario_id, 1)

if __name__ == '__main__':
    unittest.main()
