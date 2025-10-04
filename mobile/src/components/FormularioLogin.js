import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { globalStyles, cores, fontes } from '../styles/globalStyles';
import apiClient from '../../apiClient';

const FormularioLogin = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [carregando, setCarregando] = useState(false);
    const { login } = useContext(AuthContext);

    const handleLogin = async () => {
        if (!email || !senha) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos');
            return;
        }

        setCarregando(true);
        try {
            console.log('Tentando login para:', email);
            console.log('API URL:', apiClient.defaults.baseURL);

            const response = await apiClient.post('/api/login/', {
                email: email,
                password: senha
            });

            console.log('Login bem-sucedido:', response.data);

            // Extrair dados da resposta
            const { access: accessToken, user: userData } = response.data;
            
            // Log para verificar os dados que estamos passando
            console.log('Dados do usuário da resposta da API:', userData);
            console.log('Token de acesso:', accessToken ? 'presente' : 'ausente');

            // Verificar se os dados essenciais estão presentes
            if (!userData.hasOwnProperty('email_verificado') || !userData.hasOwnProperty('perfil_completo')) {
                console.warn('ATENÇÃO: Dados de email_verificado ou perfil_completo não encontrados na resposta da API');
                console.log('Campos disponíveis no userData:', Object.keys(userData));
            }
            
            // Fazer login no contexto (isso vai atualizar o estado e disparar o redirecionamento)
            await login(accessToken, userData);

            console.log('Login processado pelo contexto, aguardando redirecionamento...');

        } catch (error) {
            console.error('Erro no login:', error);
            let mensagemErro = 'Erro no login. Tente novamente.';

            if (error.response) {
                console.log('Status do erro:', error.response.status);
                console.log('Dados do erro:', error.response.data);

                if (error.response.status === 400) {
                    mensagemErro = 'Email ou senha inválidos';
                } else if (error.response.status === 401) {
                    mensagemErro = 'Credenciais inválidas';
                } else if (error.response.data?.detail) {
                    mensagemErro = error.response.data.detail;
                }
            } else if (error.request) {
                mensagemErro = 'Erro de conexão. Verifique sua internet.';
            }

            Alert.alert('Erro no Login', mensagemErro);
        } finally {
            setCarregando(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="Digite seu email"
                    placeholderTextColor={cores.hover}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!carregando}
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={styles.label}>Senha</Text>
                <TextInput
                    style={styles.input}
                    value={senha}
                    onChangeText={setSenha}
                    placeholder="Digite sua senha"
                    placeholderTextColor={cores.hover}
                    secureTextEntry
                    editable={!carregando}
                />
            </View>

            <TouchableOpacity
                style={[styles.button, carregando && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={carregando}
            >
                <Text style={styles.buttonText}>
                    {carregando ? 'Entrando...' : 'Entrar'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        ...globalStyles.text,
        fontFamily: fontes.semiBold,
        marginBottom: 8,
        color: cores.texto,
    },
    input: {
        ...globalStyles.input,
        backgroundColor: cores.fundo,
        borderColor: cores.borda,
        borderWidth: 1,
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderRadius: 8,
        fontSize: 16,
        color: cores.texto,
    },
    button: {
        ...globalStyles.button,
        backgroundColor: cores.primaria,
        paddingVertical: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonDisabled: {
        backgroundColor: cores.hover,
        opacity: 0.7,
    },
    buttonText: {
        ...globalStyles.buttonText,
        color: cores.branco,
        fontFamily: fontes.semiBold,
        fontSize: 16,
    },
});

export default FormularioLogin;