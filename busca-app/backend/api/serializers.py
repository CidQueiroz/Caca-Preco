from rest_framework import serializers

from .models import (
    Usuario, CategoriaLoja, SubcategoriaProduto, Produto, Atributo, ValorAtributo, SKU, ImagemSKU,
    OfertaProduto, Vendedor, AvaliacaoLoja, Cliente, Endereco, ProdutosMonitoradosExternos, Sugestao
)
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.conf import settings # Importar settings

class UserSerializer(serializers.ModelSerializer):
    senha = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})

    class Meta:
        model = Usuario
        fields = ['id', 'email', 'senha', 'tipo_usuario', 'token_verificacao']
        read_only_fields = ['id', 'token_verificacao']

    def create(self, validated_data):
        """
        Cria e retorna um novo usuário, garantindo que a senha seja criptografada.
        """
        password = validated_data.pop('senha')
        user = Usuario.objects.create_user(password=password, **validated_data)
        return user

class MyTokenObtainPairSerializer(TokenObtainPairSerializer): # CORRIGIDO: Era TokenObtainPairView
    username_field = 'email'
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Adiciona claims customizadas
        token['tipo_usuario'] = user.tipo_usuario
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        if not self.user.email_verificado:
            raise serializers.ValidationError({'detail': 'EMAIL_NAO_VERIFICADO'})
        # Adiciona dados do usuário à resposta do login
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'tipo_usuario': self.user.tipo_usuario,
            'email_verificado': self.user.email_verificado, # Adicionado
            'perfil_completo': self.user.perfil_completo, # Adicionado
        }
        return data

class AtributoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Atributo
        fields = '__all__'

class ValorAtributoSerializer(serializers.ModelSerializer):
    atributo = serializers.StringRelatedField()
    class Meta:
        model = ValorAtributo
        fields = ['id', 'atributo', 'valor']

class ImagemSKUSerializer(serializers.ModelSerializer):
    class Meta:
        model = ImagemSKU
        fields = ['id', 'imagem', 'ordem']

class SKUSerializer(serializers.ModelSerializer):
    valores = ValorAtributoSerializer(many=True, read_only=True)
    imagens = ImagemSKUSerializer(many=True, read_only=True)

    class Meta:
        model = SKU
        fields = ['id', 'produto', 'codigo_sku', 'valores', 'imagens']

class ProdutoSerializer(serializers.ModelSerializer):
    # Aninha os SKUs para detalhar o produto
    skus = SKUSerializer(many=True, read_only=True)

    class Meta:
        model = Produto
        fields = ['id', 'nome', 'descricao', 'subcategoria', 'skus']

class OfertaProdutoSerializer(serializers.ModelSerializer):
    # Aninha o SKU para dar detalhes da oferta
    sku = SKUSerializer(read_only=True)
    sku_id = serializers.PrimaryKeyRelatedField(
        queryset=SKU.objects.all(), source='sku', write_only=True
    )

    class Meta:
        model = OfertaProduto
        fields = ['id', 'vendedor', 'sku', 'sku_id', 'preco', 'quantidade_disponivel', 'ativo']
        read_only_fields = ['vendedor']

class CategoriaLojaSerializer(serializers.ModelSerializer):
    class Meta:
        model = CategoriaLoja
        fields = '__all__'

class SubcategoriaProdutoSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubcategoriaProduto
        fields = '__all__'

class EnderecoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Endereco
        fields = '__all__'

class ClienteSerializer(serializers.ModelSerializer):
    usuario = UserSerializer(read_only=True)
    endereco = EnderecoSerializer(required=False, allow_null=True)

    class Meta:
        model = Cliente
        fields = '__all__'

    def create(self, validated_data):
        endereco_data = validated_data.pop('endereco', None)
        user = self.context['request'].user # Revert to getting user from context
        cliente = Cliente.objects.create(usuario=user, **validated_data)
        if endereco_data:
            endereco = Endereco.objects.create(**endereco_data)
            cliente.endereco = endereco
            cliente.save()
        return cliente

    def update(self, instance, validated_data):
        endereco_data = validated_data.pop('endereco', None)

        # Update Cliente fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update or create Endereco
        if endereco_data:
            if instance.endereco:
                for attr, value in endereco_data.items():
                    setattr(instance.endereco, attr, value)
                instance.endereco.save()
            else:
                endereco = Endereco.objects.create(**endereco_data)
                instance.endereco = endereco
                instance.save()
        elif instance.endereco: # If endereco_data is None but instance.endereco exists, delete it
            instance.endereco.delete()

        return instance

class VendedorSerializer(serializers.ModelSerializer):
    usuario = UserSerializer(read_only=True)
    endereco = EnderecoSerializer(required=False, allow_null=True)

    class Meta:
        model = Vendedor
        fields = '__all__'

    def create(self, validated_data):
        endereco_data = validated_data.pop('endereco', None)
        user = self.context['request'].user
        vendedor = Vendedor.objects.create(usuario=user, **validated_data)
        if endereco_data:
            endereco = Endereco.objects.create(**endereco_data)
            vendedor.endereco = endereco
            vendedor.save()
        return vendedor

    def update(self, instance, validated_data):
        endereco_data = validated_data.pop('endereco', None)

        # Update Vendedor fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Update or create Endereco
        if endereco_data:
            if instance.endereco:
                for attr, value in endereco_data.items():
                    setattr(instance.endereco, attr, value)
                instance.endereco.save()
            else:
                endereco = Endereco.objects.create(**endereco_data)
                instance.endereco = endereco
                instance.save()
        elif instance.endereco: # If endereco_data is None but instance.endereco exists, delete it
            instance.endereco.delete()

        return instance

class AvaliacaoLojaSerializer(serializers.ModelSerializer):
    class Meta:
        model = AvaliacaoLoja
        fields = '__all__'

class SugestaoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sugestao
        fields = '__all__'
        read_only_fields = ['usuario']

class ProdutosMonitoradosExternosSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProdutosMonitoradosExternos
        # Incluímos todos os campos para retornar o objeto completo ao frontend
        fields = ['id', 'vendedor', 'url_produto', 'nome_produto', 'preco_atual', 'ultima_coleta']
        read_only_fields = ['vendedor', 'ultima_coleta'] # Removed nome_produto and preco_atual

class MeusProdutosSerializer(serializers.ModelSerializer):
    nome_produto = serializers.CharField(source='sku.produto.nome', read_only=True)
    descricao = serializers.CharField(source='sku.produto.descricao', read_only=True)
    nome_categoria = serializers.CharField(source='sku.produto.subcategoria.categoria_loja.nome', read_only=True)
    variacao_formatada = serializers.SerializerMethodField()
    url_imagem = serializers.SerializerMethodField()

    class Meta:
        model = OfertaProduto
        fields = [
            'id', 
            'preco', 
            'quantidade_disponivel', 
            'nome_produto', 
            'descricao', 
            'nome_categoria', 
            'variacao_formatada', 
            'url_imagem'
        ]

    def get_variacao_formatada(self, obj):
        valores = obj.sku.valores.all().order_by('atributo__nome')
        return " - ".join([f"{v.atributo.nome}: {v.valor}" for v in valores])
    
    def get_url_imagem(self, obj):
        request = self.context.get('request')
        primeira_imagem = obj.sku.imagens.first()
        if primeira_imagem and primeira_imagem.imagem and request:
            return request.build_absolute_uri(primeira_imagem.imagem.url)
        
        # Use a imagem padrão se nenhuma imagem específica for encontrada
        default_image_url = request.build_absolute_uri(settings.MEDIA_URL + 'ia.png')
        return default_image_url
