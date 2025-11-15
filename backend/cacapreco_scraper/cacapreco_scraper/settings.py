# Scrapy settings for cacapreco_scraper project

BOT_NAME = 'cacapreco_scraper'

SPIDER_MODULES = ['cacapreco_scraper.spiders']
NEWSPIDER_MODULE = 'cacapreco_scraper.spiders'

# Respeita robots.txt
ROBOTSTXT_OBEY = False

# Configurações de concorrência
CONCURRENT_REQUESTS = 16
CONCURRENT_REQUESTS_PER_DOMAIN = 1  # Evita rate limiting
DOWNLOAD_DELAY = 2  # 2 segundos entre requests

# Configurações de timeout
DOWNLOAD_TIMEOUT = 30

# User Agents rotativos
USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
]

# Headers padrão
DEFAULT_REQUEST_HEADERS = {
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
}

# Pipelines (ordem importa!)
ITEM_PIPELINES = {
    # 'cacapreco_scraper.pipelines.DebugPipeline': 100,        # Debug (descomente se precisar)
    'cacapreco_scraper.pipelines.ValidationPipeline': 200,     # Validação primeiro
    'cacapreco_scraper.pipelines.DjangoPipeline': 300,         # Salva no Django
}

# Corrige o warning de REQUEST_FINGERPRINTER
REQUEST_FINGERPRINTER_IMPLEMENTATION = '2.7'

# Configurações de feed (export)
FEEDS = {
    '/tmp/scrapy_output.json': {
        'format': 'json',
        'encoding': 'utf-8',
        'store_empty': False,
        'overwrite': True,
    }
}

# Middlewares
DOWNLOADER_MIDDLEWARES = {
    'scrapy.downloadermiddlewares.useragent.UserAgentMiddleware': None,
    'scrapy_user_agents.middlewares.RandomUserAgentMiddleware': 400,  # Se instalado
}

# Log
LOG_LEVEL = 'INFO'  # DEBUG, INFO, WARNING, ERROR
LOG_ENABLED = True

# Autothrottle (ajusta velocidade automaticamente)
AUTOTHROTTLE_ENABLED = True
AUTOTHROTTLE_START_DELAY = 2
AUTOTHROTTLE_MAX_DELAY = 10
AUTOTHROTTLE_TARGET_CONCURRENCY = 2.0

# Cache (útil para desenvolvimento)
HTTPCACHE_ENABLED = False
HTTPCACHE_EXPIRATION_SECS = 0
HTTPCACHE_DIR = 'httpcache'

# Retry
RETRY_ENABLED = True
RETRY_TIMES = 3
RETRY_HTTP_CODES = [500, 502, 503, 504, 408, 429]

# Telnet (console remoto para debug)
TELNETCONSOLE_ENABLED = True
TELNETCONSOLE_PORT = [6023, 6024]

# Extensões
EXTENSIONS = {
    'scrapy.extensions.telnet.TelnetConsole': None,  # Desabilita se não usar
}

# Twisted Reactor (performance)
TWISTED_REACTOR = 'twisted.internet.asyncioreactor.AsyncioSelectorReactor'

# Memory usage
MEMUSAGE_ENABLED = True
MEMUSAGE_LIMIT_MB = 512  # Alerta se passar de 512MB
MEMUSAGE_WARNING_MB = 256