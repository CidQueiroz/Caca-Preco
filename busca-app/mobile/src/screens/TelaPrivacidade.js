import React from 'react';
import { ScrollView, Text, StyleSheet, View, Linking } from 'react-native';

// Componente reutilizável para seções de texto
const TextSection = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.h2}>{title}</Text>
    {children}
  </View>
);

const TelaPrivacidade = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.h1}>Política de Privacidade</Text>
        <Text style={styles.p}><Text style={{fontWeight: 'bold'}}>Última atualização:</Text> 8 de agosto de 2025</Text>

        <TextSection title="1. Introdução">
          <Text style={styles.p}>Bem-vindo ao Caça-Preço. A sua privacidade é importante para nós. Esta Política de Privacidade explica como coletamos, usamos, divulgamos e protegemos suas informações quando você usa nosso site e nossos serviços.</Text>
        </TextSection>

        <TextSection title="2. Informações que Coletamos">
          <Text style={styles.p}>Podemos coletar informações sobre você de várias maneiras. As informações que podemos coletar no Site incluem:</Text>
          <Text style={styles.li}>• <Text style={{fontWeight: 'bold'}}>Informações Pessoais:</Text> Informações de identificação pessoal, como seu nome, endereço de e-mail, número de telefone e informações demográficas.</Text>
          <Text style={styles.li}>• <Text style={{fontWeight: 'bold'}}>Informações de Pagamento:</Text> Podemos coletar dados relacionados aos seus pagamentos, como número do cartão de crédito, quando você efetua uma compra.</Text>
          <Text style={styles.li}>• <Text style={{fontWeight: 'bold'}}>Dados de Uso:</Text> Informações que seu navegador envia sempre que você visita nosso Site ou quando você acessa o Serviço por um dispositivo móvel.</Text>
        </TextSection>

        <TextSection title="3. Uso de Suas Informações">
          <Text style={styles.p}>Ter informações precisas sobre você nos permite fornecer uma experiência tranquila, eficiente e personalizada. Especificamente, podemos usar as informações coletadas sobre você para:</Text>
          <Text style={styles.li}>• Criar e gerenciar sua conta.</Text>
          <Text style={styles.li}>• Processar suas transações.</Text>
          <Text style={styles.li}>• Enviar a você um e-mail de boas-vindas e outras comunicações.</Text>
          <Text style={styles.li}>• Monitorar e analisar o uso e as tendências para melhorar sua experiência.</Text>
          <Text style={styles.li}>• Notificá-lo sobre atualizações do Site.</Text>
        </TextSection>

        <TextSection title="4. Divulgação de Suas Informações">
          <Text style={styles.p}>Não compartilharemos suas informações com terceiros, exceto nos seguintes casos:</Text>
          <Text style={styles.li}>• Com o seu consentimento.</Text>
          <Text style={styles.li}>• Para cumprir com a lei.</Text>
          <Text style={styles.li}>• Para proteger seus direitos.</Text>
          <Text style={styles.li}>• Em conexão com qualquer fusão ou venda de ativos da empresa.</Text>
        </TextSection>

        <TextSection title="5. Segurança de Suas Informações">
          <Text style={styles.p}>Usamos medidas de segurança administrativas, técnicas e físicas para ajudar a proteger suas informações pessoais. Esteja ciente de que, apesar de nossos esforços, nenhuma medida de segurança é perfeita ou impenetrável.</Text>
        </TextSection>

        <TextSection title="6. Contato">
          <Text style={styles.p}>
            Se você tiver alguma dúvida sobre esta Política de Privacidade, entre em contato conosco em: 
            <Text style={styles.link} onPress={() => Linking.openURL('mailto:privacidade@cacapreco.com')}> privacidade@cacapreco.com</Text>.
          </Text>
        </TextSection>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    padding: 25,
  },
  h1: {
    fontFamily: 'Krona One',
    color: '#FF8383',
    fontSize: 26,
    marginBottom: 20,
    textAlign: 'center',
  },
  h2: {
    fontFamily: 'Krona One',
    color: '#A19AD3',
    fontSize: 20,
    marginTop: 15,
    marginBottom: 10,
  },
  p: {
    fontFamily: 'Montserrat',
    fontSize: 16,
    lineHeight: 26, // 1.7x font size
    color: '#333',
    marginBottom: 15,
    textAlign: 'justify',
  },
  li: {
    fontFamily: 'Montserrat',
    fontSize: 16,
    lineHeight: 26,
    color: '#333',
    marginBottom: 10,
    paddingLeft: 10,
  },
  section: {
    marginBottom: 10,
  },
  link: {
    color: '#FF8383',
    textDecorationLine: 'underline',
  },
});

export default TelaPrivacidade;