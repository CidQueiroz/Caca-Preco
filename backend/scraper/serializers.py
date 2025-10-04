from rest_framework import serializers
from .models import ProdutosMonitoradosExternos, HistoricoPrecos

class HistoricoPrecosSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistoricoPrecos
        fields = ['preco', 'data_coleta']

class ProdutosMonitoradosExternosSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProdutosMonitoradosExternos
        # Incluímos todos os campos para retornar o objeto completo ao frontend
        fields = ['id', 'vendedor', 'url_produto', 'nome_produto', 'preco_atual', 'ultima_coleta']
        read_only_fields = ['vendedor', 'ultima_coleta'] # Removed nome_produto and preco_atual

class ProdutosMonitoradosExternosComHistoricoSerializer(serializers.ModelSerializer):
    historico = HistoricoPrecosSerializer(many=True, read_only=True)
    variacao = serializers.SerializerMethodField()

    class Meta:
        model = ProdutosMonitoradosExternos
        fields = ['id', 'vendedor', 'url_produto', 'nome_produto', 'preco_atual', 'ultima_coleta', 'historico', 'variacao']

    def get_variacao(self, obj):
        historico = obj.historico.order_by('-data_coleta')[:2]
        if len(historico) == 2:
            preco_atual = historico[0].preco
            preco_anterior = historico[1].preco
            if preco_anterior > 0:
                return ((preco_atual - preco_anterior) / preco_anterior) * 100
        return None
