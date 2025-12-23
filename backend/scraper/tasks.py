from celery import shared_task
import logging
from django.contrib.auth import get_user_model
from django.utils import timezone

# Importe seus modelos corretamente
# AJUSTE O IMPORT ABAIXO SE SEUS MODELS ESTIVEREM EM OUTRA PASTA (ex: core.models, api.models)
from api.models import Vendedor
from scraper.models import ProdutosMonitoradosExternos 

logger = logging.getLogger(__name__)
User = get_user_model()

@shared_task(bind=True)
def run_scraping_task(self, url, user_id, strategy=None):
    """
    Tarefa Celery que roda em background.
    Chama o orquestrador e salva o resultado no banco.
    """
    from .orchestrator import ScraperOrchestrator
    
    logger.info(f"[TASK] Iniciando job para: {url} (User: {user_id})")
    
    try:
        # 1. Executa o Scraping (Isso vai rodar o FastPath ou o Subprocesso Scrapy)
        resultado = ScraperOrchestrator.execute_scraping(
            url=url, 
            usuario_id=user_id, 
            strategy=strategy
        )
        
        if not resultado:
            logger.error(f"[TASK] Falha: Nenhum dado retornado para {url}")
            return {"status": "error", "message": "Scraping falhou ou retornou vazio"}

        # 2. Salva no Banco de Dados
        logger.info(f"[TASK] Sucesso! Salvando produto: {resultado.get('nome_produto')}")
        
        # Tenta encontrar o Vendedor associado ao User
        try:
            user = User.objects.get(id=user_id)
            vendedor = Vendedor.objects.get(usuario=user)
            
            # Cria ou Atualiza o produto monitorado
            produto, created = ProdutosMonitoradosExternos.objects.update_or_create(
                vendedor=vendedor,
                url_produto=url,
                defaults={
                    'nome_produto': resultado['nome_produto'],
                    'preco_atual': resultado['preco_atual'],
                    'ultima_coleta': timezone.now(),
                    'ativo': True
                }
            )
            
            status = "CRIADO" if created else "ATUALIZADO"
            logger.info(f"[TASK] DB {status}: ID {produto.id} - R$ {produto.preco_atual}")
            
            return {
                "status": "success",
                "action": status,
                "data": resultado
            }
            
        except Vendedor.DoesNotExist:
            # Se o usuário não for vendedor, apenas logamos (ou salvamos em ScrapedData se quiser)
            logger.warning(f"[TASK] Usuário {user_id} não é Vendedor. Resultado não salvo em ProdutosMonitorados.")
            return {"status": "success", "data": resultado, "warning": "User not Vendor"}
            
    except Exception as e:
        logger.error(f"[TASK] Erro crítico: {e}", exc_info=True)
        return {"status": "error", "message": str(e)}