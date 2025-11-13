from django.db import models
from django.conf import settings
from api.models import Vendedor # Import Vendedor from api app
from urllib.parse import urlparse
import hashlib

def get_canonical_url(url: str) -> str:
    """
    Normaliza uma URL para sua forma canônica, removendo parâmetros de query
    e fragmentos que não afetam a identificação do produto.
    """
    parsed_url = urlparse(url)
    # Reconstroi a URL apenas com esquema, netloc e path
    canonical_url = parsed_url.scheme + "://" + parsed_url.netloc + parsed_url.path
    return canonical_url.lower() # Retorna em minúsculas para consistência

class ScrapedData(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='scraped_data')
    url = models.URLField(max_length=1024)
    product_name = models.CharField(max_length=512)
    product_price = models.DecimalField(max_digits=10, decimal_places=2)
    scraped_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.product_name} - {self.product_price}'

    class Meta:
        ordering = ['-scraped_at']
        verbose_name = 'Dado Raspado'
        verbose_name_plural = 'Dados Raspados'

class Dominio(models.Model):
    nome_dominio = models.CharField(max_length=255, unique=True)
    ativo = models.BooleanField(default=True)
    data_cadastro = models.DateTimeField(auto_now_add=True)
    data_atualizacao = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nome_dominio

    class Meta:
        verbose_name = 'Domínio de Scraping'
        verbose_name_plural = 'Domínios de Scraping'

class Seletor(models.Model):
    class TipoSeletor(models.TextChoices):
        NOME = 'NOME', 'Nome do Produto'
        PRECO = 'PRECO', 'Preço do Produto'
        API_URL = 'API_URL', 'URL da API de Dados'

    dominio = models.ForeignKey(Dominio, on_delete=models.CASCADE, related_name='seletores')
    tipo = models.CharField(max_length=10, choices=TipoSeletor.choices)
    seletor = models.CharField(max_length=512) # O seletor CSS/XPath/JSONPath
    prioridade = models.PositiveSmallIntegerField(default=0) # Para ordenar a tentativa de seletores
    data_cadastro = models.DateTimeField(auto_now_add=True)
    data_atualizacao = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.dominio.nome_dominio} - {self.get_tipo_display()}: {self.seletor}'

    class Meta:
        unique_together = ('dominio', 'tipo', 'seletor')
        ordering = ['dominio', 'tipo', 'prioridade']
        verbose_name = 'Seletor de Scraping'
        verbose_name_plural = 'Seletores de Scraping'

class ProdutosMonitoradosExternos(models.Model):
    vendedor = models.ForeignKey(Vendedor, on_delete=models.CASCADE, related_name='produtos_monitorados')
    url_hash = models.CharField(max_length=64, unique=True, help_text="Hash SHA256 da URL canônica do produto.")
    url_produto = models.URLField(max_length=1024)
    nome_produto = models.CharField(max_length=512)
    preco_atual = models.DecimalField(max_digits=10, decimal_places=2)
    ultima_coleta = models.DateTimeField(auto_now=True)
    data_cadastro = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.nome_produto} ({self.vendedor.nome_loja})'

    class Meta:
        verbose_name = 'Produto Monitorado Externamente'
        verbose_name_plural = 'Produtos Monitorados Externamente'

class HistoricoPrecos(models.Model):
    produto_monitorado = models.ForeignKey(ProdutosMonitoradosExternos, on_delete=models.CASCADE, related_name='historico_precos')
    preco = models.DecimalField(max_digits=10, decimal_places=2)
    data_coleta = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.produto_monitorado.nome_produto} - R${self.preco} em {self.data_coleta.strftime("%Y-%m-%d")}'

    class Meta:
        ordering = ['-data_coleta']
        verbose_name = 'Histórico de Preço'
        verbose_name_plural = 'Históricos de Preços'