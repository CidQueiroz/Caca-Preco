from celery import shared_task
import logging
from .orchestrator import ScraperOrchestrator
from .models import ProdutosMonitoradosExternos
from api.models import Vendedor
from django.contrib.auth import get_user_model

logger = logging.getLogger(__name__)
User = get_user_model()

@shared_task(bind=True)
def run_scraping_task(self, url, user_id, strategy=None):
    """
    Tarefa Celery unificada para scraping.
    Usa o orquestrador para escolher automaticamente a melhor estratégia.
    """
    user = None
    if user_id:
        try:
            user = User.objects.get(id=user_id)
            logger.info(f"[TASK] Iniciando scraping para {url} (usuário: {user_id})")
            
        except User.DoesNotExist:
            error_msg = f"Usuário com ID {user_id} não encontrado."
            logger.error(f"[TASK] {error_msg}")
            return {"status": "error", "message": error_msg}
    else:
        logger.info(f"[TASK] Iniciando scraping para {url} (usuário: None - modo de teste)")
    
    try:
        # Usa o orquestrador
        resultado = ScraperOrchestrator.execute_scraping(
            url=url,
            usuario_id=user_id,
            strategy=strategy # type: ignore
        )
        
        if resultado:
            logger.info(f"[TASK] ✓ Scraping concluído: ")
                # Salva no banco
            try:
                vendedor = Vendedor.objects.get(usuario=user)
                
                produto_monitorado, created = ProdutosMonitoradosExternos.objects.update_or_create(
                    vendedor=vendedor,
                    url_produto=url,
                    defaults={
                        'nome_produto': resultado.get('nome_produto'),
                        'preco_atual': resultado.get('preco_atual'),
                    }
                )
                
                action = "criado" if created else "atualizado"
                logger.info(f"[TASK] Produto {action}: {produto_monitorado.id}")
                
            except Vendedor.DoesNotExist:
                logger.warning(f"[TASK] Usuário {user_id} não é vendedor")
            
            return {
                "status": "success",
                "message": "Scraping concluído",
                "data": resultado
            }
        else:
            return {"status": "error", "message": "Todas estratégias falharam"}
            
    except Exception as e:
        error_msg = f"Erro inesperado: {str(e)}"
        logger.error(f"[TASK] {error_msg}", exc_info=True)
        return {"status": "error", "message": error_msg}


@shared_task
def atualizar_precos_monitorados():
    """Tarefa periódica para atualizar preços"""
    logger.info("[TASK PERIÓDICA] Iniciando atualização...")
    
    produtos = ProdutosMonitoradosExternos.objects.filter(ativo=True)
    total = produtos.count()
    sucesso = 0
    falhas = 0
    
    for produto in produtos:
        try:
            resultado = ScraperOrchestrator.execute_scraping(
                url=produto.url_produto,
                usuario_id=produto.vendedor.usuario.id # type: ignore
            )
            
            if resultado:
                preco_novo = resultado.get('preco_atual')
                if preco_novo != produto.preco_atual:
                    logger.info(
                        f"[PERIÓDICA] Preço atualizado: {produto.nome_produto} "
                        f"R$ {produto.preco_atual:.2f} → R$ {preco_novo:.2f}"
                    )
                    produto.preco_atual = preco_novo # type: ignore
                    produto.save()
                sucesso += 1
            else:
                falhas += 1
                
        except Exception as e:
            falhas += 1
            logger.error(f"[PERIÓDICA] Erro em {produto.url_produto}: {e}")
    
    logger.info(f"[PERIÓDICA] Concluído: {sucesso}/{total} sucesso, {falhas} falhas")
    
    return {"total": total, "sucesso": sucesso, "falhas": falhas}