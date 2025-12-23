import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import Botao from '../components/Botao';

const DashboardAdmin = () => {
    const [vendedoresPendentes, setVendedoresPendentes] = useState([]);
    const { token, usuario } = useAuth();
    const { showNotification } = useNotification();
    const nomeAdmin = usuario?.nome || 'Admin';

    const fetchVendedoresPendentes = useCallback(async () => {
        if (!token) return;
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/vendedores/?status_aprovacao=Pendente`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVendedoresPendentes(response.data);
        } catch (error) {
            showNotification('Erro ao buscar vendedores pendentes.', 'erro');
            console.error('Erro ao buscar vendedores pendentes:', error);
        }
    }, [token, showNotification]);

    useEffect(() => {
        fetchVendedoresPendentes();
    }, [fetchVendedoresPendentes]);

    const handleAprovacao = async (idVendedor, novoStatus) => {
        try {
            const endpoint = `${import.meta.env.VITE_API_URL}/api/vendedores/${idVendedor}/atualizar-status/`;
            await axios.post(endpoint, { status: novoStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showNotification(`Vendedor ${novoStatus === 'Aprovado' ? 'aprovado' : 'rejeitado'} com sucesso!`, 'sucesso');
            fetchVendedoresPendentes(); // Atualiza a lista
        } catch (error) {
            showNotification('Erro ao atualizar status do vendedor.', 'erro');
            console.error('Erro ao atualizar status:', error);
        }
    };

    return (
        <>
            <h1 className="dashboard-title">Painel do Administrador</h1>
            <p className="text" style={{ textAlign: 'center', marginBottom: '30px' }}>Bem-vindo(a), {nomeAdmin}!</p>

            <div className="card-grid">
                {/* Card 1: Gerenciamento de Usuários */}
                <div className="card">
                    <span className="card-icon">👥</span>
                    <h2 className="card-title">Gerenciamento de Usuários</h2>
                    <p className="card-text">Visualize e gerencie as contas de todos os clientes e vendedores na plataforma.</p>
                    <Botao to="/admin/gerenciar-vendedores" variante="primario">Gerenciar Vendedores</Botao>
                    <Botao to="/admin/gerenciar-clientes" variante="secundario" style={{marginTop: '10px'}}>Gerenciar Clientes</Botao>
                </div>

                {/* Card 2: Análise da Plataforma */}
                <div className="card">
                    <span className="card-icon">📊</span>
                    <h2 className="card-title">Estatísticas e Saúde da Plataforma</h2>
                    <p className="card-text">Acompanhe métricas de uso, desempenho e receita para garantir o crescimento do negócio.</p>
                    <Botao to="/admin/relatorios" variante="primario">Ver Relatório de Vendas (SaaS)</Botao>
                    <Botao to="/admin/monitoramento" variante="secundario" style={{marginTop: '10px'}}>Monitorar Atividade do Sistema</Botao>
                </div>

                {/* Card 3: Moderação de Conteúdo */}
                <div className="card">
                    <span className="card-icon">📝</span>
                    <h2 className="card-title">Moderação de Conteúdo</h2>
                    <p className="card-text">Mantenha a qualidade da plataforma revisando produtos, avaliações e denúncias de usuários.</p>
                    <Botao to="/admin/revisar-produtos" variante="primario">Revisar Produtos e Ofertas</Botao>
                    <Botao to="/admin/moderar-avaliacoes" variante="secundario" style={{marginTop: '10px'}}>Moderar Avaliações</Botao>
                </div>

                {/* Card 4: Suporte e Feedback */}
                <div className="card">
                    <span className="card-icon">💬</span>
                    <h2 className="card-title">Suporte e Feedback</h2>
                    <p className="card-text">Gerencie e responda às sugestões e solicitações de suporte enviadas por clientes e vendedores.</p>
                    <Botao to="/admin/sugestoes" variante="primario">Ver Sugestões de Usuários</Botao>
                    <Botao to="/admin/suporte" variante="secundario" style={{marginTop: '10px'}}>Gerenciar Tickets de Suporte</Botao>
                </div>
            </div>

            {/* Seção de Aprovações Pendentes como uma tabela separada */}
            <div className="layout-logado-content" style={{marginTop: '40px'}}>
                <h2 className="card-title">Aprovações Pendentes</h2>
                {vendedoresPendentes.length > 0 ? (
                    <div className="list-view-container">
                        <table className="product-table">
                            <thead>
                                <tr>
                                    <th>Nome da Loja</th>
                                    <th>CNPJ</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {vendedoresPendentes.map(vendedor => (
                                    <tr key={vendedor.usuario.id}>
                                        <td>{vendedor.nome_loja}</td>
                                        <td>{vendedor.cnpj}</td>
                                        <td>
                                            <div className="botoes-acao">
                                                <Botao onClick={() => handleAprovacao(vendedor.usuario.id, 'Aprovado')} variante="sucesso" className="btn-sm">Aprovar</Botao>
                                                <Botao onClick={() => handleAprovacao(vendedor.usuario.id, 'Rejeitado')} variante="erro" className="btn-sm">Rejeitar</Botao>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p className="text">Nenhum vendedor pendente de aprovação.</p>
                )}
            </div>
        </>
    );
};

export default DashboardAdmin;