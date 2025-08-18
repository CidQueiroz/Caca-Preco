import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import Constants from 'expo-constants';
import { globalStyles, cores, fontes } from '../styles/globalStyles';

const TelaLogin = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const { login } = useContext(AuthContext);

    const handleLogin = async () => {
        try {
            const apiUrl = Constants.expoConfig.extra.apiUrl;
            const response = await axios.post(`${apiUrl}/autenticacao/login`, { email, senha });
            
            await login(response.data.token);

            if (!response.data.perfilCompleto) {
                Alert.alert('Perfil Incompleto', 'Por favor, complete seu perfil para continuar.');
                navigation.navigate('TelaCompletarPerfil', { idUsuario: response.data.idUsuario, tipoUsuario: response.data.tipoUsuario, email: email });
            } else {
                Alert.alert('Login Realizado', 'Bem-vindo(a) de volta!');
                // O AuthContext cuidará do redirecionamento para a tela principal
            }
        } catch (error) {
            const mensagemErro = error.response ? error.response.data.message : 'Erro ao tentar fazer login.';
            Alert.alert('Erro no Login', mensagemErro);

            if (mensagemErro.includes('Conta inativa')) {
                navigation.navigate('TelaVerificarEmail', { email: email });
            }
        }
    };

    return (
        <ScrollView contentContainerStyle={globalStyles.container}>
            <Text style={styles.title}>Bem-vindo(a) de Volta!</Text>
            <Text style={styles.subtitle}>Sentimos sua falta</Text>

            <TextInput
                style={styles.input}
                placeholder="Seu e-mail"
                placeholderTextColor={cores.hover}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Sua senha"
                placeholderTextColor={cores.hover}
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
            />

            <TouchableOpacity style={[globalStyles.button, globalStyles.buttonPrimary]} onPress={handleLogin}>
                <Text style={globalStyles.buttonText}>Entrar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('TelaCadastro')}>
                <Text style={styles.linkButtonText}>Não tenho uma conta</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('TelaVerificarEmail', { email: email }) }>
                <Text style={styles.linkButtonText}>Verificar E-mail / Reenviar Código</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
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
    },
    linkButtonText: {
        ...globalStyles.text,
        color: cores.primaria,
        textAlign: 'center',
        fontFamily: fontes.semiBold,
    },
});

export default TelaLogin;
