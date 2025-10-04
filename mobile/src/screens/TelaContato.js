import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Linking, ScrollView } from 'react-native';

// Dados dos links, para facilitar a manutenção
const socialLinks = [
  { name: 'Instagram', icon: require('../../assets/instagram.png'), url: 'https://www.instagram.com/ciddyqueiroz/' },
  { name: 'GitHub', icon: require('../../assets/github.png'), url: 'https://github.com/CidQueiroz' },
  { name: 'LinkedIn', icon: require('../../assets/linkedin.png'), url: 'https://www.linkedin.com/in/ciddy-queiroz/' },
  { name: 'Twitter', icon: require('../../assets/twitter.png'), url: 'https://x.com/cyrdQueiroz' },
  { name: 'Facebook', icon: require('../../assets/facebook1.png'), url: 'https://www.facebook.com/cyrd.queiroz' },
  { name: 'Email', icon: require('../../assets/email.png'), url: 'mailto:cydy.queiroz@gmail.com' },
  { name: 'WhatsApp', icon: require('../../assets/whatsapp.png'), url: 'https://wa.me/5521971583118' },
];

const TelaContato = () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Conecte-se Comigo</Text>
      <Text style={styles.subtitle}>Estou sempre aberto a novas oportunidades, colaborações e um bom bate-papo. Me encontre nas redes abaixo!</Text>
      
      <View style={styles.linksGrid}>
        {socialLinks.map((item, index) => (
          <TouchableOpacity key={index} style={styles.linkCard} onPress={() => Linking.openURL(item.url)}>
            <Image source={item.icon} style={styles.icon} />
            <Text style={styles.linkText}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fdeff2', // Cor de fundo do frontend
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28, // Equivalente a 2.5rem
    fontFamily: 'Krona One', // Supondo que a fonte está carregada globalmente
    color: '#FF8383', // var(--cor-primaria)
    textAlign: 'center',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18, // Equivalente a 1.2rem
    color: '#333', // var(--cor-texto)
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 10,
  },
  linksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 20, // Espaçamento entre os cards
  },
  linkCard: {
    backgroundColor: '#FFFFFF', // Fundo branco para os cards
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    width: '45%', // Para ter 2 colunas
    aspectRatio: 1, // Para manter o card quadrado
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#A1D6CB', // var(--cor-terciaria)
  },
  icon: {
    width: 60,
    height: 60,
    marginBottom: 15,
  },
  linkText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF8383', // var(--cor-primaria)
    fontFamily: 'Montserrat-SemiBold', // Supondo que a fonte está carregada
  },
});

export default TelaContato;