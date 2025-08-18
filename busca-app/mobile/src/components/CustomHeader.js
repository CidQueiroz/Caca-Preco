import React, { useContext } from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import { globalStyles, cores, fontes } from '../styles/globalStyles';

const CustomHeader = () => {
  const navigation = useNavigation();
  const { logout } = useContext(AuthContext);
  const insets = useSafeAreaInsets();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Image
        source={require('../../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <TouchableOpacity style={styles.panelButton} onPress={() => navigation.navigate('DashboardVendedor')}> 
        <Text style={styles.panelButtonText}>Meu Painel</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.panelButton} onPress={handleLogout}> 
        <Text style={styles.panelButtonText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    height: 80, 
    borderBottomWidth: 1,
    borderBottomColor: cores.terciaria,
  },
  logo: {
    width: 80,
    height: 50,
  },
  panelButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 10,
  },
  panelButtonText: {
    color: cores.primaria,
    fontFamily: fontes.semiBold,
    fontSize: 16,
  },
});

export default CustomHeader;