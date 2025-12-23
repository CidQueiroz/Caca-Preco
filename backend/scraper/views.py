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

# --- CORREÇÃO AQUI: Importando a task correta ---
from .tasks import run_scraping_task 


class ProdutosMonitoradosExternosViewSet(mixins.ListModelMixin,
                                         mixins.RetrieveModelMixin,
                                         mixins.DestroyModelMixin,
                                         viewsets.GenericViewSet):
    serializer_class = ProdutosMonitoradosExternosSerializer
    permission_classes = [IsAuthenticated, IsVendedor]

    def get_queryset(self) -> QuerySet[ProdutosMonitoradosExternos]:
        return ProdutosMonitoradosExternos.objects.filter(vendedor__usuario=self.request.user)


class MonitorarProdutoView(APIView):
    """
    Dispara a tarefa assíncrona que orquestra o pipeline de scraping.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        url_concorrente = request.data.get('url')
        usuario_id = request.user.id

        if not url_concorrente:
            return Response({'error': 'URL não fornecida.'}, status=status.HTTP_400_BAD_REQUEST)

        # Verifica permissão de vendedor
        try:
            Vendedor.objects.get(usuario=request.user)
        except Vendedor.DoesNotExist:
            return Response({'error': 'Apenas vendedores podem monitorar produtos.'}, status=status.HTTP_403_FORBIDDEN)

        # Limpa a URL
        try:
            url_limpa = get_canonical_url(url_concorrente)
        except Exception:
            url_limpa = url_concorrente

        task = run_scraping_task.delay(url_limpa, usuario_id)

        return Response({
            'message': 'Monitoramento iniciado.',
            'task_id': task.id,
            'url_processada': url_limpa
        }, status=status.HTTP_202_ACCEPTED)


class TaskStatusView(APIView):
    """
    Verifica o status de uma tarefa do Celery.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, task_id, *args, **kwargs):
        task_result = AsyncResult(task_id)
        
        response = {
            'task_id': task_id,
            'status': task_result.status,
        }

        # Se terminou (Sucesso ou Falha), anexa o resultado
        if task_result.ready():
            if task_result.successful():
                response['result'] = task_result.result
            else:
                # Converte a exceção para string para não quebrar o JSON
                response['error'] = str(task_result.result)
        
        return Response(response, status=status.HTTP_200_OK)


class HistoricoPrecosView(generics.RetrieveAPIView):
    queryset = ProdutosMonitoradosExternos.objects.all()
    serializer_class = ProdutosMonitoradosExternosComHistoricoSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'pk'