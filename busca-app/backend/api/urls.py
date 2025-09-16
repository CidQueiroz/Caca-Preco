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
    AdminViewSet,
    EnderecoViewSet,
    AvaliacaoLojaViewSet,
    SugestaoCreateView,
    ObterPerfilView,
    ProdutosMonitoradosExternosViewSet,
    RecuperarSenhaView,
    RedefinirSenhaView,
    VerificarEmailView,
    ReenviarVerificacaoView,
    VariacaoCreateView,    
    AdminTestView,
    ClienteTestView,
    HistoricoPrecosView,
    MonitorarProdutoView,
    TaskStatusView,
    SalvarDadosMonitoramentoView
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
router.register(r'monitoramento', ProdutosMonitoradosExternosViewSet, basename='produtos-monitorados')

router.register(r'atributos', AtributoViewSet, basename='atributo')
router.register(r'valores-atributos', ValorAtributoViewSet, basename='valoratributo')
router.register(r'skus', SKUViewSet, basename='sku')

urlpatterns = [
    path('login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('', include(router.urls)),
    path('variacoes/', VariacaoCreateView.as_view(), name='criar_variacao'),
    path('perfil/', ObterPerfilView.as_view(), name='obter_perfil'),
    path('registrar/', UserCreateView.as_view(), name='registrar'),
    path('sugestoes/', SugestaoCreateView.as_view(), name='criar_sugestao'),
    path('recuperar-senha/', RecuperarSenhaView.as_view(), name='recuperar_senha'),
    path('redefinir-senha/<uuid:token>/', RedefinirSenhaView.as_view(), name='redefinir_senha'),
    path('verificar-email/<uuid:token>/', VerificarEmailView.as_view(), name='verificar_email'),
    path('reenviar-verificacao/', ReenviarVerificacaoView.as_view(), name='reenviar_verificacao'),
    path('admin-test/', AdminTestView.as_view(), name='admin_test'),
    path('cliente-test/', ClienteTestView.as_view(), name='cliente_test'),
    
    path('monitoramento/<int:pk>/historico/', HistoricoPrecosView.as_view(), name='historico-precos'),
    path('iniciar-monitoramento/', MonitorarProdutoView.as_view(), name='iniciar-monitoramento'),
    path('task-status/<str:task_id>/', TaskStatusView.as_view(), name='task-status'),
    path('salvar-monitoramento/', SalvarDadosMonitoramentoView.as_view(), name='salvar_dados_monitoramento'),
]