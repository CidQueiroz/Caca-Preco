import React, { useState, useEffect, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import Constants from 'expo-constants';
import axios from 'axios';
import { globalStyles, cores, fontes } from '../styles/globalStyles';
import Notification from '../components/Notification';
import MainLayout from '../components/MainLayout';

const TelaVerificarEmail = ({ route, navigation }) => {
    const { usuario, refreshUser, atualizarStatusEmail } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [carregando, setCarregando] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '' });
    
    // Verificar se há um token de verificação na URL (se aplicável)
    const { token } = route.params || {};
    const apiUrl = Constants.expoConfig.extra.apiUrl;

    // Definir email inicial baseado no usuário ou route params
    useEffect(() => {
        if (route.params?.email) {
            setEmail(route.params.email);
        } else if (usuario?.email) {
            setEmail(usuario.email);
        }
    }, [route.params?.email, usuario?.email]);

    const showNotification = (message, type) => {
        setNotification({ message, type });
        // Auto-hide notification after 5 seconds
        setTimeout(() => {
            setNotification({ message: '', type: '' });
        }, 5000);
    };

    useEffect(() => {
        if (token) {
            handleVerificarEmail(token);
        }
    }, [token]);

    const handleVerificarEmail = async (verificationToken) => {
        try {
            setCarregando(true);
            console.log('Verificando email com token:', verificationToken);
            
            const response = await axios.get(`${apiUrl}/api/verificar-email/${verificationToken}/`);
            
            showNotification('Seu e-mail foi verificado com sucesso!', 'success');
            
            // Atualizar status do email no contexto
            atualizarStatusEmail(true);
            
            // Refresh user data para garantir que está atualizado
            await refreshUser();
            
            Alert.alert(
                'Sucesso', 
                'Seu e-mail foi verificado com sucesso! O redirecionamento será feito automaticamente.',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            // O redirecionamento será automático via useEffect no App.js
                            // baseado no estado atualizado do usuário
                        }
                    }
                ]
            );
            
        } catch (error) {
            console.error('Erro ao verificar e-mail:', error.response ? error.response.data : error.message);
            
            let mensagemErro = 'Erro ao verificar e-mail. Token inválido ou expirado.';
            if (error.response?.data?.message) {
                mensagemErro = error.response.data.message;
            }
            
            showNotification(mensagemErro, 'error');
            Alert.alert('Erro', mensagemErro);
        } finally {
            setCarregando(false);
        }
    };

    const handleReenviarVerificacao = async () => {
        if (!email.trim()) {
            showNotification('Por favor, insira seu e-mail.', 'error');
            Alert.alert('Erro', 'Por favor, insira seu e-mail.');
            return;
        }

        // Validação básica de e-mail
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            showNotification('Por favor, insira um e-mail válido.', 'error');
            Alert.alert('Erro', 'Por favor, insira um e-mail válido.');
            return;
        }

        try {
            setCarregando(true);
            console.log('Reenviando verificação para:', email.trim());
            
            const response = await axios.post(`${apiUrl}/api/reenviar-verificacao/`, { 
                email: email.trim() 
            });
            
            showNotification('Um novo e-mail de verificação foi enviado.', 'success');
            Alert.alert(
                'Sucesso', 
                'Um novo e-mail de verificação foi enviado para o seu endereço. Verifique sua caixa de entrada e spam.'
            );
            
        } catch (error) {
            console.error('Erro ao reenviar verificação:', error.response ? error.response.data : error.message);
            
            let mensagemErro = 'Erro ao reenviar e-mail de verificação.';
            
            if (error.response?.data) {
                if (error.response.data.message) {
                    mensagemErro = error.response.data.message;
                } else if (typeof error.response.data === 'string') {
                    mensagemErro = error.response.data;
                } else {
                    // Pegar primeira mensagem de erro disponível
                    const primeiroErro = Object.values(error.response.data)[0];
                    mensagemErro = Array.isArray(primeiroErro) ? primeiroErro[0] : primeiroErro;
                }
            }
            
            showNotification(mensagemErro, 'error');
            Alert.alert('Erro', mensagemErro);
        } finally {
            setCarregando(false);
        }
    };

    return (
        <MainLayout>
            <ScrollView contentContainerStyle={styles.container}>
                {notification.message ? (
                    <Notification 
                        message={notification.message} 
                        type={notification.type} 
                        onClose={() => setNotification({ message: '', type: '' })} 
                    />
                ) : null}
                
                <Text style={styles.title}>Verificar E-mail</Text>
                <Text style={styles.subtitle}>
                    Insira seu e-mail para reenviar o código de verificação ou clique no link do e-mail recebido.
                </Text>

                {!token && (
                    <>
                        <TextInput
                            style={styles.input}
                            placeholder="Seu e-mail"
                            placeholderTextColor={cores.hover}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            editable={!carregando}
                        />

                        <TouchableOpacity 
                            style={[
                                globalStyles.button, 
                                globalStyles.buttonPrimary,
                                carregando && { opacity: 0.6 }
                            ]} 
                            onPress={handleReenviarVerificacao}
                            disabled={carregando}
                        >
                            <Text style={globalStyles.buttonText}>
                                {carregando ? 'Reenviando...' : 'Reenviar Código de Verificação'}
                            </Text>
                        </TouchableOpacity>
                    </>
                )}

                {token && (
                    <View style={styles.tokenContainer}>
                        <Text style={styles.infoText}>
                            {carregando ? 'Verificando e-mail...' : 'Verificando e-mail com o token...'}
                        </Text>
                    </View>
                )}

                <TouchableOpacity 
                    style={styles.linkButton} 
                    onPress={() => navigation.navigate('TelaLogin')}
                >
                    <Text style={styles.linkButtonText}>Voltar para o Login</Text>
                </TouchableOpacity>
                
                {/* Informações adicionais */}
                <View style={styles.infoContainer}>
                    <Text style={styles.helpText}>
                        Não recebeu o e-mail? Verifique sua pasta de spam ou aguarde alguns minutos antes de tentar novamente.
                    </Text>
                </View>
            </ScrollView>
        </MainLayout>
    );
};

const styles = StyleSheet.create({
    container: {
        ...globalStyles.container,
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    title: {
        ...globalStyles.title,
        marginBottom: 10,
    },
    subtitle: {
        ...globalStyles.text,
        textAlign: 'center',
        marginBottom: 30,
        color: cores.hover,
    },
    input: {
        backgroundColor: cores.branco,
        borderRadius: 12,
        paddingHorizontal: 20,
        paddingVertical: 15,
        fontSize: 16,
        fontFamily: fontes.secundaria,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: cores.terciaria,
    },
    linkButton: {
        marginTop: 20,
        padding: 10,
    },
    linkButtonText: {
        ...globalStyles.text,
        color: cores.primaria,
        textAlign: 'center',
        fontFamily: fontes.semiBold,
        textDecorationLine: 'underline',
    },
    tokenContainer: {
        backgroundColor: cores.terciaria,
        padding: 20,
        borderRadius: 12,
        marginBottom: 20,
    },
    infoText: {
        ...globalStyles.text,
        textAlign: 'center',
        color: cores.primaria,
        fontFamily: fontes.semiBold,
    },
    infoContainer: {
        marginTop: 30,
        paddingHorizontal: 20,
    },
    helpText: {
        ...globalStyles.text,
        textAlign: 'center',
        color: cores.hover,
        fontSize: 14,
        fontStyle: 'italic',
    },
});

export default TelaVerificarEmail;