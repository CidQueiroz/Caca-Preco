# SeuAplicativo/tasks.py
import os
import subprocess
import logging
from celery import shared_task
from django.conf import settings

@shared_task
def run_spider_task(url_concorrente, usuario_id):
    """
    Tarefa do Celery para executar o spider do Scrapy de forma assíncrona via subprocesso.
    """
    try:
        scrapy_project_path = os.path.join(settings.BASE_DIR, 'cacapreco_scraper')
        logging.info(f"Iniciando spider no diretório: {scrapy_project_path} para a URL: {url_concorrente}")

        # O comando 'scrapy' deve estar no PATH do ambiente do Celery, 
        # ou você pode especificar o caminho completo para o executável do scrapy.
        command = [
            'xvfb-run',
            '--auto-servernum',
            '--server-args', '-screen 0 1280x1024x24',
            'scrapy',
            'crawl',
            'selenium_spider',
            '-a',
            f'url={url_concorrente}',
            '-a',
            f'usuario_id={usuario_id}',
        ]
        
        # Executa o comando Scrapy a partir do diretório do projeto Scrapy
        result = subprocess.run(
            command, 
            cwd=scrapy_project_path, 
            capture_output=True, 
            text=True, 
            check=True # Lança uma exceção se o Scrapy retornar um erro
        )

        logging.info(f"Spider finalizado com sucesso. Saída:\n{result.stdout}")
        if result.stderr:
            logging.warning(f"Spider com avisos (stderr):\n{result.stderr}")

    except subprocess.CalledProcessError as e:
        # Erro na execução do Scrapy (ex: spider não encontrado, erro no spider)
        logging.error(
            f"Erro ao executar o spider do Scrapy.\n"
            f"Comando: {' '.join(e.cmd)}\n"
            f"Exit Code: {e.returncode}\n"
            f"Stdout: {e.stdout}\n"
            f"Stderr: {e.stderr}",
            exc_info=True
        )
    except FileNotFoundError:
        # Erro se o comando 'scrapy' não for encontrado
        logging.error(
            "Comando 'scrapy' não encontrado. Verifique se o Scrapy está instalado "
            "no ambiente do Celery e se o PATH está configurado corretamente.",
            exc_info=True
        )
    except Exception as e:
        # Outros erros inesperados
        logging.error(f"Um erro inesperado ocorreu na tarefa do Celery: {e}", exc_info=True)

    return "Tarefa de raspagem finalizada."
