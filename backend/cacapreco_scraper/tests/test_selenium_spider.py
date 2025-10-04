import unittest
import os
import json
import time
from unittest.mock import Mock, patch
from scrapy.http import HtmlResponse
from bs4 import BeautifulSoup
from cacapreco_scraper.cacapreco_scraper.spiders.selenium_spider import SeleniumSpider

class TestSeleniumSpider(unittest.TestCase):
    def setUp(self):
        self.test_dir = os.path.dirname(os.path.abspath(__file__))
        self.log_file = os.path.join(self.test_dir, 'scrapy_output.log')
        self.spider = SeleniumSpider(log_file=self.log_file)

    def tearDown(self):
        if os.path.exists(self.log_file):
            os.remove(self.log_file)

    def test_log_file_creation_and_content(self):
        # Arrange
        file_path = os.path.join(self.test_dir, '..', 'casasbahia.html')
        with open(file_path, "r", encoding="utf-8") as f:
            html_content = f.read()
        
        response = HtmlResponse(url="http://www.casasbahia.com.br", body=html_content, encoding="utf-8")
        mock_driver = Mock()

        # Act
        list(self.spider.parse_product_page(response, mock_driver))

        # Assert
        self.assertTrue(os.path.exists(self.log_file))
        with open(self.log_file, 'r') as f:
            log_data = json.loads(f.read())
            self.assertEqual(log_data['url'], "http://www.casasbahia.com.br")
            self.assertEqual(log_data['nome_produto'], 'Smart TV LED 50" Ultra HD 4K Philips 50PUG7019 com Google TV, Comando de Voz, Wi-Fi, Entradas HDMI e USB')
            self.assertEqual(log_data['preco_produto_str'], '1849')

if __name__ == '__main__':
    unittest.main()