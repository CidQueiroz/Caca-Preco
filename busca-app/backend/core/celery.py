import os
from celery import Celery

# Define a variável de ambiente para as configurações do Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

# Cria a instância da aplicação Celery
app = Celery('core')

# Usa as configurações do Django para o Celery
app.config_from_object('django.conf:settings', namespace='CELERY')

# Carrega as tarefas do Celery a partir de todos os aplicativos Django
app.autodiscover_tasks()

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')