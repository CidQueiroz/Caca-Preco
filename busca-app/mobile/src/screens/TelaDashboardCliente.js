import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { globalStyles, cores, fontes } from '../styles/globalStyles';
import { AuthContext } from '../context/AuthContext';
import MainLayout from '../components/MainLayout';

const TelaDashboardCliente = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const userName = user?.nome || 'Usuário';

  return (
    <MainLayout>
      <View style={globalStyles.container}>
        <Text style={globalStyles.title}>Painel do Cliente</Text>
        <Text style={styles.welcomeText}>
          Bem-vindo, {userName}!
        </Text>
        <View>
          <TouchableOpacity style={[globalStyles.button, globalStyles.buttonPrimary]}>
            <Text style={globalStyles.buttonText}>Buscar Produtos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[globalStyles.button, globalStyles.buttonSecondary, { marginTop: 10 }]}>
            <Text style={globalStyles.buttonText}>Histórico de Compras</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[globalStyles.button, globalStyles.buttonPrimary, { marginTop: 10 }]}>
            <Text style={globalStyles.buttonText}>Minha Economia</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[globalStyles.button, globalStyles.buttonSecondary, { marginTop: 10 }]}>
            <Text style={globalStyles.buttonText}>Alterar Dados</Text>
          </TouchableOpacity>
        </View>
      </View>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  welcomeText: {
    textAlign: 'center',
    marginBottom: 30,
    fontSize: 16,
    color: '#333',
  },
});

export default TelaDashboardCliente;
