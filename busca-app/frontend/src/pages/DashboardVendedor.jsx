import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api';
import { AuthContext } from '../context/AuthContext';
import { useMonitoring } from '../context/MonitoringContext';
import Botao from '../components/Botao';
import { useNotification } from '../context/NotificationContext';

const DashboardVendedor = () => {
  const navigate = useNavigate();
  const { token, user } = useContext(AuthContext);
  const { showNotification } = useNotification();
  const { lastResult, setLastResult } = useMonitoring();

  const [sellerName, setSellerName] = useState('Usuário');
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loadingAvaliacoes, setLoadingAvaliacoes] = useState(true);
  const [showSuggestionForm, setShowSuggestionForm] = useState(false);
  const [suggestionText, setSuggestionText] = useState('');

  const handleSaveResult = async () => {
    if (!lastResult || !lastResult.data) return;

    try {
      await apiClient.post('/salvar-monitoramento/', lastResult.data);
      showNotification('Produto salvo e monitoramento iniciado!', 'sucesso');
      setLastResult(null); // Limpa o card após salvar
    } catch (error) {
      console.error("Erro ao salvar resultado:", error);
      showNotification(error.response?.data?.error || 'Erro ao salvar o produto.', 'erro');
    }
  };

  const handleDiscardResult = () => {
    setLastResult(null);
  };

  const handleSendSuggestion = async () => {
    if (!suggestionText.trim()) {
      showNotification('A sugestão não pode ser vazia.', 'erro');
      return;
    }
    try {
      await apiClient.post('/sugestoes/', { texto: suggestionText });
      showNotification('Sugestão enviada com sucesso!', 'sucesso');
      setSuggestionText('');
      setShowSuggestionForm(false);
    } catch (err) {
      showNotification('Falha ao enviar sugestão.', 'erro');
      console.error(err);
    }
  };

  const avaliacaoMedia = avaliacoes.length > 0
    ? (avaliacoes.reduce((acc, curr) => acc + curr.nota, 0) / avaliacoes.length).toFixed(2)
    : 'N/A';

  useEffect(() => {
    const fetchAvaliacoes = async () => {
      if (!token) return;
      try {
        const response = await apiClient.get('/avaliacoes/');
        setAvaliacoes(response.data);
      } catch (err) {
        showNotification('Falha ao buscar suas avaliações.', 'erro');
        console.error(err);
      }
      setLoadingAvaliacoes(false);
    };

    const fetchSellerProfile = async () => {
      if (!token) return;
      try {
        const response = await apiClient.get('/perfil/');
        if (response.data && response.data.nome_responsavel) {
          setSellerName(response.data.nome_responsavel);
        } else if (user?.email) {
          setSellerName(user.email);
        }
      } catch (err) {
        console.error("Falha ao buscar perfil do vendedor:", err);
        if (user?.email) {
          setSellerName(user.email);
        }
      }
    };

    fetchAvaliacoes();
    fetchSellerProfile();
  }, [token, user, showNotification]);

  const produtosMaisAcessados = [
    { id: 1, nome: 'Produto A', acessos: 150 },
    { id: 2, nome: 'Produto B', acessos: 120 },
    { id: 3, nome: 'Produto C', acessos: 95 },
  ];

  const renderMonitoringCard = () => {
    if (!lastResult) return null;

    const cardStyle = {
      width: '100%',
      padding: '20px',
      marginBottom: '20px',
      borderRadius: '8px',
      border: '1px solid',
      color: '#fff',
    };

    if (lastResult.status === 'SUCCESS') {
      return (
        <div style={{ ...cardStyle, backgroundColor: 'var(--cor-sucesso-clara)', borderColor: 'var(--cor-sucesso)' }}>
          <h3 style={{ marginTop: 0 }}>Monitoramento Concluído com Sucesso!</h3>
          <p><strong>Produto:</strong> {lastResult.data.nome_produto}</p>
          <p><strong>Preço Encontrado:</strong> R$ {lastResult.data.preco_atual}</p>
          <div className="botoes-acao" style={{ marginTop: '15px' }}>
            <Botao onClick={handleSaveResult} variante="sucesso">Salvar no Monitoramento</Botao>
            <Botao onClick={handleDiscardResult} variante="secundario" style={{ marginLeft: '10px' }}>Descartar</Botao>
          </div>
        </div>
      );
    }

    if (lastResult.status === 'FAILURE') {
      return (
        <div style={{ ...cardStyle, backgroundColor: 'var(--cor-erro-clara)', borderColor: 'var(--cor-erro)' }}>
          <h3 style={{ marginTop: 0 }}>Falha no Monitoramento</h3>
          <p>{lastResult.message}</p>
          <div className="botoes-acao" style={{ marginTop: '15px' }}>
            <Botao onClick={() => navigate('/monitorar-concorrencia')} variante="primario">Tentar Outro Link</Botao>
            <Botao onClick={handleDiscardResult} variante="secundario" style={{ marginLeft: '10px' }}>Descartar</Botao>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <h1 className="dashboard-title">Painel do Vendedor</h1>
      <p className="text" style={{ textAlign: 'center', marginBottom: '30px' }}>Bem-vindo, {sellerName}!</p>

      {renderMonitoringCard()}

      <div className="card-grid">

        {/* Seção de Gerenciamento de Produtos */}
        <div className="card">
          <span className="card-icon">📦</span>
          <h2 className="card-title">Gerenciamento de Produtos</h2>
          <p className="card-text">Visualize, edite e adicione novos produtos.</p>
          <Botao to="/meus-produtos" variante="secundario">Gerenciar Meus Produtos</Botao>
        </div>

        {/* Seção de Análise e SaaS */}
        <div className="card">
          <span className="card-icon">📈</span>
          <h2 className="card-title">Análises e Estatísticas</h2>
          <p className="card-text">Acompanhe quais produtos estão gerando mais interesse.</p>
          <ul>
            {produtosMaisAcessados.map(produto => (
              <li key={produto.id} className="text" style={{ marginBottom: '5px' }}>
                {produto.nome} - <strong>{produto.acessos} visualizações</strong>
              </li>
            ))}
          </ul>
          <Botao to="/analise-de-mercado" variante="secundario" style={{marginTop: '20px'}}>Monitorar Concorrência (Premium)</Botao>
        </div>

        {/* Seção de Conta */}
        <div className="card">
          <span className="card-icon">⚙️</span>
          <h2 className="card-title">Minha Conta</h2>
          <p className="card-text">Edite suas informações de perfil e dados da loja.</p>
          <Botao to="/completar-perfil" variante="secundario">Editar Perfil e Dados da Loja</Botao>
          <p className="text" style={{ fontSize: '0.8rem', marginTop: '10px' }}><small>Obs: A alteração de dados como CNPJ requer aprovação de um administrador.</small></p>
        </div>

        {/* Seção de Feedback e Comunidade */}
        <div className="card">
          <span className="card-icon">⭐</span>
          <h2 className="card-title">Minha Conta</h2>
          {loadingAvaliacoes ? (
            <p>Carregando avaliações...</p>
          ) : (
            <>
              <p className="card-text">Avaliação Média: <strong>{avaliacaoMedia}</strong></p>
              {avaliacoes.length === 0 ? (
                <p>Você ainda não possui avaliações.</p>
              ) : (
                <p>Você possui {avaliacoes.length} avaliação(ões).</p>
              )}
              <Botao 
                to="/minhas-avaliacoes"
                variante="secundario"
                style={{ marginTop: '10px' }}
                disabled={avaliacoes.length === 0}
              >
                Ver Todas as Avaliações
              </Botao>
            </>
          )}

          <Botao 
            onClick={() => setShowSuggestionForm(!showSuggestionForm)}
            variante="secundario"
            style={{ marginTop: '10px' }}
          >
            {showSuggestionForm ? 'Cancelar Sugestão' : 'Enviar Sugestão'}
          </Botao>

          {showSuggestionForm && (
            <div style={{ marginTop: '20px', width: '100%' }}>
              <textarea
                placeholder="Digite sua sugestão aqui..."
                value={suggestionText}
                onChange={(e) => setSuggestionText(e.target.value)}
                rows="5"
                className="form-control"
                style={{ width: '100%', marginBottom: '10px' }}
              ></textarea>
              <Botao onClick={handleSendSuggestion} variante="sucesso">
                Enviar Sugestão
              </Botao>
            </div>
          )}

          <Botao 
            to="/indicar-vendedor"
            variante="secundario"
            style={{ marginTop: '10px' }}
          >
            Indicar Novo Vendedor
          </Botao>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <Botao to="/" variante="primario">Voltar ao Início</Botao>
      </div>
    </>
  );
};

export default DashboardVendedor;
