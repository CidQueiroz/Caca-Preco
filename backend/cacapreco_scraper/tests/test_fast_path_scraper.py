import unittest
from unittest.mock import patch, Mock
from scraper.strategies.fast_path import FastPathScraper

class TestFastPathScraper(unittest.TestCase):

    def setUp(self):
        self.scraper = FastPathScraper()

    @patch('cacapreco_scraper.scraper.strategies.fast_path.requests.get')
    def test_scrape_success(self, mock_requests_get):
        # Mock a successful response
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.content = """
        <html>
            <body>
                <h1 class="product-title">Test Product Name</h1>
                <span class="product-price">R$ 1.234,56</span>
            </body>
        </html>
        """
        mock_requests_get.return_value = mock_response

        url = "http://example.com/product"
        usuario_id = 123
        result = self.scraper.scrape(url, usuario_id)

        mock_requests_get.assert_called_once_with(url, headers=self.scraper.headers, timeout=15)
        self.assertIsNotNone(result)
        self.assertEqual(result['nome_produto'], 'Test Product Name')
        self.assertEqual(result['preco_atual'], 1234.56)
        self.assertEqual(result['url_produto'], url)
        self.assertEqual(result['usuario_id'], usuario_id)

    @patch('cacapreco_scraper.scraper.strategies.fast_path.requests.get')
    def test_scrape_no_data(self, mock_requests_get):
        # Mock a response with no product data
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.content = "<html><body><h1>No data here</h1></body></html>"
        mock_requests_get.return_value = mock_response

        url = "http://example.com/empty"
        result = self.scraper.scrape(url)

        self.assertIsNone(result)

    @patch('cacapreco_scraper.scraper.strategies.fast_path.requests.get')
    def test_scrape_request_exception(self, mock_requests_get):
        # Mock a request exception
        mock_requests_get.side_effect = requests.exceptions.RequestException("Connection Error")

        url = "http://example.com/error"
        result = self.scraper.scrape(url)

        self.assertIsNone(result)

if __name__ == '__main__':
    unittest.main()
