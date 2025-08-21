import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import axios from 'axios';
import Constants from 'expo-constants';
import { globalStyles, cores, fontes } from '../styles/globalStyles';
import MainLayout from '../components/MainLayout';

const TelaRecuperarSenha = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [token, setToken] = useState('');
    const [novaSenha, setNovaSenha] = useState('');
    const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
    const [etapa, setEtapa] = useState('solicitar'); // 'solicitar' ou 'redefinir'

    const apiUrl = Constants.expoConfig.extra.apiUrl;

    const handleSolicitarRedefinicao = async () => {
        try {
            await axios.post(`${apiUrl}/api/recuperar-senha/`, { email });
            Alert.alert('Sucesso', 'Um link de redefinição de senha foi enviado para o seu e-mail.');
            setEtapa('redefinir'); // Avança para a etapa de redefinição
        } catch (error) {
            console.error('Erro ao solicitar redefinição:', error.response ? error.response.data : error.message);
            Alert.alert('Erro', 'Não foi possível solicitar a redefinição de senha. Tente novamente.');
        }
    };

    const handleRedefinirSenha = async () => {
        if (novaSenha !== confirmarNovaSenha) {
            Alert.alert('Erro', 'As senhas não coincidem.');
            return;
        }
        try {
            await axios.post(`${apiUrl}/api/redefinir-senha/${token}/`, { password: novaSenha });
            Alert.alert('Sucesso', 'Sua senha foi redefinida com sucesso. Agora você pode fazer login.');
            navigation.navigate('TelaLogin');
        } catch (error) {
            console.error('Erro ao redefinir senha:', error.response ? error.response.data : error.message);
            Alert.alert('Erro', error.response ? error.response.data.error : 'Não foi possível redefinir a senha. Verifique o token e tente novamente.');
        }
    };

    return (
        <MainLayout>
            <ScrollView contentContainerStyle={globalStyles.container}>
                <Text style={styles.title}>Recuperar Senha</Text>

                {etapa === 'solicitar' ? (
                    <>
                        <Text style={styles.subtitle}>Informe seu e-mail para receber o link de redefinição.</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Seu e-mail"
                            placeholderTextColor={cores.hover}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <TouchableOpacity style={[globalStyles.button, globalStyles.buttonPrimary]} onPress={handleSolicitarRedefinicao}>
                            <Text style={globalStyles.buttonText}>Solicitar Redefinição</Text>
                        </TouchableOpacity>
                    </>
                ) : (
                    <>
                        <Text style={styles.subtitle}>Um token foi enviado para o seu e-mail. Insira-o abaixo e sua nova senha.</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Token de Redefinição"
                            placeholderTextColor={cores.hover}
                            value={token}
                            onChangeText={setToken}
                            autoCapitalize="none"
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Nova Senha"
                            placeholderTextColor={cores.hover}
                            value={novaSenha}
                            onChangeText={setNovaSenha}
                            secureTextEntry
                        />
                        <TextInput
                            style={styles.input}
                            placeholder="Confirmar Nova Senha"
                            placeholderTextColor={cores.hover}
                            value={confirmarNovaSenha}
                            onChangeText={setConfirmarNovaSenha}
                            secureTextEntry
                        />
                        <TouchableOpacity style={[globalStyles.button, globalStyles.buttonPrimary]} onPress={handleRedefinirSenha}>
                            <Text style={globalStyles.buttonText}>Redefinir Senha</Text>
                        </TouchableOpacity>
                    </>
                )}

                <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('TelaLogin')}>
                    <Text style={styles.linkButtonText}>Voltar para o Login</Text>
                </TouchableOpacity>
            </ScrollView>
        </MainLayout>
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

export default TelaRecuperarSenha;
