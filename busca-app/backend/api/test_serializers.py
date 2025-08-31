from django.test import TestCase
from django.contrib.auth import get_user_model, authenticate
from .models import Usuario, Cliente, Endereco, CategoriaLoja, Vendedor, SubcategoriaProduto, Produto, Atributo, ValorAtributo, SKU, ImagemSKU, OfertaProduto
from rest_framework.exceptions import ValidationError, AuthenticationFailed
from .serializers import UserSerializer, MyTokenObtainPairSerializer, ClienteSerializer, VendedorSerializer, EnderecoSerializer, MeusProdutosSerializer
from django.test import RequestFactory
from django.core.files.uploadedfile import SimpleUploadedFile
from django.conf import settings
from unittest.mock import Mock

User = get_user_model()

class UserAndTokenSerializerTests(TestCase):

    def setUp(self):
        self.user_data = {'email': 'test@example.com', 'senha': 'password123', 'tipo_usuario': 'Cliente'}
        self.admin_data = {'email': 'admin@example.com', 'senha': 'password123', 'tipo_usuario': 'Administrador'}

    def test_user_serializer_create_user(self):
        """Test UserSerializer creates a user correctly."""
        serializer = UserSerializer(data=self.user_data)
        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        self.assertEqual(user.email, self.user_data['email'])
        self.assertTrue(user.check_password(self.user_data['senha']))
        self.assertFalse(user.is_active) # Default is False

    def test_user_serializer_password_is_write_only(self):
        """Test that the password is not included in the serialized output."""
        serializer = UserSerializer(data=self.user_data)
        self.assertTrue(serializer.is_valid())
        user = serializer.save()
        serialized_data = UserSerializer(instance=user).data
        self.assertNotIn('senha', serialized_data)

    def test_token_serializer_success(self):
        """Test token generation for a verified user with a complete profile."""
        # Create a verified user with a complete profile
        user = User.objects.create_user(email='verified@test.com', password='pw', email_verificado=True, tipo_usuario='Cliente', is_active=True)
        Cliente.objects.create(usuario=user, nome='Test Client', cpf='12345678901')
        
        serializer = MyTokenObtainPairSerializer(data={'email': 'verified@test.com', 'password': 'pw'})
        self.assertTrue(serializer.is_valid())
        data = serializer.validated_data
        self.assertIn('access', data)
        self.assertIn('refresh', data)
        self.assertEqual(data['user']['email'], 'verified@test.com')
        self.assertEqual(data['user']['perfil_completo'], True)

    def test_token_serializer_email_not_verified(self):
        """Test token generation fails if email is not verified."""
        User.objects.create_user(email='unverified@test.com', password='pw', email_verificado=False, is_active=True)
        
        serializer = MyTokenObtainPairSerializer(data={'email': 'unverified@test.com', 'password': 'pw'})
        with self.assertRaises(ValidationError) as context:
            serializer.is_valid(raise_exception=True)
        self.assertEqual(str(context.exception.detail['detail'][0]), 'EMAIL_NAO_VERIFICADO')

    def test_token_serializer_profile_not_complete(self):
        """Test token generation fails if profile is not complete for non-admin."""
        # User is verified but has no Cliente/Vendedor profile
        User.objects.create_user(email='incomplete@test.com', password='pw', email_verificado=True, tipo_usuario='Cliente', is_active=True)
        
        serializer = MyTokenObtainPairSerializer(data={'email': 'incomplete@test.com', 'password': 'pw'})
        with self.assertRaises(ValidationError) as context:
            serializer.is_valid(raise_exception=True)
        self.assertEqual(str(context.exception.detail['detail'][0]), 'PERFIL_INCOMPLETO')

    def test_token_serializer_admin_profile_not_complete(self):
        """Test admin can get a token even with an incomplete profile."""
        User.objects.create_user(email='admin@test.com', password='pw', email_verificado=True, tipo_usuario='Administrador', is_active=True)
        
        serializer = MyTokenObtainPairSerializer(data={'email': 'admin@test.com', 'password': 'pw'})
        self.assertTrue(serializer.is_valid())
        data = serializer.validated_data
        self.assertIn('access', data)
        self.assertEqual(data['user']['email'], 'admin@test.com')
        self.assertEqual(data['user']['perfil_completo'], False) # Admin profile is never "complete"

    def test_token_serializer_invalid_credentials(self):
        """Test token generation fails with invalid credentials."""
        User.objects.create_user(email='user@test.com', password='pw', email_verificado=True, is_active=True)
        
        serializer = MyTokenObtainPairSerializer(data={'email': 'user@test.com', 'password': 'wrongpassword'})
        with self.assertRaises(AuthenticationFailed):
            serializer.is_valid(raise_exception=True)

