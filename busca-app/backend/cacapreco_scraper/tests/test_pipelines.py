import pytest
from unittest.mock import patch, MagicMock, AsyncMock, call
from decimal import Decimal
import hashlib
from api.models import Vendedor, ProdutosMonitoradosExternos, Usuario, CategoriaLoja, HistoricoPrecos
from cacapreco_scraper.cacapreco_scraper.pipelines import DjangoPipeline

# Fixtures síncronas para uma configuração de banco de dados limpa e segura por teste
@pytest.fixture
def categoria_loja(db):
    return CategoriaLoja.objects.create(nome='Eletrônicos')

@pytest.fixture
def user(db):
    return Usuario.objects.create_user(email='testuser@example.com', password='password')

@pytest.fixture
def vendedor(db, user, categoria_loja):
    return Vendedor.objects.create(usuario=user, nome_loja='Loja Teste', categoria_loja=categoria_loja)

@pytest.mark.parametrize("url_input, expected_output", [
    ("http://example.com/produto1?param=1&utm_source=google", "http://example.com/produto1"),
    ("https://www.example.com/product/123#details", "https://www.example.com/product/123"),
    ("http://example.com/", "http://example.com/"),
])
def test_get_canonical_url(url_input, expected_output):
    """Testa a função get_canonical_url com diferentes URLs."""
    pipeline = DjangoPipeline()
    assert pipeline.get_canonical_url(url_input) == expected_output

@pytest.mark.parametrize("price_str, expected_float", [
    ("R$ 1.234,56", 1234.56),
    ("R$ 99,90", 99.90),
    ("1.000", 1000.0),
    ("789", 789.0),
    ("Preço sob consulta", None),
    ("", None),
    (None, None),
    ("1,2,3,4.56", None), # Invalid format
    ("R$ 1,234.56", 1234.56) # American format
])
@patch('api.models.Vendedor.objects.get')
@patch('api.models.ProdutosMonitoradosExternos.objects.update_or_create')
@patch('api.models.HistoricoPrecos.objects.create') # Also patch historico
@pytest.mark.django_db
@pytest.mark.asyncio
async def test_price_cleaning_logic(mock_historico_create, mock_update_or_create, mock_vendedor_get, price_str, expected_float, vendedor):
    """Testa a lógica de limpeza de preço com vários formatos."""
    mock_vendedor_get.return_value = vendedor
    mock_update_or_create.return_value = (ProdutosMonitoradosExternos(), True)

    pipeline = DjangoPipeline()
    spider = MagicMock()
    item = {
        'usuario_id': vendedor.pk,
        'url_produto': 'http://example.com/produto-preco',
        'nome_produto': 'Produto com Preco',
        'preco_str': price_str
    }

    await pipeline.process_item(item, spider)

    # Check that update_or_create was called with the correctly cleaned price
    args, kwargs = mock_update_or_create.call_args
    assert kwargs['defaults']['preco_atual'] == expected_float

    # Check that HistoricoPrecos is created only if the price is valid
    if expected_float is not None:
        mock_historico_create.assert_called_once()
    else:
        mock_historico_create.assert_not_called()


@patch('api.models.Vendedor.objects.get')
@patch('api.models.ProdutosMonitoradosExternos.objects.update_or_create')
@pytest.mark.django_db
@pytest.mark.asyncio
async def test_process_item_creates_or_updates_product(mock_update_or_create, mock_vendedor_get, vendedor):
    """Testa se o pipeline chama update_or_create com os dados corretos."""
    mock_vendedor_get.return_value = vendedor
    mock_update_or_create.return_value = (ProdutosMonitoradosExternos(), True)

    pipeline = DjangoPipeline()
    spider = MagicMock()
    url = 'http://example.com/produto1'
    canonical_url = pipeline.get_canonical_url(url)
    url_hash = hashlib.sha256(canonical_url.encode('utf-8')).hexdigest()
    item = {
        'usuario_id': vendedor.pk,
        'url_produto': url,
        'nome_produto': 'Produto Teste 1',
        'preco_str': 'R$ 1.234,56'
    }

    await pipeline.process_item(item, spider)

    mock_vendedor_get.assert_called_once_with(pk=vendedor.pk)
    mock_update_or_create.assert_called_once_with(
        vendedor=vendedor,
        url_hash=url_hash,
        defaults={
            'url_produto': url,
            'nome_produto': 'Produto Teste 1',
            'preco_atual': 1234.56
        }
    )

