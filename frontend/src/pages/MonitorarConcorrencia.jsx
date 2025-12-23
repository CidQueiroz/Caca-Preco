import React, { useState, useEffect, useContext, useRef } from 'react';
import apiClient from '../api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useMonitoring } from '../context/MonitoringContext';
import Botao from '../components/Botao';
import ListaProdutosMonitorados from '../components/ListaProdutosMonitorados';

const MonitorarConcorrencia = () => {
  const [url, setUrl] = useState('');
  const submittedUrl = useRef('');
  const { usuario } = useAuth();
  const { showNotification } = useNotification();
  const { setLastResult } = useMonitoring();

  const [loadingTaskId, setLoadingTaskId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isFormExpanded, setIsFormExpanded] = useState(true);

  const handleMonitorarSubmit = async (event) => {
    event.preventDefault();
    setLastResult(null);
    submittedUrl.current = url;

    try {
      const response = await apiClient.post('/api/scraper/monitorar/', { url });
      
      setLoadingTaskId(response.data.task_id);
      showNotification('Robô iniciado! Aguardando resposta...', 'info');
    } catch (error) {
      console.error("Erro ao iniciar monitoramento:", error);
      const errorMessage = error.response?.data?.error || 'Falha ao iniciar o monitoramento.';
      showNotification(errorMessage, 'erro');
    }
  };

  useEffect(() => {
    if (!loadingTaskId) return;

    const intervalId = setInterval(async () => {
      try {
        const response = await apiClient.get(`/api/scraper/status/${loadingTaskId}/`);
        const { status, result, error } = response.data;

        console.log("Status da Task:", status, result);

        if (status === 'SUCCESS' || status === 'FAILURE') {
          clearInterval(intervalId);
          setLoadingTaskId(null);

          if (status === 'SUCCESS') {
            const finalResult = { 
                ...result, 
                url_produto: submittedUrl.current 
            };
            
            setLastResult({ status: 'SUCCESS', data: finalResult });
            showNotification(`Sucesso! Preço encontrado: R$ ${result.preco_atual}`, "sucesso");
            setUrl(''); 
            
            setRefreshKey(prev => prev + 1);

          } else {
            const msg = error || "O robô não conseguiu ler este site.";
            setLastResult({ status: 'FAILURE', message: msg });
            showNotification(msg, "erro");
          }
        }
      } catch (error) {
        console.error("Erro no polling:", error);
        if (error.response && error.response.status >= 400) {
             clearInterval(intervalId);
             setLoadingTaskId(null);
             showNotification("Erro ao verificar status da tarefa.", 'erro');
        }
      }
    }, 3000); // Verifica a cada 3 segundos

    return () => clearInterval(intervalId);
  }, [loadingTaskId, showNotification, setLastResult]);

  const toggleFormExpansion = () => {
    setIsFormExpanded(!isFormExpanded);
  };

  return (
    <>
      <div className="layout-logado-content" style={{marginTop: '40px'}}>
        <div 
            onClick={toggleFormExpansion} 
            style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}
        >
            <h2 className="card-title">🕵️‍♀️ Monitorar Concorrente</h2>
            <span style={{ fontSize: '1.5rem', marginRight: '10px' }}>{isFormExpanded ? '−' : '+'}</span>
        </div>

        {isFormExpanded && (
          <div className="form-container" style={{ maxWidth: '700px', margin: '0 auto 40px auto', padding: '20px', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <p style={{ textAlign: 'center', marginBottom: '20px', color: '#666' }}>
              Cole a URL de um produto (Mercado Livre, Amazon, etc) e veja a mágica acontecer.
            </p>

            <form onSubmit={handleMonitorarSubmit}>
              <div className="form-group">
                <input
                  type="url"
                  id="urlInput"
                  className="form-control"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.mercadolivre.com.br/..."
                  required
                  disabled={!!loadingTaskId}
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                />
              </div>
              
              <div className="form-actions" style={{ marginTop: '15px', textAlign: 'center' }}>
                <Botao type="submit" variante="primario" disabled={!!loadingTaskId} style={{width: '100%'}}>
                  {loadingTaskId ? '⏳ Robô Trabalhando...' : '🔍 Buscar Preço'}
                </Botao>
              </div>
            </form>
          </div>
        )}

        {/* Lista que atualiza sozinha quando termina */}
        <ListaProdutosMonitorados key={refreshKey} />
      </div>
    </>
  );
};

export default MonitorarConcorrencia;