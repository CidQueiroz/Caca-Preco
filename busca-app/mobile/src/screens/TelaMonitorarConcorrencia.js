
import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const TelaMonitorarConcorrencia = () => {
  const [url, setUrl] = useState('');
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const { token } = useContext(AuthContext);
  const apiUrl = Constants.expoConfig.extra.apiUrl;

  const handleSubmit = async () => {
    setLoading(true);
    setErro('');
    setResultado(null);

    try {
      const response = await axios.post('http://192.168.0.101:8000/api/monitoramento/add-url', { url }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setResultado(response.data);
    } catch (error) {
      console.error('Erro ao monitorar URL:', error);
      setErro(error.response?.data?.message || 'Falha ao monitorar o produto. Verifique a URL e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
      <ScrollView style={styles.container}>
        <Text style={styles.dashboardTitle}>Monitorar Produto Concorrente</Text>
        <Text style={styles.subtitle}>Insira a URL do produto que deseja monitorar e nós faremos o trabalho pesado para você.</Text>

        <View style={styles.form}>
          <Text style={styles.label}>URL do Produto:</Text>
          <TextInput
            style={styles.input}
            value={url}
            onChangeText={setUrl}
            placeholder="Ex: https://www.loja.com.br/produto-x"
            keyboardType="url"
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Monitorar Produto</Text>}
          </TouchableOpacity>
        </View>

        {erro && <Text style={styles.messageError}>{erro}</Text>}

        {resultado && (
          <View style={styles.resultadoContainer}>
            <Text style={styles.resultadoTitle}>Resultado do Monitoramento:</Text>
            <Text style={styles.resultadoText}><Text style={styles.bold}>Produto:</Text> {resultado.nomeProduto || 'N/A'}</Text>
            <Text style={styles.resultadoText}><Text style={styles.bold}>Preço Encontrado:</Text> R$ {resultado.preco || 'N/A'}</Text>
            <Text style={styles.resultadoText}><Text style={styles.bold}>Última Atualização:</Text> {new Date(resultado.dataColeta).toLocaleString()}</Text>
            <Text style={styles.messageSuccess}>Produto adicionado para monitoramento contínuo!</Text>
          </View>
        )}
      </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f2f5',
        padding: 20,
    },
    dashboardTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 30,
    },
    form: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    label: {
        fontSize: 16,
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        fontSize: 16,
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#6200ee',
        padding: 15,
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    messageError: {
        color: 'red',
        textAlign: 'center',
        marginTop: 20,
    },
    messageSuccess: {
        color: 'green',
        textAlign: 'center',
        marginTop: 10,
    },
    resultadoContainer: {
        marginTop: 30,
        padding: 20,
        backgroundColor: '#e6f7ff',
        borderRadius: 10,
    },
    resultadoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    resultadoText: {
        fontSize: 16,
        marginBottom: 5,
    },
    bold: {
        fontWeight: 'bold',
    },
});

export default TelaMonitorarConcorrencia;
