from rest_framework.exceptions import PermissionDenied
import requests
from bs4 import BeautifulSoup
from django.http import Http404
from rest_framework import viewsets, status, generics, serializers, mixins
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework_simplejwt.views import TokenObtainPairView
from .permissions import IsVendedor, IsCliente, IsOwnerOrReadOnly, IsAdminUserOrReadOnly
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.db import transaction
from django.db.models.query import QuerySet
from django.urls import reverse
from django.utils import timezone
from datetime import timedelta  
from django.core.mail import send_mail
import uuid
from django.conf import settings
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
import os
import json
import logging

from celery.result import AsyncResult

from scraper.orchestrator import ScraperOrchestrator
from scraper.tasks import run_scraping_task
from scraper.models import ProdutosMonitoradosExternos

logger = logging.getLogger(__name__)

from .models import (
    Usuario, CategoriaLoja, SubcategoriaProduto, Produto, Atributo, ValorAtributo, SKU, 
    OfertaProduto, ImagemSKU, Vendedor, Cliente, Endereco, AvaliacaoLoja, Sugestao, Administrador
)

from .serializers import (
    UserSerializer, CategoriaLojaSerializer, SubcategoriaProdutoSerializer,
    ProdutoSerializer, AtributoSerializer, ValorAtributoSerializer, SKUSerializer, 
    OfertaProdutoSerializer, VendedorSerializer, ClienteSerializer, EnderecoSerializer, 
    AvaliacaoLojaSerializer, SugestaoSerializer, MeusProdutosSerializer, AdminSerializer, 
    ProdutosMonitoradosExternosSerializer, MyTokenObtainPairSerializer
)


class UserCreateView(generics.CreateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        serializer.validated_data['token_verificacao'] = uuid.uuid4()
        serializer.validated_data['token_verificacao_expiracao'] = timezone.now() + timedelta(minutes=15)
        user = serializer.save()
        verification_url = f"{settings.FRONTEND_BASE_URL}/verificar-email/{user.token_verificacao}"

        send_mail(
            'Verifique seu e-mail - Caça Preço',
            f'Olá, por favor, clique no link para verificar seu e-mail: {verification_url}',
            'noreply@cacapreco.com',
            [user.email],
            fail_silently=False,
        )

class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

class MonitoramentoViewSet(viewsets.ModelViewSet):
    queryset = ProdutosMonitoradosExternos.objects.all()
    serializer_class = ProdutosMonitoradosExternosSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self): # type: ignore
        if self.request.user.is_authenticated:
            try:
                vendedor = Vendedor.objects.get(usuario=self.request.user)
                return ProdutosMonitoradosExternos.objects.filter(vendedor=vendedor)
            except Vendedor.DoesNotExist:
                return ProdutosMonitoradosExternos.objects.none()
        return ProdutosMonitoradosExternos.objects.none()

class CategoriaLojaViewSet(viewsets.ModelViewSet):
    queryset = CategoriaLoja.objects.all()
    serializer_class = CategoriaLojaSerializer
    permission_classes = [IsAdminUserOrReadOnly]

class SubcategoriaProdutoViewSet(viewsets.ModelViewSet):
    queryset = SubcategoriaProduto.objects.all()
    serializer_class = SubcategoriaProdutoSerializer
    permission_classes = [IsAdminUserOrReadOnly]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['categoria_loja']

    def perform_create(self, serializer):
        nome = serializer.validated_data.get('nome')
        if nome:
            serializer.validated_data['nome'] = nome.strip().capitalize()
        super().perform_create(serializer)

    def perform_update(self, serializer):
        nome = serializer.validated_data.get('nome')
        if nome:
            serializer.validated_data['nome'] = nome.strip().capitalize()
        super().perform_update(serializer)

class AtributoViewSet(viewsets.ModelViewSet):
    queryset = Atributo.objects.all()
    serializer_class = AtributoSerializer
    permission_classes = [IsAdminUser]

