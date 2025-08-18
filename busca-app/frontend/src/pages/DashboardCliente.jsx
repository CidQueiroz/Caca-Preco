import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';


const DashboardCliente = () => {
  const { user } = useContext(AuthContext);
  const userName = user?.nome || 'Usuário';

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <div className="dashboard-background-layer"></div>
      <div className="dashboard-container">
        <h1 className="dashboard-title">Painel do Cliente</h1>
        <p className="text" style={{ textAlign: 'center', marginBottom: '30px' }}>
          Bem-vindo, {userName}!
        </p>
        <div>
          <button>Buscar Produtos</button>
          <button>Histórico de Compras</button>
          <button>Minha Economia</button>
          <button>Alterar Dados</button>
        </div>
      </div>
    </div>
  );
};

export default DashboardCliente;
