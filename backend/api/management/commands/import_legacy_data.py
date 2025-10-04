from django.core.management.base import BaseCommand
from django.db import transaction
import csv
import os
from datetime import datetime
from django.contrib.auth.hashers import make_password # For hashing passwords if needed

# Import your Django models
from django.core.management.base import BaseCommand
from django.db import transaction
import csv
import os
from datetime import datetime
from django.contrib.auth.hashers import make_password # For hashing passwords if needed
from django.utils.timezone import make_aware
import uuid

# Import your Django models
from api.models import (
    Usuario, Cliente, Vendedor, Endereco, CategoriaLoja, SubcategoriaProduto,
    Produto, VariacaoProduto, OfertaProduto, AvaliacaoLoja,
    IndicacaoVendedor, Sugestao, ProdutosMonitoradosExternos, ImagemVariacao, Administrador
)

class Command(BaseCommand):
    help = 'Imports legacy data from Node.js MySQL dump into Django models.'

    

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting data import from CSV files...'))

        CSV_DIR = r"C:\Users\cydyq\Documents\Python\TesteCacaPreco\cacapreco_ai\csv"


        # Dictionaries to store old_id -> new_id mappings for foreign keys
        old_user_id_to_new_user_id = {}
        old_endereco_id_to_new_endereco_id = {}
        old_categoria_loja_id_to_new_categoria_loja_id = {}
        old_subcategoria_produto_id_to_new_subcategoria_produto_id = {}
        old_produto_id_to_new_produto_id = {}
        old_variacao_produto_id_to_new_variacao_produto_id = {}
        old_vendedor_id_to_new_vendedor_id = {}
        old_cliente_id_to_new_cliente_id = {}


        # Helper function to read CSV
        def read_csv(filename):
            filepath = os.path.join(CSV_DIR, filename)
            data = []
            with open(filepath, 'r', newline='', encoding='utf-8') as csvfile:
                reader = csv.DictReader(csvfile)
                for row in reader:
                    data.append(row)
            return data

        # --- 1. Import USUARIO ---
        self.stdout.write(self.style.MIGRATE_HEADING('\n--- Importing USUARIO ---'))
        users_data = read_csv('USUARIO.csv') # Assuming filename is USUARIO.csv
        for row in users_data:
            try:
                with transaction.atomic():
                    # Map Node.js fields to Django fields
                    email = row['Email']
                    tipo_usuario = row['TipoUsuario']
                    # Node.js 'ID_Usuario' will be used for mapping
                    old_id = int(row['ID_Usuario'])

                    # Handle datetime fields and make them timezone-aware
                    date_joined = make_aware(datetime.strptime(row['DataCadastro'], '%Y-%m-%d %H:%M:%S')) if row['DataCadastro'] else None
                    last_login = make_aware(datetime.strptime(row['UltimoLogin'], '%Y-%m-%d %H:%M:%S')) if row['UltimoLogin'] else None

                    # Validate UUID for verification_token
                    verification_token = None
                    if row['TokenConfirmacao']:
                        try:
                            verification_token = uuid.UUID(row['TokenConfirmacao'])
                        except ValueError:
                            self.stdout.write(self.style.WARNING(f'Invalid UUID for TokenConfirmacao for user {email}: {row['TokenConfirmacao']}. Setting to None.'))

                    # Create Usuario instance
                    usuario = Usuario.objects.create(
                        email=email,
                        tipo_usuario=tipo_usuario,
                        is_active=True if row['Ativo'] == '1' else False, # Assuming '1' for true
                        email_verificado=True if row['EmailConfirmado'] == '1' else False,
                        verification_token=verification_token,
                        date_joined=date_joined,
                        last_login=last_login,
                    )
                    # Set a dummy password and inform about reset
                    usuario.set_password('temp_password_123') # Users must reset this!
                    usuario.save()

                    old_user_id_to_new_user_id[old_id] = usuario.pk
                    self.stdout.write(self.style.SUCCESS(f'Imported Usuario: {usuario.email} (Old ID: {old_id})'))

            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error importing USUARIO (Old ID: {row.get("ID_Usuario", "N/A")}, Email: {row.get("Email", "N/A")}): {e}'))

        # --- 2. Import ENDERECO ---
        self.stdout.write(self.style.MIGRATE_HEADING('\n--- Importing ENDERECO ---'))
        enderecos_data = read_csv('ENDERECO.csv')
        for row in enderecos_data:
            try:
                with transaction.atomic():
                    old_id = int(row['ID_Endereco'])
                    data_cadastro = make_aware(datetime.strptime(row['DataCadastro'], '%Y-%m-%d %H:%M:%S')) if row['DataCadastro'] else None

                    endereco = Endereco.objects.create(
                        logradouro=row['Logradouro'],
                        numero=row['Numero'] if row['Numero'] else '',
                        complemento=row['Complemento'] if row['Complemento'] else '',
                        bairro=row['Bairro'] if row['Bairro'] else '',
                        cidade=row['Cidade'],
                        estado=row['Estado'],
                        cep=row['CEP'],
                        pais=row['Pais'] if row['Pais'] else 'Brasil',
                        latitude=float(row['Latitude']) if row['Latitude'] else None,
                        longitude=float(row['Longitude']) if row['Longitude'] else None,
                        data_cadastro=data_cadastro,
                    )
                    old_endereco_id_to_new_endereco_id[old_id] = endereco.pk
                    self.stdout.write(self.style.SUCCESS(f'Imported Endereco: {endereco} (Old ID: {old_id})'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error importing ENDERECO (Old ID: {row.get("ID_Endereco", "N/A")}): {e}'))

        # --- 3. Import CATEGORIA_LOJA ---
        self.stdout.write(self.style.MIGRATE_HEADING('\n--- Importing CATEGORIA_LOJA ---'))
        categorias_data = read_csv('CATEGORIA_LOJA.csv')
        for row in categorias_data:
            try:
                with transaction.atomic():
                    old_id = int(row['ID_CategoriaLoja'])
                    categoria = CategoriaLoja.objects.create(
                        nome=row['NomeCategoria'],
                        descricao=row['Descricao'] if row['Descricao'] else '',
                    )
                    old_categoria_loja_id_to_new_categoria_loja_id[old_id] = categoria.pk
                    self.stdout.write(self.style.SUCCESS(f'Imported CategoriaLoja: {categoria.nome} (Old ID: {old_id})'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error importing CATEGORIA_LOJA (Old ID: {row.get("ID_CategoriaLoja", "N/A")}): {e}'))

        # --- 4. Import SUBCATEGORIA_PRODUTO ---
        self.stdout.write(self.style.MIGRATE_HEADING('\n--- Importing SUBCATEGORIA_PRODUTO ---'))
        subcategorias_data = read_csv('SUBCATEGORIA_PRODUTO.csv')
        for row in subcategorias_data:
            try:
                with transaction.atomic():
                    old_id = int(row['ID_Subcategoria'])
                    old_categoria_loja_id = int(row['ID_CategoriaLoja'])
                    categoria_loja_obj = CategoriaLoja.objects.get(pk=old_categoria_loja_id_to_new_categoria_loja_id[old_categoria_loja_id])

                    subcategoria = SubcategoriaProduto.objects.create(
                        nome=row['NomeSubcategoria'],
                        categoria_loja=categoria_loja_obj,
                    )
                    old_subcategoria_produto_id_to_new_subcategoria_produto_id[old_id] = subcategoria.pk
                    self.stdout.write(self.style.SUCCESS(f'Imported SubcategoriaProduto: {subcategoria.nome} (Old ID: {old_id})'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error importing SUBCATEGORIA_PRODUTO (Old ID: {row.get("ID_Subcategoria", "N/A")}): {e}'))

        # --- 5. Import PRODUTO ---
        self.stdout.write(self.style.MIGRATE_HEADING('\n--- Importing PRODUTO ---'))
        produtos_data = read_csv('PRODUTO.csv')
        for row in produtos_data:
            try:
                with transaction.atomic():
                    old_id = int(row['ID_Produto'])
                    old_subcategoria_id = int(row['ID_Subcategoria'])
                    subcategoria_obj = SubcategoriaProduto.objects.get(pk=old_subcategoria_produto_id_to_new_subcategoria_produto_id[old_subcategoria_id])
                    data_cadastro = make_aware(datetime.strptime(row['DataCadastro'], '%Y-%m-%d %H:%M:%S')) if row['DataCadastro'] else None

                    produto = Produto.objects.create(
                        nome=row['NomeProduto'],
                        descricao=row['Descricao'] if row['Descricao'] else '',
                        subcategoria=subcategoria_obj,
                        data_cadastro=data_cadastro,
                    )
                    old_produto_id_to_new_produto_id[old_id] = produto.pk
                    self.stdout.write(self.style.SUCCESS(f'Imported Produto: {produto.nome} (Old ID: {old_id})'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error importing PRODUTO (Old ID: {row.get("ID_Produto", "N/A")}): {e}'))

        # --- 6. Import VARIACAO_PRODUTO ---
        self.stdout.write(self.style.MIGRATE_HEADING('\n--- Importing VARIACAO_PRODUTO ---'))
        variacoes_data = read_csv('VARIACAO_PRODUTO.csv')
        for row in variacoes_data:
            try:
                with transaction.atomic():
                    old_id = int(row['ID_Variacao'])
                    old_produto_id = int(row['ID_Produto'])
                    produto_obj = Produto.objects.get(pk=old_produto_id_to_new_produto_id[old_produto_id])

                    variacao = VariacaoProduto.objects.create(
                        produto=produto_obj,
                        nome=row['NomeVariacao'],
                        valor=row['ValorVariacao'],
                    )
                    old_variacao_produto_id_to_new_variacao_produto_id[old_id] = variacao.pk
                    self.stdout.write(self.style.SUCCESS(f'Imported VariacaoProduto: {variacao} (Old ID: {old_id})'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error importing VARIACAO_PRODUTO (Old ID: {row.get("ID_Variacao", "N/A")}): {e}'))

        # --- 7. Import IMAGEM_VARIACAO ---
        self.stdout.write(self.style.MIGRATE_HEADING('\n--- Importing IMAGEM_VARIACAO ---'))
        imagens_data = read_csv('IMAGEM_VARIACAO.csv')
        for row in imagens_data:
            try:
                with transaction.atomic():
                    old_id = int(row['ID_Imagem'])
                    old_variacao_id = int(row['ID_Variacao'])
                    variacao_obj = VariacaoProduto.objects.get(pk=old_variacao_produto_id_to_new_variacao_produto_id[old_variacao_id])

                    # For ImageField, we usually need to handle the file itself.
                    # For now, we'll just store the URL. If actual image files need to be migrated,
                    # that's a separate, more complex process (copying files and then updating paths).
                    # Assuming URL_Imagem is just a path/filename that Django's ImageField can handle.
                    # If it's a full URL, Django's ImageField might not directly store it.
                    # For simplicity, we'll assume it's a relative path that will be handled by MEDIA_ROOT.
                    # If the images are not copied, this will lead to broken image links.
                    imagem_variacao = ImagemVariacao.objects.create(
                        variacao=variacao_obj,
                        imagem=row['URL_Imagem'], # This assumes the file exists at MEDIA_ROOT/URL_Imagem
                        ordem=int(row['Ordem']),
                    )
                    self.stdout.write(self.style.SUCCESS(f'Imported ImagemVariacao: {imagem_variacao} (Old ID: {old_id})'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error importing IMAGEM_VARIACAO (Old ID: {row.get("ID_Imagem", "N/A")}): {e}'))

        # --- 8. Import CLIENTE ---
        self.stdout.write(self.style.MIGRATE_HEADING('\n--- Importing CLIENTE ---'))
        clientes_data = read_csv('CLIENTE.csv')
        for row in clientes_data:
            try:
                with transaction.atomic():
                    old_id = int(row['ID_Cliente'])
                    old_usuario_id = int(row['ID_Usuario'])
                    usuario_obj = Usuario.objects.get(pk=old_user_id_to_new_user_id[old_usuario_id])

                    endereco_obj = None
                    if row['ID_Endereco']:
                        old_endereco_id = int(row['ID_Endereco'])
                        endereco_obj = Endereco.objects.get(pk=old_endereco_id_to_new_endereco_id[old_endereco_id])

                    data_nascimento = datetime.strptime(row['DataNascimento'], '%Y-%m-%d').date() if row['DataNascimento'] else None

                    cliente = Cliente.objects.create(
                        usuario=usuario_obj,
                        nome=row['Nome'],
                        telefone=row['Telefone'] if row['Telefone'] else '',
                        endereco=endereco_obj,
                        cpf=row['CPF'],
                        data_nascimento=data_nascimento,
                    )
                    old_cliente_id_to_new_cliente_id[old_id] = cliente.pk
                    self.stdout.write(self.style.SUCCESS(f'Imported Cliente: {cliente.nome} (Old ID: {old_id})'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error importing CLIENTE (Old ID: {row.get("ID_Cliente", "N/A")}): {e}'))

        # --- 9. Import VENDEDOR ---
        self.stdout.write(self.style.MIGRATE_HEADING('\n--- Importing VENDEDOR ---'))
        vendedores_data = read_csv('VENDEDOR.csv')
        for row in vendedores_data:
            try:
                with transaction.atomic():
                    old_id = int(row['ID_Vendedor'])
                    old_usuario_id = int(row['ID_Usuario'])
                    usuario_obj = Usuario.objects.get(pk=old_user_id_to_new_user_id[old_usuario_id])

                    endereco_obj = None
                    if row['ID_Endereco']:
                        old_endereco_id = int(row['ID_Endereco'])
                        endereco_obj = Endereco.objects.get(pk=old_endereco_id_to_new_endereco_id[old_endereco_id])

                    old_categoria_loja_id = int(row['ID_CategoriaLoja'])
                    categoria_loja_obj = CategoriaLoja.objects.get(pk=old_categoria_loja_id_to_new_categoria_loja_id[old_categoria_loja_id])

                    fundacao = datetime.strptime(row['Fundacao'], '%Y-%m-%d').date() if row['Fundacao'] else None
                    avaliacao_loja = float(row['AvaliacaoLoja']) if row['AvaliacaoLoja'] else None

                    vendedor = Vendedor.objects.create(
                        usuario=usuario_obj,
                        nome_loja=row['NomeLoja'],
                        cnpj=row['CNPJ'] if row['CNPJ'] else '',
                        endereco=endereco_obj,
                        telefone=row['Telefone'] if row['Telefone'] else '',
                        fundacao=fundacao,
                        horario_funcionamento=row['HorarioFuncionamento'] if row['HorarioFuncionamento'] else '',
                        nome_responsavel=row['NomeResponsavel'] if row['NomeResponsavel'] else '',
                        cpf_responsavel=row['CPF_Responsavel'] if row['CPF_Responsavel'] else '',
                        breve_descricao_loja=row['BreveDescricaoLoja'] if row['BreveDescricaoLoja'] else '',
                        logotipo_loja=row['LogotipoLoja'] if row['LogotipoLoja'] else '', # Assuming path/filename
                        website_redes_sociais=row['WebsiteRedesSociais'] if row['WebsiteRedesSociais'] else '',
                        categoria_loja=categoria_loja_obj,
                        avaliacao_loja=avaliacao_loja,
                        status_aprovacao=row['StatusAprovacao'],
                    )
                    old_vendedor_id_to_new_vendedor_id[old_id] = vendedor.pk
                    self.stdout.write(self.style.SUCCESS(f'Imported Vendedor: {vendedor.nome_loja} (Old ID: {old_id})'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error importing VENDEDOR (Old ID: {row.get("ID_Vendedor", "N/A")}): {e}'))

        # --- 10. Import OFERTA_PRODUTO ---
        self.stdout.write(self.style.MIGRATE_HEADING('\n--- Importing OFERTA_PRODUTO ---'))
        ofertas_data = read_csv('OFERTA_PRODUTO.csv')
        for row in ofertas_data:
            try:
                with transaction.atomic():
                    old_id = int(row['ID_Oferta'])
                    old_vendedor_id = int(row['ID_Vendedor'])
                    vendedor_obj = Vendedor.objects.get(pk=old_vendedor_id_to_new_vendedor_id[old_vendedor_id])

                    old_variacao_id = int(row['ID_Variacao'])
                    variacao_obj = VariacaoProduto.objects.get(pk=old_variacao_produto_id_to_new_variacao_produto_id[old_variacao_id])

                    data_cadastro = datetime.strptime(row['DataCadastro'], '%Y-%m-%d %H:%M:%S') if row['DataCadastro'] else None
                    ultima_atualizacao = datetime.strptime(row['UltimaAtualizacao'], '%Y-%m-%d %H:%M:%S') if row['UltimaAtualizacao'] else None

                    oferta = OfertaProduto.objects.create(
                        vendedor=vendedor_obj,
                        variacao=variacao_obj,
                        preco=float(row['Preco']),
                        quantidade_disponivel=int(row['QuantidadeDisponivel']),
                        ativo=True if row['Ativo'] == '1' else False,
                        data_cadastro=data_cadastro,
                        ultima_atualizacao=ultima_atualizacao,
                    )
                    self.stdout.write(self.style.SUCCESS(f'Imported OfertaProduto: {oferta} (Old ID: {old_id})'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error importing OFERTA_PRODUTO (Old ID: {row.get("ID_Oferta", "N/A")}): {e}'))

        # --- 11. Import AVALIACAO_LOJA ---
        self.stdout.write(self.style.MIGRATE_HEADING('\n--- Importing AVALIACAO_LOJA ---'))
        avaliacoes_data = read_csv('AVALIACAO_LOJA.csv')
        for row in avaliacoes_data:
            try:
                with transaction.atomic():
                    old_id = int(row['ID_Avaliacao'])
                    old_cliente_id = int(row['ID_Cliente'])
                    cliente_obj = Cliente.objects.get(pk=old_cliente_id_to_new_cliente_id[old_cliente_id])

                    old_vendedor_id = int(row['ID_Vendedor'])
                    vendedor_obj = Vendedor.objects.get(pk=old_vendedor_id_to_new_vendedor_id[old_vendedor_id])

                    data_avaliacao = datetime.strptime(row['DataAvaliacao'], '%Y-%m-%d %H:%M:%S') if row['DataAvaliacao'] else None

                    avaliacao = AvaliacaoLoja.objects.create(
                        cliente=cliente_obj,
                        vendedor=vendedor_obj,
                        nota=int(row['Nota']),
                        comentario=row['Comentario'] if row['Comentario'] else '',
                        data_avaliacao=data_avaliacao,
                    )
                    self.stdout.write(self.style.SUCCESS(f'Imported AvaliacaoLoja: {avaliacao} (Old ID: {old_id})'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error importing AVALIACAO_LOJA (Old ID: {row.get("ID_Avaliacao", "N/A")}): {e}'))

        # --- 12. Import INDICACAO_VENDEDOR ---
        self.stdout.write(self.style.MIGRATE_HEADING('\n--- Importing INDICACAO_VENDEDOR ---'))
        indicacoes_data = read_csv('INDICACAO_VENDEDOR.csv')
        for row in indicacoes_data:
            try:
                with transaction.atomic():
                    old_id = int(row['ID_Indicacao'])
                    cliente_obj = None
                    if row['ID_Cliente']:
                        old_cliente_id = int(row['ID_Cliente'])
                        cliente_obj = Cliente.objects.get(pk=old_cliente_id_to_new_cliente_id[old_cliente_id])

                    vendedor_obj = None
                    if row['ID_Vendedor']:
                        old_vendedor_id = int(row['ID_Vendedor'])
                        vendedor_obj = Vendedor.objects.get(pk=old_vendedor_id_to_new_vendedor_id[old_vendedor_id])

                    data_indicacao = datetime.strptime(row['DataIndicacao'], '%Y-%m-%d %H:%M:%S') if row['DataIndicacao'] else None

                    indicacao = IndicacaoVendedor.objects.create(
                        cliente=cliente_obj,
                        vendedor=vendedor_obj,
                        nome_indicado=row['NomeIndicado'],
                        email_indicado=row['EmailIndicado'],
                        telefone_indicado=row['TelefoneIndicado'] if row['TelefoneIndicado'] else '',
                        mensagem=row['Mensagem'] if row['Mensagem'] else '',
                        status=row['StatusIndicacao'],
                        data_indicacao=data_indicacao,
                    )
                    self.stdout.write(self.style.SUCCESS(f'Imported IndicacaoVendedor: {indicacao} (Old ID: {old_id})'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error importing INDICACAO_VENDEDOR (Old ID: {row.get("ID_Indicacao", "N/A")}): {e}'))

        # --- 13. Import ADMINISTRADOR ---
        self.stdout.write(self.style.MIGRATE_HEADING('\n--- Importing ADMINISTRADOR ---'))
        administradores_data = read_csv('ADMINISTRADOR.csv')
        for row in administradores_data:
            try:
                with transaction.atomic():
                    old_id = int(row['ID_Admin'])
                    old_usuario_id = int(row['ID_Usuario'])
                    usuario_obj = Usuario.objects.get(pk=old_user_id_to_new_user_id[old_usuario_id])

                    # Make the user a superuser/staff in Django
                    usuario_obj.is_staff = True
                    usuario_obj.is_superuser = True
                    usuario_obj.save()

                    administrador = Administrador.objects.create(
                        usuario=usuario_obj,
                        nome=row['Nome'],
                        cargo=row['Cargo'] if row['Cargo'] else '',
                        permissoes=row['Permissoes'] if row['Permissoes'] else '',
                    )
                    self.stdout.write(self.style.SUCCESS(f'Imported Administrador: {administrador.nome} (Old ID: {old_id})'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error importing ADMINISTRADOR (Old ID: {row.get("ID_Admin", "N/A")}): {e}'))

        # --- 14. Import PRODUTOS_MONITORADOS_EXTERNOS ---
        self.stdout.write(self.style.MIGRATE_HEADING('\n--- Importing PRODUTOS_MONITORADOS_EXTERNOS ---'))
        monitorados_data = read_csv('PRODUTOS_MONITORADOS_EXTERNOS.csv')
        for row in monitorados_data:
            try:
                with transaction.atomic():
                    old_id = int(row['ID_Monitoramento'])
                    old_vendedor_id = int(row['ID_Vendedor'])
                    vendedor_obj = Vendedor.objects.get(pk=old_vendedor_id_to_new_vendedor_id[old_vendedor_id])

                    preco_atual = float(row['Preco_Atual']) if row['Preco_Atual'] else None
                    ultima_coleta = datetime.strptime(row['Ultima_Coleta'], '%Y-%m-%d %H:%M:%S') if row['Ultima_Coleta'] else None

                    monitorado = ProdutosMonitoradosExternos.objects.create(
                        vendedor=vendedor_obj,
                        url_produto=row['URL_Produto'],
                        nome_produto=row['Nome_Produto'] if row['Nome_Produto'] else '',
                        preco_atual=preco_atual,
                        ultima_coleta=ultima_coleta,
                    )
                    self.stdout.write(self.style.SUCCESS(f'Imported ProdutosMonitoradosExternos: {monitorado} (Old ID: {old_id})'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'Error importing PRODUTOS_MONITORADOS_EXTERNOS (Old ID: {row.get("ID_Monitoramento", "N/A")}): {e}'))


        self.stdout.write(self.style.SUCCESS('\nData import process completed.'))
        self.stdout.write(self.style.WARNING('**IMPORTANT:** Users will need to reset their passwords after this migration.'))
        self.stdout.write(self.style.WARNING('Please ensure all image files (logos, product images) are manually copied to your Django MEDIA_ROOT directory.'))

