import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Constants from 'expo-constants';
import axios from 'axios';
import { globalStyles, cores, fontes } from '../styles/globalStyles';
import Notification from '../components/Notification';
import MainLayout from '../components/MainLayout';

const TelaVerificarEmail = ({ route, navigation }) => {
    const [codigoVerificacao, setCodigoVerificacao] = useState('');
    const { email } = route.params || {}; // Garante que route.params não seja nulo
    const apiUrl = Constants.expoConfig.extra.apiUrl;
    const [notification, setNotification] = useState({ message: '', type: '' });

    const showNotification = (message, type) => {
        setNotification({ message, type });
    };
    return (
        <MainLayout>
            <View style={globalStyles.container}>
                <Text>Tela de Verificação de Email</Text>
            </View>
        </MainLayout>
    );
}

export default TelaVerificarEmail;