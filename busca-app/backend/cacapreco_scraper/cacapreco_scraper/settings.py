import sys
import os
import django

# Aponta para a pasta do seu projeto Django
sys.path.append(os.path.join(os.path.dirname(__file__), '../../'))
os.environ['DJANGO_SETTINGS_MODULE'] = 'core.settings' # Substitua pelo nome do seu projeto
django.setup()

# Scrapy settings for cacapreco_scraper project
#
# For simplicity, this file contains only settings considered important or
# commonly used. You can find more settings consulting the documentation:
#
#     https://docs.scrapy.org/en/latest/topics/settings.html
#     https://docs.scrapy.org/en/latest/topics/downloader-middleware.html
#     https://docs.scrapy.org/en/latest/topics/spider-middleware.html

BOT_NAME = "cacapreco_scraper"

SPIDER_MODULES = ["cacapreco_scraper.spiders"]
NEWSPIDER_MODULE = "cacapreco_scraper.spiders"

USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 13_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.1 Safari/605.1.15',
]

# Obey robots.txt rules
ROBOTSTXT_OBEY = False

# --- Configurações de Concorrência e Atraso ---
# Para evitar sobrecarregar os sites e diminuir a chance de ser bloqueado.
CONCURRENT_REQUESTS_PER_DOMAIN = 1
DOWNLOAD_DELAY = 2 # Aumentar o delay pode ser mais seguro

# --- Configurações do Selenium ---
# Caminho para o perfil do Chrome para sessões persistentes
CHROME_PROFILE_PATH = os.path.join(os.path.dirname(__file__), "perfil_chrome")

# Habilita o manipulador de download do Playwright para requisições HTTP e HTTPS
# DOWNLOAD_HANDLERS = {
#     "http": "scrapy_playwright.handler.ScrapyPlaywrightDownloadHandler",
#     "https": "scrapy_playwright.handler.ScrapyPlaywrightDownloadHandler",
# }

# Reator Twisted necessário para o Playwright
# TWISTED_REACTOR = "twisted.internet.asyncioreactor.AsyncioSelectorReactor"

# Configurações de lançamento do navegador Playwright
PLAYWRIGHT_LAUNCH_OPTIONS = {
    "headless": True,  # Mude para False para ver o navegador durante os testes
    "args": [
        "--disable-blink-features=AutomationControlled",
    ],
}

# Timeout de navegação padrão do Playwright
PLAYWRIGHT_DEFAULT_NAVIGATION_TIMEOUT = 60 * 1000  # 60 segundos

# Define o tipo de navegador a ser usado pelo Playwright
PLAYWRIGHT_BROWSER_TYPE = "chromium"


DOWNLOADER_MIDDLEWARES = {
   # 'cacapreco_scraper.middlewares.SeleniumMiddleware': 543, # Desativado para usar Playwright
}

# --- Pipeline de Itens ---
# Ativa o pipeline para salvar os dados no banco de dados Django.
ITEM_PIPELINES = {
   "cacapreco_scraper.pipelines.DjangoPipeline": 300,
}

# --- API Settings ---
DJANGO_API_URL = "http://localhost:8000"
SCRAPY_API_KEY = "your_secret_api_key"

# --- Codificação de Saída ---
FEED_EXPORT_ENCODING = "utf-8"
FEED_FORMAT = 'json'
FEED_URI = 'file:///tmp/scrapy_output.json'
