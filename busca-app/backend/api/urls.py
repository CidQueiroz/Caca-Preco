from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserCreateView, 
    MyTokenObtainPairView, 
    CategoriaLojaViewSet, 
    SubcategoriaProdutoViewSet,
    AtributoViewSet, 
    ValorAtributoViewSet, 
    SKUViewSet, 
    ProdutoViewSet,
    OfertaProdutoViewSet,
    VendedorViewSet,
    ClienteViewSet,
    EnderecoViewSet,
    AvaliacaoLojaViewSet,
    SugestaoCreateView,
    ObterPerfilView,
    ProdutosMonitoradosExternosViewSet,
    RecuperarSenhaView,
    RedefinirSenhaView,
    VerificarEmailView,
    ReenviarVerificacaoView,
    VariacaoCreateView
)
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
# Rotas antigas
router.register(r'categorias', CategoriaLojaViewSet)
router.register(r'subcategorias', SubcategoriaProdutoViewSet)
router.register(r'produtos', ProdutoViewSet)
router.register(r'ofertas', OfertaProdutoViewSet)
router.register(r'vendedores', VendedorViewSet)
router.register(r'clientes', ClienteViewSet)
router.register(r'enderecos', EnderecoViewSet)
router.register(r'avaliacoes', AvaliacaoLojaViewSet)
router.register(r'monitoramento', ProdutosMonitoradosExternosViewSet, basename='monitoramento')

# NOVAS ROTAS PARA SKU
router.register(r'atributos', AtributoViewSet)
router.register(r'valores-atributos', ValorAtributoViewSet)
router.register(r'skus', SKUViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('variacoes/', VariacaoCreateView.as_view(), name='criar_variacao'),
    path('perfil/', ObterPerfilView.as_view(), name='obter_perfil'),
    path('registrar/', UserCreateView.as_view(), name='registrar'),
    path('login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('sugestoes/', SugestaoCreateView.as_view(), name='criar_sugestao'),
    # Novas rotas para recuperação de senha
    path('recuperar-senha/', RecuperarSenhaView.as_view(), name='recuperar_senha'),
    path('redefinir-senha/<uuid:token>/', RedefinirSenhaView.as_view(), name='redefinir_senha'),
    path('verificar-email/<uuid:token>/', VerificarEmailView.as_view(), name='verificar_email'),
    path('reenviar-verificacao/', ReenviarVerificacaoView.as_view(), name='reenviar_verificacao')
]