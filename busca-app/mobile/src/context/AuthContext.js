import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';
import apiClient from '../../apiClient';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [usuario, setUsuario] = useState(null);
    const [token, setToken] = useState(null);
    const [carregando, setCarregando] = useState(true);
    const [splashConcluido, setSplashConcluido] = useState(false);

    useEffect(() => {
        const carregarToken = async () => {
            try {
                const tokenArmazenado = await AsyncStorage.getItem('token');

                if (tokenArmazenado) {
                    try {
                        
                        const tokenDecodificado = jwtDecode(tokenArmazenado);
                        console.log('Token decodificado:', tokenDecodificado);
                        
                        // Verificar se o token não expirou
                        if (tokenDecodificado.exp * 1000 < Date.now()) {
                            console.log('Token expirado, fazendo logout');
                            await logout();
                        } else {
                            
                            // Token válido, definir token e buscar dados completos do usuário
                            setToken(tokenArmazenado);

                            // Buscar dados completos do usuário da API
                            try {
                                
                                console.log('Buscando dados completos do usuário da API...');
                                
                                const response = await apiClient.get('/api/perfil/', {
                                    headers: {
                                        'Authorization': `Bearer ${tokenArmazenado}`
                                    }
                                });
                                
                                const dadosUsuarioCompletos = response.data;
                                console.log('Dados do usuário da API:', dadosUsuarioCompletos);
                                
                                // Os dados podem vir em estruturas diferentes dependendo do tipo de usuário
                                let usuarioData, email_verificado, perfil_completo;
                                
                                if (dadosUsuarioCompletos.usuario) {
                                    // Estrutura para vendedor: dados estão dentro de 'usuario'
                                    usuarioData = dadosUsuarioCompletos.usuario;
                                    email_verificado = usuarioData.email_verificado;
                                    
                                    // Para vendedor, verificar se perfil está completo baseado na existência de dados obrigatórios
                                    perfil_completo = !!(
                                        dadosUsuarioCompletos.nome_loja && 
                                        dadosUsuarioCompletos.cnpj && 
                                        dadosUsuarioCompletos.endereco &&
                                        usuarioData.email_verificado
                                    );
                                } else {
                                    // Estrutura para cliente: dados diretos no objeto raiz
                                    usuarioData = dadosUsuarioCompletos;
                                    email_verificado = usuarioData.email_verificado;
                                    perfil_completo = usuarioData.perfil_completo;
                                }

                                const usuarioFormatado = {
                                    id: usuarioData.id || tokenDecodificado.user_id,
                                    tipoUsuario: usuarioData.tipo_usuario || tokenDecodificado.tipo_usuario,
                                    email_verificado: email_verificado,
                                    perfil_completo: perfil_completo
                                };
                                
                                console.log('Estrutura detectada:', dadosUsuarioCompletos.usuario ? 'Vendedor (aninhada)' : 'Cliente (direta)');
                                console.log('Email verificado extraído:', email_verificado);
                                console.log('Perfil completo calculado:', perfil_completo);
                                
                                console.log('AuthContext - Dados do usuário carregados:', usuarioFormatado);
                                setUsuario(usuarioFormatado);

                            } catch (apiError) {    
                                
                                console.error('Erro ao buscar dados do usuário da API:', apiError);
                                
                                // Se não conseguir buscar da API, usar dados básicos do token
                                // mas marcar email_verificado e perfil_completo como false para forçar verificação
                                const dadosUsuario = { 
                                    id: tokenDecodificado.user_id, 
                                    tipoUsuario: tokenDecodificado.tipo_usuario, 
                                    email_verificado: false, // Forçar verificação se API falhar
                                    perfil_completo: false // Forçar completar perfil se API falhar
                                };
                                
                                console.log('AuthContext - Usando dados básicos do token (API falhou):', dadosUsuario);
                                setUsuario(dadosUsuario);
                                
                            }
                        } 
                    
                    }   catch (error) {
                        console.error("Token inválido", error);
                        await logout();
                    }
                
                } else {
                    console.log('Nenhum token encontrado');
                }
            
            } catch (error) {
                console.error('Erro ao carregar token:', error);
            
            } finally {
                setCarregando(false);
            }
        };
        
        carregarToken();
    }, []);

    const terminarSplash = () => {
        setSplashConcluido(true);
    };

    const login = async (novoToken, dadosUsuario) => {
        try {
            console.log('AuthContext - Iniciando login com:', { novoToken: novoToken ? 'presente' : 'ausente', dadosUsuario });
            
            // Salvar token no storage
            await AsyncStorage.setItem('token', novoToken);
            setToken(novoToken);
            
            // Usar dados do usuário fornecidos pelo backend
            const usuarioFormatado = {
                id: dadosUsuario.id || dadosUsuario.user_id,
                tipoUsuario: dadosUsuario.tipo_usuario || dadosUsuario.tipo,
                email_verificado: dadosUsuario.email_verificado,
                perfil_completo: dadosUsuario.perfil_completo
            };
            
            console.log('AuthContext - Dados do usuário formatados:', usuarioFormatado);
            setUsuario(usuarioFormatado);
            
        } catch (error) {
            console.error('Erro durante o login:', error);
            throw error;
        }
    };

    const atualizarStatusPerfil = (status) => {
        console.log('AuthContext - Atualizando status do perfil para:', status);
        setUsuario(utilizadorAtual => ({
            ...utilizadorAtual, 
            perfil_completo: status
        }));
    };

    const atualizarStatusEmail = (status) => {
        console.log('AuthContext - Atualizando status do email para:', status);
        setUsuario(utilizadorAtual => ({
            ...utilizadorAtual, 
            email_verificado: status
        }));
    };

    const logout = async () => {
        try {
            console.log('AuthContext - Fazendo logout');
            await AsyncStorage.removeItem('token');
            setToken(null);
            setUsuario(null);
            setSplashConcluido(false);
        } catch (error) {
            console.error('Erro durante logout:', error);
        }
    };

    const refreshUser = async () => {
        if (!token) {
            console.log('RefreshUser: Sem token disponível');
            return;
        }

        try {
            console.log('AuthContext - Refreshing user data...');
            const response = await apiClient.get('/api/me/', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const dadosUsuarioCompletos = response.data;
            
            // Usar a mesma lógica de extração de dados
            let usuarioData, email_verificado, perfil_completo;
            
            if (dadosUsuarioCompletos.usuario) {
                // Estrutura para vendedor: dados estão dentro de 'usuario'
                usuarioData = dadosUsuarioCompletos.usuario;
                email_verificado = usuarioData.email_verificado;
                
                // Para vendedor, verificar se perfil está completo baseado na existência de dados obrigatórios
                perfil_completo = !!(
                    dadosUsuarioCompletos.nome_loja && 
                    dadosUsuarioCompletos.cnpj && 
                    dadosUsuarioCompletos.endereco &&
                    usuarioData.email_verificado
                );
            } else {
                // Estrutura para cliente: dados diretos no objeto raiz
                usuarioData = dadosUsuarioCompletos;
                email_verificado = usuarioData.email_verificado;
                perfil_completo = usuarioData.perfil_completo;
            }
            
            const usuarioAtualizado = {
                id: usuarioData.id,
                tipoUsuario: usuarioData.tipo_usuario,
                email_verificado: email_verificado,
                perfil_completo: perfil_completo,
            };
            
            console.log('AuthContext - Dados do usuário atualizados:', usuarioAtualizado);
            setUsuario(usuarioAtualizado);
            
        } catch (error) {
            console.error("Failed to refresh user data:", error);
            
            // Se o erro for de autenticação (401, 403), fazer logout
            if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                console.log('Erro de autenticação detectado, fazendo logout');
                await logout();
            }
        }
    };

    const valorDoContexto = {
        usuario,
        token,
        login,
        logout,
        carregando,
        terminarSplash,
        splashConcluido,
        refreshUser,
        atualizarStatusPerfil,
        atualizarStatusEmail
    };

    return (
        <AuthContext.Provider value={valorDoContexto}>
            {children}
        </AuthContext.Provider>
    );
};