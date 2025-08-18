from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient
from django.core import mail
from django.conf import settings
from unittest.mock import patch

from .models import (
    Usuario, CategoriaLoja, SubcategoriaProduto, Produto,
    VariacaoProduto, OfertaProduto, Vendedor, AvaliacaoLoja, Cliente, Endereco,
    ProdutosMonitoradosExternos
)

class UserAuthenticationTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.register_url = reverse('registrar')
        self.login_url = reverse('token_obtain_pair')
        self.profile_url = reverse('obter_perfil')

        self.admin_user = Usuario.objects.create_superuser(
            email='admin@example.com',
            email='admin@example.com',
            password='adminpassword123',
            tipo_usuario='Administrador',
            is_active=True,
            email_verificado=True
        )
        self.client_user = Usuario.objects.create_user(
            email='client@example.com',
            email='client@example.com',
            password='clientpassword123',
            tipo_usuario='Cliente',
            is_active=True,
            email_verificado=True
        )
        self.vendor_user = Usuario.objects.create_user(
            email='vendor@example.com',
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

        Cliente.objects.create(
            usuario=self.client_user,
            nome='Cliente Teste',
            telefone='11987654321',
            endereco=self.endereco,
            cpf='12345678901',
            data_nascimento='2000-01-01'
        )
        Vendedor.objects.create(
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
            website_redes_sociais='http://test.com'
        )

    def test_user_registration(self):
        mail.outbox = [] # Clear outbox before test
        data = {
            'email': 'newuser@example.com',
            'password': 'newpassword123',
            'tipo_usuario': 'Cliente' # Corrected case
        }
        response = self.client.post(self.register_url, data, format='json')
        print(response.data) # Debugging 400 error
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        # self.assertIn('message', response.data) # Removed as response now returns user object
        self.assertEqual(Usuario.objects.count(), 4) # Admin, Client, Vendor, New User
        new_user = Usuario.objects.get(email='newuser@example.com')
        self.assertFalse(new_user.is_active)
        self.assertFalse(new_user.email_verificado)
        self.assertIsNotNone(new_user.verification_token)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn('Por favor, confirme seu e-mail', mail.outbox[0].subject)

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

    def test_email_verification(self):
        # Register a user to get a verification token
        mail.outbox = []
        data = {
            'email': 'unverified@example.com',
            'password': 'unverifiedpassword',
            'tipo_usuario': 'Cliente' # Corrected case
        }
        self.client.post(self.register_url, data, format='json')
        unverified_user = Usuario.objects.get(email='unverified@example.com')
        
        print(f"User active: {unverified_user.is_active}") # Debugging
        print(f"Verification token: {unverified_user.token_verificacao}") # Debugging

        verification_url = reverse('email_verify', kwargs={'token': unverified_user.token_verificacao})
        
        response = self.client.get(verification_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
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
            email='admin@example.com',
            password='adminpassword123',
            tipo_usuario='Administrador',
            is_active=True,
            email_verificado=True
        )
        self.client_user = Usuario.objects.create_user(
            email='client@example.com',
            email='client@example.com',
            password='clientpassword123',
            tipo_usuario='Cliente',
            is_active=True,
            email_verificado=True
        )
        self.vendor_user = Usuario.objects.create_user(
            email='vendor@example.com',
            email='vendor@example.com',
            password='vendorpassword123',
            tipo_usuario='Vendedor',
            is_active=True,
            email_verificado=True
        )
        self.other_vendor_user = Usuario.objects.create_user(
            email='other_vendor@example.com',
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
            website_redes_sociais='http://test.com'
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
            website_redes_sociais='http://other.com'
        )

        self.produto = Produto.objects.create(
            nome='Produto Teste', descricao='Desc', subcategoria=self.subcategoria
        )
        self.variacao = VariacaoProduto.objects.create(
            produto=self.produto, nome='Cor Azul', valor=100.00
        )
        self.oferta = OfertaProduto.objects.create(
            vendedor=self.vendor_profile, variacao=self.variacao, preco=99.99, quantidade_disponivel=10
        )

    def test_admin_can_create_category(self):
        self.client.force_authenticate(user=self.admin_user)
        data = {'nome': 'Nova Categoria', 'descricao': 'Desc'}
        response = self.client.post(reverse('categoria-loja-list'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_client_cannot_create_category(self):
        self.client.force_authenticate(user=self.client_user)
        data = {'nome': 'Nova Categoria', 'descricao': 'Desc'}
        response = self.client.post(reverse('categoria-loja-list'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_vendor_can_create_offer(self):
        self.client.force_authenticate(user=self.vendor_user)
        # Create a new product and variation to avoid unique constraint violation
        new_product = Produto.objects.create(
            nome='Novo Produto para Oferta', descricao='Desc', subcategoria=self.subcategoria
        )
        new_variacao = VariacaoProduto.objects.create(
            produto=new_product, nome='Tamanho G', valor=200.00
        )
        data = {
            'vendedor': self.vendor_profile.pk,
            'variacao': new_variacao.id,
            'preco': 120.00,
            'quantidade_disponivel': 5
        }
        response = self.client.post(reverse('oferta-produto-list'), data, format='json')
        print(response.data) # Debugging 400 error
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_client_cannot_create_offer(self):
        self.client.force_authenticate(user=self.client_user)
        data = {
            'vendedor': self.vendor_profile.pk,
            'variacao': self.variacao.id,
            'preco': 120.00,
            'quantidade_disponivel': 5
        }
        response = self.client.post(reverse('oferta-produto-list'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_vendor_can_update_own_offer(self):
        self.client.force_authenticate(user=self.vendor_user)
        data = {
            'vendedor': self.vendor_profile.pk,
            'variacao': self.variacao.id,
            'preco': 105.00,
            'quantidade_disponivel': 8
        }
        response = self.client.put(reverse('oferta-produto-detail', args=[self.oferta.pk]), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.oferta.refresh_from_db()
        self.assertEqual(self.oferta.preco, 105.00)

    def test_other_vendor_cannot_update_offer(self):
        self.client.force_authenticate(user=self.other_vendor_user)
        data = {
            'vendedor': self.vendor_profile.pk,
            'variacao': self.variacao.id,
            'preco': 105.00,
            'quantidade_disponivel': 8
        }
        response = self.client.put(reverse('oferta-produto-detail', args=[self.oferta.pk]), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_client_can_update_own_profile(self):
        self.client.force_authenticate(user=self.client_user)
        data = {
            'usuario': self.client_user.id,
            'nome': 'Cliente Atualizado',
            'telefone': '11999999999',
            'endereco': self.endereco.id,
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
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

class CRUDTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin_user = Usuario.objects.create_superuser(
            email='admin@example.com',
            email='admin@example.com',
            password='adminpassword123',
            tipo_usuario='Administrador',
            is_active=True,
            email_verificado=True
        )
        self.vendor_user = Usuario.objects.create_user(
            email='vendor@example.com',
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
            website_redes_sociais='http://test.com'
        )
        self.client.force_authenticate(user=self.admin_user)
        self.categoria = CategoriaLoja.objects.get(nome='Eletrônicos') # Use existing category
        self.subcategoria = SubcategoriaProduto.objects.create(nome='Smartphones', categoria_loja=self.categoria)

    def test_create_categoria_loja(self):
        data = {'nome': 'Moda', 'descricao': 'Roupas e acessórios'}
        response = self.client.post(reverse('categoria-loja-list'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(CategoriaLoja.objects.count(), 2) # Eletrônicos + Moda

    def test_list_categoria_loja(self):
        response = self.client.get(reverse('categoria-loja-list'))
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
        variacao = VariacaoProduto.objects.create(
            produto=produto, nome='50 polegadas', valor=2000.00
        )
        data = {
            'vendedor': self.vendor_profile.pk,
            'variacao': variacao.id,
            'preco': 1999.99,
            'quantidade_disponivel': 5
        }
        self.client.force_authenticate(user=self.vendor_user) # Vendor can create offers
        response = self.client.post(reverse('oferta-produto-list'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(OfertaProduto.objects.count(), 1)

class BusinessLogicTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.vendor_user = Usuario.objects.create_user(
            email='vendor@example.com',
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
            website_redes_sociais='http://test.com'
        )
        self.client.force_authenticate(user=self.vendor_user)

    def test_dashboard_vendedor_view(self):
        # Create some monitored products for the vendor
        ProdutosMonitoradosExternos.objects.create(
            vendedor=self.vendor_profile,
            url_produto='http://example.com/product1',
            nome_produto='Produto Monitorado 1',
            preco_atual=100.00,
            ultima_coleta='2023-01-01'
        )
        ProdutosMonitoradosExternos.objects.create(
            vendedor=self.vendor_profile,
            url_produto='http://example.com/product2',
            nome_produto='Produto Monitorado 2',
            preco_atual=150.00,
            ultima_coleta='2023-01-02'
        )
        
        # Create some ratings for the vendor
        client_user_1 = Usuario.objects.create_user(
            email='client2@example.com',
            email='client2@example.com',
            password='clientpassword123',
            tipo_usuario='Cliente',
            is_active=True,
            email_verificado=True
        )
        cliente_profile_1 = Cliente.objects.create(
            usuario=client_user_1,
            nome='Cliente Teste 2',
            telefone='11987654322',
            endereco=self.endereco,
            cpf='12345678902',
            data_nascimento='2000-01-02'
        )
        client_user_2 = Usuario.objects.create_user(
            email='client3@example.com',
            email='client3@example.com',
            password='clientpassword123',
            tipo_usuario='Cliente',
            is_active=True,
            email_verificado=True
        )
        cliente_profile_2 = Cliente.objects.create(
            usuario=client_user_2,
            nome='Cliente Teste 3',
            telefone='11987654323',
            endereco=self.endereco,
            cpf='12345678903',
            data_nascimento='2000-01-03'
        )

        AvaliacaoLoja.objects.create(
            cliente=cliente_profile_1, vendedor=self.vendor_profile, nota=5, comentario='Ótimo!'
        )
        AvaliacaoLoja.objects.create(
            cliente=cliente_profile_2, vendedor=self.vendor_profile, nota=4, comentario='Bom.'
        )

        response = self.client.get(reverse('dashboard_vendedor'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('analise_e_estatisticas', response.data)
        self.assertIn('feedback', response.data)
        self.assertEqual(response.data['analise_e_estatisticas']['total_produtos_monitorados'], 2)
        self.assertEqual(response.data['feedback']['total_avaliacoes'], 2)
        self.assertEqual(response.data['feedback']['media_geral_avaliacoes'], 4.5) # (5+4)/2

    def test_produtos_monitorados_externos_create(self):
        data = {
            'url_produto': 'http://newproduct.com/item',
        }
        response = self.client.post(reverse('monitoramento-list'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(ProdutosMonitoradosExternos.objects.count(), 1)
        self.assertEqual(ProdutosMonitoradosExternos.objects.get().vendedor, self.vendor_profile)
        self.assertIn('Produto Fictício da URL', ProdutosMonitoradosExternos.objects.get().nome_produto)

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
            website_redes_sociais='http://other.com'
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