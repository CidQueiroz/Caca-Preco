from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from django.contrib.auth import get_user_model
from django.core import mail
from unittest.mock import patch, MagicMock
from api.models import (
    Usuario, Cliente, Vendedor, CategoriaLoja, SubcategoriaProduto, Produto, SKU, 
    OfertaProduto, ImagemSKU, Atributo, ValorAtributo, Endereco, AvaliacaoLoja,
    ProdutosMonitoradosExternos, HistoricoPrecos
)
import uuid
import json
from django.utils import timezone
import datetime
from rest_framework.test import APIClient
from django.core.files.uploadedfile import SimpleUploadedFile
from decimal import Decimal

User = get_user_model()

class UserCreateViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = reverse('registrar')

    def test_create_user_success(self):
        data = {'email': 'test@example.com', 'senha': 'password123', 'tipo_usuario': 'Cliente'}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(User.objects.get().email, 'test@example.com')
        self.assertFalse(User.objects.get().is_active)

    def test_create_user_sends_verification_email(self):
        data = {'email': 'test@example.com', 'senha': 'password123', 'tipo_usuario': 'Cliente'}
        self.client.post(self.url, data, format='json')
        self.assertEqual(len(mail.outbox), 1)

    def test_create_user_invalid_data(self):
        data = {'email': 'not-an-email', 'senha': '123', 'tipo_usuario': 'Cliente'}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)
        self.assertIn('senha', response.data)

class MyTokenObtainPairViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com', password='password123', tipo_usuario='Cliente',
            is_active=True, email_verificado=True
        )
        Cliente.objects.create(usuario=self.user, nome='Test Client', cpf='12345678900')
        self.url = reverse('token_obtain_pair')

    def test_obtain_token_with_valid_credentials(self):
        data = {'email': 'test@example.com', 'password': 'password123'}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_obtain_token_with_invalid_credentials(self):
        data = {'email': 'test@example.com', 'password': 'wrongpassword'}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_obtain_token_with_inactive_user(self):
        self.user.is_active = False
        self.user.save()
        data = {'email': 'test@example.com', 'password': 'password123'}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class VerificarEmailViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com', password='password123', tipo_usuario='Cliente',
            is_active=False, email_verificado=False,
            token_verificacao=uuid.uuid4(),
            token_verificacao_expiracao=timezone.now() + datetime.timedelta(hours=1)
        )
        self.valid_token_url = reverse('verificar_email', args=[self.user.token_verificacao])

    def test_verify_email_with_valid_token(self):
        response = self.client.get(self.valid_token_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_active)
        self.assertTrue(self.user.email_verificado)

    def test_verify_email_with_invalid_token(self):
        invalid_url = reverse('verificar_email', args=[uuid.uuid4()])
        response = self.client.get(invalid_url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_verify_email_with_expired_token(self):
        self.user.token_verificacao_expiracao = timezone.now() - datetime.timedelta(hours=1)
        self.user.save()
        response = self.client.get(self.valid_token_url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
    def test_verify_email_already_verified_and_active(self):
        self.user.email_verificado = True
        self.user.is_active = True
        self.user.save()
        response = self.client.get(self.valid_token_url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('message', response.data)
        self.assertEqual(response.data['message'], 'Este e-mail já foi verificado e está ativo.')

class BaseSetup(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_superuser('admin@example.com', 'password123')
        self.vendedor_user = User.objects.create_user(email='vendedor@example.com', password='password123', tipo_usuario='Vendedor', is_active=True, email_verificado=True)
        self.cliente_user = User.objects.create_user(email='cliente@example.com', password='password123', tipo_usuario='Cliente', is_active=True, email_verificado=True)

        self.categoria_loja = CategoriaLoja.objects.create(nome='Eletrônicos')
        self.vendedor = Vendedor.objects.create(usuario=self.vendedor_user, nome_loja='Loja Teste', cnpj='12.345.678/0001-90', categoria_loja=self.categoria_loja)
        self.cliente = Cliente.objects.create(usuario=self.cliente_user, nome='Cliente Teste', cpf='111.222.333-44')

class MonitoramentoViewTest(BaseSetup):
    def setUp(self):
        super().setUp()
        self.url = reverse('monitorar')

    @patch('api.views.subprocess.Popen')
    def test_monitorar_produto_sucesso(self, mock_popen):
        self.client.force_authenticate(user=self.vendedor_user)
        mock_process = MagicMock()
        mock_process.returncode = 0
        mock_process.communicate.return_value = (b'[{"nome_produto": "Produto Teste", "preco_atual": 199.99}]', b'')
        mock_popen.return_value = mock_process

        data = {'url': 'http://example.com/produto'}
        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(ProdutosMonitoradosExternos.objects.filter(vendedor=self.vendedor, url_produto='http://example.com/produto').exists())
        mock_popen.assert_called_once()

    def test_monitorar_produto_nao_vendedor(self):
        self.client.force_authenticate(user=self.cliente_user)
        data = {'url': 'http://example.com/produto'}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_monitorar_produto_duplicado(self):
        self.client.force_authenticate(user=self.vendedor_user)
        ProdutosMonitoradosExternos.objects.create(vendedor=self.vendedor, url_produto='http://example.com/produto', nome_produto='Já existe', preco_atual='100.00')
        data = {'url': 'http://example.com/produto'}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)

    @patch('api.views.get_canonical_url', return_value='http://example.com/canonical')
    @patch('api.views.subprocess.Popen')
    def test_monitorar_produto_scrapy_process_failure(self, mock_popen, mock_get_canonical_url):
        self.client.force_authenticate(user=self.vendedor_user)
        
        mock_process = MagicMock()
        mock_process.returncode = 1
        mock_process.communicate.return_value = (b'', b'Scrapy error message')
        mock_popen.return_value = mock_process

        data = {'url': 'http://example.com/product'}
        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertIn('message', response.data)
        self.assertEqual(response.data['message'], 'A coleta de dados falhou. Verifique o console do servidor para mais detalhes.')
        mock_popen.assert_called_once()
        mock_get_canonical_url.assert_called_once_with('http://example.com/product')

    @patch('api.views.get_canonical_url', return_value='http://example.com/canonical')
    @patch('api.views.subprocess.Popen')
    def test_monitorar_produto_scrapy_malformed_json_output(self, mock_popen, mock_get_canonical_url):
        self.client.force_authenticate(user=self.vendedor_user)
        
        mock_process = MagicMock()
        mock_process.returncode = 0
        mock_process.communicate.return_value = (b'{"not_a_valid_json_array"}', b'')
        mock_popen.return_value = mock_process

        data = {'url': 'http://example.com/product'}
        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)
        self.assertIn('message', response.data)
        self.assertEqual(response.data['message'], 'Não foi possível extrair os dados do produto. O site pode ser incompatível ou estar indisponível.')
        mock_popen.assert_called_once()
        mock_get_canonical_url.assert_called_once_with('http://example.com/product')

    @patch('api.views.get_canonical_url', return_value='http://example.com/canonical')
    @patch('api.views.subprocess.Popen')
    def test_monitorar_produto_scrapy_missing_price(self, mock_popen, mock_get_canonical_url):
        self.client.force_authenticate(user=self.vendedor_user)
        
        mock_process = MagicMock()
        mock_process.returncode = 0
        mock_process.communicate.return_value = (b'[{"nome_produto": "Produto sem preco"}]', b'')
        mock_popen.return_value = mock_process

        data = {'url': 'http://example.com/product'}
        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)
        self.assertIn('message', response.data)
        self.assertEqual(response.data['message'], 'Não foi possível extrair os dados do produto. O site pode ser incompatível ou estar indisponível.')
        mock_popen.assert_called_once()
        mock_get_canonical_url.assert_called_once_with('http://example.com/product')

    @patch('api.views.get_canonical_url', return_value='http://example.com/canonical')
    @patch('api.views.subprocess.Popen', side_effect=FileNotFoundError("scrapy not found"))
    def test_monitorar_produto_scrapy_command_not_found(self, mock_popen, mock_get_canonical_url):
        self.client.force_authenticate(user=self.vendedor_user)
        data = {'url': 'http://example.com/product'}
        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertIn('message', response.data)
        self.assertEqual(response.data['message'], 'Erro de configuração no servidor que impede a execução do scraper.')
        mock_popen.assert_called_once()
        mock_get_canonical_url.assert_called_once_with('http://example.com/product')

    @patch('api.views.get_canonical_url', return_value='http://example.com/canonical')
    @patch('api.views.subprocess.Popen', side_effect=Exception("Generic error"))
    def test_monitorar_produto_scrapy_generic_exception(self, mock_popen, mock_get_canonical_url):
        self.client.force_authenticate(user=self.vendedor_user)
        data = {'url': 'http://example.com/product'}
        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertIn('message', response.data)
        self.assertEqual(response.data['message'], 'Ocorreu um erro inesperado no servidor.')
        mock_popen.assert_called_once()
        mock_get_canonical_url.assert_called_once_with('http://example.com/product')

class ObterPerfilViewTest(BaseSetup):
    def setUp(self):
        super().setUp()
        self.url = reverse('meu_perfil')

    def test_get_cliente_perfil(self):
        self.client.force_authenticate(user=self.cliente_user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['nome'], self.cliente.nome)

    def test_get_vendedor_perfil(self):
        self.client.force_authenticate(user=self.vendedor_user)
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['nome_loja'], self.vendedor.nome_loja)

    def test_update_cliente_perfil(self):
        self.client.force_authenticate(user=self.cliente_user)
        data = {'nome': 'Novo Nome Cliente'}
        response = self.client.patch(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.cliente.refresh_from_db()
        self.assertEqual(self.cliente.nome, 'Novo Nome Cliente')

    def test_update_vendedor_perfil(self):
        self.client.force_authenticate(user=self.vendedor_user)
        data = {'nome_loja': 'Nova Loja Teste'}
        response = self.client.patch(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.vendedor.refresh_from_db()
        self.assertEqual(self.vendedor.nome_loja, 'Nova Loja Teste')

    def test_unauthenticated_get_perfil(self):
        response = self.client.get(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class RecuperarSenhaViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(email='test@example.com', password='password123', is_active=True)
        self.url = reverse('recuperar_senha')

    def test_recuperar_senha_success(self):
        data = {'email': 'test@example.com'}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)
        self.user.refresh_from_db()
        self.assertIsNotNone(self.user.token_redefinir_senha)

    def test_recuperar_senha_non_existent_user(self):
        data = {'email': 'nonexistent@example.com'}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 0)

class RedefinirSenhaViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            email='test@example.com', password='password123', is_active=True,
            token_redefinir_senha=uuid.uuid4(),
            token_redefinir_senha_expiracao=timezone.now() + datetime.timedelta(hours=1)
        )
        self.valid_token_url = reverse('redefinir_senha', args=[self.user.token_redefinir_senha])

    def test_redefinir_senha_success(self):
        data = {'password': 'newpassword123'}
        response = self.client.post(self.valid_token_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('newpassword123'))
        self.assertIsNone(self.user.token_redefinir_senha)

    def test_redefinir_senha_invalid_token(self):
        invalid_url = reverse('redefinir_senha', args=[uuid.uuid4()])
        data = {'password': 'newpassword123'}
        response = self.client.post(invalid_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_redefinir_senha_expired_token(self):
        self.user.token_redefinir_senha_expiracao = timezone.now() - datetime.timedelta(hours=1)
        self.user.save()
        data = {'password': 'newpassword123'}
        response = self.client.post(self.valid_token_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_redefinir_senha_missing_password(self):
        response = self.client.post(self.valid_token_url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

class ReenviarVerificacaoViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.verified_user = User.objects.create_user(email='verified@example.com', password='password123', is_active=True, email_verificado=True)
        self.unverified_user = User.objects.create_user(email='unverified@example.com', password='password123', is_active=False, email_verificado=False)
        self.url = reverse('reenviar_verificacao')

    def test_reenviar_verificacao_success(self):
        data = {'email': 'unverified@example.com'}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)

    def test_reenviar_verificacao_already_verified(self):
        data = {'email': 'verified@example.com'}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_reenviar_verificacao_missing_email(self):
        response = self.client.post(self.url, {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_reenviar_verificacao_non_existent_user(self):
        data = {'email': 'nonexistent@example.com'}
        response = self.client.post(self.url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

class VariacaoCreateViewTest(BaseSetup):
    def setUp(self):
        super().setUp()
        self.subcategoria = SubcategoriaProduto.objects.create(nome='Smartphones', categoria_loja=self.categoria_loja)
        self.produto = Produto.objects.create(nome='iPhone 13', subcategoria=self.subcategoria)
        self.url = reverse('criar_variacao')

    def test_criar_variacao_success(self):
        self.client.force_authenticate(user=self.vendedor_user)
        variacoes = json.dumps([{'nome': 'Cor', 'valor': 'Azul'}, {'nome': 'Memória', 'valor': '128GB'}])
        data = {'produto': self.produto.id, 'variacoes': variacoes}
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(SKU.objects.count(), 1)

    def test_criar_variacao_with_image(self):
        self.client.force_authenticate(user=self.vendedor_user)
        variacoes = json.dumps([{'nome': 'Cor', 'valor': 'Azul'}, {'nome': 'Memória', 'valor': '128GB'}])
        image = SimpleUploadedFile("test_image.jpg", b"file_content", content_type="image/jpeg")
        data = {'produto': self.produto.id, 'variacoes': variacoes, 'imagem': image}
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ImagemSKU.objects.count(), 1)

    def test_criar_variacao_produto_nao_existe(self):
        self.client.force_authenticate(user=self.vendedor_user)
        variacoes = json.dumps([{'nome': 'Cor', 'valor': 'Azul'}])
        data = {'produto': 999, 'variacoes': variacoes}
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_criar_variacao_duplicada(self):
        self.client.force_authenticate(user=self.vendedor_user)
        variacoes = json.dumps([{'nome': 'Cor', 'valor': 'Azul'}])
        data = {'produto': self.produto.id, 'variacoes': variacoes}
        self.client.post(self.url, data) # First time
        response = self.client.post(self.url, data) # Second time
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)

    def test_criar_variacao_missing_fields(self):
        self.client.force_authenticate(user=self.vendedor_user)
        response = self.client.post(self.url, {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_criar_variacao_as_cliente(self):
        self.client.force_authenticate(user=self.cliente_user)
        variacoes = json.dumps([{'nome': 'Cor', 'valor': 'Azul'}])
        data = {'produto': self.produto.id, 'variacoes': variacoes}
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_criar_variacao_unauthenticated(self):
        variacoes = json.dumps([{'nome': 'Cor', 'valor': 'Azul'}])
        data = {'produto': self.produto.id, 'variacoes': variacoes}
        response = self.client.post(self.url, data)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)