from rest_framework.exceptions import PermissionDenied
from django.http import Http404
from rest_framework import viewsets, status, generics, serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser, IsAdminUserOrReadOnly
from .permissions import IsVendedor, IsCliente, IsOwnerOrReadOnly 
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
from rest_framework.filters import SearchFilter, OrderingFilter
from rest_framework.parsers import MultiPartParser, FormParser
import os
from rest_framework import status
from .models import Vendedor, ProdutosMonitoradosExternos
from .serializers import ProdutosMonitoradosExternosSerializer

import subprocess
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework_simplejwt.views import TokenObtainPairView
from django.http import JsonResponse
import json
import hashlib
import re
from urllib.parse import urlparse, urlunparse

# Modelos atualizados
from .models import (
    Usuario, CategoriaLoja, SubcategoriaProduto, Produto, Atributo, ValorAtributo, SKU, OfertaProduto, ImagemSKU,
    Vendedor, Cliente, Endereco, AvaliacaoLoja, Sugestao, ProdutosMonitoradosExternos, HistoricoPrecos
)

# Serializers atualizados
from .serializers import (
    UserSerializer, MyTokenObtainPairSerializer, CategoriaLojaSerializer, SubcategoriaProdutoSerializer,
    ProdutoSerializer, AtributoSerializer, ValorAtributoSerializer, SKUSerializer, OfertaProdutoSerializer,
    VendedorSerializer, ClienteSerializer, EnderecoSerializer, AvaliacaoLojaSerializer, SugestaoSerializer,
    ProdutosMonitoradosExternosSerializer,
    MeusProdutosSerializer,
    ProdutosMonitoradosExternosComHistoricoSerializer
)

def get_canonical_url(url):
    """Gera uma URL canônica removendo parâmetros de consulta e fragmentos."""
    parsed_url = urlparse(url)
    # Reconstrói a URL apenas com scheme, netloc e path
    canonical_url = urlunparse((parsed_url.scheme, parsed_url.netloc, parsed_url.path, '', '', ''))
    return canonical_url

class HistoricoPrecosView(generics.RetrieveAPIView):
    queryset = ProdutosMonitoradosExternos.objects.all()
    serializer_class = ProdutosMonitoradosExternosComHistoricoSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'pk'


class UserCreateView(generics.CreateAPIView):
    queryset = Usuario.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        serializer.validated_data['token_verificacao'] = uuid.uuid4()
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

class CategoriaLojaViewSet(viewsets.ModelViewSet):
    queryset = CategoriaLoja.objects.all()
    serializer_class = CategoriaLojaSerializer
    permission_classes = [IsAdminUserOrReadOnly]

class SubcategoriaProdutoViewSet(viewsets.ModelViewSet):
    queryset = SubcategoriaProduto.objects.all()
    serializer_class = SubcategoriaProdutoSerializer
    permission_classes = [IsAdminUser]

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
        ).order_by('sku__produto__nome') # Add ordering
        id_categoria = request.query_params.get('id_categoria')
        if id_categoria:
            ofertas = ofertas.filter(sku__produto__subcategoria__categoria_loja__id=id_categoria)
        serializer = MeusProdutosSerializer(ofertas, many=True, context={'request': request})
        return Response(serializer.data)

class OfertaProdutoViewSet(viewsets.ModelViewSet):
    queryset = OfertaProduto.objects.all()
    serializer_class = OfertaProdutoSerializer
    permission_classes = [IsAuthenticated, IsVendedor, IsOwnerOrReadOnly]
    parser_classes = [MultiPartParser, FormParser, JSONParser] # Add JSONParser

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
                imagem_sku_instance.imagem = imagem
                imagem_sku_instance.save()
            else:
                ImagemSKU.objects.create(sku=sku, imagem=imagem, ordem=0)

class VendedorViewSet(viewsets.ModelViewSet):
    queryset = Vendedor.objects.all()
    serializer_class = VendedorSerializer
    permission_classes = [IsOwnerOrReadOnly]

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

