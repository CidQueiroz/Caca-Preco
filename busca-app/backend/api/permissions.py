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
    """
    def has_object_permission(self, request, view, obj):
        # Permissões de leitura são permitidas para qualquer solicitação,
        # então sempre permitiremos solicitações GET, HEAD ou OPTIONS.
        if request.method in SAFE_METHODS:
            return True

        # A permissão de escrita só é concedida ao proprietário do objeto.
        # Verificamos se o objeto tem um atributo 'usuario' ou 'vendedor.usuario'.
        if hasattr(obj, 'usuario'):
            return obj.usuario == request.user
        if hasattr(obj, 'vendedor') and hasattr(obj.vendedor, 'usuario'):
            return obj.vendedor.usuario == request.user
        return False

