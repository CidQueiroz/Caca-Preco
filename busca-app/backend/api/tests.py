import datetime
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from django.core import mail
from django.conf import settings
from django.utils import timezone
import itertools
from unittest.mock import patch



from .models import (
    Usuario, CategoriaLoja, SubcategoriaProduto, Produto,
    SKU, Atributo, ValorAtributo, ImagemSKU,
    OfertaProduto, Vendedor, AvaliacaoLoja, Cliente, Endereco,
    ProdutosMonitoradosExternos, Sugestao
)
from .serializers import ClienteSerializer, VendedorSerializer, ProdutosMonitoradosExternosSerializer

class UsuarioModelTests(APITestCase):
    def setUp(self):
        self.endereco = Endereco.objects.create(
            logradouro='Rua Teste', numero='123', cidade='Cidade Teste', estado='SP', cep='12345-678'
        )
        self.categoria = CategoriaLoja.objects.create(nome='Eletrônicos')

    def test_create_user_no_email(self):
        with self.assertRaises(ValueError):
            Usuario.objects.create_user(email='', password='password')

    def test_create_superuser_not_staff(self):
        with self.assertRaises(ValueError):
            Usuario.objects.create_superuser(email='super@user.com', password='password', is_staff=False)

    def test_create_superuser_not_superuser(self):
        with self.assertRaises(ValueError):
            Usuario.objects.create_superuser(email='super@user.com', password='password', is_superuser=False)

    def test_perfil_completo_cliente_only(self):
        user = Usuario.objects.create_user(email='cliente_only@example.com', password='password')
        Cliente.objects.create(usuario=user, nome='Cliente Only', cpf='11111111111')
        self.assertTrue(user.perfil_completo)

    def test_perfil_completo_vendedor_only(self):
        user = Usuario.objects.create_user(email='vendedor_only@example.com', password='password')
        Vendedor.objects.create(usuario=user, nome_loja='Vendedor Only', categoria_loja=self.categoria)
        self.assertTrue(user.perfil_completo)

    def test_perfil_completo_no_profile(self):
        user = Usuario.objects.create_user(email='no_profile@example.com', password='password')
        self.assertFalse(user.perfil_completo)

    def test_perfil_completo_both_profiles(self):
        user = Usuario.objects.create_user(email='both_profiles@example.com', password='password')
        Cliente.objects.create(usuario=user, nome='Both Profiles Client', cpf='22222222222')
        Vendedor.objects.create(usuario=user, nome_loja='Both Profiles Vendor', categoria_loja=self.categoria)
        self.assertTrue(user.perfil_completo)

class UserAuthenticationTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('registrar')
        self.login_url = reverse('token_obtain_pair')
        self.profile_url = reverse('obter_perfil')

        self.admin_user = Usuario.objects.create_superuser(
            email='admin@example.com',
            password='adminpassword123',
            tipo_usuario='Administrador',
            is_active=True,
            email_verificado=True
        )
        self.client_user = Usuario.objects.create_user(
            email='client@example.com',
            password='clientpassword123',
            tipo_usuario='Cliente',
            is_active=True,
            email_verificado=True
        )
        self.vendor_user = Usuario.objects.create_user(
            email='vendor@example.com',
            password='vendorpassword123',
            tipo_usuario='Vendedor',
            is_active=True,
            email_verificado=True
        )

        # Create related profiles for client and vendor
        self.endereco = Endereco.objects.create(
            logradouro='Rua Teste', numero='123', cidade='Cidade Teste', estado='SP', cep='12345-678'
        )
        self.categoria = CategoriaLoja.objects.create(nome='Eletrônicos')
        self.subcategoria = SubcategoriaProduto.objects.create(nome='Smartphones', categoria_loja=self.categoria)

        self.cliente_profile = Cliente.objects.create(
            usuario=self.client_user,
            nome='Cliente Teste',
            telefone='11987654321',
            endereco=self.endereco,
            cpf='12345678901',
            data_nascimento='2000-01-01'
        )
        self.vendor_profile = Vendedor.objects.create(
            usuario=self.vendor_user,
            nome_loja='Loja Teste',
            cnpj='11223344556677',
            endereco=self.endereco,
            telefone='11987654321',
            categoria_loja=self.categoria,
            status_aprovacao='aprovado',
            nome_responsavel='Responsavel Teste',
            cpf_responsavel='12345678901',
            breve_descricao_loja='Uma loja de testes',
            site_redes_sociais='http://test.com'
        )
        self.produto = Produto.objects.create(
            nome='Produto Teste', descricao='Desc', subcategoria=self.subcategoria
        )
        self.atributo_cor = Atributo.objects.create(nome='Cor')
        self.valor_cor_azul = ValorAtributo.objects.create(atributo=self.atributo_cor, valor='Azul')
        self.sku = SKU.objects.create(produto=self.produto, codigo_sku='P1-AZUL')
        self.sku.valores.add(self.valor_cor_azul)
        self.oferta = OfertaProduto.objects.create(
            vendedor=self.vendor_profile, sku=self.sku, preco=99.99, quantidade_disponivel=10
        )

    def test_str_methods(self):
        with patch('django.utils.timezone.now') as mock_now:
            mock_now.return_value = datetime.datetime(2025, 8, 21, 18, 0, 0, tzinfo=datetime.timezone.utc)
            self.assertEqual(str(self.admin_user), 'admin@example.com')
            self.assertEqual(str(self.endereco), 'Rua Teste, 123 - Cidade Teste/SP')
            self.assertEqual(str(self.categoria), 'Eletrônicos')
            self.assertEqual(str(self.cliente_profile), 'Cliente Teste')
            self.assertEqual(str(self.vendor_profile), 'Loja Teste')
            self.assertEqual(str(self.subcategoria), 'Eletrônicos > Smartphones')
            self.assertEqual(str(self.produto), 'Produto Teste')
            self.assertEqual(str(self.atributo_cor), 'Cor')
            self.assertEqual(str(self.valor_cor_azul), 'Cor: Azul')
            self.assertEqual(str(self.sku), 'Produto Teste (Cor: Azul)')
            self.assertEqual(str(ImagemSKU.objects.create(sku=self.sku, imagem='test.jpg')), f'Imagem de {self.sku}')
            self.assertEqual(str(self.oferta), f'{self.sku} por {self.vendor_profile.nome_loja} - R${self.oferta.preco}')
            sugestao = Sugestao.objects.create(usuario=self.client_user, texto='Sugestão de teste')
            self.assertEqual(str(sugestao), f'Sugestão de {self.client_user.email} em 2025-08-21 18:00')

    def test_user_registration(self):
        mail.outbox = [] # Clear outbox before test
        data = {
            'email': 'newuser@example.com',
            'senha': 'newpassword123',
            'tipo_usuario': 'Cliente' # Corrected case
        }
        response = self.client.post(self.register_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # self.assertIn('message', response.data) # Removed as response now returns user object
        self.assertEqual(Usuario.objects.count(), 4) # Admin, Client, Vendor, New User
        new_user = Usuario.objects.get(email='newuser@example.com')
        self.assertFalse(new_user.is_active)
        self.assertFalse(new_user.email_verificado)
        self.assertIsNotNone(new_user.token_verificacao)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('Verifique seu e-mail - Caça Preço', mail.outbox[0].subject)

    def test_user_login(self):
        data = {
            'email': 'client@example.com',
            'password': 'clientpassword123'
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_user_login_invalid_credentials(self):
        data = {
            'email': 'client@example.com',
            'password': 'wrongpassword'
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn('detail', response.data)

    def test_user_login_unverified_email(self):
        unverified_user = Usuario.objects.create_user(
            email='unverified_login@example.com',
            password='unverifiedpassword',
            tipo_usuario='Cliente',
            is_active=True, # User must be active to reach validate()
            email_verificado=False # Not verified
        )
        data = {
            'email': 'unverified_login@example.com',
            'password': 'unverifiedpassword'
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('EMAIL_NAO_VERIFICADO', response.data['detail'])

    def test_email_verification(self):
        # Register a user to get a verification token
        mail.outbox = []
        data = {
            'email': 'unverified@example.com',
            'senha': 'unverifiedpassword',
            'tipo_usuario': 'Cliente' # Corrected case
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        unverified_user = Usuario.objects.get(email='unverified@example.com')
        
        verification_url = reverse('verificar_email', kwargs={'token': unverified_user.token_verificacao})
        
        response = self.client.get(verification_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('status', response.data)
        unverified_user.refresh_from_db()
        self.assertTrue(unverified_user.is_active)
        self.assertTrue(unverified_user.email_verificado)
        self.assertIsNone(unverified_user.token_verificacao)

    def test_get_user_profile_client(self):
        self.client.force_authenticate(user=self.client_user)
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('nome', response.data)
        self.assertEqual(response.data['usuario']['email'], 'client@example.com')
        self.assertEqual(response.data['nome'], 'Cliente Teste')

    def test_get_user_profile_vendor(self):
        self.client.force_authenticate(user=self.vendor_user)
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('nome_loja', response.data)
        self.assertEqual(response.data['usuario']['email'], 'vendor@example.com')
        self.assertEqual(response.data['nome_loja'], 'Loja Teste')

    def test_get_user_profile_unauthenticated(self):
        self.client.force_authenticate(user=None) # Ensure no user is authenticated
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class PermissionTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin_user = Usuario.objects.create_superuser(
            email='admin@example.com',
            password='adminpassword123',
            tipo_usuario='Administrador',
            is_active=True,
            email_verificado=True
        )
        self.client_user = Usuario.objects.create_user(
            email='client@example.com',
            password='clientpassword123',
            tipo_usuario='Cliente',
            is_active=True,
            email_verificado=True
        )
        self.vendor_user = Usuario.objects.create_user(
            email='vendor@example.com',
            password='vendorpassword123',
            tipo_usuario='Vendedor',
            is_active=True,
            email_verificado=True
        )
        self.other_vendor_user = Usuario.objects.create_user(
            email='other_vendor@example.com',
            password='otherpassword123',
            tipo_usuario='Vendedor',
            is_active=True,
            email_verificado=True
        )

        self.endereco = Endereco.objects.create(
            logradouro='Rua Teste', numero='123', cidade='Cidade Teste', estado='SP', cep='12345-678'
        )
        self.categoria = CategoriaLoja.objects.create(nome='Eletrônicos')
        self.subcategoria = SubcategoriaProduto.objects.create(nome='Smartphones', categoria_loja=self.categoria)

        self.cliente_profile = Cliente.objects.create(
            usuario=self.client_user,
            nome='Cliente Teste',
            telefone='11987654321',
            endereco=self.endereco,
            cpf='12345678901',
            data_nascimento='2000-01-01'
        )
        self.vendor_profile = Vendedor.objects.create(
            usuario=self.vendor_user,
            nome_loja='Loja Teste',
            cnpj='11223344556677',
            endereco=self.endereco,
            telefone='11987654321',
            categoria_loja=self.categoria,
            status_aprovacao='aprovado',
            nome_responsavel='Responsavel Teste',
            cpf_responsavel='12345678901',
            breve_descricao_loja='Uma loja de testes',
            site_redes_sociais='http://test.com'
        )
        self.other_vendor_profile = Vendedor.objects.create(
            usuario=self.other_vendor_user,
            nome_loja='Outra Loja',
            cnpj='99887766554433',
            endereco=self.endereco,
            telefone='11987654322',
            categoria_loja=self.categoria,
            status_aprovacao='aprovado',
            nome_responsavel='Outro Responsavel',
            cpf_responsavel='98765432109',
            breve_descricao_loja='Outra loja de testes',
            site_redes_sociais='http://other.com'
        )

        self.produto = Produto.objects.create(
            nome='Produto Teste', descricao='Desc', subcategoria=self.subcategoria
        )
        self.atributo_cor = Atributo.objects.create(nome='Cor')
        self.valor_cor_azul = ValorAtributo.objects.create(atributo=self.atributo_cor, valor='Azul')
        self.sku = SKU.objects.create(produto=self.produto, codigo_sku='P1-AZUL')
        self.sku.valores.add(self.valor_cor_azul)
        self.oferta = OfertaProduto.objects.create(
            vendedor=self.vendor_profile, sku=self.sku, preco=99.99, quantidade_disponivel=10
        )

    def test_admin_can_create_category(self):
        self.client.force_authenticate(user=self.admin_user)
        data = {'nome': 'Nova Categoria', 'descricao': 'Desc'}
        response = self.client.post(reverse('categorialoja-list'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_client_cannot_create_category(self):
        self.client.force_authenticate(user=self.client_user)
        data = {'nome': 'Nova Categoria', 'descricao': 'Desc'}
        response = self.client.post(reverse('categorialoja-list'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_vendor_can_create_offer(self):
        self.client.force_authenticate(user=self.vendor_user)
        # Create a new product and SKU to avoid unique constraint violation
        new_product = Produto.objects.create(
            nome='Novo Produto para Oferta', descricao='Desc', subcategoria=self.subcategoria
        )
        atributo_tamanho = Atributo.objects.create(nome='Tamanho')
        valor_tamanho_g = ValorAtributo.objects.create(atributo=atributo_tamanho, valor='G')
        new_sku = SKU.objects.create(produto=new_product, codigo_sku='NP-G')
        new_sku.valores.add(valor_tamanho_g)
        data = {
            'vendedor': self.vendor_profile.pk,
            'sku_id': new_sku.id,
            'preco': 120.00,
            'quantidade_disponivel': 5
        }
        response = self.client.post(reverse('ofertaproduto-list'), data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_client_cannot_create_offer(self):
        self.client.force_authenticate(user=self.client_user)
        data = {
            'vendedor': self.vendor_profile.pk,
            'sku_id': self.sku.id,
            'preco': 120.00,
            'quantidade_disponivel': 5
        }
        response = self.client.post(reverse('ofertaproduto-list'), data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_vendor_can_update_own_offer(self):
        self.client.force_authenticate(user=self.vendor_user)
        data = {
            'vendedor': self.vendor_profile.pk,
            'sku_id': self.sku.id,
            'preco': 105.00,
            'quantidade_disponivel': 8
        }
        response = self.client.put(reverse('ofertaproduto-detail', args=[self.oferta.pk]), data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.oferta.refresh_from_db()
        self.assertEqual(self.oferta.preco, 105.00)

    def test_other_vendor_cannot_update_offer(self):
        self.client.force_authenticate(user=self.other_vendor_user)
        data = {
            'vendedor': self.vendor_profile.pk,
            'sku_id': self.sku.id,
            'preco': 105.00,
            'quantidade_disponivel': 8
        }
        response = self.client.put(reverse('ofertaproduto-detail', args=[self.oferta.pk]), data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_client_can_update_own_profile(self):
        self.client.force_authenticate(user=self.client_user)
        data = {
            'nome': 'Cliente Atualizado',
            'telefone': '11999999999',
            'endereco': {
                'logradouro': 'Rua Nova',
                'numero': '456',
                'cidade': 'Cidade Nova',
                'estado': 'SP',
                'cep': '87654-321'
            },
            'cpf': '12345678901',
            'data_nascimento': '2000-01-01'
        }
        response = self.client.put(reverse('cliente-detail', args=[self.cliente_profile.pk]), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.cliente_profile.refresh_from_db()
        self.assertEqual(self.cliente_profile.nome, 'Cliente Atualizado')

    def test_client_cannot_update_other_client_profile(self):
        other_client_user = Usuario.objects.create_user(
            email='another_client@example.com',
            password='anotherpassword123',
            tipo_usuario='Cliente',
            is_active=True,
            email_verificado=True
        )
        other_client_profile = Cliente.objects.create(
            usuario=other_client_user,
            nome='Outro Cliente',
            telefone='11987654321',
            endereco=self.endereco,
            cpf='12345678902',
            data_nascimento='2000-01-02'
        )
        self.client.force_authenticate(user=self.client_user) # Authenticate as self.client_user
        data = {
            'usuario': other_client_user.id,
            'nome': 'Cliente Malicioso',
            'telefone': '11999999999',
            'endereco': self.endereco.id,
            'cpf': '12345678902',
            'data_nascimento': '2000-01-02'
        }
        response = self.client.put(reverse('cliente-detail', args=[other_client_profile.pk]), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_admin_permission(self):
        self.client.force_authenticate(user=self.client_user)
        response = self.client.get(reverse('admin:index'))
        self.assertEqual(response.status_code, status.HTTP_302_FOUND)

    def test_is_cliente_permission(self):
        self.client.force_authenticate(user=self.vendor_user)
        response = self.client.get(reverse('cliente-detail', args=[self.cliente_profile.pk]))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_is_owner_or_read_only_permission_safe_methods(self):
        self.client.force_authenticate(user=self.other_vendor_user)
        response = self.client.get(reverse('ofertaproduto-detail', args=[self.oferta.pk]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_is_owner_or_read_only_permission_no_owner(self):
        self.client.force_authenticate(user=self.other_vendor_user)
        data = {'preco': 150.00}
        response = self.client.put(reverse('ofertaproduto-detail', args=[self.oferta.pk]), data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_is_owner_or_read_only_permission_no_user_attribute(self):
        # Create an object without a 'usuario' or 'vendedor' attribute
        class MockObject:
            pass
        obj = MockObject()
        # Create a dummy request and view
        from django.test import RequestFactory
        from rest_framework.views import APIView
        request = RequestFactory().put('/')
        request.user = self.vendor_user
        view = APIView()
        # Check the permission
        from .permissions import IsOwnerOrReadOnly
        permission = IsOwnerOrReadOnly()
        self.assertFalse(permission.has_object_permission(request, view, obj))

    def test_is_owner_or_read_only_permission_vendedor_no_usuario(self):
        # Create an object with a 'vendedor' attribute but no 'usuario' attribute
        class MockVendedor:
            pass
        class MockObject:
            def __init__(self):
                self.vendedor = MockVendedor()
        obj = MockObject()
        # Create a dummy request and view
        from django.test import RequestFactory
        from rest_framework.views import APIView
        request = RequestFactory().put('/')
        request.user = self.vendor_user
        view = APIView()
        # Check the permission
        from .permissions import IsOwnerOrReadOnly
        permission = IsOwnerOrReadOnly()
        self.assertFalse(permission.has_object_permission(request, view, obj))

    def test_is_admin_user_permission(self):
        self.client.login(email='admin@example.com', password='adminpassword123')
        response = self.client.get(reverse('admin:index'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_is_cliente_user_permission(self):
        self.client.force_authenticate(user=self.client_user)
        response = self.client.get(reverse('cliente-detail', args=[self.cliente_profile.pk]))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_is_admin_user_permission_direct(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.get(reverse('admin-test'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_is_cliente_user_permission_direct(self):
        self.client.force_authenticate(user=self.client_user)
        response = self.client.get(reverse('cliente-test'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)

class CRUDTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin_user = Usuario.objects.create_superuser(
            email='admin@example.com',
            password='adminpassword123',
            tipo_usuario='Administrador',
            is_active=True,
            email_verificado=True
        )
        self.vendor_user = Usuario.objects.create_user(
            email='vendor@example.com',
            password='vendorpassword123',
            tipo_usuario='Vendedor',
            is_active=True,
            email_verificado=True
        )
        self.vendor_profile = Vendedor.objects.create(
            usuario=self.vendor_user,
            nome_loja='Loja Teste',
            cnpj='11223344556677',
            endereco=Endereco.objects.create(logradouro='Rua A', numero='1', cidade='Cidade A', estado='SP', cep='11111-111'),
            telefone='11987654321',
            categoria_loja=CategoriaLoja.objects.create(nome='Eletrônicos'),
            status_aprovacao='aprovado',
            nome_responsavel='Responsavel Teste',
            cpf_responsavel='12345678901',
            breve_descricao_loja='Uma loja de testes',
            site_redes_sociais='http://test.com'
        )
        self.client.force_authenticate(user=self.admin_user)
        self.categoria = CategoriaLoja.objects.get(nome='Eletrônicos') # Use existing category
        self.subcategoria = SubcategoriaProduto.objects.create(nome='Smartphones', categoria_loja=self.categoria)

    def test_create_categoria_loja(self):
        data = {'nome': 'Moda', 'descricao': 'Roupas e acessórios'}
        response = self.client.post(reverse('categorialoja-list'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CategoriaLoja.objects.count(), 2) # Eletrônicos + Moda

    def test_list_categoria_loja(self):
        response = self.client.get(reverse('categorialoja-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1) # Only Eletrônicos from setUp

    def test_create_produto(self):
        data = {
            'nome': 'Smartphone X',
            'descricao': 'Um smartphone avançado',
            'subcategoria': self.subcategoria.id
        }
        response = self.client.post(reverse('produto-list'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Produto.objects.count(), 1)

    def test_create_oferta_produto(self):
        produto = Produto.objects.create(
            nome='TV', descricao='Smart TV', subcategoria=self.subcategoria
        )
        atributo_tamanho = Atributo.objects.create(nome='Tamanho')
        valor_tamanho_50 = ValorAtributo.objects.create(atributo=atributo_tamanho, valor='50 polegadas')
        sku = SKU.objects.create(produto=produto, codigo_sku='TV-50')
        sku.valores.add(valor_tamanho_50)
        data = {
            'vendedor': self.vendor_profile.pk,
            'sku_id': sku.id,
            'preco': 1999.99,
            'quantidade_disponivel': 5
        }
        self.client.force_authenticate(user=self.vendor_user) # Vendor can create offers
        response = self.client.post(reverse('ofertaproduto-list'), data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(OfertaProduto.objects.count(), 1)

class BusinessLogicTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.vendor_user = Usuario.objects.create_user(
            email='vendor@example.com',
            password='vendorpassword123',
            tipo_usuario='Vendedor',
            is_active=True,
            email_verificado=True
        )
        self.endereco = Endereco.objects.create(
            logradouro='Rua Teste', numero='123', cidade='Cidade Teste', estado='SP', cep='12345-678'
        )
        self.categoria = CategoriaLoja.objects.create(nome='Eletrônicos')
        self.vendor_profile = Vendedor.objects.create(
            usuario=self.vendor_user,
            nome_loja='Loja Teste',
            cnpj='11223344556677',
            endereco=self.endereco,
            telefone='11987654321',
            categoria_loja=self.categoria,
            status_aprovacao='aprovado',
            nome_responsavel='Responsavel Teste',
            cpf_responsavel='12345678901',
            breve_descricao_loja='Uma loja de testes',
            site_redes_sociais='http://test.com'
        )
        self.client.force_authenticate(user=self.vendor_user)

    

    def test_produtos_monitorados_externos_create(self):
        data = {
            'url_produto': 'http://newproduct.com/item',
        }
        response = self.client.post(reverse('monitoramento-list'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ProdutosMonitoradosExternos.objects.count(), 1)
        self.assertEqual(ProdutosMonitoradosExternos.objects.get().vendedor, self.vendor_profile)
        # self.assertIn('Produto Fictício da URL', ProdutosMonitoradosExternos.objects.get().nome_produto)

    def test_produtos_monitorados_externos_list(self):
        ProdutosMonitoradosExternos.objects.create(
            vendedor=self.vendor_profile,
            url_produto='http://example.com/product1',
            nome_produto='Produto Monitorado 1',
            preco_atual=100.00,
            ultima_coleta='2023-01-01'
        )
        response = self.client.get(reverse('monitoramento-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['vendedor'], self.vendor_profile.pk)

    def test_produtos_monitorados_externos_update_own(self):
        monitored_product = ProdutosMonitoradosExternos.objects.create(
            vendedor=self.vendor_profile,
            url_produto='http://example.com/to_update',
            nome_produto='Old Name',
            preco_atual=50.00,
            ultima_coleta='2023-01-01'
        )
        data = {
            'nome_produto': 'Updated Name',
            'preco_atual': 55.00
        }
        response = self.client.patch(reverse('monitoramento-detail', args=[monitored_product.pk]), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        monitored_product.refresh_from_db()
        self.assertEqual(monitored_product.nome_produto, 'Updated Name')
        self.assertEqual(monitored_product.preco_atual, 55.00)

    def test_produtos_monitorados_externos_update_other_vendor(self):
        other_vendor_user = Usuario.objects.create_user(
            email='other_vendor@example.com',
            password='otherpassword123',
            tipo_usuario='Vendedor',
            is_active=True,
            email_verificado=True
        )
        other_vendor_profile = Vendedor.objects.create(
            usuario=other_vendor_user,
            nome_loja='Outra Loja',
            cnpj='99887766554433',
            endereco=self.endereco,
            telefone='11987654322',
            categoria_loja=self.categoria,
            status_aprovacao='aprovado',
            nome_responsavel='Outro Responsavel',
            cpf_responsavel='98765432109',
            breve_descricao_loja='Outra loja de testes',
            site_redes_sociais='http://other.com'
        )
        monitored_product = ProdutosMonitoradosExternos.objects.create(
            vendedor=other_vendor_profile, # This product belongs to other_vendor_profile
            url_produto='http://example.com/other_product',
            nome_produto='Other Product',
            preco_atual=70.00,
            ultima_coleta='2023-01-01'
        )
        data = {
            'nome_produto': 'Malicious Update',
        }
        # Authenticate as self.vendor_user, trying to update other_vendor_profile's product
        response = self.client.patch(reverse('monitoramento-detail', args=[monitored_product.pk]), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)


class ProdutosMonitoradosExternosViewSetTests(APITestCase):
    email_counter = itertools.count(1)

    def setUp(self):
        self.client = APIClient()
        self.vendor_user = Usuario.objects.create_user(
            email=f'vendor_monitor_{next(self.email_counter)}@example.com',
            password='password123',
            tipo_usuario='Vendedor',
            is_active=True,
            email_verificado=True
        )
        self.vendor_profile = Vendedor.objects.create(
            usuario=self.vendor_user,
            nome_loja='Loja Monitoramento',
            cnpj='11111111111111',
            categoria_loja=CategoriaLoja.objects.create(nome='Eletrônicos')
        )
        self.client.force_authenticate(user=self.vendor_user)

    def tearDown(self):
        ProdutosMonitoradosExternos.objects.all().delete()
        Vendedor.objects.all().delete()
        Usuario.objects.all().delete()
        CategoriaLoja.objects.all().delete()

    @patch('api.views.scrape_product_data')
    def test_create_monitoramento_missing_url(self, mock_scrape_product_data):
        mock_scrape_product_data.return_value = {}
        data = {} # Missing URL
        response = self.client.post(reverse('monitoramento-list'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('url_produto', response.data) # Check for url_produto field error
        self.assertIn('This field is required.', str(response.data['url_produto'])) # Check for required error message

    @patch('api.views.scrape_product_data')
    def test_create_monitoramento_not_vendor(self, mock_scrape_product_data):
        mock_scrape_product_data.return_value = {}
        client_user = Usuario.objects.create_user(
            email=f'client_monitor_{next(self.email_counter)}@example.com',
            password='password123',
            tipo_usuario='Cliente',
            is_active=True,
            email_verificado=True
        )
        self.client.force_authenticate(user=client_user)
        data = {'url': 'http://example.com/product'}
        response = self.client.post(reverse('monitoramento-list'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('Apenas vendedores podem monitorar produtos.', response.data['message'])

    @patch('api.views.scrape_product_data')
    def test_create_monitoramento_already_monitoring(self, mock_scrape_product_data):
        mock_scrape_product_data.return_value = {}
        ProdutosMonitoradosExternos.objects.create(
            vendedor=self.vendor_profile,
            url_produto='http://example.com/existing_product',
            nome_produto='Existing Product',
            preco_atual=10.00
        )
        data = {'url': 'http://example.com/existing_product'}
        response = self.client.post(reverse('monitoramento-list'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertIn('Você já está monitorando este produto.', response.data['message'])

    @patch('api.views.scrape_product_data')
    def test_create_monitoramento_scraping_fails(self, mock_scrape_product_data):
        mock_scrape_product_data.return_value = {} # Simulate scraping failure
        data = {'url': 'http://example.com/product_fail'}
        response = self.client.post(reverse('monitoramento-list'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)
        self.assertIn('Não foi possível extrair os dados do produto.', response.data['message'])

    @patch('api.views.scrape_product_data')
    def test_create_monitoramento_success_with_url(self, mock_scrape_product_data):
        mock_scrape_product_data.return_value = {
            'nome_produto': 'Scraped Product',
            'preco_atual': 100.00
        }
        data = {'url': 'http://example.com/new_product'}
        response = self.client.post(reverse('monitoramento-list'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ProdutosMonitoradosExternos.objects.count(), 1)
        self.assertEqual(ProdutosMonitoradosExternos.objects.first().nome_produto, 'Scraped Product')

    def test_create_monitoramento_standard_create(self):
        # This tests the super().create() path
        data = {
            'vendedor': self.vendor_profile.pk,
            'url_produto': 'http://example.com/standard_product',
            'nome_produto': 'Standard Product',
            'preco_atual': 50.00
        }
        response = self.client.post(reverse('monitoramento-list'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ProdutosMonitoradosExternos.objects.count(), 1)
        self.assertEqual(ProdutosMonitoradosExternos.objects.first().nome_produto, 'Standard Product')

class ProdutosMonitoradosExternosViewSetTests(APITestCase):
    email_counter = itertools.count(1)

    def setUp(self):
        self.client = APIClient()
        self.vendor_user = Usuario.objects.create_user(
            email=f'vendor_monitor_{next(self.email_counter)}@example.com',
            password='password123',
            tipo_usuario='Vendedor',
            is_active=True,
            email_verificado=True
        )
        self.vendor_profile = Vendedor.objects.create(
            usuario=self.vendor_user,
            nome_loja='Loja Monitoramento',
            cnpj='11111111111111',
            categoria_loja=CategoriaLoja.objects.create(nome='Eletrônicos')
        )
        self.client.force_authenticate(user=self.vendor_user)

    def tearDown(self):
        ProdutosMonitoradosExternos.objects.all().delete()
        Vendedor.objects.all().delete()
        Usuario.objects.all().delete()
        CategoriaLoja.objects.all().delete()

    @patch('api.views.scrape_product_data')
    def test_create_monitoramento_missing_url(self, mock_scrape_product_data):
        mock_scrape_product_data.return_value = {}
        data = {} # Missing URL
        response = self.client.post(reverse('monitoramento-list'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('url_produto', response.data) # Check for url_produto field error
        self.assertIn('This field is required.', str(response.data['url_produto'])) # Check for required error message

    @patch('api.views.scrape_product_data')
    def test_create_monitoramento_not_vendor(self, mock_scrape_product_data):
        mock_scrape_product_data.return_value = {}
        client_user = Usuario.objects.create_user(
            email=f'client_monitor_{next(self.email_counter)}@example.com',
            password='password123',
            tipo_usuario='Cliente',
            is_active=True,
            email_verificado=True
        )
        self.client.force_authenticate(user=client_user)
        data = {'url': 'http://example.com/product'}
        response = self.client.post(reverse('monitoramento-list'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('Apenas vendedores podem monitorar produtos.', response.data['message'])

    @patch('api.views.scrape_product_data')
    def test_create_monitoramento_already_monitoring(self, mock_scrape_product_data):
        mock_scrape_product_data.return_value = {}
        ProdutosMonitoradosExternos.objects.create(
            vendedor=self.vendor_profile,
            url_produto='http://example.com/existing_product',
            nome_produto='Existing Product',
            preco_atual=10.00
        )
        data = {'url': 'http://example.com/existing_product'}
        response = self.client.post(reverse('monitoramento-list'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertIn('Você já está monitorando este produto.', response.data['message'])

    @patch('api.views.scrape_product_data')
    def test_create_monitoramento_scraping_fails(self, mock_scrape_product_data):
        mock_scrape_product_data.return_value = {} # Simulate scraping failure
        data = {'url': 'http://example.com/product_fail'}
        response = self.client.post(reverse('monitoramento-list'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)
        self.assertIn('Não foi possível extrair os dados do produto.', response.data['message'])

    @patch('api.views.scrape_product_data')
    def test_create_monitoramento_success_with_url(self, mock_scrape_product_data):
        mock_scrape_product_data.return_value = {
            'nome_produto': 'Scraped Product',
            'preco_atual': 100.00
        }
        data = {'url': 'http://example.com/new_product'}
        response = self.client.post(reverse('monitoramento-list'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ProdutosMonitoradosExternos.objects.count(), 1)
        self.assertEqual(ProdutosMonitoradosExternos.objects.first().nome_produto, 'Scraped Product')

    def test_create_monitoramento_standard_create(self):
        # This tests the super().create() path
        data = {
            'vendedor': self.vendor_profile.pk,
            'url_produto': 'http://example.com/standard_product',
            'nome_produto': 'Standard Product',
            'preco_atual': 50.00
        }
        response = self.client.post(reverse('monitoramento-list'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ProdutosMonitoradosExternos.objects.count(), 1)
        self.assertEqual(ProdutosMonitoradosExternos.objects.first().nome_produto, 'Standard Product')

    def test_get_queryset_vendor_authenticated(self):
        # Create another vendor and their monitored product
        other_vendor_user = Usuario.objects.create_user(
            email=f'other_vendor_monitor_{next(self.email_counter)}@example.com',
            password='password123',
            tipo_usuario='Vendedor',
            is_active=True,
            email_verificado=True
        )
        other_vendor_profile = Vendedor.objects.create(
            usuario=other_vendor_user,
            nome_loja='Outra Loja Monitoramento',
            cnpj='22222222222222',
            categoria_loja=CategoriaLoja.objects.create(nome='Livros')
        )
        ProdutosMonitoradosExternos.objects.create(
            vendedor=other_vendor_profile,
            url_produto='http://example.com/other_vendor_product',
            nome_produto='Other Vendor Product',
            preco_atual=200.00
        )

        # Authenticate as the main vendor
        self.client.force_authenticate(user=self.vendor_user)
        response = self.client.get(reverse('monitoramento-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1) # Should only see own product
        self.assertEqual(response.data[0]['vendedor'], self.vendor_profile.pk)

    def test_get_queryset_client_authenticated(self):
        client_user = Usuario.objects.create_user(
            email=f'client_monitor_{next(self.email_counter)}@example.com',
            password='password123',
            tipo_usuario='Cliente',
            is_active=True,
            email_verificado=True
        )
        self.client.force_authenticate(user=client_user)
        response = self.client.get(reverse('monitoramento-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0) # Clients should see no products

    def test_get_queryset_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(reverse('monitoramento-list'))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED) # Should be unauthorized

class ProdutosMonitoradosExternosViewSetTests(APITestCase):
    email_counter = itertools.count(1)

    def setUp(self):
        self.client = APIClient()
        self.vendor_user = Usuario.objects.create_user(
            email=f'vendor_monitor_{next(self.email_counter)}@example.com',
            password='password123',
            tipo_usuario='Vendedor',
            is_active=True,
            email_verificado=True
        )
        self.categoria = CategoriaLoja.objects.create(nome='Eletrônicos') # Create category here
        self.vendor_profile = Vendedor.objects.create(
            usuario=self.vendor_user,
            nome_loja='Loja Monitoramento',
            cnpj='11111111111111',
            categoria_loja=self.categoria # Use the created category
        )
        self.client.force_authenticate(user=self.vendor_user)

    def tearDown(self):
        ProdutosMonitoradosExternos.objects.all().delete()
        Vendedor.objects.all().delete()
        Usuario.objects.all().delete()
        CategoriaLoja.objects.all().delete()

    @patch('api.views.scrape_product_data')
    def test_create_monitoramento_missing_url(self, mock_scrape_product_data):
        mock_scrape_product_data.return_value = {}
        data = {} # Missing URL
        response = self.client.post(reverse('monitoramento-list'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('url_produto', response.data) # Check for url_produto field error
        self.assertIn('This field is required.', str(response.data['url_produto'])) # Check for required error message

    @patch('api.views.scrape_product_data')
    def test_create_monitoramento_not_vendor(self, mock_scrape_product_data):
        mock_scrape_product_data.return_value = {}
        client_user = Usuario.objects.create_user(
            email=f'client_monitor_{next(self.email_counter)}@example.com',
            password='password123',
            tipo_usuario='Cliente',
            is_active=True,
            email_verificado=True
        )
        self.client.force_authenticate(user=client_user)
        data = {'url': 'http://example.com/product'}
        response = self.client.post(reverse('monitoramento-list'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('Apenas vendedores podem monitorar produtos.', response.data['message'])

    @patch('api.views.scrape_product_data')
    def test_create_monitoramento_already_monitoring(self, mock_scrape_product_data):
        mock_scrape_product_data.return_value = {}
        ProdutosMonitoradosExternos.objects.create(
            vendedor=self.vendor_profile,
            url_produto='http://example.com/existing_product',
            nome_produto='Existing Product',
            preco_atual=10.00
        )
        data = {'url': 'http://example.com/existing_product'}
        response = self.client.post(reverse('monitoramento-list'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)
        self.assertIn('Você já está monitorando este produto.', response.data['message'])

    @patch('api.views.scrape_product_data')
    def test_create_monitoramento_scraping_fails(self, mock_scrape_product_data):
        mock_scrape_product_data.return_value = {} # Simulate scraping failure
        data = {'url': 'http://example.com/product_fail'}
        response = self.client.post(reverse('monitoramento-list'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_422_UNPROCESSABLE_ENTITY)
        self.assertIn('Não foi possível extrair os dados do produto.', response.data['message'])

    @patch('api.views.scrape_product_data')
    def test_create_monitoramento_success_with_url(self, mock_scrape_product_data):
        mock_scrape_product_data.return_value = {
            'nome_produto': 'Scraped Product',
            'preco_atual': 100.00
        }
        data = {'url': 'http://example.com/new_product'}
        response = self.client.post(reverse('monitoramento-list'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ProdutosMonitoradosExternos.objects.count(), 1)
        self.assertEqual(ProdutosMonitoradosExternos.objects.first().nome_produto, 'Scraped Product')

    def test_create_monitoramento_standard_create(self):
        # This tests the super().create() path
        data = {
            'vendedor': self.vendor_profile.pk,
            'url_produto': 'http://example.com/standard_product',
            'nome_produto': 'Standard Product',
            'preco_atual': 50.00
        }
        response = self.client.post(reverse('monitoramento-list'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ProdutosMonitoradosExternos.objects.count(), 1)
        self.assertEqual(ProdutosMonitoradosExternos.objects.first().nome_produto, 'Standard Product')

    def test_get_queryset_vendor_authenticated(self):
        # Create another vendor and their monitored product
        other_vendor_user = Usuario.objects.create_user(
            email=f'other_vendor_monitor_{next(self.email_counter)}@example.com',
            password='password123',
            tipo_usuario='Vendedor',
            is_active=True,
            email_verificado=True
        )
        other_vendor_profile = Vendedor.objects.create(
            usuario=other_vendor_user,
            nome_loja='Outra Loja Monitoramento',
            cnpj='22222222222222',
            categoria_loja=CategoriaLoja.objects.create(nome='Livros')
        )
        ProdutosMonitoradosExternos.objects.create(
            vendedor=other_vendor_profile,
            url_produto='http://example.com/other_vendor_product',
            nome_produto='Other Vendor Product',
            preco_atual=200.00
        )

        # Authenticate as the main vendor
        self.client.force_authenticate(user=self.vendor_user)
        response = self.client.get(reverse('monitoramento-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1) # Should only see own product
        self.assertEqual(response.data[0]['vendedor'], self.vendor_profile.pk)

    def test_get_queryset_client_authenticated(self):
        client_user = Usuario.objects.create_user(
            email=f'client_monitor_{next(self.email_counter)}@example.com',
            password='password123',
            tipo_usuario='Cliente',
            is_active=True,
            email_verificado=True
        )
        self.client.force_authenticate(user=client_user)
        response = self.client.get(reverse('monitoramento-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 0) # Clients should see no products

    def test_get_queryset_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.get(reverse('monitoramento-list'))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED) # Should be unauthorized

class ProdutoViewSetTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        # Create vendor 1 and their products
        self.vendor_user_1 = Usuario.objects.create_user(email='vendor1@example.com', password='password123', tipo_usuario='Vendedor', is_active=True, email_verificado=True)
        self.vendor_profile_1 = Vendedor.objects.create(
            usuario=self.vendor_user_1,
            nome_loja='Loja do Vendedor 1',
            categoria_loja=CategoriaLoja.objects.create(nome='Roupas'),
            status_aprovacao='aprovado'
        )
        self.subcategoria = SubcategoriaProduto.objects.create(nome='Camisetas', categoria_loja=self.vendor_profile_1.categoria_loja)
        
        produto1 = Produto.objects.create(nome='Camiseta Azul', subcategoria=self.subcategoria)
        sku1 = SKU.objects.create(produto=produto1, codigo_sku='CA-AZ')
        OfertaProduto.objects.create(vendedor=self.vendor_profile_1, sku=sku1, preco=50.00)

        produto2 = Produto.objects.create(nome='Camiseta Vermelha', subcategoria=self.subcategoria)
        sku2 = SKU.objects.create(produto=produto2, codigo_sku='CA-VM')
        OfertaProduto.objects.create(vendedor=self.vendor_profile_1, sku=sku2, preco=55.00)

        # Create vendor 2 and their products
        self.vendor_user_2 = Usuario.objects.create_user(email='vendor2@example.com', password='password123', tipo_usuario='Vendedor', is_active=True, email_verificado=True)
        self.vendor_profile_2 = Vendedor.objects.create(
            usuario=self.vendor_user_2,
            nome_loja='Loja do Vendedor 2',
            categoria_loja=self.vendor_profile_1.categoria_loja,
            status_aprovacao='aprovado'
        )
        produto3 = Produto.objects.create(nome='Bermuda Jeans', subcategoria=self.subcategoria)
        sku3 = SKU.objects.create(produto=produto3, codigo_sku='BE-JE')
        OfertaProduto.objects.create(vendedor=self.vendor_profile_2, sku=sku3, preco=90.00)

    def test_meus_produtos_returns_only_own_products(self):
        """
        Ensure the 'meus-produtos' endpoint only returns products offered by the authenticated vendor.
        """
        self.client.force_authenticate(user=self.vendor_user_1)
        response = self.client.get(reverse('produto-meus-produtos'))
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Vendor 1 has 2 offers
        self.assertEqual(len(response.data), 2)
        # Check if the product names are correct
        self.assertEqual(response.data[0]['nome_produto'], 'Camiseta Azul')
        self.assertEqual(response.data[1]['nome_produto'], 'Camiseta Vermelha')

    def test_meus_produtos_category_filter(self):
        """
        Ensure the 'meus-produtos' endpoint can be filtered by category.
        """
        # Create a new category and product for vendor 1
        new_category = CategoriaLoja.objects.create(nome='Calçados')
        new_subcategoria = SubcategoriaProduto.objects.create(nome='Tênis', categoria_loja=new_category)
        produto_tenis = Produto.objects.create(nome='Tênis de Corrida', subcategoria=new_subcategoria)
        sku_tenis = SKU.objects.create(produto=produto_tenis, codigo_sku='TE-CO')
        OfertaProduto.objects.create(vendedor=self.vendor_profile_1, sku=sku_tenis, preco=250.00)

        self.client.force_authenticate(user=self.vendor_user_1)
        
        # Filter by the new category
        response = self.client.get(reverse('produto-meus-produtos'), {'id_categoria': new_category.id})
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['nome_produto'], 'Tênis de Corrida')

        # Filter by the original category
        response = self.client.get(reverse('produto-meus-produtos'), {'id_categoria': self.vendor_profile_1.categoria_loja.id})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_meus_produtos_default_image_url(self):
        """
        Ensure that the default image URL is returned when no image is associated with the SKU.
        """
        # Create a product and SKU without an associated image
        produto_no_image = Produto.objects.create(nome='Produto Sem Imagem', subcategoria=self.subcategoria)
        sku_no_image = SKU.objects.create(produto=produto_no_image, codigo_sku='NO-IMG')
        OfertaProduto.objects.create(vendedor=self.vendor_profile_1, sku=sku_no_image, preco=10.00)

        self.client.force_authenticate(user=self.vendor_user_1)
        response = self.client.get(reverse('produto-meus-produtos'))
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Find the product without an image in the response
        product_data = next((item for item in response.data if item['nome_produto'] == 'Produto Sem Imagem'), None)
        self.assertIsNotNone(product_data)
        self.assertIn(settings.MEDIA_URL + 'ia.png', product_data['url_imagem'])


class PasswordRecoveryTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.recover_password_url = reverse('recuperar_senha')
        self.reset_password_url_name = 'redefinir_senha' # Name for reverse lookup

        self.user = Usuario.objects.create_user(
            email='testuser@example.com',
            password='oldpassword123',
            tipo_usuario='Cliente',
            is_active=True,
            email_verificado=True
        )

    def test_recover_password_sends_email_for_existing_user(self):
        """
        Ensure that a password recovery email is sent for an existing user.
        """
        mail.outbox = [] # Clear outbox before test
        data = {'email': self.user.email}
        response = self.client.post(self.recover_password_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('status', response.data)
        self.assertEqual(response.data['status'], 'ok')
        
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('Redefinição de Senha - Caça Preço', mail.outbox[0].subject)
        
        self.user.refresh_from_db()
        self.assertIsNotNone(self.user.token_redefinir_senha)
        self.assertIsNotNone(self.user.token_redefinir_senha_expiracao)

    def test_recover_password_does_not_reveal_non_existing_user(self):
        """
        Ensure that the password recovery endpoint does not reveal if a user exists or not.
        """
        mail.outbox = [] # Clear outbox before test
        data = {'email': 'nonexistent@example.com'}
        response = self.client.post(self.recover_password_url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('status', response.data)
        self.assertEqual(response.data['status'], 'ok')
        
        self.assertEqual(len(mail.outbox), 0) # No email should be sent

    def test_reset_password_with_valid_token(self):
        """
        Ensure a user can reset their password with a valid token.
        """
        # First, trigger password recovery to get a token
        self.client.post(self.recover_password_url, {'email': self.user.email}, format='json')
        self.user.refresh_from_db()
        token = self.user.token_redefinir_senha

        # Now, reset the password
        reset_url = reverse(self.reset_password_url_name, kwargs={'token': token})
        data = {'password': 'newpassword123'}
        response = self.client.post(reset_url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('status', response.data)
        self.assertEqual(response.data['status'], 'Senha redefinida com sucesso.')

        # Verify the password was changed
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('newpassword123'))
        self.assertIsNone(self.user.token_redefinir_senha)
        self.assertIsNone(self.user.token_redefinir_senha_expiracao)

    def test_reset_password_with_invalid_token(self):
        """
        Ensure an error is returned for an invalid password reset token.
        """
        import uuid
        invalid_token = uuid.uuid4()
        reset_url = reverse(self.reset_password_url_name, kwargs={'token': invalid_token})
        data = {'password': 'newpassword123'}
        response = self.client.post(reset_url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)
        self.assertEqual(response.data['error'], 'Token inválido.')

class EmailVerificationTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.resend_verification_url = reverse('reenviar_verificacao')
        self.unverified_user = Usuario.objects.create_user(
            email='unverified@example.com',
            password='password123',
            tipo_usuario='Cliente',
            is_active=False,
            email_verificado=False
        )
        self.verified_user = Usuario.objects.create_user(
            email='verified@example.com',
            password='password123',
            tipo_usuario='Cliente',
            is_active=True,
            email_verificado=True
        )

    def test_resend_verification_email(self):
        """
        Ensure a new verification email is sent for an unverified user.
        """
        mail.outbox = []
        data = {'email': self.unverified_user.email}
        response = self.client.post(self.resend_verification_url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('Reenvio de Confirmação de E-mail', mail.outbox[0].subject)

    def test_resend_verification_for_verified_user(self):
        """
        Ensure an error is returned for a user who is already verified.
        """
        data = {'email': self.verified_user.email}
        response = self.client.post(self.resend_verification_url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('message', response.data)

    def test_resend_verification_missing_email(self):
        """
        Ensure an error is returned if the email field is missing.
        """
        response = self.client.post(self.resend_verification_url, {}, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

class ObterPerfilViewTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.profile_url = reverse('obter_perfil')
        self.user_no_profile = Usuario.objects.create_user(
            email='noprofile@example.com',
            password='password123',
            tipo_usuario='Cliente',
            is_active=True,
            email_verificado=True
        )
        self.user_other_type = Usuario.objects.create_user(
            email='other@example.com',
            password='password123',
            tipo_usuario='Administrador',
            is_active=True,
            email_verificado=True
        )
        self.client_user = Usuario.objects.create_user(
            email='client@example.com',
            password='clientpassword123',
            tipo_usuario='Cliente',
            is_active=True,
            email_verificado=True
        )
        self.endereco = Endereco.objects.create(
            logradouro='Rua Teste', numero='123', cidade='Cidade Teste', estado='SP', cep='12345-678'
        )
        self.cliente_profile = Cliente.objects.create(
            usuario=self.client_user,
            nome='Cliente Teste',
            telefone='11987654321',
            endereco=self.endereco,
            cpf='12345678901',
            data_nascimento='2000-01-01'
        )

    def test_get_profile_no_profile(self):
        self.client.force_authenticate(user=self.user_no_profile)
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_get_profile_other_user_type(self):
        self.client.force_authenticate(user=self.user_other_type)
        response = self.client.get(self.profile_url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_profile(self):
        self.client.force_authenticate(user=self.client_user)
        data = {'nome': 'Cliente Teste Atualizado'}
        response = self.client.patch(self.profile_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.cliente_profile.refresh_from_db()
        self.assertEqual(self.cliente_profile.nome, 'Cliente Teste Atualizado')

    def test_update_profile_no_profile(self):
        self.client.force_authenticate(user=self.user_no_profile)
        data = {'nome': 'Nome Inexistente'}
        response = self.client.patch(self.profile_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

class ClienteSerializerTests(APITestCase):
    email_counter = itertools.count(1) # Class-level counter for unique emails

    def setUp(self):
        # Create a new user for each test case that needs one
        self.user = Usuario.objects.create_user(
            email=f'test_user_{next(self.email_counter)}@example.com', # Unique email for each test
            password='password123',
            tipo_usuario='Cliente',
            is_active=True,
            email_verificado=True
        )
        self.client_profile = Cliente.objects.create(
            usuario=self.user,
            nome='Test Client',
            cpf='12345678901'
        )
        self.endereco_data = {
            'logradouro': 'Rua Teste',
            'numero': '123',
            'cidade': 'Cidade Teste',
            'estado': 'SP',
            'cep': '12345-678'
        }
        # Create a mock request object for serializer context
        class MockRequest:
            def __init__(self, user):
                self.user = user
        self.mock_request = MockRequest(self.user)

    def tearDown(self):
        # Clean up created objects to ensure isolation between tests
        self.client_profile.delete()
        self.user.delete()
        # Delete any addresses created during tests
        Endereco.objects.all().delete()

    def test_create_cliente_with_address(self):
        new_user = Usuario.objects.create_user(
            email=f'new_client_with_address_{next(self.email_counter)}@example.com',
            password='password123',
            tipo_usuario='Cliente',
            is_active=True,
            email_verificado=True
        )
        # Set the mock request user to the new_user
        self.mock_request.user = new_user
        data = {
            # 'usuario': new_user.id, # Remove this, as serializer takes user from context
            'nome': 'New Client With Address',
            'cpf': '98765432109',
            'endereco': self.endereco_data
        }
        serializer = ClienteSerializer(data=data, context={'request': self.mock_request})
        self.assertTrue(serializer.is_valid(raise_exception=True))
        cliente = serializer.save()
        self.assertIsNotNone(cliente.endereco)
        self.assertEqual(cliente.endereco.logradouro, 'Rua Teste')

    def test_create_cliente_without_address(self):
        new_user = Usuario.objects.create_user(
            email=f'new_client_without_address_{next(self.email_counter)}@example.com',
            password='password123',
            tipo_usuario='Cliente',
            is_active=True,
            email_verificado=True
        )
        # Set the mock request user to the new_user
        self.mock_request.user = new_user
        data = {
            # 'usuario': new_user.id, # Remove this, as serializer takes user from context
            'nome': 'New Client Without Address',
            'cpf': '11223344556'
        }
        serializer = ClienteSerializer(data=data, context={'request': self.mock_request})
        self.assertTrue(serializer.is_valid(raise_exception=True))
        cliente = serializer.save()
        self.assertIsNone(cliente.endereco)

    def test_update_cliente_name_only(self):
        data = {'nome': 'Updated Client Name'}
        serializer = ClienteSerializer(instance=self.client_profile, data=data, partial=True, context={'request': self.mock_request})
        self.assertTrue(serializer.is_valid(raise_exception=True))
        cliente = serializer.save()
        self.assertEqual(cliente.nome, 'Updated Client Name')
        self.assertIsNone(cliente.endereco) # Should remain None if not provided

    def test_update_cliente_add_address(self):
        data = {'endereco': self.endereco_data}
        serializer = ClienteSerializer(instance=self.client_profile, data=data, partial=True, context={'request': self.mock_request})
        self.assertTrue(serializer.is_valid(raise_exception=True))
        cliente = serializer.save()
        self.assertIsNotNone(cliente.endereco)
        self.assertEqual(cliente.endereco.logradouro, 'Rua Teste')

    def test_update_cliente_update_existing_address(self):
        # First, add an address to the client
        existing_address = Endereco.objects.create(**self.endereco_data)
        self.client_profile.endereco = existing_address
        self.client_profile.save()

        updated_address_data = {
            'logradouro': 'Rua Atualizada',
            'numero': '456',
            'cidade': 'Cidade Atualizada',
            'estado': 'RJ',
            'cep': '98765-432'
        }
        data = {'endereco': updated_address_data}
        serializer = ClienteSerializer(instance=self.client_profile, data=data, partial=True, context={'request': self.mock_request})
        self.assertTrue(serializer.is_valid(raise_exception=True))
        cliente = serializer.save()
        self.assertEqual(cliente.endereco.logradouro, 'Rua Atualizada')
        self.assertEqual(cliente.endereco.numero, '456')

    def test_update_cliente_remove_address(self):
        # First, add an address to the client
        existing_address = Endereco.objects.create(**self.endereco_data)
        self.client_profile.endereco = existing_address
        self.client_profile.save()

        data = {'endereco': None} # Explicitly set address to None to remove it
        serializer = ClienteSerializer(instance=self.client_profile, data=data, partial=True, context={'request': self.mock_request})
        self.assertTrue(serializer.is_valid(raise_exception=True))
        cliente = serializer.save()
        cliente.refresh_from_db() # Refresh the client object to get the latest state
        self.assertIsNone(cliente.endereco)
        # Ensure the address object is actually deleted from the database
        with self.assertRaises(Endereco.DoesNotExist):
            Endereco.objects.get(pk=existing_address.pk) # Try to retrieve by PK

class VendedorSerializerTests(APITestCase):
    email_counter = itertools.count(1)

    def setUp(self):
        self.user = Usuario.objects.create_user(
            email=f'test_vendor_{next(self.email_counter)}@example.com',
            password='password123',
            tipo_usuario='Vendedor',
            is_active=True,
            email_verificado=True
        )
        self.categoria = CategoriaLoja.objects.create(nome='Eletrônicos')
        self.vendor_profile = Vendedor.objects.create(
            usuario=self.user,
            nome_loja='Test Store',
            cnpj='11223344556677',
            categoria_loja=self.categoria
        )
        self.endereco_data = {
            'logradouro': 'Rua Vendedor',
            'numero': '456',
            'cidade': 'Cidade Vendedor',
            'estado': 'RJ',
            'cep': '98765-432'
        }
        class MockRequest:
            def __init__(self, user):
                self.user = user
        self.mock_request = MockRequest(self.user)

    def tearDown(self):
        self.vendor_profile.delete()
        self.user.delete()
        Endereco.objects.all().delete()
        CategoriaLoja.objects.all().delete() # Clean up categories created in tests

    def test_create_vendedor_with_address(self):
        new_user = Usuario.objects.create_user(
            email=f'new_vendor_with_address_{next(self.email_counter)}@example.com',
            password='password123',
            tipo_usuario='Vendedor',
            is_active=True,
            email_verificado=True
        )
        self.mock_request.user = new_user
        data = {
            'usuario': new_user.id,
            'nome_loja': 'New Store With Address',
            'cnpj': '99887766554433',
            'categoria_loja': self.categoria.id,
            'endereco': self.endereco_data
        }
        serializer = VendedorSerializer(data=data, context={'request': self.mock_request})
        self.assertTrue(serializer.is_valid(raise_exception=True))
        vendedor = serializer.save()
        self.assertIsNotNone(vendedor.endereco)
        self.assertEqual(vendedor.endereco.logradouro, 'Rua Vendedor')

    def test_create_vendedor_without_address(self):
        new_user = Usuario.objects.create_user(
            email=f'new_vendor_without_address_{next(self.email_counter)}@example.com',
            password='password123',
            tipo_usuario='Vendedor',
            is_active=True,
            email_verificado=True
        )
        self.mock_request.user = new_user
        data = {
            'usuario': new_user.id,
            'nome_loja': 'New Store Without Address',
            'cnpj': '11122233344455',
            'categoria_loja': self.categoria.id
        }
        serializer = VendedorSerializer(data=data, context={'request': self.mock_request})
        self.assertTrue(serializer.is_valid(raise_exception=True))
        vendedor = serializer.save()
        self.assertIsNone(vendedor.endereco)

    def test_update_vendedor_name_only(self):
        data = {'nome_loja': 'Updated Store Name'}
        serializer = VendedorSerializer(instance=self.vendor_profile, data=data, partial=True, context={'request': self.mock_request})
        self.assertTrue(serializer.is_valid(raise_exception=True))
        vendedor = serializer.save()
        self.assertEqual(vendedor.nome_loja, 'Updated Store Name')
        self.assertIsNone(vendedor.endereco) # Should remain None if not provided

    def test_update_vendedor_add_address(self):
        data = {'endereco': self.endereco_data}
        serializer = VendedorSerializer(instance=self.vendor_profile, data=data, partial=True, context={'request': self.mock_request})
        self.assertTrue(serializer.is_valid(raise_exception=True))
        vendedor = serializer.save()
        self.assertIsNotNone(vendedor.endereco)
        self.assertEqual(vendedor.endereco.logradouro, 'Rua Vendedor')

    def test_update_vendedor_update_existing_address(self):
        # First, add an address to the vendor
        existing_address = Endereco.objects.create(**self.endereco_data)
        self.vendor_profile.endereco = existing_address
        self.vendor_profile.save()

        updated_address_data = {
            'logradouro': 'Rua Atualizada Vendedor',
            'numero': '789',
            'cidade': 'Cidade Atualizada Vendedor',
            'estado': 'MG',
            'cep': '54321-987'
        }
        data = {'endereco': updated_address_data}
        serializer = VendedorSerializer(instance=self.vendor_profile, data=data, partial=True, context={'request': self.mock_request})
        self.assertTrue(serializer.is_valid(raise_exception=True))
        vendedor = serializer.save()
        self.assertEqual(vendedor.endereco.logradouro, 'Rua Atualizada Vendedor')
        self.assertEqual(vendedor.endereco.numero, '789')

    def test_update_vendedor_remove_address(self):
        # First, add an address to the vendor
        existing_address = Endereco.objects.create(**self.endereco_data)
        self.vendor_profile.endereco = existing_address
        self.vendor_profile.save()

        data = {'endereco': None} # Explicitly set address to None to remove it
        serializer = VendedorSerializer(instance=self.vendor_profile, data=data, partial=True, context={'request': self.mock_request})
        self.assertTrue(serializer.is_valid(raise_exception=True))
        vendedor = serializer.save()
        vendedor.refresh_from_db() # Refresh the vendor object to get the latest state
        self.assertIsNone(vendedor.endereco)
        # Ensure the address object is actually deleted from the database
        with self.assertRaises(Endereco.DoesNotExist):
            Endereco.objects.get(pk=existing_address.pk) # Try to retrieve by PK

class VendedorSerializerTests(APITestCase):
    email_counter = itertools.count(1)

    def setUp(self):
        self.user = Usuario.objects.create_user(
            email=f'test_vendor_{next(self.email_counter)}@example.com',
            password='password123',
            tipo_usuario='Vendedor',
            is_active=True,
            email_verificado=True
        )
        self.categoria = CategoriaLoja.objects.create(nome='Eletrônicos')
        self.vendor_profile = Vendedor.objects.create(
            usuario=self.user,
            nome_loja='Test Store',
            cnpj='11223344556677',
            categoria_loja=self.categoria
        )
        self.endereco_data = {
            'logradouro': 'Rua Vendedor',
            'numero': '456',
            'cidade': 'Cidade Vendedor',
            'estado': 'RJ',
            'cep': '98765-432'
        }
        class MockRequest:
            def __init__(self, user):
                self.user = user
        self.mock_request = MockRequest(self.user)

    def tearDown(self):
        Vendedor.objects.all().delete() # Delete all vendors first
        Usuario.objects.all().delete() # Then all users
        Endereco.objects.all().delete() # Then all addresses
        CategoriaLoja.objects.all().delete() # Finally, all categories

    def test_create_vendedor_with_address(self):
        new_user = Usuario.objects.create_user(
            email=f'new_vendor_with_address_{next(self.email_counter)}@example.com',
            password='password123',
            tipo_usuario='Vendedor',
            is_active=True,
            email_verificado=True
        )
        self.mock_request.user = new_user
        data = {
            'usuario': new_user.id,
            'nome_loja': 'New Store With Address',
            'cnpj': '99887766554433',
            'categoria_loja': self.categoria.id,
            'endereco': self.endereco_data
        }
        serializer = VendedorSerializer(data=data, context={'request': self.mock_request})
        self.assertTrue(serializer.is_valid(raise_exception=True))
        vendedor = serializer.save()
        self.assertIsNotNone(vendedor.endereco)
        self.assertEqual(vendedor.endereco.logradouro, 'Rua Vendedor')

    def test_create_vendedor_without_address(self):
        new_user = Usuario.objects.create_user(
            email=f'new_vendor_without_address_{next(self.email_counter)}@example.com',
            password='password123',
            tipo_usuario='Vendedor',
            is_active=True,
            email_verificado=True
        )
        self.mock_request.user = new_user
        data = {
            'usuario': new_user.id,
            'nome_loja': 'New Store Without Address',
            'cnpj': '11122233344455',
            'categoria_loja': self.categoria.id
        }
        serializer = VendedorSerializer(data=data, context={'request': self.mock_request})
        self.assertTrue(serializer.is_valid(raise_exception=True))
        vendedor = serializer.save()
        self.assertIsNone(vendedor.endereco)

    def test_update_vendedor_name_only(self):
        data = {'nome_loja': 'Updated Store Name'}
        serializer = VendedorSerializer(instance=self.vendor_profile, data=data, partial=True, context={'request': self.mock_request})
        self.assertTrue(serializer.is_valid(raise_exception=True))
        vendedor = serializer.save()
        self.assertEqual(vendedor.nome_loja, 'Updated Store Name')
        self.assertIsNone(vendedor.endereco) # Should remain None if not provided

    def test_update_vendedor_add_address(self):
        data = {'endereco': self.endereco_data}
        serializer = VendedorSerializer(instance=self.vendor_profile, data=data, partial=True, context={'request': self.mock_request})
        self.assertTrue(serializer.is_valid(raise_exception=True))
        vendedor = serializer.save()
        self.assertIsNotNone(vendedor.endereco)
        self.assertEqual(vendedor.endereco.logradouro, 'Rua Vendedor')

    def test_update_vendedor_update_existing_address(self):
        # First, add an address to the vendor
        existing_address = Endereco.objects.create(**self.endereco_data)
        self.vendor_profile.endereco = existing_address
        self.vendor_profile.save()

        updated_address_data = {
            'logradouro': 'Rua Atualizada Vendedor',
            'numero': '789',
            'cidade': 'Cidade Atualizada Vendedor',
            'estado': 'MG',
            'cep': '54321-987'
        }
        data = {'endereco': updated_address_data}
        serializer = VendedorSerializer(instance=self.vendor_profile, data=data, partial=True, context={'request': self.mock_request})
        self.assertTrue(serializer.is_valid(raise_exception=True))
        vendedor = serializer.save()
        self.assertEqual(vendedor.endereco.logradouro, 'Rua Atualizada Vendedor')
        self.assertEqual(vendedor.endereco.numero, '789')

    def test_update_vendedor_remove_address(self):
        # First, add an address to the vendor
        existing_address = Endereco.objects.create(**self.endereco_data)
        self.vendor_profile.endereco = existing_address
        self.vendor_profile.save()

        data = {'endereco': None} # Explicitly set address to None to remove it
        serializer = VendedorSerializer(instance=self.vendor_profile, data=data, partial=True, context={'request': self.mock_request})
        self.assertTrue(serializer.is_valid(raise_exception=True))
        vendedor = serializer.save()
        vendedor.refresh_from_db() # Refresh the vendor object to get the latest state
        self.assertIsNone(vendedor.endereco)
        # Ensure the address object is actually deleted from the database
        with self.assertRaises(Endereco.DoesNotExist):
            Endereco.objects.get(pk=existing_address.pk) # Try to retrieve by PK

class VariacaoCreateViewTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.vendor_user = Usuario.objects.create_user(
            email='vendor@example.com',
            password='vendorpassword123',
            tipo_usuario='Vendedor',
            is_active=True,
            email_verificado=True
        )
        self.client.force_authenticate(user=self.vendor_user)
        self.categoria = CategoriaLoja.objects.create(nome='Eletrônicos')
        self.subcategoria = SubcategoriaProduto.objects.create(nome='Smartphones', categoria_loja=self.categoria)
        self.produto = Produto.objects.create(
            nome='Produto Teste', descricao='Desc', subcategoria=self.subcategoria
        )
        self.create_variation_url = reverse('criar_variacao')

    def test_create_variacao(self):
        import json
        data = {
            'produto': self.produto.id,
            'variacoes': json.dumps([
                {'nome': 'Cor', 'valor': 'Azul'},
                {'nome': 'Tamanho', 'valor': 'M'}
            ])
        }
        response = self.client.post(self.create_variation_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(SKU.objects.count(), 1)
        sku = SKU.objects.first()
        self.assertEqual(sku.produto, self.produto)
        self.assertEqual(sku.valores.count(), 2)

    def test_create_variacao_with_image(self):
        import json
        from django.core.files.uploadedfile import SimpleUploadedFile
        image = SimpleUploadedFile("test_image.jpg", b"file_content", content_type="image/jpeg")
        data = {
            'produto': self.produto.id,
            'variacoes': json.dumps([
                {'nome': 'Cor', 'valor': 'Verde'}
            ]),
            'imagem': image
        }
        response = self.client.post(self.create_variation_url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(SKU.objects.count(), 1)
        self.assertEqual(ImagemSKU.objects.count(), 1)

    def test_create_variacao_existing(self):
        import json
        # Create a variation first
        data = {
            'produto': self.produto.id,
            'variacoes': json.dumps([
                {'nome': 'Cor', 'valor': 'Azul'}
            ])
        }
        self.client.post(self.create_variation_url, data)

        # Try to create the same variation again
        response = self.client.post(self.create_variation_url, data)
        self.assertEqual(response.status_code, status.HTTP_409_CONFLICT)

    def test_create_variacao_missing_data(self):
        response = self.client.post(self.create_variation_url, {})
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_variacao_invalid_json(self):
        data = {
            'produto': self.produto.id,
            'variacoes': 'invalid-json'
        }
        response = self.client.post(self.create_variation_url, data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

class OfertaProdutoViewSetTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.vendor_user = Usuario.objects.create_user(
            email='vendor@example.com',
            password='vendorpassword123',
            tipo_usuario='Vendedor',
            is_active=True,
            email_verificado=True
        )
        self.vendor_profile = Vendedor.objects.create(
            usuario=self.vendor_user,
            nome_loja='Loja Teste',
            cnpj='11223344556677',
            endereco=Endereco.objects.create(logradouro='Rua A', numero='1', cidade='Cidade A', estado='SP', cep='11111-111'),
            telefone='11987654321',
            categoria_loja=CategoriaLoja.objects.create(nome='Eletrônicos'),
            status_aprovacao='aprovado',
            nome_responsavel='Responsavel Teste',
            cpf_responsavel='12345678901',
            breve_descricao_loja='Uma loja de testes',
            site_redes_sociais='http://test.com'
        )
        self.client.force_authenticate(user=self.vendor_user)
        self.categoria = CategoriaLoja.objects.get(nome='Eletrônicos')
        self.subcategoria = SubcategoriaProduto.objects.create(nome='Smartphones', categoria_loja=self.categoria)
        self.produto = Produto.objects.create(
            nome='Produto Teste', descricao='Desc', subcategoria=self.subcategoria
        )
        self.sku = SKU.objects.create(produto=self.produto, codigo_sku='P1-AZUL')
        self.oferta = OfertaProduto.objects.create(
            vendedor=self.vendor_profile, sku=self.sku, preco=99.99, quantidade_disponivel=10
        )

    def test_create_offer_existing(self):
        data = {
            'vendedor': self.vendor_profile.pk,
            'sku_id': self.sku.id,
            'preco': 120.00,
            'quantidade_disponivel': 5
        }
        response = self.client.post(reverse('ofertaproduto-list'), data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.oferta.refresh_from_db()
        self.assertEqual(self.oferta.preco, 120.00)

    def test_update_offer_with_image(self):
        from django.core.files.uploadedfile import SimpleUploadedFile
        image = SimpleUploadedFile("test_image.jpg", b"file_content", content_type="image/jpeg")
        data = {
            'preco': 110.00,
            'imagem': image
        }
        response = self.client.patch(reverse('ofertaproduto-detail', args=[self.oferta.pk]), data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.oferta.refresh_from_db()
        self.assertEqual(self.oferta.preco, 110.00)
        self.assertEqual(ImagemSKU.objects.count(), 1)

    def test_update_offer_with_new_image(self):
        from django.core.files.uploadedfile import SimpleUploadedFile
        image = SimpleUploadedFile("new_test_image.jpg", b"file_content", content_type="image/jpeg")
        data = {
            'preco': 115.00,
            'imagem': image
        }
        response = self.client.patch(reverse('ofertaproduto-detail', args=[self.oferta.pk]), data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.oferta.refresh_from_db()
        self.assertEqual(self.oferta.preco, 115.00)
        self.assertEqual(ImagemSKU.objects.count(), 1)

    def test_update_offer_no_image(self):
        """
        Ensure offer can be updated without providing an image.
        """
        data = {
            'preco': 125.00,
            'quantidade_disponivel': 15
        }
        response = self.client.patch(reverse('ofertaproduto-detail', args=[self.oferta.pk]), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.oferta.refresh_from_db()
        self.assertEqual(self.oferta.preco, 125.00)
        self.assertEqual(self.oferta.quantidade_disponivel, 15)

class SugestaoCreateViewTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = Usuario.objects.create_user(
            email='user@example.com',
            password='password123',
            tipo_usuario='Cliente',
            is_active=True,
            email_verificado=True
        )
        self.client.force_authenticate(user=self.user)
        self.sugestao_url = reverse('criar_sugestao')

    def test_create_sugestao(self):
        data = {
            'texto': 'Esta é uma nova sugestão.'
        }
        response = self.client.post(self.sugestao_url, data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Sugestao.objects.count(), 1)
        sugestao = Sugestao.objects.first()
        self.assertEqual(sugestao.usuario, self.user)
