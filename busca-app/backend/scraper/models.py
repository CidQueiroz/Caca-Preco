from django.db import models
import hashlib
from urllib.parse import urlparse, urlunparse

# Create your models here.

def get_canonical_url(url):
    """Gera uma URL canônica removendo parâmetros de consulta e fragmentos."""
    parsed_url = urlparse(url)
    # Reconstrói a URL apenas com scheme, netloc e path
    canonical_url = urlunparse((parsed_url.scheme, parsed_url.netloc, parsed_url.path, '', '', ''))
    return canonical_url

class ProdutosMonitoradosExternos(models.Model):
    vendedor = models.ForeignKey('api.Vendedor', on_delete=models.CASCADE)
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


class Dominio(models.Model):
    """
    Representa um domínio de site a ser monitorado (ex: 'americanas.com.br').
    """
    nome_dominio = models.CharField(
        max_length=255, 
        unique=True, 
        help_text="O nome de domínio principal, ex: 'americanas.com.br'"
    )
    ativo = models.BooleanField(
        default=True, 
        help_text="Desmarque para desativar temporariamente o scraping neste domínio."
    )
    # Futuramente, podemos adicionar campos de configuração aqui, 
    # como 'precisa_js', 'usa_proxy', etc.

    def __str__(self):
        return self.nome_dominio

    class Meta:
        verbose_name = "Domínio"
        verbose_name_plural = "Domínios"
        ordering = ['nome_dominio']


class Seletor(models.Model):
    """
    Armazena um seletor específico (CSS, XPath, etc.) para um tipo de dado em um domínio.
    """
    class TipoSeletor(models.TextChoices):
        NOME = 'nome', 'Nome do Produto'
        PRECO = 'preco', 'Preço do Produto'
        JSON_LD = 'json_ld', 'JSON-LD'
        API_URL = 'api_url', 'URL de API'

    dominio = models.ForeignKey(
        Dominio, 
        related_name='seletores', 
        on_delete=models.CASCADE
    )
    tipo = models.CharField(
        max_length=10, 
        choices=TipoSeletor.choices,
        help_text="O tipo de dado que este seletor extrai."
    )
    seletor = models.CharField(
        max_length=512, 
        help_text="O seletor (CSS, XPath, chave JSON) ou padrão de URL."
    )
    prioridade = models.PositiveSmallIntegerField(
        default=0, 
        help_text="Define a ordem de tentativa (0 é a primeira)."
    )

    def __str__(self):
        return f"{self.dominio.nome_dominio} - {self.get_tipo_display()} (Prioridade: {self.prioridade})"

    class Meta:
        verbose_name = "Seletor"
        verbose_name_plural = "Seletores"
        # Garante que não haja seletores do mesmo tipo com a mesma prioridade para um domínio
        unique_together = ('dominio', 'tipo', 'prioridade')
        ordering = ['dominio', 'tipo', 'prioridade']