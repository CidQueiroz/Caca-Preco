from django.test import TestCase
from django.contrib.auth import get_user_model
from .models import Usuario, Cliente, Vendedor, CategoriaLoja
from rest_framework.test import APIRequestFactory
from .permissions import IsAdminUser, IsVendedor, IsCliente, IsOwnerOrReadOnly
from django.contrib.auth.models import AnonymousUser

User = get_user_model()

class PermissionsTest(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()

        # Create users of different types
        self.admin_user = User.objects.create_user(email='admin@test.com', password='pw', tipo_usuario='Administrador', is_staff=True, is_superuser=True, is_active=True)
        self.vendedor_user = User.objects.create_user(email='vendedor@test.com', password='pw', tipo_usuario='Vendedor')
        self.cliente_user = User.objects.create_user(email='cliente@test.com', password='pw', tipo_usuario='Cliente')
        self.anonymous_user = AnonymousUser()

        # Create some objects to test ownership
        self.cliente_profile = Cliente.objects.create(usuario=self.cliente_user, nome='Cliente Teste', cpf='111.111.111-11')
        cat_loja = CategoriaLoja.objects.create(nome='Test Category')
        self.vendedor_profile = Vendedor.objects.create(usuario=self.vendedor_user, nome_loja='Loja Teste', categoria_loja=cat_loja)


    def test_is_admin_user_permission(self):
        """Test the IsAdminUser permission."""
        permission = IsAdminUser()
        request = self.factory.get('/')
        view = None

        # Admin user
        request.user = self.admin_user
        self.assertTrue(permission.has_permission(request, view))

        # Non-admin users
        request.user = self.vendedor_user
        self.assertFalse(permission.has_permission(request, view))
        request.user = self.cliente_user
        self.assertFalse(permission.has_permission(request, view))
        
        # Anonymous user
        request.user = self.anonymous_user
        self.assertFalse(permission.has_permission(request, view))

    def test_is_vendedor_permission(self):
        """Test the IsVendedor permission."""
        permission = IsVendedor()
        request = self.factory.get('/')
        view = None

        request.user = self.vendedor_user
        self.assertTrue(permission.has_permission(request, view))

        request.user = self.admin_user
        self.assertFalse(permission.has_permission(request, view))

    def test_is_cliente_permission(self):
        """Test the IsCliente permission."""
        permission = IsCliente()
        request = self.factory.get('/')
        view = None

        request.user = self.cliente_user
        self.assertTrue(permission.has_permission(request, view))

        request.user = self.admin_user
        self.assertFalse(permission.has_permission(request, view))

    def test_is_owner_or_read_only_safe_methods(self):
        """Test IsOwnerOrReadOnly allows safe methods for any user."""
        permission = IsOwnerOrReadOnly()
        view = None
        obj = self.cliente_profile

        # Anonymous user
        request = self.factory.get('/')
        request.user = self.anonymous_user
        self.assertTrue(permission.has_object_permission(request, view, obj))

        # Any authenticated user
        request = self.factory.head('/')
        request.user = self.vendedor_user
        self.assertTrue(permission.has_object_permission(request, view, obj))

    def test_is_owner_or_read_only_owner_can_write(self):
        """Test IsOwnerOrReadOnly allows write methods for owner."""
        permission = IsOwnerOrReadOnly()
        view = None
        
        # Test with an object that has a 'usuario' attribute
        obj_cliente = self.cliente_profile
        request = self.factory.put('/')
        request.user = self.cliente_user
        self.assertTrue(permission.has_object_permission(request, view, obj_cliente))

        # Test with an object that has a 'vendedor.usuario' attribute
        obj_vendedor = self.vendedor_profile
        request = self.factory.patch('/')
        request.user = self.vendedor_user
        self.assertTrue(permission.has_object_permission(request, view, obj_vendedor))

    def test_is_owner_or_read_only_non_owner_cannot_write(self):
        """Test IsOwnerOrReadOnly blocks write methods for non-owners."""
        permission = IsOwnerOrReadOnly()
        view = None
        obj = self.cliente_profile
        
        request = self.factory.post('/')
        request.user = self.vendedor_user # Vendedor is not the owner
        self.assertFalse(permission.has_object_permission(request, view, obj))

    def test_is_owner_or_read_only_admin_can_write(self):
        """Test IsOwnerOrReadOnly allows write methods for admin on any object."""
        permission = IsOwnerOrReadOnly()
        view = None
        obj = self.cliente_profile # Admin is not the owner

        request = self.factory.delete('/')
        request.user = self.admin_user
        self.assertTrue(permission.has_object_permission(request, view, obj))
        
    def test_is_owner_or_read_only_no_user_attr(self):
        """Test IsOwnerOrReadOnly returns False for objects without a user attribute."""
        class DummyObject:
            pass
        obj = DummyObject()
        
        permission = IsOwnerOrReadOnly()
        view = None
        
        request = self.factory.put('/')
        request.user = self.vendedor_user
        self.assertFalse(permission.has_object_permission(request, view, obj))

    def test_is_owner_or_read_only_final_return_case(self):
        """Explicitly test the final return False in IsOwnerOrReadOnly."""
        class FinalDummyObject:
            pass
        obj = FinalDummyObject()
        permission = IsOwnerOrReadOnly()
        request = self.factory.post('/')  # Not a safe method
        request.user = self.cliente_user  # Not an admin
        
        # This should hit the final "return False"
        self.assertFalse(permission.has_object_permission(request, None, obj))

    def test_is_owner_or_read_only_for_oferta_produto(self):
        """Test IsOwnerOrReadOnly for an object with a 'vendedor' attribute."""
        from .models import SubcategoriaProduto, Produto, SKU, OfertaProduto
        permission = IsOwnerOrReadOnly()
        view = None
        
        # Create an OfertaProduto object
        cat_loja = CategoriaLoja.objects.get(nome='Test Category')
        subcat = SubcategoriaProduto.objects.create(nome='Smartphones', categoria_loja=cat_loja)
        produto = Produto.objects.create(nome='SuperPhone', subcategoria=subcat)
        sku = SKU.objects.create(produto=produto)
        oferta = OfertaProduto.objects.create(vendedor=self.vendedor_profile, sku=sku, preco=100)

        # The owner of the oferta is the vendedor
        request = self.factory.put('/')
        request.user = self.vendedor_user
        self.assertTrue(permission.has_object_permission(request, view, oferta))

        # A different vendedor cannot edit the oferta
        other_vendedor_user = User.objects.create_user(email='other@vendedor.com', password='pw', tipo_usuario='Vendedor')
        other_vendedor_profile = Vendedor.objects.create(usuario=other_vendedor_user, nome_loja='Outra Loja', categoria_loja=cat_loja)
        request.user = other_vendedor_user
        self.assertFalse(permission.has_object_permission(request, view, oferta))
