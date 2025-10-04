from rest_framework import viewsets, status, generics, mixins
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models.query import QuerySet
from celery.result import AsyncResult

# Imports from the 'api' app
from api.permissions import IsVendedor
from api.models import Vendedor

# Imports from the local 'scraper' app
from .models import ProdutosMonitoradosExternos, get_canonical_url
from .serializers import ProdutosMonitoradosExternosSerializer, ProdutosMonitoradosExternosComHistoricoSerializer
# from .tasks import run_scraping_pipeline # This will be moved later


class ProdutosMonitoradosExternosViewSet(mixins.ListModelMixin,
                                         mixins.RetrieveModelMixin,
                                         mixins.DestroyModelMixin,
                                         viewsets.GenericViewSet):
    serializer_class = ProdutosMonitoradosExternosSerializer
    permission_classes = [IsAuthenticated, IsVendedor]

    def get_queryset(self) -> QuerySet[ProdutosMonitoradosExternos]: # type: ignore
        # Assuming the user model has a 'vendedor' related object
        return ProdutosMonitoradosExternos.objects.filter(vendedor=self.request.user.vendedor) # type: ignore


class MonitorarProdutoView(APIView):
    """
    Dispara a tarefa assíncrona que orquestra o pipeline de scraping.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        from .tasks import run_scraping_pipeline # Local import to avoid circular dependency issues at startup
        url_concorrente = request.data.get('url')
        usuario_id = request.user.id

        if not url_concorrente:
            return Response({'error': 'URL não fornecida.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            # Check if the user has a Vendedor profile
            Vendedor.objects.get(usuario=request.user)
        except Vendedor.DoesNotExist:
            return Response({'error': 'Apenas vendedores podem monitorar produtos.'}, status=status.HTTP_403_FORBIDDEN)

        # Limpa a URL para remover parâmetros de marketing e tracking
        url_limpa = get_canonical_url(url_concorrente)

        # Dispara a tarefa principal do Celery com a URL limpa
        task = run_scraping_pipeline.delay(url_limpa, usuario_id)

        # Retorna uma resposta imediata para o frontend com o ID da tarefa
        return Response({
            'message': 'O monitoramento foi iniciado. Você será notificado quando for concluído.',
            'task_id': task.id
        }, status=status.HTTP_202_ACCEPTED)


class TaskStatusView(APIView):
    """
    Verifica o status de uma tarefa do Celery para o frontend poder pollar.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, task_id, *args, **kwargs):
        task_result = AsyncResult(task_id)
        result = {
            'task_id': task_id,
            'status': task_result.status,
            'result': task_result.result if task_result.ready() else None
        }
        return Response(result, status=status.HTTP_200_OK)


class HistoricoPrecosView(generics.RetrieveAPIView):
    queryset = ProdutosMonitoradosExternos.objects.all()
    serializer_class = ProdutosMonitoradosExternosComHistoricoSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'pk'