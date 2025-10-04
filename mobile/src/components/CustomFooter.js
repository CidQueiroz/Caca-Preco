import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { globalStyles, cores, fontes } from '../styles/globalStyles';

const CustomFooter = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <Text style={styles.footerText}>© 2025 <Text style={{fontWeight: 'bold'}}>CDK TECK</Text>. Todos os direitos reservados.</Text>
      <View style={styles.linksContainer}>
        <TouchableOpacity onPress={() => navigation.navigate('TelaPrivacidade')}>
          <Text style={styles.linkText}>Privacidade</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('TelaTermos')}>
          <Text style={styles.linkText}>Termos</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('TelaContato')}>
          <Text style={styles.linkText}>Contato</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#e2ebf1',
    paddingHorizontal: 15,
    paddingTop: 15, // Adicionado paddingTop para consistência
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: '#ccc',
  },
  footerText: {
    color: '#000000',
    fontSize: 12,
    fontFamily: fontes.secundaria,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  linksContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '80%',
  },
  linkText: {
    color: '#FF8383',
    fontSize: 12,
    fontFamily: fontes.semiBold,
  },
});

export default CustomFooter;