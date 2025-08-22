import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const MonitorarConcorrencia = () => {
  const [url, setUrl] = useState('');
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const { token } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro('');
    setResultado(null);

    try {
      // ATENÇÃO: Corrigindo a URL do endpoint para a que definimos no Django
      const response = await axios.post('/api/monitoramento/', { url }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json' // Boa prática adicionar
        },
      });
      setResultado(response.data);
      console.log('Resultado do monitoramento:', resultado);
    } catch (error) {
      console.error('Erro ao monitorar URL:', error);
      setErro(error.response?.data?.message || 'Falha ao monitorar o produto. Verifique a URL e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="monitor-container">
      <h1 className="apresentacao__conteudo__titulo">Monitorar Produto Concorrente</h1>
      <p className="subtitle">Insira a URL do produto que deseja monitorar e nós faremos o trabalho pesado para você.</p>

      <form onSubmit={handleSubmit} className="monitor-form">
        <div className="form-group">
          <label htmlFor="urlInput">URL do Produto:</label>
          <input
            type="url"
            id="urlInput"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Ex: https://www.loja.com.br/produto-x"
            required
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Monitorando...' : 'Monitorar Produto'}
        </button>
      </form>

      {erro && <p className="message-error">{erro}</p>}
      {/* Ajustando a exibição dos resultados para bater com o serializer do Django */}
      {resultado && (
        <div className="monitor-resultado">
          <h3>Resultado do Monitoramento:</h3>
          <p><strong>Produto:</strong> {resultado.nome_produto || 'N/A'}</p>
          <p><strong>Preço Encontrado:</strong> R$ {resultado.preco_atual || 'N/A'}</p>
          <p><strong>Última Atualização:</strong> {new Date(resultado.ultima_coleta).toLocaleString()}</p>
          <p className="message-success">Produto adicionado para monitoramento contínuo!</p>
        </div>
      )}
    </div>
  );
};

export default MonitorarConcorrencia;