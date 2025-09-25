from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ProdutosMonitoradosExternosViewSet,
    HistoricoPrecosView,
    MonitorarProdutoView,
    TaskStatusView,
)

router = DefaultRouter()
router.register(r'monitoramento', ProdutosMonitoradosExternosViewSet, basename='produtos-monitorados')

urlpatterns = [
    path('', include(router.urls)),
    path('monitoramento/<int:pk>/historico/', HistoricoPrecosView.as_view(), name='historico-precos'),
    path('iniciar-monitoramento/', MonitorarProdutoView.as_view(), name='iniciar-monitoramento'),
    path('task-status/<str:task_id>/', TaskStatusView.as_view(), name='task-status'),
]