class ValorAtributoViewSet(viewsets.ModelViewSet):
    queryset = ValorAtributo.objects.all()
    serializer_class = ValorAtributoSerializer
    permission_classes = [IsAdminUser]

class SKUViewSet(viewsets.ModelViewSet):
    queryset = SKU.objects.all()
    serializer_class = SKUSerializer
    permission_classes = [IsAuthenticated, IsVendedor]

class ProdutoViewSet(viewsets.ModelViewSet):
    queryset = Produto.objects.all()
    serializer_class = ProdutoSerializer
    permission_classes = [IsAuthenticated, IsVendedor]

    @action(detail=False, methods=['get'], url_path='meus-produtos', permission_classes=[IsVendedor])
    def meus_produtos(self, request):
        vendedor = get_object_or_404(Vendedor, usuario=request.user)
        ofertas = OfertaProduto.objects.filter(vendedor=vendedor).select_related(
            'sku__produto__subcategoria__categoria_loja'
        ).prefetch_related(
            'sku__valores__atributo',
            'sku__imagens'
        ).order_by('sku__produto__nome')
        
        id_categoria = request.query_params.get('id_categoria')
        if id_categoria:
            ofertas = ofertas.filter(sku__produto__subcategoria__categoria_loja__id=id_categoria)
        
        serializer = MeusProdutosSerializer(ofertas, many=True, context={'request': request})
        return Response(serializer.data)

class OfertaProdutoViewSet(viewsets.ModelViewSet):
    queryset = OfertaProduto.objects.all()
    serializer_class = OfertaProdutoSerializer
    permission_classes = [IsAuthenticated, IsVendedor, IsOwnerOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def create(self, request, *args, **kwargs):
        vendedor = get_object_or_404(Vendedor, usuario=self.request.user)
        sku_id = request.data.get('sku_id')
        
        if OfertaProduto.objects.filter(vendedor=vendedor, sku_id=sku_id).exists():
            instance = OfertaProduto.objects.get(vendedor=vendedor, sku_id=sku_id)
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data)
        else:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        vendedor = get_object_or_404(Vendedor, usuario=self.request.user)
        serializer.save(vendedor=vendedor)

    def perform_update(self, serializer):
        serializer.save()
        imagem = self.request.FILES.get('imagem')
        if imagem:
            sku = serializer.instance.sku
            imagem_sku_instance = ImagemSKU.objects.filter(sku=sku).order_by('ordem').first()
            if imagem_sku_instance:
                imagem_sku_instance.imagem = imagem # type: ignore
                imagem_sku_instance.save()
            else:
                ImagemSKU.objects.create(sku=sku, imagem=imagem, ordem=0)

class VendedorViewSet(viewsets.ModelViewSet):
    queryset = Vendedor.objects.all()
    serializer_class = VendedorSerializer
    permission_classes = [IsAdminUser]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['status_aprovacao']

    def get_queryset(self): # type: ignore
        user = self.request.user
        if user.is_staff or user.tipo_usuario == 'Administrador': # type: ignore
            return Vendedor.objects.all()
        if user.tipo_usuario == 'Vendedor': # type: ignore
            return Vendedor.objects.filter(usuario=user)
        return Vendedor.objects.filter(status_aprovacao='Aprovado')

    @action(detail=True, methods=['post'], url_path='atualizar-status', permission_classes=[IsAdminUser])
    def atualizar_status(self, request, pk=None):
        vendedor = self.get_object()
        novo_status = request.data.get('status')
        
        if novo_status not in ['Aprovado', 'Rejeitado', 'Pendente']:
            return Response({'error': 'Status inválido.'}, status=status.HTTP_400_BAD_REQUEST)
            
        vendedor.status_aprovacao = novo_status
        vendedor.save(update_fields=['status_aprovacao'])
        
        return Response({'status': f'Status do vendedor atualizado para {novo_status}'})

class AdminViewSet(viewsets.ModelViewSet):
    queryset = Administrador.objects.all()
    serializer_class = AdminSerializer
    permission_classes = [IsAdminUser]

