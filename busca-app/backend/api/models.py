from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid

# --- GERENCIADOR DE USUÁRIO SIMPLIFICADO ---

class UsuarioManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        """
        Cria e salva um usuário com o email e senha fornecidos.
        """
        if not email:
            raise ValueError("O email deve ser definido")
        email = self.normalize_email(email)
        # Ensure password is not passed to the model constructor
        # It's already handled by set_password later
        
        # Create a copy of extra_fields to safely modify it
        model_extra_fields = extra_fields.copy() 
        
        # If 'password' is somehow in extra_fields, remove it
        # (though it shouldn't be if passed as a named argument)
        # This is a defensive check.
        if 'password' in model_extra_fields:
            del model_extra_fields['password']

        user = self.model(email=email, **model_extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_active", True)
        extra_fields.setdefault("tipo_usuario", "Administrador")

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")
        return self.create_user(email, password, **extra_fields)

class Usuario(AbstractBaseUser, PermissionsMixin):
    TIPO_USUARIO_CHOICES = (
        ('Cliente', 'Cliente'),
        ('Vendedor', 'Vendedor'),
        ('Administrador', 'Administrador'),
    )
    
    email = models.EmailField(unique=True)
    tipo_usuario = models.CharField(max_length=15, choices=TIPO_USUARIO_CHOICES, default='Cliente')
    
    # Campos requeridos pelo Django Admin
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=False)
    date_joined = models.DateTimeField(auto_now_add=True)

    # Campos para verificação de email e reset de senha
    email_verificado = models.BooleanField(default=False)
    token_verificacao = models.UUIDField(null=True, blank=True)
    token_verificacao_expiracao = models.DateTimeField(null=True, blank=True)
    token_redefinir_senha = models.UUIDField(null=True, blank=True)
    token_redefinir_senha_expiracao = models.DateTimeField(null=True, blank=True)

    # Define o manager customizado
    objects = UsuarioManager()

    # Define o campo de login
    USERNAME_FIELD = 'email'
    # Campos requeridos para o comando createsuperuser (além de email e senha)
    REQUIRED_FIELDS = []

    def __str__(self):
        return self.email

    @property
    def perfil_completo(self):
        try:
            if self.tipo_usuario == 'Cliente':
                return self.cliente is not None # type: ignore
            elif self.tipo_usuario == 'Vendedor':
                return self.vendedor is not None # type: ignore
            elif self.tipo_usuario in ['Administrador', 'Admin']:
                return self.administrador is not None # type: ignore
        except AttributeError:
            return False
        return False

class Endereco(models.Model):
    logradouro = models.CharField(max_length=255)
    numero = models.CharField(max_length=50, blank=True, null=True)
    complemento = models.CharField(max_length=255, blank=True, null=True)
    bairro = models.CharField(max_length=255, blank=True, null=True)
    cidade = models.CharField(max_length=255)
    estado = models.CharField(max_length=2)
    cep = models.CharField(max_length=9)
    pais = models.CharField(max_length=100, default='Brasil')
    latitude = models.DecimalField(max_digits=10, decimal_places=8, blank=True, null=True)
    longitude = models.DecimalField(max_digits=11, decimal_places=8, blank=True, null=True)
    data_cadastro = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.logradouro}, {self.numero} - {self.cidade}/{self.estado}'

class CategoriaLoja(models.Model):
    nome = models.CharField(max_length=255, unique=True)
    descricao = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.nome

class Cliente(models.Model):
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, primary_key=True)
    nome = models.CharField(max_length=255)
    telefone = models.CharField(max_length=20, blank=True, null=True)
    endereco = models.ForeignKey(Endereco, on_delete=models.SET_NULL, null=True, blank=True)
    cpf = models.CharField(max_length=14, unique=True)
    data_nascimento = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.nome

class Vendedor(models.Model):
    STATUS_APROVACAO_CHOICES = (('Pendente', 'Pendente'), ('Aprovado', 'Aprovado'), ('Rejeitado', 'Rejeitado'))
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, primary_key=True)
    nome_loja = models.CharField(max_length=255)
    cnpj = models.CharField(max_length=18, unique=True, null=True, blank=True)
    endereco = models.ForeignKey(Endereco, on_delete=models.SET_NULL, null=True, blank=True)
    telefone = models.CharField(max_length=20, null=True, blank=True)
    categoria_loja = models.ForeignKey(CategoriaLoja, on_delete=models.PROTECT)
    status_aprovacao = models.CharField(max_length=10, choices=STATUS_APROVACAO_CHOICES, default='Pendente')
    
    # Novos campos para o perfil do vendedor
    data_fundacao = models.DateField(null=True, blank=True)
    horario_funcionamento = models.CharField(max_length=255, blank=True, null=True)
    nome_responsavel = models.CharField(max_length=255, blank=True, null=True)
    cpf_responsavel = models.CharField(max_length=14, blank=True, null=True)
    breve_descricao_loja = models.TextField(blank=True, null=True)
    logotipo_loja = models.URLField(max_length=200, blank=True, null=True)
    site_redes_sociais = models.URLField(max_length=200, blank=True, null=True)

    def __str__(self):
        return self.nome_loja

