import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { globalStyles, cores, fontes } from '../styles/globalStyles';

const TelaDashboardAnalise = () => {
  return (
    <ScrollView style={globalStyles.container}>
      <Text style={globalStyles.title}>Dashboard de Análise de Mercado</Text>

      <View style={styles.kpiGrid}>
        <View style={styles.kpiCard}>
          <Text style={styles.kpiTitle}>Seu Preço Médio</Text>
          <Text style={styles.kpiValue}>R$ 25,90</Text>
          <Text style={styles.kpiTrend}>+1.5%</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiTitle}>Média da Concorrência</Text>
          <Text style={styles.kpiValue}>R$ 25,05</Text>
          <Text style={styles.kpiTrend}>+1.0%</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiTitle}>Oportunidades</Text>
          <Text style={styles.kpiValue}>5 Produtos</Text>
          <Text style={styles.kpiDescription}>Onde seu preço é competitivo</Text>
        </View>

        <View style={styles.kpiCard}>
          <Text style={styles.kpiTitle}>Produtos Monitorados</Text>
          <Text style={styles.kpiValue}>120</Text>
          <Text style={styles.kpiDescription}>Total de itens em monitoramento</Text>
        </View>
      </View>

      <View style={styles.chartsGrid}>
        <View style={styles.chartCard}>
          <Text style={styles.chartTitleHeader}>Seu Preço vs. Concorrência (Últimos 7 dias)</Text>
          <Text style={styles.chartPlaceholder}>[Gráfico de Linha de Preços]</Text>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitleHeader}>Comparativo de Estoque</Text>
          <Text style={styles.chartPlaceholder}>[Gráfico de Barras de Estoque]</Text>
        </View>

        <View style={styles.chartCard}>
          <Text style={styles.chartTitleHeader}>Distribuição de Preços no Mercado</Text>
          <Text style={styles.chartPlaceholder}>[Gráfico de Pizza de Posicionamento]</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  kpiCard: {
    backgroundColor: cores.branco,
    borderRadius: 8,
    padding: 15,
    margin: 5,
    width: '45%', // Ajuste para 2 colunas
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  kpiTitle: {
    fontSize: 14,
    fontFamily: fontes.semiBold,
    color: cores.texto,
    marginBottom: 5,
    textAlign: 'center',
  },
  kpiValue: {
    fontSize: 24,
    fontFamily: fontes.bold,
    color: cores.primaria,
    marginBottom: 5,
  },
  kpiTrend: {
    fontSize: 12,
    color: 'green', // Ou vermelho para queda
  },
  kpiDescription: {
    fontSize: 12,
    color: cores.textoSecundario,
    textAlign: 'center',
  },
  chartsGrid: {
    marginBottom: 20,
  },
  chartCard: {
    backgroundColor: cores.branco,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  chartTitleHeader: {
    fontSize: 16,
    fontFamily: fontes.semiBold,
    color: cores.texto,
    marginBottom: 10,
    textAlign: 'center',
  },
  chartPlaceholder: {
    fontSize: 14,
    color: cores.textoSecundario,
    fontStyle: 'italic',
    marginTop: 20,
    marginBottom: 20,
  },
});

export default TelaDashboardAnalise;