from rest_framework import viewsets, status, generics, serializers
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
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

# Modelos atualizados
from .models import (
    Usuario, CategoriaLoja, SubcategoriaProduto, Produto, Atributo, ValorAtributo, SKU, OfertaProduto, ImagemSKU,
    Vendedor, Cliente, Endereco, AvaliacaoLoja, Sugestao, ProdutosMonitoradosExternos
)

# Serializers atualizados
from .serializers import (
    UserSerializer, MyTokenObtainPairSerializer, CategoriaLojaSerializer, SubcategoriaProdutoSerializer,
    ProdutoSerializer, AtributoSerializer, ValorAtributoSerializer, SKUSerializer, OfertaProdutoSerializer,
    VendedorSerializer, ClienteSerializer, EnderecoSerializer, AvaliacaoLojaSerializer, SugestaoSerializer,
    ProdutosMonitoradosExternosSerializer,
    MeusProdutosSerializer
)

from rest_framework_simplejwt.views import TokenObtainPairView

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
    permission_classes = [IsAuthenticated]

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
    permission_classes = [IsAuthenticated]

class ProdutoViewSet(viewsets.ModelViewSet):
    queryset = Produto.objects.all()
    serializer_class = ProdutoSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['get'], url_path='meus-produtos', permission_classes=[IsVendedor])
    def meus_produtos(self, request):
        vendedor = get_object_or_404(Vendedor, usuario=request.user)
        ofertas = OfertaProduto.objects.filter(vendedor=vendedor).select_related(
            'sku__produto__subcategoria__categoria_loja'
        ).prefetch_related(
            'sku__valores__atributo',
            'sku__imagens'
        )
        id_categoria = request.query_params.get('id_categoria')
        if id_categoria:
            ofertas = ofertas.filter(sku__produto__subcategoria__categoria_loja__id=id_categoria)
        serializer = MeusProdutosSerializer(ofertas, many=True, context={'request': request})
        return Response(serializer.data)

class OfertaProdutoViewSet(viewsets.ModelViewSet):
    queryset = OfertaProduto.objects.all()
    serializer_class = OfertaProdutoSerializer
    permission_classes = [IsAuthenticated, IsVendedor]
    parser_classes = [MultiPartParser, FormParser]

    def perform_create(self, serializer):
        vendedor = get_object_or_404(Vendedor, usuario=self.request.user)
        sku_id = serializer.validated_data.get('sku').id
        if OfertaProduto.objects.filter(vendedor=vendedor, sku_id=sku_id).exists():
            instance = OfertaProduto.objects.get(vendedor=vendedor, sku_id=sku_id)
            serializer.update(instance, serializer.validated_data)
        else:
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
    permission_classes = [IsOwnerOrReadOnly]

class EnderecoViewSet(viewsets.ModelViewSet):
    queryset = Endereco.objects.all()
    serializer_class = EnderecoSerializer
    permission_classes = [IsAuthenticated]

class AvaliacaoLojaSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvaliacaoLoja
        fields = '__all__'

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

    def get_queryset(self) -> QuerySet[ProdutosMonitoradosExternos]:
        if self.request.user.is_authenticated and self.request.user.tipo_usuario == 'Vendedor':
            return ProdutosMonitoradosExternos.objects.filter(vendedor__usuario=self.request.user)
        return ProdutosMonitoradosExternos.objects.none()

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
            user.email_verificado = True
            user.token_verificacao = None
            user.save(update_fields=['email_verificado', 'token_verificacao'])
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
            print("ObterPerfilView: Perfil não encontrado para o usuário.")
            return None
        return None

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

# --- NOVA VIEW PARA CRIAR VARIAÇÕES ---
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
        import json
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