import React, { useContext, useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext, AuthProvider } from './src/context/AuthContext';
import TelaLogin from './src/screens/TelaLogin';
import TelaCadastro from './src/screens/TelaCadastro';
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

const AppNavigator = () => {
    const { usuario, carregando } = useContext(AuthContext);

    if (carregando) {
        return <TelaSplash />;
    }

    const withMainLayout = (Component) => (props) => (
        <MainLayout>
            <Component {...props} />
        </MainLayout>
    );

    return (
        <Stack.Navigator>
            {usuario ? (
                <>
                    {usuario.tipoUsuario === 'vendedor' ? (
                        <Stack.Group>
                            <Stack.Screen name="DashboardVendedor" component={withMainLayout(TelaDashboardVendedor)} options={{ headerShown: false }} />
                            <Stack.Screen name="CadastroProduto" component={withMainLayout(TelaCadastroProduto)} options={{ headerShown: false }} />
                            <Stack.Screen name="MeusProdutos" component={withMainLayout(TelaMeusProdutos)} options={{ headerShown: false }} />
                            <Stack.Screen name="EditarPerfilVendedor" component={withMainLayout(TelaEditarPerfilVendedor)} options={{ headerShown: false }} />
                            <Stack.Screen name="AnaliseMercadoSaaS" component={withMainLayout(TelaAnaliseMercadoSaaS)} options={{ headerShown: false }} />
                            <Stack.Screen name="TelaDashboardAnalise" component={withMainLayout(TelaDashboardAnalise)} options={{ headerShown: false }} />
                            <Stack.Screen name="TelaMonitorarConcorrencia" component={withMainLayout(TelaMonitorarConcorrencia)} options={{ headerShown: false }} />
                            <Stack.Screen name="IndicarVendedor" component={withMainLayout(TelaIndicarVendedor)} options={{ headerShown: false }} />
                        </Stack.Group>
                    ) : (
                        <Stack.Group>
                            <Stack.Screen name="BemVindo" component={withMainLayout(TelaBemVindo)} options={{ headerShown: false }}/>
                            <Stack.Screen name="DashboardCliente" component={withMainLayout(TelaDashboardCliente)} options={{ headerShown: false }}/>
                            <Stack.Screen name="IndicarVendedor" component={withMainLayout(TelaIndicarVendedor)} options={{ headerShown: false }}/>
                            <Stack.Screen name="MinhasAvaliacoesDetalhe" component={withMainLayout(TelaMinhasAvaliacoesDetalhe)} options={{ headerShown: false }}/>
                            <Stack.Screen name="Produtos" component={withMainLayout(TelaProdutos)} options={{ headerShown: false }}/>
                            <Stack.Screen name="BuscaProdutos" component={withMainLayout(TelaBuscaProdutos)} options={{ headerShown: false }}/>
                        </Stack.Group>
                    )}
                </>
            ) : (
                <Stack.Group>
                    <Stack.Screen name="TelaInicial" component={TelaInicial} options={{ headerShown: false }} />
                    <Stack.Screen name="TelaLogin" component={TelaLogin} options={{ headerShown: false }} />
                    <Stack.Screen name="TelaCadastro" component={TelaCadastro} options={{ headerShown: false }} />
                    <Stack.Screen name="TelaCompletarPerfil" component={TelaCompletarPerfil} options={{ headerShown: false }} />
                    <Stack.Screen name="TelaVerificarEmail" component={TelaVerificarEmail} options={{ headerShown: false }} />
                </Stack.Group>
            )}
            <Stack.Screen name="TelaPrivacidade" component={withMainLayout(TelaPrivacidade)} options={{ headerShown: false }} />
            <Stack.Screen name="TelaTermos" component={withMainLayout(TelaTermos)} options={{ headerShown: false }} />
            <Stack.Screen name="TelaContato" component={withMainLayout(TelaContato)} options={{ headerShown: false }} />
        </Stack.Navigator>
    );
};

export default function App() {
    return (
        <AuthProvider>
            <NavigationContainer>
                <AppNavigator />
            </NavigationContainer>
        </AuthProvider>
    );
}

const estilos = StyleSheet.create({
    containerCarregamento: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});