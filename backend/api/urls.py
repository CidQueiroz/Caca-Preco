from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserCreateView,
    MyTokenObtainPairView,
    TaskStatusView,
    CategoriaLojaViewSet, 
    SubcategoriaProdutoViewSet,
    AtributoViewSet, 
    ValorAtributoViewSet, 
    SKUViewSet, 
    ProdutoViewSet,
    OfertaProdutoViewSet,
    VendedorViewSet,
    ClienteViewSet,
    AdminViewSet,
    EnderecoViewSet,
    AvaliacaoLojaViewSet,
    SugestaoCreateView,
    ObterPerfilView,
    RecuperarSenhaView,
    RedefinirSenhaView,
    VerificarEmailView,
    ReenviarVerificacaoView,
    VariacaoCreateView,    
    AdminTestView,
    ClienteTestView,
    DebugUserView,
    MonitoramentoViewSet,
    IniciarScrapingView,
    TesteScrapingView
)
from rest_framework_simplejwt.views import TokenRefreshView


router = DefaultRouter()

router.register(r'categorias', CategoriaLojaViewSet, basename='categorialoja')
router.register(r'subcategorias', SubcategoriaProdutoViewSet, basename='subcategoriaproduto')
router.register(r'produtos', ProdutoViewSet, basename='produto')
router.register(r'ofertas', OfertaProdutoViewSet, basename='oferta')
router.register(r'vendedores', VendedorViewSet, basename='vendedor')
router.register(r'admins', AdminViewSet, basename='admin')
router.register(r'clientes', ClienteViewSet, basename='cliente')
router.register(r'enderecos', EnderecoViewSet, basename='endereco')
router.register(r'avaliacoes', AvaliacaoLojaViewSet, basename='avaliacaoloja')
router.register(r'atributos', AtributoViewSet, basename='atributo')
router.register(r'valores-atributos', ValorAtributoViewSet, basename='valoratributo')
router.register(r'skus', SKUViewSet, basename='sku')
# Resolvido o conflito movendo o ViewSet para o router com um nome claro
router.register(r'produtos-monitorados', MonitoramentoViewSet, basename='produtos-monitorados')


urlpatterns = [
    # Autenticação
    path('register/', UserCreateView.as_view(), name='register'),
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'), # Corrigido para usar a View customizada
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Recuperação de Senha e Verificação
    path('recuperar-senha/', RecuperarSenhaView.as_view(), name='recuperar_senha'),
    path('redefinir-senha/<uuid:token>/', RedefinirSenhaView.as_view(), name='redefinir_senha'),
    path('verificar-email/<uuid:token>/', VerificarEmailView.as_view(), name='verificar_email'),
    path('reenviar-verificacao/', ReenviarVerificacaoView.as_view(), name='reenviar_verificacao'),
    
    # Perfil e Dados do Usuário
    path('perfil/', ObterPerfilView.as_view(), name='obter_perfil'),
    path('variacao/', VariacaoCreateView.as_view(), name='criar_variacao'),
    
    # Scraping e Monitoramento
    path('iniciar-scraping/', IniciarScrapingView.as_view(), name='iniciar_scraping'), # Mantido conforme solicitado
    path('task-status/<str:task_id>/', TaskStatusView.as_view(), name='task_status'), # Adicionado endpoint que faltava

    # Debug e Testes
    path('debug-user/', DebugUserView.as_view(), name='debug_user'),
    path('admin-test/', AdminTestView.as_view(), name='admin_test'),
    path('cliente-test/', ClienteTestView.as_view(), name='cliente_test'),
    path('teste-scraping/', TesteScrapingView.as_view(), name='teste_scraping'),

    # Rotas do Router
    path('', include(router.urls)),
]