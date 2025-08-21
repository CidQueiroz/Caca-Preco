import React, { useContext } from 'react';
import { View, Image, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import { globalStyles, cores, fontes } from '../styles/globalStyles';

const CustomHeader = () => {
  const navigation = useNavigation();
  // 1. Obtenha também o 'usuario' do seu contexto
  const { usuario, logout } = useContext(AuthContext);
  const insets = useSafeAreaInsets();

  const handleLogout = async () => {
    await logout();
  };

  // 2. Crie uma nova função para navegar para o painel correto
  const handlePanelPress = () => {
    // Verifica o tipo de utilizador e navega para o painel correspondente
    if (usuario?.tipoUsuario === 'Vendedor') {
      navigation.navigate('DashboardVendedor');
    } else if (usuario?.tipoUsuario === 'Cliente') {
      // Certifique-se de que 'DashboardCliente' é o nome correto da sua rota
      navigation.navigate('DashboardCliente'); 
    }
    // Se o tipo de utilizador não for reconhecido, não faz nada para evitar erros.
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Image
        source={require('../../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* 3. O botão "Meu Painel" agora chama a nova função handlePanelPress */}
      <TouchableOpacity style={styles.panelButton} onPress={handlePanelPress}> 
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
    paddingVertical: 10, // Ajustado para melhor aparência
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    // A altura será automática com base no padding e no safe area
    borderBottomWidth: 1,
    borderBottomColor: cores.terciaria,
  },
  logo: {
    width: 60, // Ajustado para um tamanho mais equilibrado
    height: 40,
  },
  panelButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 10,
    paddingVertical: 5, // Adicionado para uma área de clique maior
  },
  panelButtonText: {
    color: cores.primaria,
    fontFamily: fontes.semiBold,
    fontSize: 16,
  },
});

export default CustomHeader;