import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    // Inicializa o usuario no estado de forma síncrona
    const [usuario, setUsuario] = useState(() => {
        const userSalvo = localStorage.getItem('usuario');
        try {
            return userSalvo ? JSON.parse(userSalvo) : null;
        } catch (e) {
            console.error("Erro ao parsear usuário do localStorage", e);
            return null;
        }
    });
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        const checkToken = () => {
            if (token) {
                try {
                    const tokenDecodificado = jwtDecode(token);
                    if (tokenDecodificado.exp * 1000 < Date.now()) {
                        console.log('AuthContext - Token expirado. Realizando logout.');
                        logout();
                    }
                } catch (error) {
                    console.error("AuthContext - Token inválido", error);
                    logout();
                }
            }
            setCarregando(false); // Termina o carregamento aqui, após a verificação
        };

        checkToken();
    }, [token]);

    const login = (novoToken, dadosUsuario) => {
        console.log('AuthContext - Dados do usuário recebidos na função login:', dadosUsuario);
        localStorage.setItem('token', novoToken);
        localStorage.setItem('usuario', JSON.stringify(dadosUsuario));
        setToken(novoToken);
        setUsuario(dadosUsuario);
        setCarregando(false); // Garante que o estado de carregamento é false após o login
        console.log('AuthContext - Estado do usuário após setUsuario:', dadosUsuario);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        setToken(null);
        setUsuario(null);
        setCarregando(false);
    };
    
    // A propriedade `perfil_completo` e `email_verificado` do objeto 'usuario'
    // devem ser usadas diretamente, pois são a fonte da verdade.
    const perfil_completo = usuario?.perfil_completo;
    const email_Verificado = usuario?.email_verificado;

    const valorDoContexto = {
        token,
        usuario,
        email: usuario?.email,
        perfil_completo,
        email_Verificado,
        login,
        logout,
        carregando, // Adiciona o estado de carregamento ao contexto
    };

    return <AuthContext.Provider value={valorDoContexto}>{children}</AuthContext.Provider>;
};