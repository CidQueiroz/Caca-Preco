from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProdutosMonitoradosExternosViewSet, 
    MonitorarProdutoView, 
    TaskStatusView, 
    HistoricoPrecosView
)

router = DefaultRouter()
router.register(r'produtos', ProdutosMonitoradosExternosViewSet, basename='produtos-monitorados')

urlpatterns = [
    # Rotas automáticas do ViewSet (GET /api/scraper/produtos/)
    path('', include(router.urls)),
    
    # Rotas manuais para as Actions
    path('monitorar/', MonitorarProdutoView.as_view(), name='monitorar-produto'),
    path('status/<str:task_id>/', TaskStatusView.as_view(), name='task-status'),
    path('historico/<int:pk>/', HistoricoPrecosView.as_view(), name='historico-precos'),
]