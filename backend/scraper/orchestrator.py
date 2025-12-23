import logging
import subprocess
import sys
import os
import json
from urllib.parse import urlparse
from django.conf import settings

logger = logging.getLogger(__name__)

class ScraperOrchestrator:
    """
    Orquestrador SEGURO usando Subprocessos.
    Evita o erro 'ReactorNotRestartable' rodando o Scrapy isolado do Django.
    """
    
    # Caminho para o executável Python do ambiente virtual atual
    PYTHON_EXEC = sys.executable 
    
    # Caminho raiz do projeto Scrapy (onde está o scrapy.cfg)
    # Ajuste se a pasta se chamar diferente, ex: 'backend/scraper'
    SCRAPY_ROOT = os.path.join(settings.BASE_DIR, 'cacapreco_scraper')

    # Mapa de domínios para spiders específicos
    KNOWN_SITES = {
        'shopee.com.br': 'playwright_spider',      # Precisa de JS pesado
        'aliexpress.com': 'playwright_spider',     # Precisa de JS pesado
        'shein.com': 'playwright_spider',
        'mercadolivre.com.br': 'generic_scrapy_spider',
        'amazon.com.br': 'generic_scrapy_spider',
        'kabum.com.br': 'generic_scrapy_spider',
        'magazineluiza.com.br': 'generic_scrapy_spider',
    }
    
    @classmethod
    def execute_scraping(cls, url, usuario_id=None, strategy=None):
        """
        Fluxo principal:
        1. Tenta Fast Path (Requests puro - muito rápido).
        2. Se falhar, invoca um Subprocesso do Scrapy (Medium ou Long path).
        """
        domain = urlparse(url).netloc.replace('www.', '')
        
        # ---------------------------------------------------------
        # 1. TENTATIVA FAST PATH (Sem abrir navegador/subprocesso)
        # ---------------------------------------------------------
        # Só tentamos se não for forçada uma estratégia pesada
        if strategy != 'long':
            try:
                from .strategies.fast_path import FastPathScraper
                logger.info(f"[ORCHESTRATOR] Tentando Fast Path para {domain}")
                result = FastPathScraper().scrape(url, usuario_id)
                if result:
                    return result
            except Exception as e:
                logger.warning(f"[ORCHESTRATOR] Fast Path falhou, indo para Scrapy: {e}")

        # ---------------------------------------------------------
        # 2. DECISÃO DO SPIDER (Medium vs Long)
        # ---------------------------------------------------------
        spider_name = 'generic_scrapy_spider' # Padrão (Medium Path)
        
        if strategy == 'long':
            spider_name = 'playwright_spider'
        elif domain in cls.KNOWN_SITES:
            spider_name = cls.KNOWN_SITES[domain]
        
        logger.info(f"[ORCHESTRATOR] Iniciando Subprocesso Scrapy: {spider_name}")

        # ---------------------------------------------------------
        # 3. EXECUÇÃO VIA SUBPROCESSO (Seguro)
        # ---------------------------------------------------------
        return cls._run_spider_subprocess(spider_name, url, usuario_id)

    @classmethod
    def _run_spider_subprocess(cls, spider_name, url, usuario_id):
        """
        Executa o Scrapy em um processo separado do SO.
        Isso garante que o Twisted Reactor seja criado e destruído limpamente.
        """
        # Arquivo temporário para receber o JSON do Scrapy
        import uuid
        output_file = f"/tmp/scraping_{uuid.uuid4()}.json"
        
        # Argumentos passados para o Spider
        spider_args = [
            cls.PYTHON_EXEC, '-m', 'scrapy', 'crawl', spider_name,
            '-a', f'start_urls={url}',  # Para generic_spider
            '-a', f'url={url}',         # Para playwright_spider
            '-a', f'usuario_id={usuario_id}',
            '-O', output_file,          # -O sobrescreve o arquivo de saída
            '-s', 'LOG_LEVEL=INFO'      # Reduz ruído no terminal
        ]

        try:
            # Verifica se a pasta do projeto Scrapy existe
            if not os.path.exists(cls.SCRAPY_ROOT):
                logger.error(f"Pasta do Scrapy não encontrada em: {cls.SCRAPY_ROOT}")
                return None

            # Executa o comando no terminal do sistema
            logger.debug(f"Executando comando: {' '.join(spider_args)}")
            
            result = subprocess.run(
                spider_args, 
                cwd=cls.SCRAPY_ROOT, # Executa DENTRO da pasta do projeto Scrapy
                capture_output=True, 
                text=True, 
                timeout=120 # Timeout de 2 minutos para evitar zumbis
            )
            
            # Log de erro do stderr do Scrapy (se houver falha grave)
            if result.returncode != 0:
                logger.error(f"Scrapy falhou (Exit Code {result.returncode}). Stderr: {result.stderr}")
                return None

            # Lê o resultado do arquivo JSON gerado
            if os.path.exists(output_file):
                try:
                    with open(output_file, 'r', encoding='utf-8') as f:
                        content = f.read().strip()
                        if content:
                            data = json.loads(content)
                            if isinstance(data, list) and len(data) > 0:
                                item = data[0]
                                logger.info(f"[ORCHESTRATOR] Sucesso no subprocesso: {item.get('nome_produto')}")
                                return item
                except json.JSONDecodeError:
                    logger.error(f"Erro ao decodificar JSON de saída: {content}")
                finally:
                    # Limpeza: remove o arquivo temporário
                    try:
                        os.remove(output_file)
                    except OSError:
                        pass
            
            logger.warning("[ORCHESTRATOR] Scrapy rodou mas não retornou dados válidos.")
            return None

        except subprocess.TimeoutExpired:
            logger.error("[ORCHESTRATOR] Timeout: O spider demorou muito para responder.")
            return None
        except Exception as e:
            logger.error(f"[ORCHESTRATOR] Erro crítico ao invocar subprocesso: {e}")
            return None