import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const RotaProtegida = ({ children, papeisPermitidos }) => {
    const { token, carregando, usuario } = useContext(AuthContext);
    const location = useLocation();

    // Novo log para depuração do estado de carregamento
    console.log('RotaProtegida - Carregando:', carregando);
    console.log('RotaProtegida - Usuario (do contexto):', usuario);
    console.log('RotaProtegida - Current Path:', location.pathname);

    // 1. Se ainda está carregando, exibe uma tela de espera.
    // Isso é crucial para evitar redirecionamentos prematuros.
    if (carregando) {
        return <div>Carregando...</div>;
    }

    // 2. Se não há token, redireciona para o login.
    if (!token) {
        console.log('RotaProtegida - Redirecionando para /login (sem token).');
        return <Navigate to="/login" replace />;
    }

    // A partir daqui, sabemos que o token existe e o usuário já foi carregado
    // (pois 'carregando' é false).
    
    // As variáveis `perfil_completo` e `email_verificado` devem ser obtidas do objeto `usuario`.
    const perfil_completo = usuario?.perfil_completo;
    const email_verificado = usuario?.email_verificado;
    const tipo_usuario = usuario?.tipo_usuario;

    // 3. Se o e-mail não for verificado, redireciona.
    if (!email_verificado && location.pathname !== '/verificar-email') {
        console.log('RotaProtegida - Redirecionando para /verificar-email (email não verificado).');
        return <Navigate to="/verificar-email" replace />;
    }

    // 4. Se o usuário está autenticado mas o perfil não está completo, redireciona.
    if (!perfil_completo && location.pathname !== '/completar-perfil') {
        console.log('RotaProtegida - Redirecionando para /completar-perfil (perfil não completo).');
        return <Navigate to="/completar-perfil" replace />;
    }

    // 5. Verifica permissões se necessário
    if (papeisPermitidos && !papeisPermitidos.includes(tipo_usuario)) {
        return <Navigate to="/nao-autorizado" replace />;
    }

    // Se tudo estiver ok, renderiza o conteúdo filho
    return children;
};

export default RotaProtegida;