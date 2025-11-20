import pytest
from unittest.mock import patch, MagicMock
from scraper.strategies.fast_path import FastPathScraper

@pytest.mark.django_db
class TestFastPathScraper:
    
    @patch('requests.get')
    def test_scrape_success(self, mock_get):
        """
        Testa o sucesso do scraping do FastPathScraper quando o HTML é válido.
        """
        # Arrange
        html_content = """
        <html>
            <body>
                <h1 class="ui-pdp-title">Test Product</h1>
                <span class="andes-money-amount__fraction">199,99</span>
            </body>
        </html>
        """
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.content = html_content.encode('utf-8')
        mock_get.return_value = mock_response
        
        scraper = FastPathScraper()
        url = "http://www.example.com"
        
        # Act
        result = scraper.scrape(url, usuario_id=1)
        
        # Assert
        assert result is not None
        assert result['nome_produto'] == 'Test Product'
        assert result['preco_atual'] == 199.99
        assert result['url_produto'] == url
        assert result['usuario_id'] == 1

    @patch('requests.get')
    def test_scrape_failure_on_request_exception(self, mock_get):
        """
        Testa a falha do scraping do FastPathScraper quando ocorre uma exceção na requisição.
        """
        # Arrange
        mock_get.side_effect = Exception("Failed to connect")
        
        scraper = FastPathScraper()
        url = "http://www.example.com"
        
        # Act
        result = scraper.scrape(url, usuario_id=1)
        
        # Assert
        assert result is None

    @patch('requests.get')
    def test_scrape_incomplete_data(self, mock_get):
        """
        Testa o scraping do FastPathScraper quando o HTML não contém todos os dados.
        """
        # Arrange
        html_content = """
        <html>
            <body>
                <h1>Outro Produto</h1>
                {/* Preço faltando */}
            </body>
        </html>
        """
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.content = html_content.encode('utf-8')
        mock_get.return_value = mock_response
        
        scraper = FastPathScraper()
        url = "http://www.example.com"
        
        # Act
        result = scraper.scrape(url, usuario_id=1)
        
        # Assert
        assert result is None