class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = [IsAuthenticated]

    def list(self, request, *args, **kwargs):
        if not request.user.is_authenticated:
            raise PermissionDenied("Authentication credentials were not provided.")
        return super().list(request, *args, **kwargs)

class EnderecoViewSet(viewsets.ModelViewSet):
    queryset = Endereco.objects.all()
    serializer_class = EnderecoSerializer
    permission_classes = [IsAuthenticated]

class AvaliacaoLojaViewSet(viewsets.ModelViewSet):
    queryset = AvaliacaoLoja.objects.all()
    serializer_class = AvaliacaoLojaSerializer
    permission_classes = [IsAuthenticated]

class SugestaoCreateView(generics.CreateAPIView):
    queryset = Sugestao.objects.all()
    serializer_class = SugestaoSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)

class RecuperarSenhaView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        try:
            user = Usuario.objects.get(email=email)
        except Usuario.DoesNotExist:
            return Response({'status': 'ok'}, status=status.HTTP_200_OK)
        user.token_redefinir_senha = uuid.uuid4()
        user.token_redefinir_senha_expiracao = timezone.now() + timedelta(hours=1)
        user.save(update_fields=['token_redefinir_senha', 'token_redefinir_senha_expiracao'])
        
        reset_url = f"{settings.FRONTEND_BASE_URL}/redefinir-senha/{user.token_redefinir_senha}"
        send_mail(
            'Redefinição de Senha - Caça Preço',
            f'Clique no link para redefinir sua senha: {reset_url}',
            'noreply@cacapreco.com',
            [user.email]
        )
        return Response({'status': 'ok'}, status=status.HTTP_200_OK)

