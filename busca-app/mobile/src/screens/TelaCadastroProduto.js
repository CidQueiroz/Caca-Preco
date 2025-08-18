import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Image } from 'react-native';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { globalStyles, cores, fontes } from '../styles/globalStyles';
import Constants from 'expo-constants';
import Notification from '../components/Notification';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';
import MainLayout from '../components/MainLayout';

const TelaCadastroProduto = ({ navigation }) => {
  const { token } = useContext(AuthContext);
  const [todasSubcategorias, setTodasSubcategorias] = useState([]);
  const [nomeProduto, setNomeProduto] = useState('');
  const [descricao, setDescricao] = useState('');
  const [buscaSubcategoria, setBuscaSubcategoria] = useState('');
  const [sugestoes, setSugestoes] = useState([]);
  const [subcategoriaSelecionada, setSubcategoriaSelecionada] = useState(null);
  const [variacoes, setVariacoes] = useState([]);
  const [notification, setNotification] = useState({ message: '', type: '' });

  const showNotification = (message, type) => {
    setNotification({ message, type });
  };

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          showNotification('Desculpe, precisamos de permissões da galeria para isso funcionar!', 'error');
        }
      }
    })();

    const fetchSubcategories = async () => {
      try {
        const apiUrl = Constants.expoConfig.extra.apiUrl;
        const response = await axios.get(`${apiUrl}/categories/subcategories`);
        setTodasSubcategorias(response.data.map(sub => ({ id: sub.ID_Subcategoria, nome: sub.NomeSubcategoria })));
      } catch (error) {
        console.error('Erro ao buscar subcategorias:', error);
        showNotification('Erro ao carregar subcategorias. Tente novamente.', 'error');
      }
    };
    fetchSubcategories();
  }, []);

  useEffect(() => {
    if (buscaSubcategoria.length > 0) {
      const filtradas = todasSubcategorias.filter(sub =>
        sub.nome.toLowerCase().includes(buscaSubcategoria.toLowerCase())
      );
      setSugestoes(filtradas);
    } else {
      setSugestoes([]);
    }
  }, [buscaSubcategoria, todasSubcategorias]);

  const handleSelecionarSubcategoria = (sub) => {
    setSubcategoriaSelecionada(sub);
    setBuscaSubcategoria(sub.nome);
    setSugestoes([]);
  };

  const handleBlurSubcategoria = () => {
    if (buscaSubcategoria.trim() === '') {
      setSubcategoriaSelecionada(null);
      return;
    }

    if (subcategoriaSelecionada && subcategoriaSelecionada.nome.toLowerCase() === buscaSubcategoria.toLowerCase()) {
      return;
    }

    const matchedSub = todasSubcategorias.find(sub => sub.nome.toLowerCase() === buscaSubcategoria.toLowerCase());
    if (matchedSub) {
      setSubcategoriaSelecionada(matchedSub);
      setBuscaSubcategoria(matchedSub.nome);
    } else {
      setSubcategoriaSelecionada(null);
    }
  };

  const handleAdicionarVariacao = () => {
    setVariacoes([
      ...variacoes,
      {
        id: Date.now(),
        nomeVariacao: '',
        valorVariacao: '',
        preco: '',
        quantidadeDisponivel: '',
        imagens: [],
      },
    ]);
  };

  const handleRemoverVariacao = (id) => {
    setVariacoes(variacoes.filter(v => v.id !== id));
  };

  const handleVariacaoChange = (id, campo, valor) => {
    const novasVariacoes = variacoes.map(v => {
      if (v.id === id) {
        return { ...v, [campo]: valor };
      }
      return v;
    });
    setVariacoes(novasVariacoes);
  };

  const pickImage = async (variacaoId) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      handleVariacaoChange(variacaoId, 'imagens', [...variacoes.find(v => v.id === variacaoId).imagens, result.assets[0].uri]);
    }
  };

  const handleSubmit = async () => {
    if (!subcategoriaSelecionada) {
      showNotification('Por favor, selecione uma subcategoria válida.', 'error');
      return;
    }
    if (variacoes.length === 0) {
      showNotification('Adicione pelo menos uma variação para o produto.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('nomeProduto', nomeProduto);
    formData.append('descricao', descricao);
    formData.append('idSubcategoria', subcategoriaSelecionada.id);

    variacoes.forEach((variacao, index) => {
      formData.append(`variacoes[${index}][nomeVariacao]`, variacao.nomeVariacao);
      formData.append(`variacoes[${index}][valorVariacao]`, variacao.valorVariacao);
      formData.append(`variacoes[${index}][preco]`, variacao.preco);
      formData.append(`variacoes[${index}][quantidadeDisponivel]`, variacao.quantidadeDisponivel);

      variacao.imagens.forEach((imagemUri, imgIndex) => {
        const uriParts = imagemUri.split('.');
        const fileType = uriParts[uriParts.length - 1];
        const fileName = `imagem_${variacao.id}_${imgIndex}.${fileType}`;
        formData.append(`imagens`, {
          uri: imagemUri,
          name: fileName,
          type: `image/${fileType}`,
        });
      });
    });

    try {
      const apiUrl = Constants.expoConfig.extra.apiUrl;
      await axios.post(`${apiUrl}/produtos/completo`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      showNotification('Produto cadastrado com sucesso!', 'success');
      // Limpar o formulário ou navegar para outra tela
      setNomeProduto('');
      setDescricao('');
      setBuscaSubcategoria('');
      setSubcategoriaSelecionada(null);
      setVariacoes([]);
    } catch (error) {
      console.error('Erro ao cadastrar produto:', error);
      showNotification('Falha ao cadastrar o produto. Tente novamente.', 'error');
    }
  };

  return (
    <MainLayout>
      <ScrollView style={globalStyles.container}>
        <Notification
          message={notification.message}
          type={notification.type}
          onHide={() => setNotification({ message: '', type: '' })}
        />
        <Text style={globalStyles.title}>Cadastro de Produto</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Gerais do Produto</Text>
          <Text style={globalStyles.label}>Nome do Produto:</Text>
          <TextInput
            style={globalStyles.input}
            value={nomeProduto}
            onChangeText={setNomeProduto}
            placeholder="Nome do Produto"
          />
          <Text style={globalStyles.label}>Descrição:</Text>
          <TextInput
            style={[globalStyles.input, styles.textArea]}
            value={descricao}
            onChangeText={setDescricao}
            placeholder="Descrição do Produto"
            multiline
          />
          <Text style={globalStyles.label}>Buscar Subcategoria:</Text>
          <TextInput
            style={globalStyles.input}
            value={buscaSubcategoria}
            onChangeText={setBuscaSubcategoria}
            onBlur={handleBlurSubcategoria}
            placeholder="Digite para buscar subcategoria"
          />
          {sugestoes.length > 0 && (
            <View style={styles.suggestionsContainer}>
              {sugestoes.map(s => (
                <TouchableOpacity key={s.id} onPress={() => handleSelecionarSubcategoria(s)} style={styles.suggestionItem}>
                  <Text style={styles.suggestionText}>{s.nome}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {subcategoriaSelecionada && (
            <Text style={styles.selectedSubcategory}>Subcategoria Selecionada: {subcategoriaSelecionada.nome}</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Variações e Ofertas</Text>
          {variacoes.map((variacao, index) => (
            <View key={variacao.id} style={styles.variationContainer}>
              <Text style={styles.variationTitle}>Variação {index + 1}</Text>
              <Text style={globalStyles.label}>Nome da Variação (ex: Marca, Sabor):</Text>
              <TextInput
                style={globalStyles.input}
                value={variacao.nomeVariacao}
                onChangeText={(text) => handleVariacaoChange(variacao.id, 'nomeVariacao', text)}
                placeholder="Nome da Variação"
              />
              <Text style={globalStyles.label}>Valor da Variação (ex: Ninho, Morango):</Text>
              <TextInput
                style={globalStyles.input}
                value={variacao.valorVariacao}
                onChangeText={(text) => handleVariacaoChange(variacao.id, 'valorVariacao', text)}
                placeholder="Valor da Variação"
              />
              <Text style={globalStyles.label}>Preço (R$):</Text>
              <TextInput
                style={globalStyles.input}
                value={variacao.preco}
                onChangeText={(text) => handleVariacaoChange(variacao.id, 'preco', text)}
                keyboardType="numeric"
                placeholder="0.00"
              />
              <Text style={globalStyles.label}>Quantidade em Estoque:</Text>
              <TextInput
                style={globalStyles.input}
                value={variacao.quantidadeDisponivel}
                onChangeText={(text) => handleVariacaoChange(variacao.id, 'quantidadeDisponivel', text)}
                keyboardType="numeric"
                placeholder="0"
              />
              <TouchableOpacity onPress={() => pickImage(variacao.id)} style={[globalStyles.button, globalStyles.buttonSecondary, { marginTop: 10 }]}>
                <Text style={globalStyles.buttonText}>Selecionar Imagem</Text>
              </TouchableOpacity>
              <View style={styles.imagePreviewContainer}>
                {variacao.imagens.map((imageUri, imgIndex) => (
                  <Image key={imgIndex} source={{ uri: imageUri }} style={styles.imagePreview} />
                ))}
              </View>
              <TouchableOpacity onPress={() => handleRemoverVariacao(variacao.id)} style={[globalStyles.button, globalStyles.buttonDanger]}>
                <Text style={globalStyles.buttonText}>Remover Variação</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity onPress={handleAdicionarVariacao} style={[globalStyles.button, globalStyles.buttonSecondary]}>
            <Text style={globalStyles.buttonText}>+ Adicionar Variação</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleSubmit} style={[globalStyles.button, globalStyles.buttonSuccess]}>
          <Text style={globalStyles.buttonText}>Cadastrar Produto Completo</Text>
        </TouchableOpacity>
      </ScrollView>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  suggestionsContainer: {
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 5,
    maxHeight: 150,
    overflow: 'hidden',
    marginTop: 5,
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  suggestionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedSubcategory: {
    marginTop: 10,
    fontSize: 16,
    color: '#007bff',
    fontWeight: 'bold',
  },
  variationContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    backgroundColor: '#f9f9f9',
  },
  variationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#555',
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  imagePreview: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
  },
});

export default TelaCadastroProduto;