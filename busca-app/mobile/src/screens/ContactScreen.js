import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Linking } from 'react-native';

const socialLinks = [
  { name: 'Instagram', icon: require('../../assets/instagram.png'), url: 'https://instagram.com/cydyqueiroz' },
  { name: 'GitHub', icon: require('../../assets/github.png'), url: 'https://github.com/cydyqueiroz' },
  { name: 'LinkedIn', icon: require('../../assets/linkedin.png'), url: 'https://linkedin.com/in/cydyqueiroz' },
  { name: 'Twitter', icon: require('../../assets/twitter.png'), url: 'https://twitter.com/cydyqueiroz' },
];

const ContactScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Conecte-se Comigo</Text>
      <Text style={styles.subtitle}>Estou sempre aberto a novas oportunidades, colaborações e um bom bate-papo. Me encontre nas redes abaixo!</Text>
      <View style={styles.linksContainer}>
        {socialLinks.map((item, index) => (
          <TouchableOpacity key={index} style={styles.link} onPress={() => Linking.openURL(item.url)}>
            <Image source={item.icon} style={styles.icon} />
            <Text style={styles.linkText}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
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
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  linksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  link: {
    alignItems: 'center',
    margin: 15,
  },
  icon: {
    width: 50,
    height: 50,
    marginBottom: 5,
  },
  linkText: {
    fontSize: 14,
  },
});

export default ContactScreen;
