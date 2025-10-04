import React from 'react';
import { ScrollView, Text, StyleSheet, View, Linking } from 'react-native';

// Componente reutilizável para seções de texto
const TextSection = ({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.h2}>{title}</Text>
    {children}
  </View>
);

const TelaTermos = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.h1}>Termos de Serviço</Text>
        <Text style={styles.p}><Text style={{fontWeight: 'bold'}}>Última atualização:</Text> 8 de agosto de 2025</Text>

        <TextSection title="1. Acordo com os Termos">
          <Text style={styles.p}>Ao usar o Caça-Preço, você concorda em ficar vinculado por estes Termos de Serviço. Se você não concordar com estes Termos, não use o Serviço.</Text>
        </TextSection>

        <TextSection title="2. Mudanças nos Termos">
          <Text style={styles.p}>Podemos modificar estes Termos a qualquer momento. Se fizermos alterações, iremos notificá-lo, publicando os Termos revisados no Site. É sua responsabilidade revisar estes Termos periodicamente.</Text>
        </TextSection>

        <TextSection title="3. Uso do Serviço">
          <Text style={styles.p}>Você concorda em usar o Serviço apenas para fins legais e de acordo com estes Termos. Você não usará o Serviço:</Text>
          <Text style={styles.li}>• De qualquer forma que viole qualquer lei ou regulamento aplicável.</Text>
          <Text style={styles.li}>• Para explorar, prejudicar ou tentar explorar ou prejudicar menores de qualquer forma.</Text>
          <Text style={styles.li}>• Para se passar ou tentar se passar pela Empresa, um funcionário da Empresa, outro usuário ou qualquer outra pessoa ou entidade.</Text>
        </TextSection>

        <TextSection title="4. Contas de Usuário">
          <Text style={styles.p}>Ao criar uma conta conosco, você deve nos fornecer informações precisas, completas e atuais em todos os momentos. A falha em fazer isso constitui uma violação dos Termos, o que pode resultar na rescisão imediata de sua conta em nosso Serviço.</Text>
        </TextSection>

        <TextSection title="5. Propriedade Intelectual">
          <Text style={styles.p}>O Serviço e seu conteúdo original, recursos e funcionalidades são e permanecerão propriedade exclusiva do Caça-Preço e de seus licenciadores.</Text>
        </TextSection>

        <TextSection title="6. Rescisão">
          <Text style={styles.p}>Podemos rescindir ou suspender sua conta imediatamente, sem aviso prévio ou responsabilidade, por qualquer motivo, incluindo, sem limitação, se você violar os Termos.</Text>
        </TextSection>

        <TextSection title="7. Limitação de Responsabilidade">
          <Text style={styles.p}>Em nenhuma circunstância o Caça-Preço, nem seus diretores, funcionários, parceiros, agentes, fornecedores ou afiliados, serão responsáveis por quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos.</Text>
        </TextSection>

        <TextSection title="8. Contato">
          <Text style={styles.p}>
            Se você tiver alguma dúvida sobre estes Termos, entre em contato conosco em: 
            <Text style={styles.link} onPress={() => Linking.openURL('mailto:termos@cacapreco.com')}> termos@cacapreco.com</Text>.
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
    lineHeight: 26,
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

export default TelaTermos;