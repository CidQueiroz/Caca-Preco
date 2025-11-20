import unittest
from unittest.mock import patch, Mock
from decimal import Decimal

from django.test import TestCase # Import TestCase from django.test

from scraper.utils.price_utils import parse_brazilian_price, format_price_brl
from scraper.strategies.fast_path import FastPathScraper
from scraper.orchestrator import ScraperOrchestrator
from scraper.tasks import run_scraping_task

class TestPriceUtils(unittest.TestCase):

    def test_parse_brazilian_price_valid_inputs(self):
        self.assertEqual(parse_brazilian_price("R$ 20,66"), 20.66)
        self.assertEqual(parse_brazilian_price("R$ 1.234,56"), 1234.56)
        self.assertEqual(parse_brazilian_price("20.66"), 20.66)
        self.assertEqual(parse_brazilian_price("1.234,56"), 1234.56)
        self.assertEqual(parse_brazilian_price("R$ 5,00"), 5.00)
        self.assertEqual(parse_brazilian_price("R$ 0,01"), 0.01)
        self.assertEqual(parse_brazilian_price("100"), 100.00)

    def test_parse_brazilian_price_invalid_inputs(self):
        with self.assertRaises(ValueError):
            parse_brazilian_price("")
        with self.assertRaises(ValueError):
            parse_brazilian_price("abc")
        with self.assertRaises(ValueError):
            parse_brazilian_price("R$ -10,00")
        with self.assertRaises(ValueError):
            parse_brazilian_price("R$ 0,00")
        with self.assertRaises(ValueError):
            parse_brazilian_price(None) # type: ignore

    def test_format_price_brl(self):
        self.assertEqual(format_price_brl(20.66), "R$ 20,66")
        self.assertEqual(format_price_brl(1234.56), "R$ 1.234,56")
        self.assertEqual(format_price_brl(5.00), "R$ 5,00")
        self.assertEqual(format_price_brl(0.01), "R$ 0,01")
        self.assertEqual(format_price_brl(100.00), "R$ 100,00")
        self.assertEqual(format_price_brl(1000000.00), "R$ 1.000.000,00")

class TestFastPathScraper(unittest.TestCase):
    
    def setUp(self):
        self.scraper = FastPathScraper()
        self.test_url = "http://test.com/produto"

    @patch('scraper.strategies.fast_path.requests.get')
    def test_scrape_success(self, mock_get):
        # Simula uma resposta HTML de sucesso
        sample_html = """
        <html>
            <head><title>Página de Teste</title></head>
            <body>
                <h1 class="ui-pdp-title">Produto de Teste</h1>
                <p class="price-value">R$ 199,90</p>
            </body>
        </html>
        """
        mock_response = Mock()
        mock_response.status_code = 200
        mock_response.content = sample_html.encode('utf-8')
        mock_get.return_value = mock_response

        result = self.scraper.scrape(self.test_url, usuario_id=1)

        expected_result = {
            'nome_produto': 'Produto de Teste',
            'preco_atual': 199.90,
            'url_produto': self.test_url,
            'usuario_id': 1
        }
        self.assertEqual(result, expected_result)

    @patch('scraper.strategies.fast_path.requests.get')
    def test_scrape_http_error(self, mock_get):
        # Simula um erro HTTP
        mock_get.side_effect = Exception("HTTP Error")

        result = self.scraper.scrape(self.test_url)
        self.assertIsNone(result)

class TestScraperOrchestrator(unittest.TestCase):
    
    @patch('scraper.orchestrator.ScraperOrchestrator._execute_strategy')
    def test_execute_scraping_fast_path(self, mock_execute_strategy):
        mock_execute_strategy.return_value = {"nome_produto": "Orchestrated Product"}

        url = "http://fast.com/product"
        result = ScraperOrchestrator.execute_scraping(url, usuario_id=1, strategy='fast')

        mock_execute_strategy.assert_called_once_with('fast', url, 1)
        self.assertEqual(result, {"nome_produto": "Orchestrated Product"})

    @patch('scraper.orchestrator.ScraperOrchestrator._execute_strategy')
    def test_execute_scraping_no_strategy_provided(self, mock_execute_strategy):
        mock_execute_strategy.return_value = {"nome_produto": "Default Product"}

        url = "http://default.com/product"
        result = ScraperOrchestrator.execute_scraping(url, usuario_id=1) # No strategy provided

        mock_execute_strategy.assert_called_once_with('fast', url, 1)
        self.assertEqual(result, {"nome_produto": "Default Product"})

class TestScraperTasks(TestCase): # Changed to inherit from django.test.TestCase

    @patch('scraper.tasks.ScraperOrchestrator.execute_scraping')
    @patch('scraper.tasks.ProdutosMonitoradosExternos.objects.update_or_create')
    @patch('scraper.tasks.User.objects.get') # Corrected from Usuario.objects.get
    def test_run_scraping_task_success(self, mock_get_user, mock_update_or_create_product, mock_execute_scraping):
        mock_execute_scraping.return_value = {
            'nome_produto': 'Task Product',
            'preco_atual': 250.00,
            'url_produto': 'http://task.com/product',
            'usuario_id': 1
        }
        mock_user = Mock()
        mock_user.vendedor.return_value = Mock()
        mock_get_user.return_value = mock_user
        mock_update_or_create_product.return_value = (Mock(), True) # Set return_value here

        # Mock the Vendedor.objects.get call
        mock_vendedor = Mock()
        with patch('scraper.tasks.Vendedor.objects.get', return_value=mock_vendedor):
            run_scraping_task('http://task.com/product', 1)

        mock_execute_scraping.assert_called_once_with(url='http://task.com/product', usuario_id=1, strategy=None)
        mock_update_or_create_product.assert_called_once_with(
            vendedor=mock_vendedor,
            url_produto='http://task.com/product',
            defaults={
                'nome_produto': 'Task Product',
                'preco_atual': 250.00
            }
        )

    @patch('scraper.tasks.ScraperOrchestrator.execute_scraping')
    @patch('scraper.tasks.ProdutosMonitoradosExternos.objects.update_or_create')
    @patch('scraper.tasks.User.objects.get') # Corrected from Usuario.objects.get
    def test_run_scraping_task_no_result(self, mock_get_user, mock_update_or_create_product, mock_execute_scraping):
        mock_execute_scraping.return_value = None
        mock_user = Mock()
        mock_user.vendedor.return_value = Mock()
        mock_get_user.return_value = mock_user
        mock_update_or_create_product.return_value = (Mock(), False) # Set return_value here

        with patch('scraper.tasks.Vendedor.objects.get', return_value=Mock()):
            run_scraping_task('http://noresult.com/product', 1)

        mock_execute_scraping.assert_called_once_with(url='http://noresult.com/product', usuario_id=1, strategy=None)
        mock_update_or_create_product.assert_not_called()

if __name__ == '__main__':
    unittest.main()
