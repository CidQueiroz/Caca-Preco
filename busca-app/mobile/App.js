import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider } from './src/context/AuthContext';
import TelaLogin from './src/screens/TelaLogin';
import TelaCadastro from './src/screens/TelaCadastro';
import TelaRecuperarSenha from './src/screens/TelaRecuperarSenha';
import TelaInicial from './src/screens/TelaInicial';
import TelaCompletarPerfil from './src/screens/TelaCompletarPerfil';
import TelaVerificarEmail from './src/screens/TelaVerificarEmail';
import TelaSplash from './src/screens/TelaSplash';
import TelaBemVindo from './src/screens/TelaBemVindo';
import TelaDashboardVendedor from './src/screens/TelaDashboardVendedor';
import TelaCadastroProduto from './src/screens/TelaCadastroProduto';
import TelaMeusProdutos from './src/screens/TelaMeusProdutos';
import TelaDashboardCliente from './src/screens/TelaDashboardCliente';
import TelaEditarPerfilVendedor from './src/screens/TelaEditarPerfilVendedor';
import TelaIndicarVendedor from './src/screens/TelaIndicarVendedor';
import TelaMinhasAvaliacoesDetalhe from './src/screens/TelaMinhasAvaliacoesDetalhe';
import TelaProdutos from './src/screens/TelaProdutos';
import TelaAnaliseMercadoSaaS from './src/screens/TelaAnaliseMercadoSaaS';
import TelaDashboardAnalise from './src/screens/TelaDashboardAnalise';
import TelaMonitorarConcorrencia from './src/screens/TelaMonitorarConcorrencia';
import TelaBuscaProdutos from './src/screens/TelaBuscaProdutos';
import TelaPrivacidade from './src/screens/TelaPrivacidade';
import TelaTermos from './src/screens/TelaTermos';
import TelaContato from './src/screens/TelaContato';

import { ActivityIndicator, View, StyleSheet } from 'react-native';
import * as Font from 'expo-font';
import MainLayout from './src/components/MainLayout';

const Stack = createNativeStackNavigator();

const carregarFontes = () => {
    return Font.loadAsync({
        'Krona One': require('./assets/fonts/KronaOne-Regular.ttf'),
        'Montserrat': require('./assets/fonts/Montserrat-Regular.ttf'),
        'Montserrat-SemiBold': require('./assets/fonts/Montserrat-SemiBold.ttf'),
    });
};

const withMainLayout = (Component) => (props) => (
    <MainLayout>
        <Component {...props} />
    </MainLayout>
);

export default function App() {
    const [fontesCarregadas, setFontesCarregadas] = useState(false);

    useEffect(() => {
        const carregarRecursos = async () => {
            try {
                await carregarFontes();
            } catch (error) {
                console.warn('Erro ao carregar fontes:', error);
            } finally {
                setFontesCarregadas(true);
            }
        };
        carregarRecursos();
    }, []);

    if (!fontesCarregadas) {
        return (
            <View style={estilos.containerCarregamento}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <AuthProvider>
            <NavigationContainer>
                <Stack.Navigator 
                    initialRouteName="TelaSplash" 
                    screenOptions={{ headerShown: false }}
                >
                    <Stack.Screen name="TelaSplash" component={TelaSplash} />
                    <Stack.Screen name="TelaInicial" component={TelaInicial} />
                    <Stack.Screen name="TelaLogin" component={TelaLogin} />
                    <Stack.Screen name="TelaCadastro" component={TelaCadastro} />
                    <Stack.Screen name="TelaRecuperarSenha" component={TelaRecuperarSenha} />
                    <Stack.Screen name="TelaVerificarEmail" component={TelaVerificarEmail} />
                    <Stack.Screen name="TelaCompletarPerfil" component={TelaCompletarPerfil} />
                    <Stack.Screen 
                        name="TelaDashboardVendedor" 
                        component={withMainLayout(TelaDashboardVendedor)} 
                    />
                    <Stack.Screen 
                        name="TelaDashboardCliente" 
                        component={withMainLayout(TelaDashboardCliente)} 
                    />
                    <Stack.Screen 
                        name="CadastroProduto" 
                        component={withMainLayout(TelaCadastroProduto)} 
                    />
                    <Stack.Screen 
                        name="MeusProdutos" 
                        component={withMainLayout(TelaMeusProdutos)} 
                    />
                    <Stack.Screen 
                        name="EditarPerfilVendedor" 
                        component={withMainLayout(TelaEditarPerfilVendedor)} 
                    />
                    <Stack.Screen 
                        name="AnaliseMercadoSaaS" 
                        component={withMainLayout(TelaAnaliseMercadoSaaS)} 
                    />
                    <Stack.Screen 
                        name="TelaDashboardAnalise" 
                        component={withMainLayout(TelaDashboardAnalise)} 
                    />
                    <Stack.Screen 
                        name="TelaMonitorarConcorrencia" 
                        component={withMainLayout(TelaMonitorarConcorrencia)} 
                    />
                    <Stack.Screen 
                        name="BuscaProdutos" 
                        component={withMainLayout(TelaBuscaProdutos)} 
                    />
                    <Stack.Screen 
                        name="Produtos" 
                        component={withMainLayout(TelaProdutos)} 
                    />
                    <Stack.Screen 
                        name="IndicarVendedor" 
                        component={withMainLayout(TelaIndicarVendedor)} 
                    />
                    <Stack.Screen 
                        name="BemVindo" 
                        component={withMainLayout(TelaBemVindo)} 
                    />
                    <Stack.Screen 
                        name="MinhasAvaliacoesDetalhe" 
                        component={withMainLayout(TelaMinhasAvaliacoesDetalhe)} 
                    />
                    <Stack.Screen 
                        name="TelaPrivacidade" 
                        component={withMainLayout(TelaPrivacidade)} 
                    />
                    <Stack.Screen 
                        name="TelaTermos" 
                        component={withMainLayout(TelaTermos)} 
                    />
                    <Stack.Screen 
                        name="TelaContato" 
                        component={withMainLayout(TelaContato)} 
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </AuthProvider>
    );
}

const estilos = StyleSheet.create({
    containerCarregamento: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
});
