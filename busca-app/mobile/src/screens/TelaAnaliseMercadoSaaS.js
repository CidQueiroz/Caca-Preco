
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { globalStyles, cores, fontes } from '../styles/globalStyles';

const TelaAnaliseMercadoSaaS = ({ navigation }) => {
  return (
      <ScrollView style={globalStyles.container}>
        <View style={styles.header}>
          <Text style={[globalStyles.title, styles.headerTitle]}>Potencialize Suas Vendas com Análise de Mercado Inteligente</Text>
          <Text style={[globalStyles.text, styles.headerSubtitle]}>Monitore seus concorrentes, otimize seus preços e venda mais. Tudo de forma automática.</Text>
        </View>

        <View style={styles.content}>
          <Text style={globalStyles.sectionTitle}>O Problema: Adivinhar o Preço Certo é Lento e Custa Caro</Text>
          <Text style={globalStyles.text}>
            Pequenos e médios e-commerces, vendedores de marketplace e dropshippers precisam constantemente monitorar os preços e o estoque de seus concorrentes para se manterem competitivos. Fazer isso manualmente é demorado, ineficiente e sujeito a erros.
          </Text>

          <Text style={globalStyles.sectionTitle}>A Solução: Nossa Plataforma de Monitoramento SaaS</Text>
          <Text style={globalStyles.text}>
            Nós criamos uma plataforma web onde você se cadastra e deixa a tecnologia trabalhar por você:
          </Text>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={globalStyles.text}>
              <Text style={globalStyles.bold}>Configure a Automação:</Text> Insira os links dos produtos dos concorrentes que deseja monitorar.
            </Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={globalStyles.text}>
              <Text style={globalStyles.bold}>Coleta de Dados Automática:</Text> Em intervalos definidos, nossa plataforma executa scripts para coletar preços, estoque e avaliações dos sites concorrentes.
            </Text>
          </View>
          <View style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={globalStyles.text}>
              <Text style={globalStyles.bold}>Dashboard Interativo:</Text> Visualize todos os dados em um painel de controle intuitivo, com análises, gráficos e alertas de oportunidade.
            </Text>
          </View>

          <View style={styles.ctaSection}>
            <Text style={globalStyles.sectionTitle}>Acesse agora o seu Dashboard de Análise</Text>
            <Text style={globalStyles.text}>Comece a explorar os dados e insights que preparamos para você.</Text>
            <TouchableOpacity style={[globalStyles.button, globalStyles.buttonPrimary]} onPress={() => navigation.navigate('TelaDashboardAnalise')}>
              <Text style={globalStyles.buttonText}>Acessar Análises</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[globalStyles.button, globalStyles.buttonSecondary]} onPress={() => navigation.navigate('TelaMonitorarConcorrencia')}>
              <Text style={globalStyles.buttonTextSecondary}>Monitorar Nova URL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: cores.primaria,
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    color: cores.branco,
    textAlign: 'center',
  },
  headerSubtitle: {
    color: cores.branco,
    textAlign: 'center',
    marginTop: 10,
  },
  content: {
    padding: 20,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bullet: {
    fontSize: 16,
    marginRight: 10,
    color: cores.texto,
  },
  ctaSection: {
    marginTop: 30,
    padding: 20,
    backgroundColor: cores.branco,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default TelaAnaliseMercadoSaaS;