class DebugAuthenticationTest(TestCase):
    def test_direct_authentication(self):
        user = User.objects.create_user(email='debug@test.com', password='debug_pw', is_active=True)
        authenticated_user = authenticate(username='debug@test.com', password='debug_pw')
        self.assertIsNotNone(authenticated_user)
        self.assertEqual(authenticated_user, user)

class ProfileSerializerTests(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.user_cliente = User.objects.create_user(email='cliente@test.com', password='pw', tipo_usuario='Cliente', is_active=True)
        self.user_vendedor = User.objects.create_user(email='vendedor@test.com', password='pw', tipo_usuario='Vendedor', is_active=True)
        self.categoria_loja = CategoriaLoja.objects.create(nome='Eletronicos')

    # ClienteSerializer Tests
    def test_cliente_serializer_create_with_endereco(self):
        """Test ClienteSerializer creates a Cliente with nested Endereco."""
        data = {
            'nome': 'Novo Cliente',
            'cpf': '111.222.333-44',
            'telefone': '999999999',
            'endereco': {
                'logradouro': 'Rua A',
                'numero': '10',
                'cidade': 'Cidade X',
                'estado': 'SP',
                'cep': '12345-678'
            }
        }
        request = self.factory.post('/')
        request.user = self.user_cliente
        serializer = ClienteSerializer(data=data, context={'request': request})
        self.assertTrue(serializer.is_valid(raise_exception=True))
        cliente = serializer.save()

        self.assertIsNotNone(cliente.endereco)
        self.assertEqual(cliente.endereco.logradouro, 'Rua A')
        self.assertEqual(cliente.usuario, self.user_cliente)
        self.assertEqual(cliente.nome, 'Novo Cliente')

    def test_cliente_serializer_create_without_endereco(self):
        """Test ClienteSerializer creates a Cliente without nested Endereco."""
        data = {
            'nome': 'Cliente Sem Endereco',
            'cpf': '555.666.777-88',
            'telefone': '888888888'
        }
        request = self.factory.post('/')
        request.user = self.user_cliente
        serializer = ClienteSerializer(data=data, context={'request': request})
        self.assertTrue(serializer.is_valid(raise_exception=True))
        cliente = serializer.save()

        self.assertIsNone(cliente.endereco)
        self.assertEqual(cliente.usuario, self.user_cliente)
        self.assertEqual(cliente.nome, 'Cliente Sem Endereco')

    def test_cliente_serializer_update_cliente_data(self):
        """Test ClienteSerializer updates Cliente's own data."""
        cliente = Cliente.objects.create(usuario=self.user_cliente, nome='Cliente Antigo', cpf='111.111.111-11')
        data = {'nome': 'Cliente Atualizado'}
        request = self.factory.put('/')
        request.user = self.user_cliente
        serializer = ClienteSerializer(instance=cliente, data=data, partial=True, context={'request': request})
        self.assertTrue(serializer.is_valid(raise_exception=True))
        updated_cliente = serializer.save()

        self.assertEqual(updated_cliente.nome, 'Cliente Atualizado')
        self.assertEqual(updated_cliente.cpf, '111.111.111-11') # Should remain unchanged

    def test_cliente_serializer_update_endereco_existing(self):
        """Test ClienteSerializer updates an existing nested Endereco."""
        endereco = Endereco.objects.create(logradouro='Rua Velha', cidade='Cidade Antiga', estado='SP', cep='00000-000')
        cliente = Cliente.objects.create(usuario=self.user_cliente, nome='Cliente End', cpf='222.222.222-22', endereco=endereco)
        
        data = {
            'endereco': {
                'logradouro': 'Rua Nova',
                'numero': '10',
                'cidade': 'Cidade Nova',
                'estado': 'RJ',
                'cep': '99999-999'
            }
        }
        request = self.factory.put('/')
        request.user = self.user_cliente
        serializer = ClienteSerializer(instance=cliente, data=data, partial=True, context={'request': request})
        self.assertTrue(serializer.is_valid(raise_exception=True))
        updated_cliente = serializer.save()

        self.assertEqual(updated_cliente.endereco.logradouro, 'Rua Nova')
        self.assertEqual(updated_cliente.endereco.cidade, 'Cidade Nova')
        self.assertEqual(updated_cliente.endereco.estado, 'RJ')

    def test_cliente_serializer_add_endereco_to_none(self):
        """Test ClienteSerializer adds an Endereco to a Cliente without one."""
        cliente = Cliente.objects.create(usuario=self.user_cliente, nome='Cliente Sem End', cpf='333.333.333-33', endereco=None)
        data = {
            'endereco': {
                'logradouro': 'Rua Adicionada',
                'numero': '10',
                'cidade': 'Cidade Adicionada',
                'estado': 'MG',
                'cep': '11111-111'
            }
        }
        request = self.factory.put('/')
        request.user = self.user_cliente
        serializer = ClienteSerializer(instance=cliente, data=data, partial=True, context={'request': request})
        self.assertTrue(serializer.is_valid(raise_exception=True))
        updated_cliente = serializer.save()

        self.assertIsNotNone(updated_cliente.endereco)
        self.assertEqual(updated_cliente.endereco.logradouro, 'Rua Adicionada')

    def test_cliente_serializer_remove_endereco(self):
        """Test ClienteSerializer removes an Endereco by passing null."""
        endereco = Endereco.objects.create(logradouro='Rua a Remover', cidade='Cidade a Remover', estado='RS', cep='22222-222')
        cliente = Cliente.objects.create(usuario=self.user_cliente, nome='Cliente Com End', cpf='444.444.444-44', endereco=endereco)
        
        data = {'endereco': None}
        request = self.factory.put('/')
        request.user = self.user_cliente
        serializer = ClienteSerializer(instance=cliente, data=data, partial=True, context={'request': request})
        self.assertTrue(serializer.is_valid(raise_exception=True))
        updated_cliente = serializer.save()

        self.assertIsNone(updated_cliente.endereco)
        self.assertFalse(Endereco.objects.filter(pk=endereco.pk).exists()) # Ensure it's deleted from DB

    # VendedorSerializer Tests (similar logic)
    def test_vendedor_serializer_create_with_endereco(self):
        """Test VendedorSerializer creates a Vendedor with nested Endereco."""
        data = {
            'nome_loja': 'Nova Loja',
            'cnpj': '11.222.333/0001-44',
            'telefone': '987654321',
            'categoria_loja': self.categoria_loja.pk,
            'endereco': {
                'logradouro': 'Av. B',
                'numero': '20',
                'cidade': 'Cidade Y',
                'estado': 'RJ',
                'cep': '87654-321'
            }
        }
        request = self.factory.post('/')
        request.user = self.user_vendedor
        serializer = VendedorSerializer(data=data, context={'request': request})
        self.assertTrue(serializer.is_valid(raise_exception=True))
        vendedor = serializer.save()

        self.assertIsNotNone(vendedor.endereco)
        self.assertEqual(vendedor.endereco.logradouro, 'Av. B')
        self.assertEqual(vendedor.usuario, self.user_vendedor)
        self.assertEqual(vendedor.nome_loja, 'Nova Loja')

    def test_vendedor_serializer_create_without_endereco(self):
        """Test VendedorSerializer creates a Vendedor without nested Endereco."""
        data = {
            'nome_loja': 'Loja Sem Endereco',
            'cnpj': '55.666.777/0001-88',
            'telefone': '123456789',
            'categoria_loja': self.categoria_loja.pk
        }
        request = self.factory.post('/')
        request.user = self.user_vendedor
        serializer = VendedorSerializer(data=data, context={'request': request})
        self.assertTrue(serializer.is_valid(raise_exception=True))
        vendedor = serializer.save()

        self.assertIsNone(vendedor.endereco)
        self.assertEqual(vendedor.usuario, self.user_vendedor)
        self.assertEqual(vendedor.nome_loja, 'Loja Sem Endereco')

    def test_vendedor_serializer_update_vendedor_data(self):
        """Test VendedorSerializer updates Vendedor's own data."""
        vendedor = Vendedor.objects.create(usuario=self.user_vendedor, nome_loja='Loja Antiga', cnpj='11.111.111/0001-11', categoria_loja=self.categoria_loja)
        data = {'nome_loja': 'Loja Atualizada'}
        request = self.factory.put('/')
        request.user = self.user_vendedor
        serializer = VendedorSerializer(instance=vendedor, data=data, partial=True, context={'request': request})
        self.assertTrue(serializer.is_valid(raise_exception=True))
        updated_vendedor = serializer.save()

        self.assertEqual(updated_vendedor.nome_loja, 'Loja Atualizada')
        self.assertEqual(updated_vendedor.cnpj, '11.111.111/0001-11') # Should remain unchanged

    def test_vendedor_serializer_update_endereco_existing(self):
        """Test VendedorSerializer updates an existing nested Endereco."""
        endereco = Endereco.objects.create(logradouro='Av. Velha', cidade='Cidade Antiga', estado='SP', cep='00000-000')
        vendedor = Vendedor.objects.create(usuario=self.user_vendedor, nome_loja='Loja End', cnpj='22.222.222/0001-22', endereco=endereco, categoria_loja=self.categoria_loja)
        
        data = {
            'endereco': {
                'logradouro': 'Av. Nova',
                'numero': '20',
                'cidade': 'Cidade Nova',
                'estado': 'RJ',
                'cep': '99999-999'
            }
        }
        request = self.factory.put('/')
        request.user = self.user_vendedor
        serializer = VendedorSerializer(instance=vendedor, data=data, partial=True, context={'request': request})
        self.assertTrue(serializer.is_valid(raise_exception=True))
        updated_vendedor = serializer.save()

        self.assertEqual(updated_vendedor.endereco.logradouro, 'Av. Nova')
        self.assertEqual(updated_vendedor.endereco.cidade, 'Cidade Nova')
        self.assertEqual(updated_vendedor.endereco.estado, 'RJ')

    def test_vendedor_serializer_add_endereco_to_none(self):
        """Test VendedorSerializer adds an Endereco to a Vendedor without one."""
        vendedor = Vendedor.objects.create(usuario=self.user_vendedor, nome_loja='Loja Sem End', cnpj='33.333.333/0001-33', endereco=None, categoria_loja=self.categoria_loja)
        data = {
            'endereco': {
                'logradouro': 'Av. Adicionada',
                'numero': '20',
                'cidade': 'Cidade Adicionada',
                'estado': 'MG',
                'cep': '11111-111'
            }
        }
        request = self.factory.put('/')
        request.user = self.user_vendedor
        serializer = VendedorSerializer(instance=vendedor, data=data, partial=True, context={'request': request})
        self.assertTrue(serializer.is_valid(raise_exception=True))
        updated_vendedor = serializer.save()

        self.assertIsNotNone(updated_vendedor.endereco)
        self.assertEqual(updated_vendedor.endereco.logradouro, 'Av. Adicionada')

    def test_vendedor_serializer_remove_endereco(self):
        """Test VendedorSerializer removes an Endereco by passing null."""
        endereco = Endereco.objects.create(logradouro='Av. a Remover', cidade='Cidade a Remover', estado='RS', cep='22222-222')
        vendedor = Vendedor.objects.create(usuario=self.user_vendedor, nome_loja='Loja Com End', cnpj='44.444.444/0001-44', endereco=endereco, categoria_loja=self.categoria_loja)
        
        data = {'endereco': None}
        request = self.factory.put('/')
        request.user = self.user_vendedor
        serializer = VendedorSerializer(instance=vendedor, data=data, partial=True, context={'request': request})
        self.assertTrue(serializer.is_valid(raise_exception=True))
        updated_vendedor = serializer.save()

        self.assertIsNone(updated_vendedor.endereco)
        self.assertFalse(Endereco.objects.filter(pk=endereco.pk).exists()) # Ensure it's deleted from DB

class MeusProdutosSerializerTests(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.user_vendedor = User.objects.create_user('vendedor@test.com', 'pw123', tipo_usuario='Vendedor')
        self.categoria_loja = CategoriaLoja.objects.create(nome='Eletrônicos')
        self.vendedor = Vendedor.objects.create(usuario=self.user_vendedor, nome_loja='Loja do Vendedor', categoria_loja=self.categoria_loja)
        self.subcat = SubcategoriaProduto.objects.create(nome='Smartphones', categoria_loja=self.categoria_loja)
        self.produto = Produto.objects.create(nome='SuperPhone', subcategoria=self.subcat)
        self.atributo = Atributo.objects.create(nome='Cor')
        self.valor_atributo = ValorAtributo.objects.create(atributo=self.atributo, valor='Preto')
        self.sku = SKU.objects.create(produto=self.produto, codigo_sku='SP-PTO-01')
        self.sku.valores.add(self.valor_atributo)
        self.oferta = OfertaProduto.objects.create(vendedor=self.vendedor, sku=self.sku, preco=1999.99)

    def test_get_url_imagem_with_image(self):
        """
        Test get_url_imagem returns the image URL when an image exists.
        """
        # Create an image for the SKU
        imagem = ImagemSKU.objects.create(
            sku=self.sku,
            imagem=SimpleUploadedFile(name='test_image.jpg', content=b'', content_type='image/jpeg')
        )
        
        request = self.factory.get('/')
        serializer = MeusProdutosSerializer(instance=self.oferta, context={'request': request})
        
        self.assertEqual(serializer.data['url_imagem'], request.build_absolute_uri(imagem.imagem.url))

    def test_get_url_imagem_without_image(self):
        """
        Test get_url_imagem returns the default image URL when no image exists.
        """
        request = self.factory.get('/')
        serializer = MeusProdutosSerializer(instance=self.oferta, context={'request': request})
        
        default_image_url = request.build_absolute_uri(settings.MEDIA_URL + 'ia.png')
        self.assertEqual(serializer.data['url_imagem'], default_image_url)