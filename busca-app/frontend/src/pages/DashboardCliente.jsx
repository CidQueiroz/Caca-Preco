import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import Botao from '../components/Botao';
import { AuthContext } from '../context/AuthContext';

const DashboardCliente = () => {
    const { usuario } = useContext(AuthContext);
    const nomeUsuario = usuario?.nome || 'Cliente';

    return (
        <>
            <h1 className="dashboard-title">Painel do Cliente</h1>
            <p className="text" style={{ textAlign: 'center', marginBottom: '30px' }}>Bem-vindo(a), {nomeUsuario}!</p>

            <div className="card-grid">
                {/* Card 1: Busca e Economia */}
                <div className="card">
                    <span className="card-icon">🔍</span>
                    <h2 className="card-title">Buscar Preços e Economizar</h2>
                    <p className="card-text">Encontre os melhores preços de produtos perto de você e economize nas suas compras do dia a dia.</p>
                    <Botao to="/buscar-produtos" variante="primario">Buscar Produtos</Botao>
                    <Botao to="/ofertas" variante="secundario" style={{marginTop: '10px'}}>Ver Ofertas do Dia</Botao>
                </div>

                {/* Card 2: Minhas Listas de Compras */}
                <div className="card">
                    <span className="card-icon">📋</span>
                    <h2 className="card-title">Listas Inteligentes</h2>
                    <p className="card-text">Gerencie suas listas de compras para comparar preços de vários produtos de uma vez e otimizar seu tempo.</p>
                    <Botao to="/listas/nova" variante="primario">Criar Nova Lista</Botao>
                    <Botao to="/minhas-listas" variante="secundario" style={{marginTop: '10px'}}>Ver Minhas Listas</Botao>
                </div>

                {/* Card 3: Interação e Comunidade */}
                <div className="card">
                    <span className="card-icon">⭐</span>
                    <h2 className="card-title">Avaliações e Comunidade</h2>
                    <p className="card-text">Avalie lojas, veja o que outros clientes estão dizendo e ajude a comunidade a encontrar as melhores opções.</p>
                    <Botao to="/avaliar-loja" variante="primario">Deixar uma Avaliação</Botao>
                    <Botao to="/minhas-avaliacoes" variante="secundario" style={{marginTop: '10px'}}>Ver Minhas Avaliações</Botao>
                </div>

                {/* Card 4: Minha Conta */}
                <div className="card">
                    <span className="card-icon">👤</span>
                    <h2 className="card-title">Gerenciamento da Conta</h2>
                    <p className="card-text">Atualize suas informações de perfil, endereços de entrega e preferências de notificação.</p>
                    <Botao to="/completar-perfil" variante="primario">Editar Meu Perfil</Botao>
                    <Botao to="/enderecos" variante="secundario" style={{marginTop: '10px'}}>Gerenciar Endereços</Botao>
                </div>
            </div>
        </>
    );
};

export default DashboardCliente;
