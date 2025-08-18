import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const DashboardVendedor = () => {
  const navigate = useNavigate();
  const { token, user } = useContext(AuthContext);
  const [sellerName, setSellerName] = useState('Usuário'); // Novo estado para o nome do vendedor
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loadingAvaliacoes, setLoadingAvaliacoes] = useState(true);
  const [showSuggestionForm, setShowSuggestionForm] = useState(false);
  const [suggestionText, setSuggestionText] = useState('');
  const [notification, setNotification] = useState({ message: '', type: '' });

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => {
        setNotification({ message: '', type: '' });
    }, 3000);
  };

  const handleSendSuggestion = async () => {
    if (!suggestionText.trim()) {
      showNotification('A sugestão não pode ser vazia.', 'error');
      return;
    }
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/sugestoes/`, { texto: suggestionText }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      showNotification('Sugestão enviada com sucesso!', 'success');
      setSuggestionText('');
      setShowSuggestionForm(false);
    } catch (err) {
      showNotification('Falha ao enviar sugestão.', 'error');
      console.error(err);
    }
  };

  const avaliacaoMedia = avaliacoes.length > 0
    ? (avaliacoes.reduce((acc, curr) => acc + curr.nota, 0) / avaliacoes.length).toFixed(2)
    : 'N/A';

  useEffect(() => {
    const fetchAvaliacoes = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/avaliacoes/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAvaliacoes(response.data);
      } catch (err) {
        showNotification('Falha ao buscar suas avaliações.', 'error');
        console.error(err);
      }
      setLoadingAvaliacoes(false);
    };

    const fetchSellerProfile = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/perfil/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data && response.data.nome_responsavel) {
          setSellerName(response.data.nome_responsavel);
        } else if (user?.email) { // Fallback para o email se nome_loja não estiver disponível
          setSellerName(user.email);
        }
      } catch (err) {
        console.error("Falha ao buscar perfil do vendedor:", err);
        if (user?.email) {
          setSellerName(user.email);
        }
      }
    };

    if (token) {
      fetchAvaliacoes();
      fetchSellerProfile();
    }
  }, [token, user]); // Adicionado 'user' como dependência para o fallback do email

  const produtosMaisAcessados = [
    { id: 1, nome: 'Produto A', acessos: 150 },
    { id: 2, nome: 'Produto B', acessos: 120 },
    { id: 3, nome: 'Produto C', acessos: 95 },
  ];

  return (
    <>
      {notification.message && (
        <div className={`notification ${notification.type}`}>
            {notification.message}
        </div>
      )}
      <h1 className="dashboard-title">Painel do Vendedor</h1>
      <p className="text" style={{ textAlign: 'center', marginBottom: '30px' }}>Bem-vindo, {sellerName}!</p>

      <div className="card-grid">

        {/* Seção de Gerenciamento de Produtos */}
        <div className="card">
          <span className="card-icon">📦</span>
          <h2 className="card-title">Gerenciamento de Produtos</h2>
          <p className="card-text">Visualize, edite e adicione novos produtos.</p>
          <button onClick={() => navigate('/meus-produtos')} className="btn btn-primary">Gerenciar Meus Produtos</button>
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
          <button onClick={() => navigate('/analise-de-mercado')} className="btn btn-secondary" style={{marginTop: '20px'}}>Monitorar Concorrência (Premium)</button>
        </div>

        {/* Seção de Conta */}
        <div className="card">
          <span className="card-icon">⚙️</span>
          <h2 className="card-title">Minha Conta</h2>
          <p className="card-text">Edite suas informações de perfil e dados da loja.</p>
          <button onClick={() => navigate('/editar-perfil-vendedor')} className="btn btn-secondary">Editar Perfil e Dados da Loja</button>
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
              <button 
                onClick={() => navigate('/minhas-avaliacoes')}
                className="btn btn-secondary"
                style={{ marginTop: '10px' }}
                disabled={avaliacoes.length === 0}
              >
                Ver Todas as Avaliações
              </button>
            </>
          )}

          <button 
            onClick={() => setShowSuggestionForm(!showSuggestionForm)}
            className="btn btn-secondary"
            style={{ marginTop: '10px' }}
          >
            {showSuggestionForm ? 'Cancelar Sugestão' : 'Enviar Sugestão'}
          </button>

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
              <button onClick={handleSendSuggestion} className="btn btn-success">
                Enviar Sugestão
              </button>
            </div>
          )}

          <button 
            onClick={() => navigate('/indicar-vendedor')}
            className="btn btn-primary"
            style={{ marginTop: '10px' }}
          >
            Indicar Novo Vendedor
          </button>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button onClick={() => navigate('/')} className="btn btn-secondary">Voltar ao Início</button>
      </div>
    </>
  );
};

export default DashboardVendedor;
