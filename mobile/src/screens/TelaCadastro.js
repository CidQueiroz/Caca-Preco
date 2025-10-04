import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import Constants from 'expo-constants';
import { globalStyles, cores, fontes } from '../styles/globalStyles';
import MainLayout from '../components/MainLayout';

const TelaCadastro = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [tipoUsuario, setTipoUsuario] = useState('Cliente');

    const handleRegistro = async () => {
        try {
            const apiUrl = Constants.expoConfig.extra.apiUrl;
            const response = await axios.post(`${apiUrl}/api/register/`, {
                email,
                password: senha,
                tipo_usuario: tipoUsuario,
            });
            Alert.alert('Sucesso!', 'Seu cadastro inicial foi realizado. Um e-mail de verificação foi enviado. Por favor, verifique sua caixa de entrada.');
            navigation.navigate('TelaVerificarEmail', { email: email });
        } catch (error) {
            console.error('Erro de registro:', error.response ? error.response.data : error.message);
            Alert.alert('Erro no Cadastro', error.response ? error.response.data.message : 'Não foi possível realizar o cadastro. Tente novamente.');
        }
    };

    return (
        <MainLayout>
            <View style={globalStyles.container}>
                <Text style={styles.title}>Crie sua Conta</Text>
                <Text style={styles.subtitle}>É rápido, fácil e mágico!</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Seu melhor e-mail"
                    placeholderTextColor={cores.hover}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Crie uma senha segura"
                    placeholderTextColor={cores.hover}
                    value={senha}
                    onChangeText={setSenha}
                    secureTextEntry
                />
                
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={tipoUsuario}
                        onValueChange={(itemValue) => setTipoUsuario(itemValue)}
                        style={styles.picker}
                    >
                        <Picker.Item label="Quero ser Cliente" value="Cliente" />
                        <Picker.Item label="Quero ser Vendedor" value="Vendedor" />
                    </Picker>
                </View>

                <TouchableOpacity style={globalStyles.button} onPress={handleRegistro}>
                    <Text style={globalStyles.buttonText}>Cadastrar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.loginButton} onPress={() => navigation.navigate('TelaLogin')}>
                    <Text style={styles.loginButtonText}>Já tenho uma conta</Text>
                </TouchableOpacity>
            </View>
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
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 20,
        paddingVertical: 15,
        fontSize: 16,
        fontFamily: fontes.secundaria,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: cores.terciaria,
    },
    pickerContainer: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: cores.terciaria,
        marginBottom: 20,
        overflow: 'hidden', // Garante que o raio da borda seja aplicado no Picker
        backgroundColor: '#fff',
    },
    picker: {
        width: '100%',
        height: 50,
        color: cores.texto,
    },
    loginButton: {
        marginTop: 20,
    },
    loginButtonText: {
        ...globalStyles.text,
        color: cores.primaria,
        textAlign: 'center',
        fontFamily: fontes.semiBold,
    },
});

export default TelaCadastro;
