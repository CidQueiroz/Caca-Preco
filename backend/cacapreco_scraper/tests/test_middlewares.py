import pytest
from unittest.mock import patch, MagicMock
from scrapy.http import Request, HtmlResponse
from cacapreco_scraper.cacapreco_scraper.middlewares import SeleniumMiddleware

class TestSeleniumMiddleware:

    @pytest.fixture
    def middleware(self):
        return SeleniumMiddleware()

    def test_process_request_no_selenium_meta(self, middleware):
        request = Request('http://example.com')
        spider = MagicMock()
        assert middleware.process_request(request, spider) is None

    @patch('cacapreco_scraper.cacapreco_scraper.middlewares.webdriver')
    def test_process_request_with_selenium_meta(self, mock_webdriver, middleware):
        request = Request('http://example.com', meta={'selenium': True})
        spider = MagicMock()

        mock_driver = MagicMock()
        mock_webdriver.Chrome.return_value = mock_driver
        mock_driver.page_source = '<html></html>'
        mock_driver.current_url = 'http://example.com'

        response = middleware.process_request(request, spider)

        assert isinstance(response, HtmlResponse)
        mock_webdriver.Chrome.assert_called_once()
        mock_driver.get.assert_called_once_with('http://example.com')
        mock_driver.quit.assert_called_once()
