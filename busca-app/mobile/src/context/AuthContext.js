import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(null);
    const [token, setToken] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [splashConcluido, setSplashConcluido] = useState(false);

    useEffect(() => {
        const carregarToken = async () => {
            const tokenArmazenado = await AsyncStorage.getItem('token');

            if (tokenArmazenado) {
                setToken(tokenArmazenado);
                try {
                    const tokenDecodificado = jwtDecode(tokenArmazenado);
                    if (tokenDecodificado.exp * 1000 < Date.now()) {
                        logout();
                    } else {
                        setUsuario({ id: tokenDecodificado.id, tipoUsuario: tokenDecodificado.tipo });
                    }
                } catch (error) {
                    console.error("Token inválido", error);
                    logout();
                }
            }
            // setCarregando(false);
        };
        carregarToken();
    },
 []);

    useEffect(() => {
        // Agora, o carregamento só termina quando o token é carregado E a splash é concluída.
        if (splashConcluido) {
            setCarregando(false);
        }
    }, [splashConcluido]);

    const terminarSplash = () => {
        setSplashConcluido(true);
    };

    const login = async (novoToken) => {
        await AsyncStorage.setItem('token', novoToken);
        setToken(novoToken);
        const tokenDecodificado = jwtDecode(novoToken);
        setUsuario({ id: tokenDecodificado.id, tipoUsuario: tokenDecodificado.tipo });
    };

    const logout = async () => {
        await AsyncStorage.removeItem('token');
        setToken(null);
        setUsuario(null);
    };

    const valorDoContexto = {
        usuario,
        token,
        login,
        logout,
        carregando,
        terminarSplash,
    };

    return <AuthContext.Provider value={valorDoContexto}>{children}</AuthContext.Provider>;
};