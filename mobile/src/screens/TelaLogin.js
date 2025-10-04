import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { globalStyles, cores, fontes } from '../styles/globalStyles';

// 1. Importe o novo componente de formulário
import FormularioLogin from '../components/FormularioLogin';

// A tela agora é um componente de apresentação simples
const TelaLogin = ({ navigation }) => {
    return (
        <ScrollView contentContainerStyle={globalStyles.container}>
            <Text style={styles.title}>Bem-vindo(a) de Volta!</Text>
            <Text style={styles.subtitle}>Sentimos sua falta</Text>

            {/* 2. Renderize o formulário, passando a propriedade 'navigation' */}
            <FormularioLogin navigation={navigation} />

            {/* Links de navegação continuam aqui */}
            <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('TelaCadastro')}>
                <Text style={styles.linkButtonText}>Não tenho uma conta</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate('TelaRecuperarSenha')}>
                <Text style={styles.linkButtonText}>Esqueceu sua senha?</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

// Estilos da tela (layout principal)
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