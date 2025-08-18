import React, { useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import BarraNavegacao from './BarraNavegacao';
import Footer from './Footer';
import { AuthContext } from '../context/AuthContext';

const Estrutura = ({ children }) => {
    const location = useLocation();
    // Usar o TOKEN como a fonte da verdade para o status de login.
    const { token } = useContext(AuthContext);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    // A verificação agora é baseada na existência do token.
    const isUserLoggedIn = !!token;

    return (
        <>
            <BarraNavegacao />
            {isUserLoggedIn ? (
                // Layout para usuários LOGADOS
                <main className="layout-logado-background">
                    <div className="layout-logado-content">
                        {children}
                    </div>
                </main>
            ) : (
                // Layout para usuários PÚBLICOS/OFFLINE
                <main className="apresentacao">
                    {children}
                </main>
            )}
            <Footer />
        </>
    );
};

export default Estrutura;