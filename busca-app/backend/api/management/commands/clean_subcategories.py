from django.core.management.base import BaseCommand
from django.db import transaction
from django.db.models import Count, Value
from django.db.models.functions import Lower, Trim
from api.models import CategoriaLoja, SubcategoriaProduto, Produto, Vendedor

class Command(BaseCommand):
    help = 'Encontra, mescla e remove CategoriaLoja e SubcategoriaProduto duplicadas.'

    @transaction.atomic
    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('--- Iniciando Limpeza de Categorias Principais (CategoriaLoja) ---'))
        self.clean_categorias_loja()

        self.stdout.write(self.style.SUCCESS('\n--- Iniciando Limpeza de Subcategorias de Produto ---'))
        self.clean_subcategorias_produto()

        self.stdout.write(self.style.SUCCESS('\nLimpeza completa do banco de dados!'))

    def clean_categorias_loja(self):
        # Normaliza o campo 'nome' para a busca (lower e trim)
        normalized_duplicates = (
            CategoriaLoja.objects.annotate(norm_name=Trim(Lower('nome')))
            .values('norm_name')
            .annotate(name_count=Count('id'))
            .filter(name_count__gt=1)
        )

        if not normalized_duplicates.exists():
            self.stdout.write('Nenhuma CategoriaLoja duplicada encontrada.')
            return

        for item in normalized_duplicates:
            norm_name = item['norm_name']
            
            # Pega todas as instâncias duplicadas para este nome
            categorias_duplicadas = list(
                CategoriaLoja.objects.annotate(norm_name=Trim(Lower('nome')))
                .filter(norm_name=norm_name)
                .order_by('id')
            )

            master = categorias_duplicadas.pop(0)
            self.stdout.write(f"Mesclando duplicatas para CategoriaLoja '{master.nome}'")

            # Reatribui FKs dos modelos relacionados
            SubcategoriaProduto.objects.filter(categoria_loja__in=categorias_duplicadas).update(categoria_loja=master)
            Vendedor.objects.filter(categoria_loja__in=categorias_duplicadas).update(categoria_loja=master)
            self.stdout.write(f"  - Subcategorias e Vendedores reatribuídos para o ID mestre: {master.id}")

            # Deleta as instâncias duplicadas
            for duplicate in categorias_duplicadas:
                self.stdout.write(f"  - Deletando CategoriaLoja duplicada '{duplicate.nome}' (ID: {duplicate.id})")
                duplicate.delete()

    def clean_subcategorias_produto(self):
        # Normaliza e agrupa por nome e ID da categoria pai
        normalized_duplicates = (
            SubcategoriaProduto.objects.annotate(norm_name=Trim(Lower('nome')))
            .values('norm_name', 'categoria_loja_id')
            .annotate(name_count=Count('id'))
            .filter(name_count__gt=1)
        )

        if not normalized_duplicates.exists():
            self.stdout.write('Nenhuma SubcategoriaProduto duplicada encontrada.')
            return

        for item in normalized_duplicates:
            norm_name = item['norm_name']
            categoria_loja_id = item['categoria_loja_id']

            # Pega todas as instâncias duplicadas para este grupo
            subcategorias_duplicadas = list(
                SubcategoriaProduto.objects.annotate(norm_name=Trim(Lower('nome')))
                .filter(norm_name=norm_name, categoria_loja_id=categoria_loja_id)
                .order_by('id')
            )

            master = subcategorias_duplicadas.pop(0)
            self.stdout.write(f"Mesclando duplicatas para Subcategoria '{master.nome}' na Categoria ID {categoria_loja_id}")

            # Reatribui FKs de Produtos
            produtos_para_atualizar = Produto.objects.filter(subcategoria__in=subcategorias_duplicadas)
            if produtos_para_atualizar.exists():
                count = produtos_para_atualizar.count()
                produtos_para_atualizar.update(subcategoria=master)
                self.stdout.write(f"  - {count} Produto(s) reatribuído(s) para o ID mestre: {master.id}")

            # Deleta as instâncias duplicadas
            for duplicate in subcategorias_duplicadas:
                self.stdout.write(f"  - Deletando Subcategoria duplicada '{duplicate.nome}' (ID: {duplicate.id})")
                duplicate.delete()