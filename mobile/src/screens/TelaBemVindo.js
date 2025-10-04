import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { globalStyles, cores, fontes } from '../styles/globalStyles';

const TelaBemVindo = () => {
    const { usuario, logout } = useContext(AuthContext);
    const navigation = useNavigation();

    const handleLogout = async () => {
        await logout();
    };

    return (
            <View style={globalStyles.container}>
                <Text style={styles.title}>Bem-vindo(a)!</Text>
                <Text style={styles.welcomeText}>
                    Olá, <Text style={styles.userName}>{usuario?.nome || usuario?.tipoUsuario}</Text>!
                </Text>
                <Text style={globalStyles.text}>Que a magia do unicórnio traga muita economia para você!</Text>
                
                <TouchableOpacity style={globalStyles.button} onPress={handleLogout}>
                    <Text style={globalStyles.buttonText}>Sair</Text>
                </TouchableOpacity>
            </View>
    );
};

// Estilos específicos para esta tela, que complementam os globais
const styles = StyleSheet.create({
    title: {
        ...globalStyles.title, // Herda o estilo do título global
        marginBottom: 40,
    },
    welcomeText: {
        ...globalStyles.text,
        fontSize: 20,
        textAlign: 'center',
        marginBottom: 20,
    },
    userName: {
        fontFamily: fontes.semiBold,
        color: cores.primaria,
    },
});

export default TelaBemVindo;