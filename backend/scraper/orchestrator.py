import logging
from urllib.parse import urlparse

logger = logging.getLogger(__name__)


class ScraperOrchestrator:
    """
    Orquestra a estratégia de scraping baseado em:
    - Domínio do site
    - Histórico de sucesso/falha
    """
    
    # Sites que SEMPRE precisam de JS (Long Path)
    REQUIRES_JS = [
        'shopee.com.br',
        'aliexpress.com',
        'shein.com',
    ]
    
    # Sites que funcionam com Scrapy (Medium Path)
    SCRAPY_FRIENDLY = [
        'kabum.com.br',
        'pichau.com.br',
    ]
    
    @classmethod
    def choose_strategy(cls, url: str, force_strategy: str = None) -> str:
        """
        Escolhe a melhor estratégia de scraping.
        
        Args:
            url: URL do produto
            force_strategy: Força uma estratégia específica
        
        Returns:
            'fast', 'medium' ou 'long'
        """
        if force_strategy:
            logger.info(f"[ORCHESTRATOR] Estratégia forçada: {force_strategy}")
            return force_strategy
        
        domain = urlparse(url).netloc
        
        # Verifica domínios conhecidos
        for js_site in cls.REQUIRES_JS:
            if js_site in domain:
                logger.info(f"[ORCHESTRATOR] {domain} requer JS → LONG PATH")
                return 'long'
        
        for scrapy_site in cls.SCRAPY_FRIENDLY:
            if scrapy_site in domain:
                logger.info(f"[ORCHESTRATOR] {domain} funciona com Scrapy → MEDIUM PATH")
                return 'medium'
        
        # Sites desconhecidos: tenta Fast primeiro
        logger.info(f"[ORCHESTRATOR] {domain} desconhecido → FAST PATH primeiro")
        return 'fast'
    
    @classmethod
    def execute_scraping(cls, url: str, usuario_id: int = None, strategy: str = None):
        """
        Executa o scraping usando a estratégia escolhida.
        
        Args:
            url: URL do produto
            usuario_id: ID do usuário (opcional)
            strategy: Estratégia forçada ou None
        
        Returns:
            dict com dados do produto ou None
        """
        from .strategies.fast_path import FastPathScraper # type: ignore
        
        chosen_strategy = cls.choose_strategy(url, strategy)
        
        try:
            if chosen_strategy == 'fast':
                logger.info("[ORCHESTRATOR] Executando FAST PATH")
                scraper = FastPathScraper()
                result = scraper.scrape(url, usuario_id)
                
                if result:
                    return result
                else:
                    # Fallback para Long Path se Fast falhar
                    logger.warning("[ORCHESTRATOR] Fast falhou → Tentando LONG PATH")
                    return cls._execute_long_path(url, usuario_id)
            
            elif chosen_strategy == 'medium':
                logger.info("[ORCHESTRATOR] Executando MEDIUM PATH")
                # TODO: Implementar Medium Path (Scrapy)
                logger.warning("[ORCHESTRATOR] Medium Path não implementado ainda → LONG PATH")
                return cls._execute_long_path(url, usuario_id)
            
            else:  # long
                logger.info("[ORCHESTRATOR] Executando LONG PATH")
                return cls._execute_long_path(url, usuario_id)
        
        except Exception as e:
            logger.error(f"[ORCHESTRATOR] Erro fatal no scraping: {e}")
            return None
    
    @classmethod
    def _execute_long_path(cls, url: str, usuario_id: int = None):
        """Executa Long Path (Playwright via Scrapy)"""
        try:
            from scrapy.crawler import CrawlerProcess
            from scrapy.utils.project import get_project_settings
            from .spiders.playwright_spider import PlaywrightSpider # type: ignore
            
            # Configura e executa spider
            settings = get_project_settings()
            settings.set('LOG_LEVEL', 'INFO')
            
            process = CrawlerProcess(settings)
            
            # Armazena resultado
            results = []
            
            def collect_items(item, response, spider):
                results.append(dict(item))
            
            from scrapy import signals
            from scrapy.signalmanager import dispatcher
            dispatcher.connect(collect_items, signal=signals.item_scraped)
            
            process.crawl(
                PlaywrightSpider,
                url=url,
                usuario_id=str(usuario_id) if usuario_id else None
            )
            process.start()
            
            return results[0] if results else None
            
        except Exception as e:
            logger.error(f"[ORCHESTRATOR] Erro no Long Path: {e}")
            return None