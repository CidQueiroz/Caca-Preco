
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import axios from 'axios';
import MainLayout from '../components/MainLayout';

const TelaBuscaProdutos = () => {
  const [termoBusca, setTermoBusca] = useState('');
  const [produtos, setProdutos] = useState([]);
  const [produtosFiltrados, setProdutosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const apiUrl = Constants.expoConfig.extra.apiUrl;

  useEffect(() => {
    const fetchProdutos = async () => {
      try {
        const response = await axios.get('${apiUrl}/api/produtos');
        setProdutos(response.data);
        setProdutosFiltrados(response.data);
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        setErro('Não foi possível carregar os produtos.');
      } finally {
        setLoading(false);
      }
    };

    fetchProdutos();
  }, []);

  const handleBusca = (text) => {
    setTermoBusca(text);
    if (text) {
      const filtrados = produtos.filter(produto =>
        produto.name.toLowerCase().includes(text.toLowerCase())
      );
      setProdutosFiltrados(filtrados);
    } else {
      setProdutosFiltrados(produtos);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.produtoCard}>
        <Image source={{ uri: item.imageUrl || 'https://via.placeholder.com/150' }} style={styles.produtoImagem} />
        <View style={styles.produtoInfo}>
            <Text style={styles.produtoNome}>{item.name}</Text>
            <Text style={styles.produtoDescricao}>{item.description}</Text>
            <Text style={styles.produtoPreco}>R$ {item.price}</Text>
        </View>
    </View>
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#6200ee" style={styles.loader} />;
  }

  if (erro) {
    return <Text style={styles.erro}>{erro}</Text>;
  }

  return (
    <MainLayout>
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="Buscar produtos..."
          value={termoBusca}
          onChangeText={handleBusca}
        />
        <FlatList
          data={produtosFiltrados}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
          ListEmptyComponent={<Text style={styles.listaVazia}>Nenhum produto encontrado.</Text>}
        />
      </View>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f2f5',
        padding: 10,
    },
    input: {
        height: 50,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 25,
        paddingHorizontal: 20,
        fontSize: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
    },
    produtoCard: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3,
        alignItems: 'center',
    },
    produtoImagem: {
        width: 80,
        height: 80,
        borderRadius: 10,
        marginRight: 15,
    },
    produtoInfo: {
        flex: 1,
    },
    produtoNome: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    produtoDescricao: {
        fontSize: 14,
        color: '#666',
        marginVertical: 5,
    },
    produtoPreco: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#6200ee',
    },
    loader: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    erro: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 16,
        color: 'red',
    },
    listaVazia: {
        textAlign: 'center',
        marginTop: 50,
        fontSize: 16,
        color: '#999',
    },
});

export default TelaBuscaProdutos;
