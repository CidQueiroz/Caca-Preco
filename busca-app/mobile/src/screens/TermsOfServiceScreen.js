import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const TermsOfServiceScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Termos de Serviço</Text>
      <Text style={styles.paragraph}>
        Estes são os termos de serviço do Caça-Preço. Ao usar nossos serviços, você concorda com estes termos.
      </Text>
      <Text style={styles.subtitle}>Uso de Nossos Serviços</Text>
      <Text style={styles.paragraph}>
        Você deve seguir todas as políticas disponibilizadas a você dentro dos serviços. Não use nossos serviços indevidamente. Por exemplo, não interfira com nossos serviços ou tente acessá-los usando um método diferente da interface e das instruções que fornecemos.
      </Text>
      <Text style={styles.subtitle}>Sua Conta</Text>
      <Text style={styles.paragraph}>
        Você pode precisar de uma conta para usar alguns de nossos serviços. Você pode criar sua própria conta ou sua conta pode ser atribuída a você por um administrador. Se você estiver usando uma conta atribuída a você por um administrador, termos diferentes ou adicionais podem ser aplicados e seu administrador pode ser capaz de acessar ou desativar sua conta.
      </Text>
      <Text style={styles.subtitle}>Modificação e Rescisão de Nossos Serviços</Text>
      <Text style={styles.paragraph}>
        Estamos constantemente mudando e melhorando nossos serviços. Podemos adicionar ou remover funcionalidades ou recursos, e podemos suspender ou interromper um serviço completamente.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 16,
    marginBottom: 10,
    lineHeight: 24,
  },
});

export default TermsOfServiceScreen;
