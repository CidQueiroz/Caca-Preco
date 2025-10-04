import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const PrivacyPolicyScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Política de Privacidade</Text>
      <Text style={styles.paragraph}>
        Esta é a política de privacidade do Caça-Preço. Ela descreve como coletamos, usamos e protegemos suas informações pessoais.
      </Text>
      <Text style={styles.subtitle}>Coleta de Informações</Text>
      <Text style={styles.paragraph}>
        Coletamos as seguintes informações pessoais:
      </Text>
      <Text style={styles.listItem}>- Nome</Text>
      <Text style={styles.listItem}>- Endereço de e-mail</Text>
      <Text style={styles.listItem}>- Senha (criptografada)</Text>
      <Text style={styles.listItem}>- Endereço</Text>
      <Text style={styles.subtitle}>Uso de Informações</Text>
      <Text style={styles.paragraph}>
        Usamos suas informações pessoais para:
      </Text>
      <Text style={styles.listItem}>- Fornecer e melhorar nossos serviços</Text>
      <Text style={styles.listItem}>- Personalizar sua experiência</Text>
      <Text style={styles.listItem}>- Enviar e-mails transacionais</Text>
      <Text style={styles.listItem}>- Proteger nossos direitos e propriedade</Text>
      <Text style={styles.subtitle}>Compartilhamento de Informações</Text>
      <Text style={styles.paragraph}>
        Não compartilhamos suas informações pessoais com terceiros, exceto conforme exigido por lei.
      </Text>
      <Text style={styles.subtitle}>Segurança</Text>
      <Text style={styles.paragraph}>
        Tomamos medidas razoáveis para proteger suas informações pessoais contra acesso, uso ou divulgação não autorizados.
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
  listItem: {
    fontSize: 16,
    marginBottom: 5,
    marginLeft: 10,
  },
});

export default PrivacyPolicyScreen;
