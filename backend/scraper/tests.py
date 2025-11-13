import pytest
from django.test import TestCase
from unittest.mock import patch

from django.contrib.auth import get_user_model
from api.models import Vendedor, CategoriaLoja
from .models import Dominio, Seletor, ProdutosMonitoradosExternos, HistoricoPrecos
from .tasks import run_scraping_pipeline

User = get_user_model()

@pytest.mark.django_db
class ScrapingPipelineTest(TestCase):
    def setUp(self):
        """Set up the necessary objects for testing the scraping pipeline."""
        # 1. Create dependencies
        self.categoria_loja = CategoriaLoja.objects.create(nome='Eletrônicos')
        self.user = User.objects.create_user(email='test@example.com', password='password')
        self.vendedor = Vendedor.objects.create(
            usuario=self.user, 
            nome_loja='Test Seller', 
            categoria_loja=self.categoria_loja
        )

        # 2. Define a test URL
        self.test_url = "https://www.example.com/product/123"

        # 3. Create a Dominio and Seletors for the test URL
        self.domain = Dominio.objects.create(nome_dominio='www.example.com', ativo=True)
        Seletor.objects.create(dominio=self.domain, tipo=Seletor.TipoSeletor.NOME, seletor='h1.product-name')
        Seletor.objects.create(dominio=self.domain, tipo=Seletor.TipoSeletor.PRECO, seletor='span.price')

    @patch('scraper.tasks.run_long_path_scrape')
    @patch('scraper.tasks.medium_path_scrape')
    @patch('scraper.tasks.fast_path_scrape')
    def test_pipeline_fast_path_success(self, mock_fast_path, mock_medium_path, mock_long_path):
        """Tests the pipeline when the fast path is successful."""
        # Arrange
        mock_fast_path.return_value = ('Test Product', 199.99)
        
        # Act
        result = run_scraping_pipeline(url=self.test_url, user_id=self.user.id)

        # Assert
        mock_fast_path.assert_called_once_with(self.test_url)
        mock_medium_path.assert_not_called()
        mock_long_path.assert_not_called()
        self.assertEqual(result['status'], 'success')
        self.assertTrue(ProdutosMonitoradosExternos.objects.filter(nome_produto='Test Product').exists())
        self.assertTrue(HistoricoPrecos.objects.filter(preco=199.99).exists())

    @patch('scraper.tasks.run_long_path_scrape')
    @patch('scraper.tasks.medium_path_scrape')
    @patch('scraper.tasks.fast_path_scrape')
    def test_pipeline_medium_path_success(self, mock_fast_path, mock_medium_path, mock_long_path):
        """Tests the pipeline when fast path fails and medium path succeeds."""
        # Arrange
        mock_fast_path.return_value = None
        mock_medium_path.return_value = ('Medium Path Product', 299.99)

        # Act
        result = run_scraping_pipeline(url=self.test_url, user_id=self.user.id)

        # Assert
        mock_fast_path.assert_called_once_with(self.test_url)
        mock_medium_path.assert_called_once()
        mock_long_path.assert_not_called()
        self.assertEqual(result['status'], 'success')
        self.assertTrue(ProdutosMonitoradosExternos.objects.filter(nome_produto='Medium Path Product').exists())
        self.assertTrue(HistoricoPrecos.objects.filter(preco=299.99).exists())

    @patch('scraper.tasks.run_long_path_scrape')
    @patch('scraper.tasks.medium_path_scrape')
    @patch('scraper.tasks.fast_path_scrape')
    def test_pipeline_long_path_success(self, mock_fast_path, mock_medium_path, mock_long_path):
        """Tests the pipeline when fast and medium paths fail, and long path succeeds."""
        # Arrange
        mock_fast_path.return_value = None
        mock_medium_path.return_value = None
        mock_long_path.return_value = {
            'status': 'success',
            'data': {'nome_produto': 'Long Path Product', 'preco_atual': 399.99}
        }

        # Act
        result = run_scraping_pipeline(url=self.test_url, user_id=self.user.id)

        # Assert
        mock_fast_path.assert_called_once_with(self.test_url)
        mock_medium_path.assert_called_once()
        mock_long_path.assert_called_once_with(self.test_url, self.user.id)
        self.assertEqual(result['status'], 'success')
        self.assertTrue(ProdutosMonitoradosExternos.objects.filter(nome_produto='Long Path Product').exists())
        self.assertTrue(HistoricoPrecos.objects.filter(preco=399.99).exists())

    @patch('scraper.tasks.run_long_path_scrape')
    @patch('scraper.tasks.medium_path_scrape')
    @patch('scraper.tasks.fast_path_scrape')
    def test_pipeline_all_paths_fail(self, mock_fast_path, mock_medium_path, mock_long_path):
        """Tests the pipeline when all scraping paths fail."""
        # Arrange
        mock_fast_path.return_value = None
        mock_medium_path.return_value = None
        mock_long_path.return_value = {'status': 'error', 'message': 'Failed'}

        # Act
        result = run_scraping_pipeline(url=self.test_url, user_id=self.user.id)

        # Assert
        self.assertEqual(result['status'], 'error')
        self.assertFalse(ProdutosMonitoradosExternos.objects.exists())
        self.assertFalse(HistoricoPrecos.objects.exists())
