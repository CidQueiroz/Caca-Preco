from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import (
    Usuario, Cliente, Vendedor, Endereco, CategoriaLoja, SubcategoriaProduto, 
    Produto, Atributo, ValorAtributo, SKU, ImagemSKU, OfertaProduto, Sugestao
)
from django.core.files.uploadedfile import SimpleUploadedFile

User = get_user_model()

class UsuarioManagerTests(TestCase):

    def test_create_user(self):
        """
        Test creating a new regular user is successful.
        """
        email = 'test@example.com'
        password = 'password123'
        user = User.objects.create_user(email=email, password=password)

        self.assertEqual(user.email, email)
        self.assertTrue(user.check_password(password))
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)

    def test_create_user_no_email_raises_error(self):
        """
        Test that creating a user with no email raises a ValueError.
        """
        with self.assertRaises(ValueError):
            User.objects.create_user(email=None, password='password123')

    def test_create_superuser(self):
        """
        Test creating a new superuser is successful.
        """
        email = 'super@example.com'
        password = 'password123'
        admin_user = User.objects.create_superuser(email=email, password=password)

        self.assertEqual(admin_user.email, email)
        self.assertTrue(admin_user.check_password(password))
        self.assertTrue(admin_user.is_staff)
        self.assertTrue(admin_user.is_superuser)
        self.assertTrue(admin_user.is_active)

    def test_create_superuser_not_staff_raises_error(self):
        """
        Test create_superuser raises ValueError if is_staff is not True.
        """
        with self.assertRaises(ValueError):
            User.objects.create_superuser(
                email='super@example.com',
                password='password123',
                is_staff=False
            )

    def test_create_superuser_not_superuser_raises_error(self):
        """
        Test create_superuser raises ValueError if is_superuser is not True.
        """
        with self.assertRaises(ValueError):
            User.objects.create_superuser(
                email='super@example.com',
                password='password123',
                is_superuser=False
            )


class ModelStrRepresentationTests(TestCase):

    def test_usuario_str(self):
        """Test the string representation of the Usuario model."""
        user = User.objects.create_user(
            email='test@example.com',
            password='password123'
        )
        self.assertEqual(str(user), user.email)

    def test_endereco_str(self):
        """Test the string representation of the Endereco model."""
        endereco = Endereco.objects.create(
            logradouro='Rua Teste',
            numero='123',
            cidade='Cidade Teste',
            estado='TS'
        )
        expected_str = 'Rua Teste, 123 - Cidade Teste/TS'
        self.assertEqual(str(endereco), expected_str)

    def test_categoria_loja_str(self):
        """Test the string representation of the CategoriaLoja model."""
        categoria = CategoriaLoja.objects.create(nome='Eletrônicos')
        self.assertEqual(str(categoria), 'Eletrônicos')

    def test_cliente_str(self):
        """Test the string representation of the Cliente model."""
        user = User.objects.create_user(
            email='cliente@example.com',
            password='password123'
        )
        cliente = Cliente.objects.create(
            usuario=user,
            nome='Nome Cliente',
            cpf='123.456.789-00'
        )
        self.assertEqual(str(cliente), 'Nome Cliente')

    def test_vendedor_str(self):
        """Test the string representation of the Vendedor model."""
        user = User.objects.create_user(
            email='vendedor@example.com',
            password='password123',
            tipo_usuario='Vendedor'
        )
        categoria = CategoriaLoja.objects.create(nome='Alimentos')
        vendedor = Vendedor.objects.create(
            usuario=user,
            nome_loja='Loja do Vendedor',
            categoria_loja=categoria
        )
        self.assertEqual(str(vendedor), 'Loja do Vendedor')


