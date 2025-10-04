import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated } from 'react-native';
import { globalStyles, cores, fontes } from '../styles/globalStyles';

const TelaInicial = ({ navigation }) => {
    const floatAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim, {
                    toValue: -15,
                    duration: 2000,
                    useNativeDriver: false,
                }),
                Animated.timing(floatAnim, {
                    toValue: 0,
                    duration: 2000,
                    useNativeDriver: false,
                }),
            ])
        ).start();
    }, [floatAnim]);

    return (
        <View style={styles.container}>
            <Animated.Image 
                source={require('../../assets/ia.png')} 
                style={[styles.image, { transform: [{ translateY: floatAnim }] }]} resizeMode="contain"
            />

            <Text style={styles.title}>
                Bem-vindo ao <Text style={styles.highlight}>Caça-Preço</Text>
            </Text>
            <Text style={styles.subtitle}>
                Olá, eu sou a Lourdes. Sua aventura mágica financeira começa aqui!
            </Text>

            <View style={styles.buttonContainer}>
                <TouchableOpacity 
                    style={[globalStyles.button, globalStyles.buttonPrimary]} 
                    onPress={() => navigation.navigate('TelaCadastro')}
                >
                    <Text style={globalStyles.buttonText}>Criar Conta</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={[globalStyles.button, globalStyles.buttonSecondary]} 
                    onPress={() => navigation.navigate('TelaLogin')}
                >
                    <Text style={globalStyles.buttonText}>Já Tenho Conta</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...globalStyles.container,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: cores.fundo,
    },
    image: {
        width: 250,
        height: 250,
        resizeMode: 'contain',
        marginBottom: 30,
    },
    title: {
        ...globalStyles.title,
        fontSize: 28,
    },
    highlight: {
        color: cores.hover,
        fontFamily: fontes.primaria, 
    },
    subtitle: {
        ...globalStyles.text,
        fontSize: 18,
        textAlign: 'center',
        color: cores.texto,
        marginTop: 10,
        marginBottom: 40,
    },
    buttonContainer: {
        width: '100%',
        paddingHorizontal: 20,
    },
    footerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 40,
        paddingHorizontal: 20,
    },
    footerLink: {
        color: cores.primaria,
        fontFamily: fontes.secundaria,
        fontSize: 14,
        textDecorationLine: 'underline',
    },
});

export default TelaInicial;