class RedefinirSenhaView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def post(self, request, token, *args, **kwargs):
        password = request.data.get('password')
        if not password:
            return Response({'error': 'O campo de senha é obrigatório.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = Usuario.objects.get(token_redefinir_senha=token)
            if user.token_redefinir_senha_expiracao is None or user.token_redefinir_senha_expiracao < timezone.now():
                return Response({'error': 'Token expirado.'}, status=status.HTTP_400_BAD_REQUEST)
            
            user.set_password(password)
            user.token_redefinir_senha = None
            user.token_redefinir_senha_expiracao = None
            user.save(update_fields=['password', 'token_redefinir_senha', 'token_redefinir_senha_expiracao'])
            return Response({'status': 'Senha redefinida com sucesso.'}, status=status.HTTP_200_OK)
        
        except Usuario.DoesNotExist:
            return Response({'error': 'Token inválido.'}, status=status.HTTP_400_BAD_REQUEST)

class VerificarEmailView(generics.GenericAPIView):
    permission_classes = [AllowAny]

    def get(self, request, token, *args, **kwargs):
        try:
            user = Usuario.objects.get(token_verificacao=token)
            if user.email_verificado and user.is_active:
                return Response(
                    {'message': 'Este e-mail já foi verificado e está ativo.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            if user.token_verificacao_expiracao is None or user.token_verificacao_expiracao < timezone.now():
                return Response(
                    {'error': 'Token de verificação expirado ou inválido.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            user.email_verificado = True
            user.is_active = True
            user.token_verificacao = None
            user.token_verificacao_expiracao = None
            user.save(update_fields=['email_verificado', 'is_active', 'token_verificacao', 'token_verificacao_expiracao'])
            return Response({'status': 'Email verificado com sucesso.'}, status=status.HTTP_200_OK)
        
        except Usuario.DoesNotExist:
            return Response({'error': 'Token de verificação inválido.'}, status=status.HTTP_400_BAD_REQUEST)

class ReenviarVerificacaoView(generics.GenericAPIView):
    """
    Reenvia e-mail de verificação para usuário que ainda não ativou sua conta.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'O campo de e-mail é obrigatório.'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = get_object_or_404(Usuario, email=email)
        if user.email_verificado:
            return Response(
                {'message': 'Esta conta já foi verificada e está ativa.'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        user.token_verificacao = uuid.uuid4()
        user.token_verificacao_expiracao = timezone.now() + timedelta(minutes=15)
        user.save()
        
        verification_url = request.build_absolute_uri(
            reverse('verificar_email', kwargs={'token': user.token_verificacao})
        )
        
        subject = 'Caça Preço - Reenvio de Confirmação de E-mail'
        message = f'Olá,\n\nVocê solicitou o reenvio do link de ativação. Por favor, clique no link abaixo para ativar sua conta:\n{verification_url}'
        from_email = 'noreply@cacapreco.com'
        send_mail(subject, message, from_email, [user.email])
        
        return Response(
            {'message': 'Um novo e-mail de verificação foi enviado para o seu endereço.'}, 
            status=status.HTTP_200_OK
        )

class ObterPerfilView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    
    def get_object(self): # type: ignore
        user = self.request.user
        try:
            if user.is_authenticated and hasattr(user, 'tipo_usuario'):
                if user.tipo_usuario == 'Cliente':# type: ignore
                    return Cliente.objects.get(usuario=user)
                elif user.tipo_usuario == 'Vendedor':# type: ignore
                    return Vendedor.objects.get(usuario=user)
        except (Cliente.DoesNotExist, Vendedor.DoesNotExist):
            raise Http404
    def get_serializer_class(self):# type: ignore
        user = self.request.user
        if user.is_authenticated and hasattr(user, 'tipo_usuario'):
            if user.tipo_usuario == 'Cliente':# type: ignore
                return ClienteSerializer
            elif user.tipo_usuario == 'Vendedor':# type: ignore
                return VendedorSerializer
        return serializers.Serializer

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        
        if not instance:
            return Response({'detail': 'Perfil não encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        
        return Response(serializer.data)

class VariacaoCreateView(generics.CreateAPIView):
    """
    Cria nova variação (SKU) e sua imagem (opcional).
    Se nenhuma imagem for enviada, usa imagem padrão.
    """
    permission_classes = [IsAuthenticated, IsVendedor]
    serializer_class = SKUSerializer
    parser_classes = [MultiPartParser, FormParser]

    @transaction.atomic
    def create(self, request, *args, **kwargs):
        produto_id = request.data.get('produto')
        variacoes_data_str = request.data.get('variacoes')
        imagem = request.FILES.get('imagem')

        if not produto_id or not variacoes_data_str:
            return Response(
                {"error": "Os campos 'produto' e 'variacoes' são obrigatórios."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            variacoes_data = json.loads(variacoes_data_str)
        except json.JSONDecodeError:
            return Response(
                {"error": "O campo 'variacoes' não é um JSON válido."}, 
                status=status.HTTP_400_BAD_REQUEST
            )

        produto = get_object_or_404(Produto, id=produto_id)

        valores_a_associar = []
        for variacao in variacoes_data:
            nome_atributo = variacao.get('nome')
            valor_atributo = variacao.get('valor')
            
            if not nome_atributo or not valor_atributo:
                return Response(
                    {"error": "Cada variação deve conter 'nome' e 'valor' do atributo."}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            atributo, _ = Atributo.objects.get_or_create(
                nome__iexact=nome_atributo.strip(), 
                defaults={'nome': nome_atributo.strip()}
            )
            valor, _ = ValorAtributo.objects.get_or_create(
                atributo=atributo, 
                valor__iexact=valor_atributo.strip(), 
                defaults={'valor': valor_atributo.strip()}
            )
            valores_a_associar.append(valor)

        from django.db.models import Count
        skus_candidatos = SKU.objects.annotate(num_valores=Count('valores')).filter(
            produto=produto, 
            num_valores=len(valores_a_associar)
        )
        
        for sku in skus_candidatos:
            if set(sku.valores.all()) == set(valores_a_associar):
                return Response(
                    {"error": "Uma variação com esta combinação exata já existe."}, 
                    status=status.HTTP_409_CONFLICT
                )

        novo_sku = SKU.objects.create(produto=produto)
        novo_sku.valores.set(valores_a_associar)

        if imagem:
            ImagemSKU.objects.create(sku=novo_sku, imagem=imagem)
        else:
            default_image_path = 'ia.png'
            full_path = os.path.join(settings.MEDIA_ROOT, default_image_path)
            if os.path.exists(full_path):
                ImagemSKU.objects.create(sku=novo_sku, imagem=default_image_path)

        serializer = self.get_serializer(novo_sku)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class DebugUserView(APIView):
    """View temporária para depurar informações do usuário logado."""
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user = request.user
        
        try:
            vendedor_profile = Vendedor.objects.get(usuario=user)
            vendedor_info = {
                'nome_loja': vendedor_profile.nome_loja,
                'status_aprovacao': vendedor_profile.status_aprovacao,
            }
        except Vendedor.DoesNotExist:
            vendedor_info = "Nenhum perfil de Vendedor encontrado."

        debug_data = {
            'user_id': user.id,
            'user_email': user.email,
            'user_tipo_usuario': user.tipo_usuario,
            'is_authenticated': user.is_authenticated,
            'is_staff': user.is_staff,
            'is_active': user.is_active,
            'vendedor_profile': vendedor_info,
        }
        
        return Response(debug_data)

class AdminTestView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        return Response({"message": "You are an admin"})

class ClienteTestView(APIView):
    permission_classes = [IsCliente]

    def get(self, request):
        return Response({"message": "You are a cliente"})

class IniciarScrapingView(APIView):
    """
    View unificada para iniciar scraping.
    O orquestrador escolhe automaticamente a melhor estratégia (fast/medium/long).
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        url_to_scrape = request.data.get('url')
        force_strategy = request.data.get('strategy')  # Opcional: 'fast', 'medium', 'long'
        user_id = request.user.id

        if not url_to_scrape:
            return Response(
                {"error": "O campo 'url' é obrigatório."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Aciona tarefa Celery em segundo plano
        task = run_scraping_task.delay(url=url_to_scrape, user_id=user_id, strategy=force_strategy) # type: ignore

        return Response(
            {
                "message": "Requisição recebida. Processando em segundo plano.",
                "task_id": task.id
            },
            status=status.HTTP_202_ACCEPTED
        )

class TesteScrapingView(APIView):
    """
    View para testar uma estratégia de scraping de forma assíncrona.
    """
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        url_to_scrape = request.data.get('url')
        strategy = request.data.get('strategy', None) # Get strategy from request

        if not url_to_scrape:
            return Response(
                {"error": "O campo 'url' é obrigatório."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Aciona tarefa Celery em segundo plano
            task = run_scraping_task.delay(url=url_to_scrape, user_id=None, strategy=strategy)

            return Response(
                {
                    "message": "Requisição de teste recebida. Processando em segundo plano.",
                    "task_id": task.id
                },
                status=status.HTTP_202_ACCEPTED
            )

        except Exception as e:
            logger.error(f"Erro ao processar {url_to_scrape} com a estratégia {strategy}: {e}")
            return Response(
                {"error": f"Ocorreu um erro: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class IniciarMonitoramentoView(APIView):
    """
    View para iniciar monitoramento de produto externo.
    Usa o orquestrador para escolher a melhor estratégia.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        url_to_scrape = request.data.get('url')
        user_id = request.user.id

        if not url_to_scrape:
            return Response(
                {"error": "O campo 'url' é obrigatório."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Aciona tarefa Celery unificada
        task = run_scraping_task.delay(url=url_to_scrape, user_id=user_id)# type: ignore

        return Response(
            {
                "message": "Requisição de scraping recebida. Processando em segundo plano.",
                "task_id": task.id
            },
            status=status.HTTP_202_ACCEPTED
        )

class TaskStatusView(APIView):
    """
    Verifica o status de uma tarefa Celery.
    """
    permission_classes = [AllowAny]

    def get(self, request, task_id, *args, **kwargs):
        task_result = AsyncResult(task_id)

        result = {
            "task_id": task_id,
            "status": task_result.status,
            "result": task_result.result if task_result.ready() else None
        }

        return Response(result, status=status.HTTP_200_OK)
