from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsAdminUser(BasePermission):
    """
    Permite acesso apenas a usuários administradores.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.tipo_usuario == 'Administrador'

class IsVendedor(BasePermission):
    """
    Permite acesso apenas a usuários vendedores.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.tipo_usuario == 'Vendedor'

class IsCliente(BasePermission):
    """
    Permite acesso apenas a usuários clientes.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.tipo_usuario == 'Cliente'

class IsOwnerOrReadOnly(BasePermission):
    """
    Permissão personalizada para permitir que apenas os proprietários de um objeto o editem.
    Administradores podem editar qualquer objeto.
    """
    def has_object_permission(self, request, view, obj):
        # Admin users can edit anything
        if request.user and request.user.is_authenticated and request.user.tipo_usuario == 'Administrador':
            return True

        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner of the object.
        if hasattr(obj, 'usuario'):
            return obj.usuario == request.user
        if hasattr(obj, 'vendedor') and hasattr(obj.vendedor, 'usuario'):
            return obj.vendedor.usuario == request.user
        return False

