import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, ImageBackground } from 'react-native';
import { globalStyles, cores, fontes } from '../styles/globalStyles';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import Notification from '../components/Notification';
import Constants from 'expo-constants';

const TelaDashboardVendedor = ({ navigation }) => {
  const { token, usuario } = useContext(AuthContext);
  const [perfilVendedor, setPerfilVendedor] = useState(null);
  const userName = perfilVendedor?.nome_responsavel || 'Usuário';
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loadingAvaliacoes, setLoadingAvaliacoes] = useState(true);
  const [showSuggestionForm, setShowSuggestionForm] = useState(false);
  const [suggestionText, setSuggestionText] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });
  const [error, setError] = useState(null);
  const apiUrl = Constants.expoConfig.extra.apiUrl;

  useEffect(() => {
    const fetchPerfil = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/perfil/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data && response.data.nome_responsavel) {
          setPerfilVendedor(response.data.nome_responsavel);
        } else if (user?.email) { // Fallback para o email se nome_loja não estiver disponível
          setPerfilVendedor(user.email);
        }
      } catch (err) {
        console.error('Falha ao buscar perfil do vendedor:', err);
        if (user?.email) {
          setSellerName(user.email);
        }
      }
    };

    if (token && usuario?.tipo_usuario === 'Vendedor') { // Changed tipoUsuario to tipo_usuario
      fetchPerfil();
    }
  }, [token, usuario]);

  const handleSendSuggestion = async () => {
    if (!suggestionText.trim()) {
      showNotification('A sugestão não pode ser vazia.', 'error');
      return;
    }
    try {
      await axios.post(`${apiUrl}/api/sugestoes/`, { texto: suggestionText }, { // Updated endpoint and payload
        headers: { Authorization: `Bearer ${token}` }
      });
      showNotification('Sugestão enviada com sucesso!', 'success');
      setSuggestionText('');
      setShowSuggestionForm(false);
    } catch (err) {
      showNotification('Falha ao enviar sugestão.', 'error');
      console.error(err);
      setError('Falha ao buscar suas avaliações.');
    }
  };

  const avaliacaoMedia = avaliacoes.length > 0
    ? (avaliacoes.reduce((acc, curr) => acc + curr.Nota, 0) / avaliacoes.length).toFixed(2)
    : 'N/A';

  useEffect(() => {
    const fetchAvaliacoes = async () => {
      try {
        const response = await axios.get(`${apiUrl}/api/avaliacoes/`, { // Updated endpoint
          headers: { Authorization: `Bearer ${token}` }
        });
        setAvaliacoes(response.data);
      } catch (err) {
        showNotification('Falha ao buscar suas avaliações.', 'error');
        console.error(err);
        setError('Falha ao buscar suas avaliações.');
      }
      setLoadingAvaliacoes(false);
    };

    if (token) {
      fetchAvaliacoes();
    }
  }, [token]);

  const produtosMaisAcessados = [
    { id: 1, nome: 'Produto A', acessos: 150 },
    { id: 2, nome: 'Produto B', acessos: 120 },
    { id: 3, nome: 'Produto C', acessos: 95 },
  ];

  return (
      <ImageBackground 
        source={require('../../assets/ia.png')} 
        style={globalStyles.backgroundImage}
        imageStyle={{ opacity: 0.2 }}
      >
        <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Notification
          message={notification.message}
          type={notification.type}
          onHide={() => setNotification({ message: '', type: '' })}
        />
        <Text style={globalStyles.title}>Dashboard do Vendedor</Text>
        <Text style={styles.welcomeText}>Bem-vindo, {userName}!</Text>

        {/* Seção de Gerenciamento de Produtos */}
        <View style={styles.card}>
          <Text style={styles.cardIcon}>📦</Text>
          <Text style={styles.cardTitle}>Gerenciamento de Produtos</Text>
          <Text style={styles.cardText}>Visualize, edite e adicione novos produtos.</Text>
          <TouchableOpacity style={[globalStyles.button, globalStyles.buttonPrimary]} onPress={() => navigation.navigate('MeusProdutos')}>
            <Text style={globalStyles.buttonText}>Gerenciar Meus Produtos</Text>
          </TouchableOpacity>
        </View>

        {/* Seção de Análise */}
        <View style={styles.card}>
          <Text style={styles.cardIcon}>📈</Text>
          <Text style={styles.cardTitle}>Produtos Mais Acessados</Text>
          <Text style={styles.cardText}>Acompanhe quais produtos estão gerando mais interesse.</Text>
          {produtosMaisAcessados.map(produto => (
            <Text key={produto.id} style={styles.listItem}>
              {produto.nome} - <Text style={{ fontWeight: 'bold' }}>{produto.acessos} visualizações</Text>
            </Text>
          ))}
          {/* Botão Monitoramento de Concorrência (Premium) */}
          <TouchableOpacity style={[globalStyles.button, globalStyles.buttonPrimary, { marginTop: 10 }]} onPress={() => navigation.navigate('AnaliseMercadoSaaS')}>
            <Text style={globalStyles.buttonText}>Monitorar Concorrência (Premium)</Text>
          </TouchableOpacity>
        </View>

        {/* Seção de Conta */}
        <View style={styles.card}>
          <Text style={styles.cardIcon}>⚙️</Text>
          <Text style={styles.cardTitle}>Minha Conta</Text>
          <Text style={styles.cardText}>Edite suas informações de perfil e dados da loja.</Text>
          <TouchableOpacity style={[globalStyles.button, globalStyles.buttonSecondary]} onPress={() => navigation.navigate('EditarPerfilVendedor')}>
            <Text style={globalStyles.buttonText}>Editar Perfil e Dados da Loja</Text>
          </TouchableOpacity>
          <Text style={styles.smallText}><Text style={{ fontWeight: 'bold' }}>Obs:</Text> A alteração de dados como CNPJ requer aprovação de um administrador.</Text>
        </View>

        

        {/* Seção de Feedback e Comunidade */}
        <View style={styles.card}>
          <Text style={styles.cardIcon}>⭐</Text>
          <Text style={styles.cardTitle}>Feedback</Text>
          {loadingAvaliacoes ? (
            <ActivityIndicator size="small" color="#0000ff" />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : (
            <>
              <Text style={styles.cardText}>Avaliação Média: <Text style={{ fontWeight: 'bold' }}>{avaliacaoMedia}</Text></Text>
              {avaliacoes.length === 0 ? (
                <Text>Você ainda não possui avaliações.</Text>
              ) : (
                <Text>Você possui {avaliacoes.length} avaliação(ões).</Text>
              )}
              <TouchableOpacity
                style={[globalStyles.button, globalStyles.buttonSecondary, { marginTop: 10 }]}
                onPress={() => navigation.navigate('MinhasAvaliacoesDetalhe')}
                disabled={avaliacoes.length === 0}
              >
                <Text style={globalStyles.buttonText}>Ver Todas as Avaliações</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={[globalStyles.button, globalStyles.buttonSecondary, { marginTop: 10 }]}
            onPress={() => setShowSuggestionForm(!showSuggestionForm)}
          >
            <Text style={globalStyles.buttonText}>{showSuggestionForm ? 'Cancelar Sugestão' : 'Enviar Sugestão'}</Text>
          </TouchableOpacity>

          {showSuggestionForm && (
            <View style={{ marginTop: 20, width: '100%' }}>
              <TextInput
                placeholder="Digite sua sugestão aqui..."
                value={suggestionText}
                onChangeText={setSuggestionText}
                multiline
                numberOfLines={5}
                style={styles.textArea}
              />
              <TouchableOpacity style={[globalStyles.button, globalStyles.buttonPrimary]} onPress={handleSendSuggestion}>
                <Text style={globalStyles.buttonText}>Enviar Sugestão</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={[globalStyles.button, globalStyles.buttonPrimary, { marginTop: 10 }]}
            onPress={() => navigation.navigate('IndicarVendedor')}
          >
            <Text style={globalStyles.buttonText}>Indicar Novo Vendedor</Text>
          </TouchableOpacity>
        </View>

        
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  welcomeText: {
    textAlign: 'center',
    marginBottom: 30,
    fontSize: 16,
    color: '#333',
  },
  cardGrid: {
    // Em React Native, View é flexbox por padrão, então cardGrid pode ser apenas um container com flexWrap
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    padding: 10,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '95%', // Ajuste para ocupar quase toda a largura
    alignItems: 'center',
  },
  cardIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  cardText: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginBottom: 15,
  },
  listItem: {
    fontSize: 14,
    marginBottom: 5,
    color: '#333',
  },
  smallText: {
    fontSize: 12,
    marginTop: 10,
    color: '#777',
    textAlign: 'center',
  },
  textArea: {
    width: '100%',
    height: 100,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    textAlignVertical: 'top', // Para Android
  },
  messageInfo: {
    marginTop: 10,
    fontSize: 14,
    color: 'green', // Ou outra cor para mensagens de sucesso/erro
    textAlign: 'center',
  },
  errorText: {
    color: 'red',
    fontSize: 14,
    textAlign: 'center',
  },
  scrollViewContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 20, // Adicione um padding inferior para garantir que o conteúdo não fique cortado
  },
});

export default TelaDashboardVendedor;