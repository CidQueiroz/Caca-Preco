import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../api';
import Botao from './Botao';
import { useNotification } from '../context/NotificationContext';

const ListaProdutosMonitorados = ({ refreshKey }) => {
    const [produtos, setProdutos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false); // Estado para controlar a visibilidade
    const { showNotification } = useNotification();

    const fetchProdutos = useCallback(async () => {
        setLoading(true);
        try {
            const response = await apiClient.get('/monitoramento/');
            setProdutos(response.data);
        } catch (error) {
            console.error("Erro ao buscar produtos monitorados:", error);
            showNotification('Erro ao buscar produtos monitorados.', 'erro');
        } finally {
            setLoading(false);
        }
    }, [showNotification]); // Adicionado showNotification como dependência do useCallback

    useEffect(() => {
        // Só busca os produtos se a seção estiver expandida.
        if (isExpanded) {
            fetchProdutos();
        }
    }, [isExpanded, refreshKey, fetchProdutos]); // Adicionado fetchProdutos

    const handleRemover = async (id) => {
        if (window.confirm("Tem certeza que deseja parar de monitorar este produto?")) {
            try {
                await apiClient.delete(`/monitoramento/${id}/`);
                showNotification('Produto removido do monitoramento.', 'sucesso');
                fetchProdutos(); // Re-fetch a lista
            } catch (error) {
                console.error("Erro ao remover produto:", error);
                showNotification('Erro ao remover produto.', 'erro');
            }
        }
    };

    const toggleExpansion = () => {
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="layout-logado-content" style={{marginTop: '40px'}}>
            <div 
                onClick={toggleExpansion} 
                style={{ cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
                <h2 className="card-title">Produtos Monitorados</h2>
                <span style={{ fontSize: '1.5rem', marginRight: '10px' }}>{isExpanded ? '−' : '+'}</span>
            </div>

            {isExpanded && (
                <>
                    {loading ? (
                        <p style={{textAlign: 'center', marginTop: '20px'}}>Carregando...</p>
                    ) : produtos.length > 0 ? (
                        <div className="list-view-container" style={{marginTop: '20px'}}>
                            <table className="product-table">
                                <thead>
                                    <tr>
                                        <th>Produto</th>
                                        <th>Último Preço</th>
                                        <th>Última Verificação</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {produtos.map(produto => (
                                        <tr key={produto.id}>
                                            <td>
                                                <a href={produto.url_produto} target="_blank" rel="noopener noreferrer">
                                                    {produto.nome_produto || 'N/A'}
                                                </a>
                                            </td>
                                            <td>R$ {produto.preco_atual || 'N/A'}</td>
                                            <td>{new Date(produto.ultima_coleta).toLocaleString()}</td>
                                            <td>
                                                <div className="botoes-acao">
                                                    <Botao onClick={() => handleRemover(produto.id)} variante="erro" className="btn-sm">Remover</Botao>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text" style={{marginTop: '20px'}}>Você ainda não está monitorando nenhum produto.</p>
                    )}
                </>
            )}
        </div>
    );
};

export default ListaProdutosMonitorados;