class SubcategoriaProduto(models.Model):
    nome = models.CharField(max_length=255)
    categoria_loja = models.ForeignKey(CategoriaLoja, on_delete=models.CASCADE)
    class Meta:
        unique_together = ('nome', 'categoria_loja')
    def __str__(self):
        return f'{self.categoria_loja.nome} > {self.nome}'

class Produto(models.Model):
    nome = models.CharField(max_length=255)
    descricao = models.TextField(blank=True, null=True)
    subcategoria = models.ForeignKey(SubcategoriaProduto, on_delete=models.PROTECT)
    data_cadastro = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.nome

class Atributo(models.Model):
    nome = models.CharField(max_length=100, unique=True)
    def __str__(self):
        return self.nome

class ValorAtributo(models.Model):
    atributo = models.ForeignKey(Atributo, related_name='valores', on_delete=models.CASCADE)
    valor = models.CharField(max_length=100)
    class Meta:
        unique_together = ('atributo', 'valor')
    def __str__(self):
        return f'{self.atributo.nome}: {self.valor}'

class SKU(models.Model):
    produto = models.ForeignKey(Produto, related_name='skus', on_delete=models.CASCADE)
    valores = models.ManyToManyField(ValorAtributo, related_name='skus')
    codigo_sku = models.CharField(max_length=100, unique=True, blank=True, null=True)

    def __str__(self):
        valores_str = ", ".join(str(valor) for valor in self.valores.all().order_by('atributo__nome'))
        return f'{self.produto.nome} ({valores_str})'

class ImagemSKU(models.Model):
    sku = models.ForeignKey(SKU, related_name='imagens', on_delete=models.CASCADE)
    imagem = models.ImageField(upload_to='produtos/')
    ordem = models.PositiveIntegerField(default=0)
    class Meta:
        ordering = ['ordem']
    def __str__(self):
        return f'Imagem de {self.sku}'

class OfertaProduto(models.Model):
    vendedor = models.ForeignKey(Vendedor, on_delete=models.CASCADE)
    sku = models.ForeignKey(SKU, on_delete=models.CASCADE)
    preco = models.DecimalField(max_digits=10, decimal_places=2)
    quantidade_disponivel = models.PositiveIntegerField(default=0)
    ativo = models.BooleanField(default=True)
    data_cadastro = models.DateTimeField(auto_now_add=True)
    ultima_atualizacao = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('vendedor', 'sku')

    def __str__(self):
        return f'{self.sku} por {self.vendedor.nome_loja} - R${self.preco}'

class AvaliacaoLoja(models.Model):
    cliente = models.ForeignKey(Cliente, on_delete=models.CASCADE)
    vendedor = models.ForeignKey(Vendedor, on_delete=models.CASCADE)
    nota = models.PositiveSmallIntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comentario = models.TextField(blank=True, null=True)
    data_avaliacao = models.DateTimeField(auto_now_add=True)
    class Meta:
        unique_together = ('cliente', 'vendedor')

class Administrador(models.Model):
    usuario = models.OneToOneField(Usuario, on_delete=models.CASCADE, primary_key=True)
    nome = models.CharField(max_length=255)

import hashlib
from urllib.parse import urlparse, urlunparse

def get_canonical_url(url):
    """Gera uma URL canônica removendo parâmetros de consulta e fragmentos."""
    parsed_url = urlparse(url)
    # Reconstrói a URL apenas com scheme, netloc e path
    canonical_url = urlunparse((parsed_url.scheme, parsed_url.netloc, parsed_url.path, '', '', ''))
    return canonical_url

class ProdutosMonitoradosExternos(models.Model):
    vendedor = models.ForeignKey(Vendedor, on_delete=models.CASCADE)
    url_produto = models.URLField(max_length=2048)
    url_hash = models.CharField(max_length=64, blank=True, help_text="Hash SHA-256 da URL canônica para garantir unicidade.")
    nome_produto = models.CharField(max_length=255, blank=True, null=True)
    preco_atual = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    ultima_coleta = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('vendedor', 'url_hash')

    def save(self, *args, **kwargs):
        if not self.url_hash:
            canonical_url = get_canonical_url(self.url_produto)
            self.url_hash = hashlib.sha256(canonical_url.encode()).hexdigest()
        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.nome_produto} ({self.vendedor.nome_loja})'

class HistoricoPrecos(models.Model):
    produto_monitorado = models.ForeignKey(ProdutosMonitoradosExternos, related_name='historico', on_delete=models.CASCADE)
    preco = models.DecimalField(max_digits=10, decimal_places=2)
    data_coleta = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-data_coleta']

    def __str__(self):
        return f'{self.produto_monitorado.nome_produto} - R${self.preco} em {self.data_coleta.strftime("%d/%m/%Y %H:%M")}'

class Sugestao(models.Model):
    usuario = models.ForeignKey(Usuario, on_delete=models.CASCADE)
    texto = models.TextField()
    data_envio = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Sugestões"
        ordering = ['-data_envio']

    def __str__(self):
        return f'Sugestão de {self.usuario.email} em {self.data_envio.strftime("%Y-%m-%d %H:%M")}'