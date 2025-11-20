import logging
from urllib.parse import urlparse
from django.core.cache import cache
import os
import sys

logger = logging.getLogger(__name__)


class ScraperOrchestrator:
    """
    Orquestrador HÍBRIDO:
    - DECIDE quando sabe (rápido)
    - TENTA quando não sabe (adaptativo)
    - APRENDE para próxima vez (inteligente)
    """
    
    # Sites que JÁ SABEMOS qual estratégia usar
    KNOWN_SITES = {
        'shopee.com.br': 'long',
        'aliexpress.com': 'long',
        'shein.com': 'long',
        'mercadolivre.com.br': 'fast',
        'amazon.com.br': 'fast',
        'kabum.com.br': 'medium',
    }
    
    @classmethod
    def execute_scraping(cls, url, usuario_id=None, strategy=None):
        """Executa scraping usando abordagem híbrida"""
        
        domain = urlparse(url).netloc
        
        # 1️⃣ Estratégia FORÇADA (prioridade máxima)
        if strategy:
            logger.info(f"[FORÇADO] Usando estratégia: {strategy}")
            return cls._execute_strategy(strategy, url, usuario_id)
        
        # 2️⃣ DECISÃO: Site na lista conhecida
        if domain in cls.KNOWN_SITES:
            known_strategy = cls.KNOWN_SITES[domain]
            logger.info(f"[DECISÃO] {domain} → {known_strategy} (conhecido)")
            return cls._execute_strategy(known_strategy, url, usuario_id)
        
        # 3️⃣ DECISÃO: Site aprendido (cache)
        cached_strategy = cache.get(f'strategy:{domain}')
        if cached_strategy:
            logger.info(f"[DECISÃO] {domain} → {cached_strategy} (aprendido)")
            return cls._execute_strategy(cached_strategy, url, usuario_id)
        
        # 4️⃣ TENTATIVA: Site desconhecido (cascata)
        logger.info(f"[TENTATIVA] {domain} desconhecido. Iniciando cascata...")
        
        # Tenta Fast → Medium → Long
        for strategy_name in ['fast', 'medium', 'long']:
            logger.info(f"[TENTATIVA] Tentando {strategy_name.upper()} Path...")
            
            result = cls._execute_strategy(strategy_name, url, usuario_id)
            
            if result:
                # ✅ SUCESSO! Aprende para próxima vez
                logger.info(f"[APRENDIZADO] {domain} funcionou com {strategy_name}")
                cls._save_learned_strategy(domain, strategy_name)
                return result
            else:
                logger.warning(f"[TENTATIVA] {strategy_name.upper()} falhou. Próxima...")
        
        # ❌ Todas falharam
        logger.error(f"[FALHA TOTAL] Nenhuma estratégia funcionou para {url}")
        return None
    
    @classmethod
    def _execute_strategy(cls, strategy, url, usuario_id):
        """Executa uma estratégia específica"""
        
        if strategy == 'fast':
            from .strategies.fast_path import FastPathScraper
            scraper = FastPathScraper()
            return scraper.scrape(url, usuario_id)
        
        elif strategy == 'medium':
            return cls._execute_medium_path(url, usuario_id)
        
        elif strategy == 'long':
            return cls._execute_long_path(url, usuario_id)
        
        else:
            logger.error(f"Estratégia inválida: {strategy}")
            return None
    
    @classmethod
    def _save_learned_strategy(cls, domain, strategy):
        """Salva estratégia que funcionou para uso futuro"""
        # Cache por 7 dias
        cache.set(f'strategy:{domain}', strategy, timeout=604800)
    
    @classmethod
    def _execute_medium_path(cls, url, usuario_id):
        """Executa Medium Path (Scrapy Generic)"""
        try:
            from scrapy.crawler import CrawlerProcess
            from scrapy.utils.project import get_project_settings
            from scrapy import signals
            from scrapy.signalmanager import dispatcher
            
            # Configura path do Scrapy
            scrapy_dir = os.path.join(
                os.path.dirname(os.path.dirname(__file__)), 
                'cacapreco_scraper'
            )
            
            if scrapy_dir not in sys.path:
                sys.path.insert(0, scrapy_dir)
            
            # Import do spider - tenta várias localizações possíveis
            try:
                # Tenta import direto
                from cacapreco_scraper.spiders.generic_scrapy_spider import GenericScrapySpider
            except ImportError:
                try:
                    # Tenta import do subdiretório
                    sys.path.insert(0, os.path.join(scrapy_dir, 'cacapreco_scraper'))
                    from spiders.generic_scrapy_spider import GenericScrapySpider
                except ImportError as e:
            os.environ.setdefault('SCRAPY_SETTINGS_MODULE', 'cacapreco_scraper.settings')
            settings = get_project_settings()
            
            # Desabilita logs do Scrapy
            settings.set('LOG_ENABLED', False)
            
            process = CrawlerProcess(settings)
            
            results = []
            
            def collect_items(item, response, spider):
                results.append(dict(item))
            
            dispatcher.connect(collect_items, signal=signals.item_scraped)
            
            # Seletores genéricos (pode ser melhorado depois)
            process.crawl(
                GenericScrapySpider,
                start_urls=url,
                name_selector='h1.ui-pdp-title',  # Mercado Livre como padrão
                price_selector='span.andes-money-amount__fraction',
                usuario_id=str(usuario_id) if usuario_id else None
            )
            
            process.start()
            
            if results:
                logger.info(f"[MEDIUM] ✓ Sucesso: {results[0].get('nome_produto')}")
                return results[0]
            else:
                logger.warning("[MEDIUM] ✗ Nenhum resultado")
                return None
            
        except Exception as e:
            logger.error(f"[MEDIUM PATH] Erro: {e}", exc_info=True)
            return None
    
    @classmethod
    def _execute_long_path(cls, url, usuario_id):
        """Executa Long Path (Playwright via Scrapy)"""
        try:
            from scrapy.crawler import CrawlerProcess
            from scrapy.utils.project import get_project_settings
            from scrapy import signals
            from scrapy.signalmanager import dispatcher
            
            # Configura path do Scrapy
            scrapy_dir = os.path.join(
                os.path.dirname(os.path.dirname(__file__)), 
                'cacapreco_scraper'
            )
            
            if scrapy_dir not in sys.path:
                sys.path.insert(0, scrapy_dir)
            
            # Import do spider - tenta várias localizações
            try:
                from cacapreco_scraper.spiders.playwright_spider import PlaywrightSpider
            except ImportError:
                try:
                    sys.path.insert(0, os.path.join(scrapy_dir, 'cacapreco_scraper'))
                    from spiders.playwright_spider import PlaywrightSpider
                except ImportError as e:
                    logger.error(f"[LONG] Não foi possível importar PlaywrightSpider: {e}")
                    return None
            
            # Configura settings
            os.environ.setdefault('SCRAPY_SETTINGS_MODULE', 'cacapreco_scraper.settings')
            settings = get_project_settings()
            
            # Desabilita logs do Scrapy
            settings.set('LOG_ENABLED', False)
            
            process = CrawlerProcess(settings)
            
            results = []
            
            def collect_items(item, response, spider):
                results.append(dict(item))
            
            dispatcher.connect(collect_items, signal=signals.item_scraped)
            
            process.crawl(
                PlaywrightSpider, 
                url=url, 
                usuario_id=str(usuario_id) if usuario_id else None
            )
            
            process.start()
            
            if results:
                logger.info(f"[LONG] ✓ Sucesso: {results[0].get('nome_produto')}")
                return results[0]
            else:
                logger.warning("[LONG] ✗ Nenhum resultado")
                return None
            
        except Exception as e:
            logger.error(f"[LONG PATH] Erro: {e}", exc_info=True)
            return None