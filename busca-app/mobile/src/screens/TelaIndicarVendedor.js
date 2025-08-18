import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import axios from 'axios';
import Constants from 'expo-constants';
import { AuthContext } from '../context/AuthContext';
import { globalStyles, cores, fontes } from '../styles/globalStyles';

const TelaIndicarVendedor = () => {
    const { token } = useContext(AuthContext);
    const [indicacao, setIndicacao] = useState({
        nomeIndicado: '',
        emailIndicado: '',
        telefoneIndicado: '',
        mensagem: '',
    });
    const [notification, setNotification] = useState({ message: '', type: '' });
    const apiUrl = Constants.expoConfig.extra.apiUrl;

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => {
            setNotification({ message: '', type: '' });
        }, 3000);
    };

    const handleIndicacaoChange = (name, value) => {
        setIndicacao({ ...indicacao, [name]: value });
    };

    const handleIndicacaoSubmit = async () => {
        try {
            await axios.post(`${apiUrl}/usuarios/indicate-seller`, indicacao, {
                headers: { Authorization: `Bearer ${token}` }
            });
            Alert.alert('Sucesso', 'Indicação enviada com sucesso!');
            setIndicacao({
                nomeIndicado: '',
                emailIndicado: '',
                telefoneIndicado: '',
                mensagem: '',
            });
        } catch (err) {
            const errorMessage = err.response ? err.response.data.message : 'Falha ao enviar indicação.';
            Alert.alert('Erro', errorMessage);
            console.error(err);
        }
    };

    return (
        <ScrollView contentContainerStyle={globalStyles.container}>
            {notification.message && (
                <View style={[styles.notification, notification.type === 'success' ? styles.success : styles.error]}>
                    <Text style={styles.notificationText}>{notification.message}</Text>
                </View>
            )}
            <Text style={globalStyles.title}>Indicar Novo Vendedor</Text>
            <Text style={globalStyles.text}>Conhece alguém que deveria vender aqui? Indique-o!</Text>

            <View style={styles.formContainer}>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Nome do Indicado:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Nome completo"
                        placeholderTextColor={cores.hover}
                        value={indicacao.nomeIndicado}
                        onChangeText={(text) => handleIndicacaoChange('nomeIndicado', text)}
                        required
                    />
                </View>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Email do Indicado:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="email@exemplo.com"
                        placeholderTextColor={cores.hover}
                        value={indicacao.emailIndicado}
                        onChangeText={(text) => handleIndicacaoChange('emailIndicado', text)}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        required
                    />
                </View>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Telefone do Indicado (opcional):</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="(XX) XXXXX-XXXX"
                        placeholderTextColor={cores.hover}
                        value={indicacao.telefoneIndicado}
                        onChangeText={(text) => handleIndicacaoChange('telefoneIndicado', text)}
                        keyboardType="phone-pad"
                    />
                </View>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Mensagem (opcional):</Text>
                    <TextInput
                        style={styles.textArea}
                        placeholder="Sua mensagem aqui..."
                        placeholderTextColor={cores.hover}
                        value={indicacao.mensagem}
                        onChangeText={(text) => handleIndicacaoChange('mensagem', text)}
                        multiline
                        numberOfLines={4}
                    />
                </View>
                <TouchableOpacity style={[globalStyles.button, globalStyles.buttonPrimary]} onPress={handleIndicacaoSubmit}>
                    <Text style={globalStyles.buttonText}>Enviar Indicação</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    formContainer: {
        width: '100%',
        padding: 20,
        backgroundColor: cores.branco,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginTop: 20,
    },
    formGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        fontFamily: fontes.semiBold,
        color: cores.texto,
        marginBottom: 5,
    },
    input: {
        backgroundColor: cores.fundoInput,
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        fontFamily: fontes.secundaria,
        borderWidth: 1,
        borderColor: cores.bordaInput,
        color: cores.texto,
    },
    textArea: {
        backgroundColor: cores.fundoInput,
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 12,
        fontSize: 16,
        fontFamily: fontes.secundaria,
        borderWidth: 1,
        borderColor: cores.bordaInput,
        color: cores.texto,
        textAlignVertical: 'top', // Para Android
    },
    notification: {
        padding: 10,
        borderRadius: 5,
        marginBottom: 10,
        alignItems: 'center',
    },
    success: {
        backgroundColor: 'lightgreen',
    },
    error: {
        backgroundColor: 'lightcoral',
    },
    notificationText: {
        color: 'white',
        fontFamily: fontes.secundaria,
    },
});

export default TelaIndicarVendedor;