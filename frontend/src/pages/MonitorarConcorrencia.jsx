import React, { useState, useEffect, useContext, useRef } from 'react';
import apiClient from '../api';
import { AuthContext } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useMonitoring } from '../context/MonitoringContext'; // Importa o novo contexto
import Botao from '../components/Botao';
import ListaProdutosMonitorados from '../components/ListaProdutosMonitorados';

const MonitorarConcorrencia = () => {
  const [url, setUrl] = useState('');
  const submittedUrl = useRef(''); // Ref para guardar a URL submetida
  const { usuario } = useContext(AuthContext);
  const { showNotification } = useNotification();
  const { setLastResult } = useMonitoring(); // Usa o contexto do monitoramento

  const [loadingTaskId, setLoadingTaskId] = useState(null);
  const [pollingIntervalId, setPollingIntervalId] = useState(null);
  
  const [refreshKey, setRefreshKey] = useState(0);
  const [isFormExpanded, setIsFormExpanded] = useState(false);

  const handleMonitorarSubmit = async (event) => {
    event.preventDefault();
    setLastResult(null); // Limpa o resultado anterior no dashboard
    submittedUrl.current = url; // Armazena a URL no ref

    if (pollingIntervalId) {
      clearInterval(pollingIntervalId);
    }

    try {
      const response = await apiClient.post('/iniciar-monitoramento/', { url });
      setLoadingTaskId(response.data.task_id);
      showNotification('Monitoramento iniciado... Por favor, aguarde.', 'info');
    } catch (error) {
      console.error("Erro ao iniciar monitoramento:", error);
      const errorMessage = error.response?.data?.detail || 'Falha ao iniciar o monitoramento.';
      showNotification(errorMessage, 'erro');
      setLastResult({ status: 'FAILURE', message: errorMessage });
    }
  };

  useEffect(() => {
    if (!loadingTaskId) return;

    const intervalId = setInterval(async () => {
      try {
        const response = await apiClient.get(`/task-status/${loadingTaskId}/`);
        const { status, result } = response.data;

        if (status === 'SUCCESS' || status === 'FAILURE') {
          clearInterval(intervalId);
          setLoadingTaskId(null);

          if (status === 'SUCCESS') {
            const parsedResult = JSON.parse(result);
            // Usa a URL do ref, que não muda com re-renderizações
            const finalResult = { ...parsedResult, url_produto: submittedUrl.current, usuario_id: usuario.id };
            setLastResult({ status: 'SUCCESS', data: finalResult });
            showNotification("Raspagem concluída! Verifique o resultado no seu dashboard.", "sucesso");
            setUrl(''); // Limpa o input sem re-disparar o efeito
            // Força a atualização da lista de produtos monitorados se a ação for salvar no dashboard
            setRefreshKey(prevKey => prevKey + 1);
          } else {
            const errorMessage = result?.error || "A raspagem do produto falhou.";
            setLastResult({ status: 'FAILURE', message: errorMessage });
            showNotification(errorMessage, "erro");
          }
        }
      } catch (error) {
        console.error("Erro ao verificar status da tarefa:", error);
        clearInterval(intervalId);
        setLoadingTaskId(null);
        const errorMessage = "Erro de comunicação ao verificar o status da tarefa.";
        setLastResult({ status: 'FAILURE', message: errorMessage });
        showNotification(errorMessage, 'erro');
      }
    }, 5000);

    setPollingIntervalId(intervalId);

    return () => clearInterval(intervalId);
  }, [loadingTaskId, usuario, showNotification, setLastResult]); // Remove 'url' das dependências

  const toggleFormExpansion = () => {
    setIsFormExpanded(!isFormExpanded);
  };

  return (
    <>
      <div className="layout-logado-content" style={{marginTop: '40px'}}>
        <div 
            onClick={toggleFormExpansion} 
            style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        >
            <h2 className="card-title">Monitorar Produto Concorrente</h2>
            <span style={{ fontSize: '1.5rem', marginRight: '10px' }}>{isFormExpanded ? '−' : '+'}</span>
        </div>

        {isFormExpanded && (
          <div className="form-container" style={{ maxWidth: '700px', margin: '20px auto' }}>
            <p style={{ textAlign: 'center', marginBottom: '30px', color: 'var(--cor-texto)' }}>
              Insira a URL do produto que deseja monitorar e nós faremos o trabalho pesado para você.
            </p>

            <form onSubmit={handleMonitorarSubmit}>
              <div className="form-group">
                <label htmlFor="urlInput">URL do Produto:</label>
                <input
                  type="url"
                  id="urlInput"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Ex: https://www.loja.com.br/produto-x"
                  required
                  disabled={!!loadingTaskId}
                />
              </div>
              <div className="form-actions" style={{ justifyContent: 'center' }}>
                <Botao type="submit" variante="primario" disabled={!!loadingTaskId}>
                  {loadingTaskId ? 'Monitorando...' : 'Monitorar Produto'}
                </Botao>
              </div>
            </form>
          </div>
        )}

        {loadingTaskId && (
          <div className="loading-message" style={{ marginTop: '20px', textAlign: 'center' }}>
            <p>🔎 Raspagem em andamento... Por favor, aguarde.</p>
          </div>
        )}

      </div>

      <ListaProdutosMonitorados refreshKey={refreshKey} />
    </>
  );
};

export default MonitorarConcorrencia;