class ProdutosMonitoradosExternosViewSet(viewsets.ModelViewSet):
    queryset = ProdutosMonitoradosExternos.objects.all()
    serializer_class = ProdutosMonitoradosExternosSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        url = request.data.get('url')
        if not url:
            return Response({'message': 'A URL do produto é obrigatória.'}, status=status.HTTP_400_BAD_REQUEST)

        canonical_url = get_canonical_url(url)

        try:
            vendedor = Vendedor.objects.get(usuario=request.user)
        except Vendedor.DoesNotExist:
            return Response({'message': 'Apenas vendedores podem monitorar produtos.'}, status=status.HTTP_403_FORBIDDEN)

        if ProdutosMonitoradosExternos.objects.filter(vendedor=vendedor, url_produto=canonical_url).exists():
            return Response({'message': 'Você já está monitorando este produto.'}, status=status.HTTP_409_CONFLICT)

        scrapy_project_path = os.path.join(settings.BASE_DIR, 'cacapreco_scraper')
        comando = [
            'scrapy', 'crawl', 'selenium_spider',
            '-a', f'url={url}',
            '-a', f'usuario_id={vendedor.pk}',
            '-o', '-:json'
        ]

        try:
            process = subprocess.Popen(comando, cwd=scrapy_project_path, 
                                       stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            stdout_bytes, stderr_bytes = process.communicate()

            if process.returncode != 0:
                error_message = stderr_bytes.decode('latin-1', errors='ignore')
                print(f"DEBUG: Erro ao executar o Scrapy (código de saída: {process.returncode}). stderr: {error_message}")
                return Response({'message': 'A coleta de dados falhou. Verifique o console do servidor para mais detalhes.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            try:
                stdout_decoded = stdout_bytes.decode('utf-8')
                stderr_decoded = stderr_bytes.decode('utf-8')
            except UnicodeDecodeError:
                stdout_decoded = stdout_bytes.decode('latin-1', errors='ignore')
                stderr_decoded = stderr_bytes.decode('latin-1', errors='ignore')
                print("DEBUG: Fallback de decodificação para latin-1 foi utilizado no stdout.")

            scraped_data = {}
            try:
                json_start = stdout_decoded.find('[')
                json_end = stdout_decoded.rfind(']')
                if json_start != -1 and json_end != -1:
                    json_string = stdout_decoded[json_start : json_end + 1]
                    scraped_items = json.loads(json_string)
                    if scraped_items:
                        scraped_data = scraped_items[0]
                
            except json.JSONDecodeError as e:
                print(f"DEBUG: Falha ao decodificar o JSON completo do stdout: {e}. stdout: [{stdout_decoded}]")
                return Response({'message': 'Erro ao processar dados do scraper.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            if not scraped_data or 'preco_atual' not in scraped_data:
                print(f"DEBUG: Dados não encontrados ou preço ausente. stdout: [{stdout_decoded}] stderr: [{stderr_decoded}]")
                return Response({'message': 'Não foi possível extrair os dados do produto. O site pode ser incompatível ou estar indisponível.'}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

            nome_produto = scraped_data.get('nome_produto', 'Nome não encontrado')
            preco_final = scraped_data.get('preco_atual')

            with transaction.atomic():
                produto, created = ProdutosMonitoradosExternos.objects.update_or_create(
                    vendedor=vendedor,
                    url_produto=canonical_url, 
                    defaults={
                        'nome_produto': nome_produto.strip(),
                        'preco_atual': preco_final,
                        'ultima_coleta': timezone.now()
                    }
                )

                HistoricoPrecos.objects.update_or_create(
                    produto_monitorado=produto,
                    preco=preco_final,
                    data_coleta=produto.ultima_coleta
                )

            serializer = self.get_serializer(produto)
            return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

        except FileNotFoundError:
            print(f"ERRO CRÍTICO: O comando 'scrapy' não foi encontrado. Verifique se o Scrapy está instalado e no PATH do ambiente do servidor.")
            return Response({'message': 'Erro de configuração no servidor que impede a execução do scraper.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            print(f"Erro inesperado: {e}")
            return Response({'message': 'Ocorreu um erro inesperado no servidor.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get_queryset(self) -> QuerySet[ProdutosMonitoradosExternos]:
        if self.request.user.is_authenticated and self.request.user.tipo_usuario == 'Vendedor':
            return ProdutosMonitoradosExternos.objects.filter(vendedor__usuario=self.request.user)
        return ProdutosMonitoradosExternos.objects.none()

    def perform_create(self, serializer):
        vendedor = get_object_or_404(Vendedor, usuario=self.request.user)
        serializer.save(vendedor=vendedor)

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
                return Response({'message': 'Este e-mail já foi verificado e está ativo.'}, status=status.HTTP_400_BAD_REQUEST)

            if user.token_verificacao_expiracao is None or user.token_verificacao_expiracao < timezone.now():
                return Response({'error': 'Token de verificação expirado ou inválido.'}, status=status.HTTP_400_BAD_REQUEST)
            user.email_verificado = True
            user.is_active = True
            user.token_verificacao = None
            user.save(update_fields=['email_verificado', 'is_active', 'token_verificacao'])
            return Response({'status': 'Email verificado com sucesso.'}, status=status.HTTP_200_OK)
        except Usuario.DoesNotExist:
            return Response({'error': 'Token de verificação inválido.'}, status=status.HTTP_400_BAD_REQUEST)

class ReenviarVerificacaoView(generics.GenericAPIView):
    """
    Esta view reenviará um e-mail de verificação para um usuário
    que ainda não ativou sua conta.
    """
    permission_classes = [AllowAny] # Permite que qualquer uno acesse esta view

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'O campo de e-mail é obrigatório.'}, status=status.HTTP_400_BAD_REQUEST)
        user = get_object_or_404(Usuario, email=email)
        if user.email_verificado:
            return Response({'message': 'Esta conta já foi verificada e está ativa.'}, status=status.HTTP_400_BAD_REQUEST)
        user.token_verificacao = uuid.uuid4()
        user.save()
        verification_url = request.build_absolute_uri(
            reverse('verificar_email', kwargs={'token': user.token_verificacao})
        )
        subject = 'Caça Preço - Reenvio de Confirmação de E-mail'
        message = f'Olá,\n\nVocê solicitou o reenvio do link de ativação. Por favor, clique no link abaixo para ativar sua conta:\n{verification_url}'
        from_email = 'noreply@cacapreco.com'
        send_mail(subject, message, from_email, [user.email])
        return Response({'message': 'Um novo e-mail de verificação foi enviado para o seu endereço.'}, status=status.HTTP_200_OK)

class ObterPerfilView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        print("ObterPerfilView: get_object chamado")
        try:
            if self.request.user.tipo_usuario == 'Cliente':
                return Cliente.objects.get(usuario=self.request.user)
            elif self.request.user.tipo_usuario == 'Vendedor':
                return Vendedor.objects.get(usuario=self.request.user)
        except (Cliente.DoesNotExist, Vendedor.DoesNotExist):
            raise Http404
        raise Http404

    def get_serializer_class(self):
        print("ObterPerfilView: get_serializer_class chamado")
        if self.request.user.tipo_usuario == 'Cliente':
            return ClienteSerializer
        elif self.request.user.tipo_usuario == 'Vendedor':
            return VendedorSerializer
        return serializers.Serializer 

    def update(self, request, *args, **kwargs):
        print("ObterPerfilView: update chamado")
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        if not instance:
            print("ObterPerfilView: Instância não encontrada para atualização.")
            return Response({'detail': 'Perfil não encontrado.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        print("ObterPerfilView: Serializer é válido.", serializer.validated_data)
        self.perform_update(serializer)
        print("ObterPerfilView: perform_update chamado.")
        return Response(serializer.data)

class VariacaoCreateView(generics.CreateAPIView):
    """
    View para criar uma nova variação (SKU) e sua imagem (opcional).
    Se nenhuma imagem for enviada, uma imagem padrão será usada.
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
            return Response({"error": "Os campos 'produto' e 'variacoes' são obrigatórios."},
                            status=status.HTTP_400_BAD_REQUEST)
        
        try:
            variacoes_data = json.loads(variacoes_data_str)
        except json.JSONDecodeError:
            return Response({"error": "O campo 'variacoes' não é um JSON válido."},
                            status=status.HTTP_400_BAD_REQUEST)

        produto = get_object_or_404(Produto, id=produto_id)

        valores_a_associar = []
        for variacao in variacoes_data:
            nome_atributo = variacao.get('nome')
            valor_atributo = variacao.get('valor')
            if not nome_atributo or not valor_atributo:
                return Response({"error": "Cada variação deve conter 'nome' e 'valor' do atributo."},
                                status=status.HTTP_400_BAD_REQUEST)
            
            atributo, _ = Atributo.objects.get_or_create(nome__iexact=nome_atributo.strip(), defaults={'nome': nome_atributo.strip()})
            valor, _ = ValorAtributo.objects.get_or_create(atributo=atributo, valor__iexact=valor_atributo.strip(), defaults={'valor': valor_atributo.strip()})
            valores_a_associar.append(valor)

        from django.db.models import Count
        skus_candidatos = SKU.objects.annotate(num_valores=Count('valores')).filter(produto=produto, num_valores=len(valores_a_associar))
        for sku in skus_candidatos:
            if set(sku.valores.all()) == set(valores_a_associar):
                return Response({"error": "Uma variação com esta combinação exata já existe."},
                                status=status.HTTP_409_CONFLICT)

        novo_sku = SKU.objects.create(produto=produto)
        novo_sku.valores.set(valores_a_associar)

        if imagem:
            ImagemSKU.objects.create(sku=novo_sku, imagem=imagem)
        else:
            default_image_path = 'ia.png' # Usando ia.png como padrão
            full_path = os.path.join(settings.MEDIA_ROOT, default_image_path)
            if os.path.exists(full_path):
                ImagemSKU.objects.create(sku=novo_sku, imagem=default_image_path)

        serializer = self.get_serializer(novo_sku)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class AdminTestView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        return Response({"message": "You are an admin"})

class ClienteTestView(APIView):
    permission_classes = [IsCliente]

    def get(self, request):
        return Response({"message": "You are a cliente"})

class MonitoramentoView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        url = request.data.get('url')
        if not url:
            return Response({'message': 'A URL do produto é obrigatória.'}, status=status.HTTP_400_BAD_REQUEST)

        # Gera uma URL canônica para usar como chave única e evitar duplicatas
        canonical_url = get_canonical_url(url)

        try:
            vendedor = Vendedor.objects.get(usuario=request.user)
        except Vendedor.DoesNotExist:
            return Response({'message': 'Apenas vendedores podem monitorar produtos.'}, status=status.HTTP_403_FORBIDDEN)

        if ProdutosMonitoradosExternos.objects.filter(vendedor=vendedor, url_produto=canonical_url).exists():
            return Response({'message': 'Você já está monitorando este produto.'}, status=status.HTTP_409_CONFLICT)

        # O scraper deve usar a URL original completa para encontrar a página corretamente
        scrapy_project_path = os.path.join(settings.BASE_DIR, 'cacapreco_scraper')
        comando = [
            'scrapy', 'crawl', 'selenium_spider',
            '-a', f'url={url}',
            '-a', f'usuario_id={vendedor.pk}',
            '-o', '-:json' # Output to stdout as JSON
        ]

        try:
            # Etapa 1: Executar o scraper capturando a saída como bytes brutos para evitar erros de decodificação.
            process = subprocess.Popen(comando, cwd=scrapy_project_path, 
                                       stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            stdout_bytes, stderr_bytes = process.communicate()

            # Etapa 2: Verificar se o processo em si falhou.
            if process.returncode != 0:
                # Tenta decodificar o erro para exibição, mas o foco é o código de falha.
                error_message = stderr_bytes.decode('latin-1', errors='ignore')
                print(f"DEBUG: Erro ao executar o Scrapy (código de saída: {process.returncode}). stderr: {error_message}")
                return Response({'message': 'A coleta de dados falhou. Verifique o console do servidor para mais detalhes.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # Etapa 3: Decodificar a saída de forma segura, com fallback.
            try:
                stdout_decoded = stdout_bytes.decode('utf-8')
                stderr_decoded = stderr_bytes.decode('utf-8')
            except UnicodeDecodeError:
                stdout_decoded = stdout_bytes.decode('latin-1', errors='ignore')
                stderr_decoded = stderr_bytes.decode('latin-1', errors='ignore')
                print("DEBUG: Fallback de decodificação para latin-1 foi utilizado no stdout.")

            scraped_data = {}
            try:
                # Scrapy with -o - -t json outputs a single JSON array to stdout
                # We need to find the actual JSON array within the stdout_decoded
                # as there might be other log messages.
                # A more robust way is to find the first and last curly braces
                # that enclose a valid JSON array.
                json_start = stdout_decoded.find('[')
                json_end = stdout_decoded.rfind(']')
                if json_start != -1 and json_end != -1:
                    json_string = stdout_decoded[json_start : json_end + 1]
                    scraped_items = json.loads(json_string)
                    if scraped_items:
                        scraped_data = scraped_items[0] # Assuming only one item is scraped per URL
                
            except json.JSONDecodeError as e:
                print(f"DEBUG: Falha ao decodificar o JSON completo do stdout: {e}. stdout: [{stdout_decoded}]")
                return Response({'message': 'Erro ao processar dados do scraper.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            if not scraped_data or 'preco_atual' not in scraped_data:
                print(f"DEBUG: Dados não encontrados ou preço ausente. stdout: [{stdout_decoded}] stderr: [{stderr_decoded}]")
                return Response({'message': 'Não foi possível extrair os dados do produto. O site pode ser incompatível ou estar indisponível.'}, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

            nome_produto = scraped_data.get('nome_produto', 'Nome não encontrado')
            preco_final = scraped_data.get('preco_atual') # Directly use preco_atual (already a float)

            # Removed price cleaning and float conversion, as it's now handled in the spider

            with transaction.atomic():
                produto, created = ProdutosMonitoradosExternos.objects.update_or_create(
                    vendedor=vendedor,
                    url_produto=canonical_url, 
                    defaults={
                        'nome_produto': nome_produto.strip(),
                        'preco_atual': preco_final,
                        'ultima_coleta': timezone.now()
                    }
                )

                HistoricoPrecos.objects.update_or_create(
                    produto_monitorado=produto,
                    preco=preco_final,
                    data_coleta=produto.ultima_coleta
                )

            serializer = ProdutosMonitoradosExternosSerializer(produto)
            return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

        except FileNotFoundError:
            print(f"ERRO CRÍTICO: O comando 'scrapy' não foi encontrado. Verifique se o Scrapy está instalado e no PATH do ambiente do servidor.")
            return Response({'message': 'Erro de configuração no servidor que impede a execução do scraper.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        except Exception as e:
            print(f"Erro inesperado: {e}")
            return Response({'message': 'Ocorreu um erro inesperado no servidor.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

def scrape_page(request):
    """Exemplo de view Django usando playwright-stealth"""
    
    if request.method == 'POST':
        try:
            # Obter URL do request
            data = json.loads(request.body)
            url = data.get('url', 'https://example.com')
            
            with sync_playwright() as p:
                # Configurar navegador
                browser = p.chromium.launch(
                    headless=True,  # True para produção
                    args=[
                        '--no-sandbox',
                        '--disable-dev-shm-usage',
                        '--disable-blink-features=AutomationControlled',
                        '--disable-features=VizDisplayCompositor'
                    ]
                )
                
                # Criar contexto do navegador
                context = browser.new_context(
                    viewport={'width': 1920, 'height': 1080},
                    user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                )
                
                # Criar página
                page = context.new_page()
                
                # Aplicar stealth - IMPORTANTE: fazer antes de navegar
                stealth = Stealth()
                stealth.apply(page)
                
                # Navegar para a página
                response = page.goto(url, wait_until='networkidle')
                
                # Aguardar carregamento se necessário
                page.wait_for_timeout(2000)
                
                # Extrair dados (exemplo)
                title = page.title()
                content = page.content()
                
                # Fechar browser
                browser.close()
                
                return JsonResponse({
                    'success': True,
                    'title': title,
                    'status': response.status
                })
                
        except Exception as e:
            return JsonResponse({
                'success': False,
                'error': str(e)
            })
    
    return JsonResponse({'error': 'Método não permitido'})
