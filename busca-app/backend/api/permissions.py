from rest_framework.permissions import BasePermission, SAFE_METHODS
from .models import Vendedor

class IsAdminUser(BasePermission):
    """
    Permite acesso apenas a usuários administradores.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.tipo_usuario == 'Administrador'

class IsVendedor(BasePermission):
    """
    Permite acesso apenas a usuários vendedores que foram aprovados.
    """
    def has_permission(self, request, view): # type: ignore
        # Verifica as condições básicas do usuário primeiro
        if not (request.user and request.user.is_authenticated and request.user.tipo_usuario == 'Vendedor'):
            return False
        
        # Usa hasattr para verificar de forma segura se o perfil de vendedor existe.
        # Isso é mais robusto e melhor compreendido por analisadores estáticos.
        if hasattr(request.user, 'vendedor'):
            return request.user.vendedor.status_aprovacao == 'Aprovado'
        return False

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
    def has_object_permission(self, request, view, obj): # type: ignore
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

class IsAdminUserOrReadOnly(BasePermission):
    """
    Permite acesso de leitura para qualquer usuário,
    mas escrita apenas para administradores.
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated and request.user.tipo_usuario == 'Administrador'