class UsuarioModelPropertyTests(TestCase):

    def setUp(self):
        self.user = User.objects.create_user(
            email='test@example.com',
            password='password123'
        )

    def test_perfil_completo_is_false_for_new_user(self):
        """
        Test that perfil_completo is False for a user without a profile.
        """
        self.assertFalse(self.user.perfil_completo)

    def test_perfil_completo_is_true_with_cliente_profile(self):
        """
        Test that perfil_completo is True after a Cliente profile is associated.
        """
        Cliente.objects.create(
            usuario=self.user,
            nome='Nome Cliente',
            cpf='123.456.789-00'
        )
        # We need to refresh the user object from the DB to see the relation
        self.user.refresh_from_db()
        self.assertTrue(self.user.perfil_completo)

    def test_perfil_completo_is_true_with_vendedor_profile(self):
        """
        Test that perfil_completo is True after a Vendedor profile is associated.
        """
        categoria = CategoriaLoja.objects.create(nome='Roupas')
        Vendedor.objects.create(
            usuario=self.user,
            nome_loja='Loja Teste',
            categoria_loja=categoria
        )
        # We need to refresh the user object from the DB to see the relation
        self.user.refresh_from_db()
        self.assertTrue(self.user.perfil_completo)

class MoreModelStrRepresentationTests(TestCase):

    def setUp(self):
        # Common setup for these tests
        self.cat_loja = CategoriaLoja.objects.create(nome='Eletrônicos')
        self.subcat = SubcategoriaProduto.objects.create(nome='Smartphones', categoria_loja=self.cat_loja)
        self.produto = Produto.objects.create(nome='SuperPhone', subcategoria=self.subcat)
        self.atributo = Atributo.objects.create(nome='Cor')
        self.valor_atributo = ValorAtributo.objects.create(atributo=self.atributo, valor='Preto')
        self.sku = SKU.objects.create(produto=self.produto, codigo_sku='SP-PTO-01')
        self.sku.valores.add(self.valor_atributo)
        self.user_vendedor = User.objects.create_user('vendedor@test.com', 'pw123', tipo_usuario='Vendedor')
        self.vendedor = Vendedor.objects.create(usuario=self.user_vendedor, nome_loja='Loja do Vendedor', categoria_loja=self.cat_loja)

    def test_subcategoria_produto_str(self):
        """Test the string representation of the SubcategoriaProduto model."""
        expected_str = 'Eletrônicos > Smartphones'
        self.assertEqual(str(self.subcat), expected_str)

    def test_produto_str(self):
        """Test the string representation of the Produto model."""
        self.assertEqual(str(self.produto), 'SuperPhone')

    def test_atributo_str(self):
        """Test the string representation of the Atributo model."""
        self.assertEqual(str(self.atributo), 'Cor')

    def test_valor_atributo_str(self):
        """Test the string representation of the ValorAtributo model."""
        self.assertEqual(str(self.valor_atributo), 'Cor: Preto')

    def test_sku_str(self):
        """Test the string representation of the SKU model."""
        expected_str = 'SuperPhone (Cor: Preto)'
        self.assertEqual(str(self.sku), expected_str)

    def test_imagem_sku_str(self):
        """Test the string representation of the ImagemSKU model."""
        imagem = ImagemSKU.objects.create(
            sku=self.sku,
            imagem=SimpleUploadedFile(name='test_image.jpg', content=b'', content_type='image/jpeg')
        )
        expected_str = f'Imagem de {self.sku}'
        self.assertEqual(str(imagem), expected_str)

    def test_oferta_produto_str(self):
        """Test the string representation of the OfertaProduto model."""
        oferta = OfertaProduto.objects.create(
            vendedor=self.vendedor,
            sku=self.sku,
            preco=1999.99
        )
        expected_str = f'{self.sku} por Loja do Vendedor - R$1999.99'
        self.assertEqual(str(oferta), expected_str)

    def test_sugestao_str(self):
        """Test the string representation of the Sugestao model."""
        user = User.objects.create_user('sugestao@test.com', 'pw123')
        sugestao = Sugestao.objects.create(usuario=user, texto='Sugestão de teste')
        # We don't check the exact time, just that it's formatted correctly
        self.assertIn(f'Sugestão de {user.email} em', str(sugestao))