@patch('api.models.Vendedor.objects.get')
@patch('api.models.ProdutosMonitoradosExternos.objects.update_or_create')
@pytest.mark.django_db
@pytest.mark.asyncio
async def test_process_item_with_invalid_price(mock_update_or_create, mock_vendedor_get, vendedor):
    """Testa se o preço é None quando a string de preço é inválida."""
    mock_vendedor_get.return_value = vendedor
    mock_update_or_create.return_value = (ProdutosMonitoradosExternos(), True)
    
    pipeline = DjangoPipeline()
    spider = MagicMock()
    url = 'http://example.com/produto3'
    canonical_url = pipeline.get_canonical_url(url)
    url_hash = hashlib.sha256(canonical_url.encode('utf-8')).hexdigest()
    item = {
        'usuario_id': vendedor.pk,
        'url_produto': url,
        'nome_produto': 'Produto com Preco Ruim',
        'preco_str': 'Invalido'
    }

    await pipeline.process_item(item, spider)

    mock_vendedor_get.assert_called_once_with(pk=vendedor.pk)
    mock_update_or_create.assert_called_once_with(
        vendedor=vendedor,
        url_hash=url_hash,
        defaults={
            'url_produto': url,
            'nome_produto': 'Produto com Preco Ruim',
            'preco_atual': None
        }
    )

@pytest.mark.django_db
@pytest.mark.asyncio
async def test_process_item_vendedor_not_found():
    """Testa o log de erro quando o vendedor não é encontrado."""
    pipeline = DjangoPipeline()
    spider = MagicMock()
    item = {
        'usuario_id': 999, # ID de um vendedor que não existe
        'url_produto': 'http://example.com/produto4',
        'nome_produto': 'Produto 4',
        'preco_str': 'R$ 10,00'
    }

    await pipeline.process_item(item, spider)

    # Verifica se o erro foi logado corretamente
    spider.logger.error.assert_called_with("Vendedor com usuário ID 999 não encontrado no banco.")

@patch('cacapreco_scraper.cacapreco_scraper.pipelines.sync_to_async')
@pytest.mark.django_db
@pytest.mark.asyncio
async def test_process_item_updates_product(mock_sync_to_async, vendedor):
    """Testa se o pipeline atualiza um produto existente."""
    
    # Configure the side effects of the async mocks
    async def get_vendedor(*args, **kwargs):
        return vendedor

    async def update_or_create(*args, **kwargs):
        return (ProdutosMonitoradosExternos(id=1), False)

    async def create_historico(*args, **kwargs):
        return None

    mock_sync_to_async.side_effect = [
        get_vendedor,
        update_or_create,
        create_historico
    ]

    pipeline = DjangoPipeline()
    spider = MagicMock()
    item = {
        'usuario_id': vendedor.pk,
        'url_produto': 'http://example.com/produto1',
        'nome_produto': 'Produto Teste 1',
        'preco_str': 'R$ 1.234,56'
    }

    await pipeline.process_item(item, spider)

    spider.logger.info.assert_any_call(f"Produto ID 1 atualizado com sucesso para o vendedor (usuário ID {vendedor.pk})!")

@patch('api.models.Vendedor.objects.get')
@patch('api.models.ProdutosMonitoradosExternos.objects.update_or_create')
@pytest.mark.django_db
@pytest.mark.asyncio
async def test_process_item_generic_exception(mock_update_or_create, mock_vendedor_get, vendedor):
    """Testa o log de erro para uma exceção genérica."""
    mock_vendedor_get.return_value = vendedor
    mock_update_or_create.side_effect = Exception("Erro de teste")
    
    pipeline = DjangoPipeline()
    spider = MagicMock()
    item = {
        'usuario_id': vendedor.pk,
        'url_produto': 'http://example.com/produto1',
        'nome_produto': 'Produto Teste 1',
        'preco_str': 'R$ 1.234,56'
    }

    await pipeline.process_item(item, spider)

    spider.logger.error.assert_called_with("Erro ao salvar no banco: Erro de teste")

@patch('api.models.Vendedor.objects.get')
@patch('api.models.ProdutosMonitoradosExternos.objects.update_or_create')
@patch('api.models.HistoricoPrecos.objects.create')
@pytest.mark.django_db
@pytest.mark.asyncio
async def test_process_item_logs_creation(mock_historico_create, mock_update_or_create, mock_vendedor_get, vendedor):
    """Testa se o pipeline loga a criação de um novo produto."""
    # Setup mocks
    mock_vendedor_get.return_value = vendedor
    # The first element of the tuple is the object, the second is the 'created' boolean
    mock_product = ProdutosMonitoradosExternos(id=99)
    mock_update_or_create.return_value = (mock_product, True)

    pipeline = DjangoPipeline()
    spider = MagicMock()
    item = {
        'usuario_id': vendedor.pk,
        'url_produto': 'http://example.com/new-product',
        'nome_produto': 'Produto Novo',
        'preco_str': 'R$ 50,00'
    }

    await pipeline.process_item(item, spider)

    # Check for the specific info log message
    spider.logger.info.assert_any_call(f"Produto novo criado com ID {mock_product.id} para o vendedor (usuário ID {vendedor.pk}).")
