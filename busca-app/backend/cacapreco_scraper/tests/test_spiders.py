import unittest
from unittest.mock import Mock, patch
from scrapy.http import HtmlResponse
from bs4 import BeautifulSoup
from cacapreco_scraper.cacapreco_scraper.spiders.selenium_spider import SeleniumSpider

class ScraperTest(unittest.TestCase):
    def setUp(self):
        self.selenium_spider = SeleniumSpider()

    def test_selenium_spider_casasbahia(self):
        with open("cacapreco_scraper\\casasbahia.html", "r", encoding="utf-8") as f:
            html_content = f.read()
        
        response = HtmlResponse(url="http://www.casasbahia.com.br", body=html_content, encoding="utf-8")
        
        result = next(self.selenium_spider.parse_product_page(response, None), None)
        
        if result:
            self.assertEqual(result['nome_produto'], 'Smart TV LED 50" Ultra HD 4K Philips 50PUG7019 com Google TV, Comando de Voz, Wi-Fi, Entradas HDMI e USB')
            self.assertEqual(result['preco_atual'], 1849.0)

    def test_selenium_spider_css_fallback(self):
        with open("cacapreco_scraper\\casasbahia.html", "r", encoding="utf-8") as f:
            html_content = f.read()
        
        soup = BeautifulSoup(html_content, 'html.parser')
        for script in soup.find_all('script', {'type': 'application/ld+json'}):
            script.decompose()
            
        response = HtmlResponse(url="http://www.casasbahia.com.br", body=str(soup), encoding="utf-8")
        
        result = next(self.selenium_spider.parse_product_page(response, None), None)
        
        if result:
            self.assertEqual(result['nome_produto'], 'Smart TV LED 50" Ultra HD 4K Philips 50PUG7019 com Google TV, Comando de Voz, Wi-Fi, Entradas HDMI e USB')
            self.assertEqual(result['preco_atual'], 1849.0)

    def test_selenium_spider_invalid_price(self):
        with open("cacapreco_scraper\\casasbahia_invalid_price.html", "r", encoding="utf-8") as f:
            html_content = f.read()
        
        response = HtmlResponse(url="http://www.casasbahia.com.br", body=html_content, encoding="utf-8")
        
        mock_driver = Mock()
        result = next(self.selenium_spider.parse_product_page(response, mock_driver), None)
        
        self.assertIsNone(result)
        mock_driver.save_screenshot.assert_called_once_with('screenshot_falha_preco.png')

    def test_selenium_spider_no_data(self):
        with open("cacapreco_scraper\\empty.html", "r", encoding="utf-8") as f:
            html_content = f.read()
        
        response = HtmlResponse(url="http://www.casasbahia.com.br", body=html_content, encoding="utf-8")
        
        mock_driver = Mock()
        result = next(self.selenium_spider.parse_product_page(response, mock_driver), None)
        
        self.assertIsNone(result)
        mock_driver.save_screenshot.assert_called_once_with('screenshot_falha.png')

    def test_selenium_spider_jsonld_error(self):
        with open("cacapreco_scraper\\casasbahia_malformed_jsonld.html", "r", encoding="utf-8") as f:
            html_content = f.read()
        
        response = HtmlResponse(url="http://www.casasbahia.com.br", body=html_content, encoding="utf-8")
        
        result = next(self.selenium_spider.parse_product_page(response, None), None)
        
        if result:
            self.assertEqual(result['nome_produto'], 'Smart TV LED 50" Ultra HD 4K Philips 50PUG7019 com Google TV, Comando de Voz, Wi-Fi, Entradas HDMI e USB')
            self.assertEqual(result['preco_atual'], 1849.0)

    @patch('cacapreco_scraper.cacapreco_scraper.spiders.selenium_spider.HtmlResponse')
    @patch('cacapreco_scraper.cacapreco_scraper.spiders.selenium_spider.uc.Chrome')
    @patch('cacapreco_scraper.cacapreco_scraper.spiders.selenium_spider.ChromeDriverManager')
    def test_start_requests(self, mock_driver_manager, mock_chrome, mock_html_response):
        # Arrange
        self.selenium_spider.url = "http://test.com"
        self.selenium_spider.usuario_id = 1
        mock_driver = Mock()
        mock_chrome.return_value = mock_driver
        mock_driver_manager.return_value.install.return_value = "path/to/driver"
        
        # Patch the parse_product_page method
        with patch('cacapreco_scraper.cacapreco_scraper.spiders.selenium_spider.SeleniumSpider.parse_product_page', return_value=iter([{"key": "value"}])) as mock_parse:
            # Act
            requests = list(self.selenium_spider.start_requests())

            # Assert
            mock_chrome.assert_called_once()
            mock_driver.get.assert_called_once_with("http://test.com")
            mock_html_response.assert_called_once_with(url=self.selenium_spider.url, body=mock_driver.page_source, encoding='utf-8')
            self.assertEqual(len(requests), 1)
            mock_parse.assert_called_once()

    @patch('cacapreco_scraper.cacapreco_scraper.spiders.selenium_spider.SeleniumSpider.logger')
    def test_start_requests_missing_args(self, mock_logger):
        # Arrange
        self.selenium_spider.url = None
        self.selenium_spider.usuario_id = None

        # Act
        requests = list(self.selenium_spider.start_requests())

        # Assert
        self.assertEqual(len(requests), 0)
        mock_logger.error.assert_called_once_with("A URL e o usuario_id são obrigatórios")

    @patch('cacapreco_scraper.cacapreco_scraper.spiders.selenium_spider.uc.Chrome')
    @patch('cacapreco_scraper.cacapreco_scraper.spiders.selenium_spider.ChromeDriverManager')
    @patch('cacapreco_scraper.cacapreco_scraper.spiders.selenium_spider.SeleniumSpider.logger')
    def test_start_requests_exception(self, mock_logger, mock_driver_manager, mock_chrome):
        # Arrange
        self.selenium_spider.url = "http://test.com"
        self.selenium_spider.usuario_id = 1
        mock_driver = Mock()
        mock_chrome.return_value = mock_driver
        mock_driver_manager.return_value.install.return_value = "path/to/driver"
        mock_driver.get.side_effect = Exception("Test Exception") # Make get raise an exception

        # Act
        requests = list(self.selenium_spider.start_requests())

        # Assert
        self.assertEqual(len(requests), 0)
        mock_logger.error.assert_called_once_with("Ocorreu um erro durante o scraping com Selenium: Test Exception")
        mock_driver.save_screenshot.assert_called_once_with('screenshot_falha_selenium.png')

    @patch('cacapreco_scraper.cacapreco_scraper.spiders.selenium_spider.uc.Chrome')
    @patch('cacapreco_scraper.cacapreco_scraper.spiders.selenium_spider.ChromeDriverManager')
    @patch('cacapreco_scraper.cacapreco_scraper.spiders.selenium_spider.SeleniumSpider.logger')
    def test_start_requests_os_error(self, mock_logger, mock_driver_manager, mock_chrome):
        # Arrange
        self.selenium_spider.url = "http://test.com"
        self.selenium_spider.usuario_id = 1
        mock_driver = Mock()
        mock_chrome.return_value = mock_driver
        mock_driver_manager.return_value.install.return_value = "path/to/driver"
        mock_driver.get.side_effect = Exception("Test Exception") # Make get raise an exception
        mock_driver.quit.side_effect = OSError("OS Error") # Make quit raise an OSError

        # Act
        requests = list(self.selenium_spider.start_requests())

        # Assert
        self.assertEqual(len(requests), 0)
        mock_logger.error.assert_called_once_with("Ocorreu um erro durante o scraping com Selenium: Test Exception")
        mock_logger.warning.assert_called_once_with("Erro ao finalizar o driver do Selenium (pode ser ignorado se o processo já foi encerrado): OS Error")

if __name__ == '__main__':
    unittest.main()