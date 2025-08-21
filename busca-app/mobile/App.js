import React, { useContext, useEffect, useState } from 'react';
import { NavigationContainer, useNavigation, StackActions } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthContext, AuthProvider } from './src/context/AuthContext';
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

const AppNavigator = () => {
    const { usuario, token, carregando } = useContext(AuthContext);
    const navigation = useNavigation();
    const [initialRouteSet, setInitialRouteSet] = useState(false);

    // Função para determinar e executar o redirecionamento
    const executarRedirecionamento = () => {
        console.log('AppNavigator - Executando redirecionamento:', {
            token: token ? 'presente' : 'ausente',
            usuario: usuario ? {
                id: usuario.id,
                tipoUsuario: usuario.tipoUsuario,
                email_verificado: usuario.email_verificado,
                perfil_completo: usuario.perfil_completo
            } : 'ausente'
        });

        if (token && usuario) {
            // Usuário autenticado - verificar status do perfil na ordem correta
            if (!usuario.email_verificado) {
                // PRIORIDADE 1: Email não verificado
                console.log('Redirecionando para verificar email');
                navigation.dispatch(StackActions.replace('TelaVerificarEmail'));
            } else if (!usuario.perfil_completo) {
                // PRIORIDADE 2: Perfil incompleto
                console.log('Redirecionando para completar perfil');
                navigation.dispatch(StackActions.replace('TelaCompletarPerfil'));
            } else {
                // PRIORIDADE 3: Tudo completo - ir para dashboard específico
                const dashboard = usuario.tipoUsuario === 'Vendedor' 
                    ? 'TelaDashboardVendedor' 
                    : 'TelaDashboardCliente';
                console.log('Redirecionando para dashboard:', dashboard);
                navigation.dispatch(StackActions.replace(dashboard));
            }
        } else {
            // Usuário não autenticado - ir para tela inicial
            console.log('Redirecionando para tela inicial');
            navigation.dispatch(StackActions.replace('TelaInicial'));
        }
    };

    // Effect para redirecionamento inicial (quando o app carrega)
    useEffect(() => {
        if (!carregando && navigation && !initialRouteSet) {
            console.log('AppNavigator - Configurando rota inicial');
            executarRedirecionamento();
            setInitialRouteSet(true);
        }
    }, [carregando, navigation, initialRouteSet]);

    // Effect separado para mudanças no estado do usuário após o login
    useEffect(() => {
        if (!carregando && navigation && initialRouteSet && token && usuario) {
            console.log('AppNavigator - Usuario logou, executando redirecionamento');
            // Adiciona um pequeno delay para garantir que o estado foi totalmente atualizado
            const timeoutId = setTimeout(() => {
                executarRedirecionamento();
            }, 100);

            return () => clearTimeout(timeoutId);
        }
    }, [usuario, token, carregando, navigation, initialRouteSet]);

    // Mostrar splash screen enquanto carrega
    if (carregando) {
        return <TelaSplash />;
    }

    const withMainLayout = (Component) => (props) => (
        <MainLayout>
            <Component {...props} />
        </MainLayout>
    );

    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            {/* Telas de Autenticação */}
            <Stack.Screen name="TelaInicial" component={TelaInicial} />
            <Stack.Screen name="TelaLogin" component={TelaLogin} />
            <Stack.Screen name="TelaCadastro" component={TelaCadastro} />
            <Stack.Screen name="TelaRecuperarSenha" component={TelaRecuperarSenha} />
            
            {/* Telas de Verificação/Completar Perfil */}
            <Stack.Screen name="TelaVerificarEmail" component={TelaVerificarEmail} />
            <Stack.Screen name="TelaCompletarPerfil" component={TelaCompletarPerfil} />
            
            {/* Dashboards Principais */}
            <Stack.Screen 
                name="TelaDashboardVendedor" 
                component={withMainLayout(TelaDashboardVendedor)} 
            />
            <Stack.Screen 
                name="TelaDashboardCliente" 
                component={withMainLayout(TelaDashboardCliente)} 
            />
            
            {/* Telas do Vendedor */}
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
            
            {/* Telas do Cliente */}
            <Stack.Screen 
                name="BuscaProdutos" 
                component={withMainLayout(TelaBuscaProdutos)} 
            />
            <Stack.Screen 
                name="Produtos" 
                component={withMainLayout(TelaProdutos)} 
            />
            
            {/* Telas Compartilhadas */}
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
            
            {/* Telas Legais */}
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
    );
};

export default function App() {
    const [fontesCarregadas, setFontesCarregadas] = useState(false);
    const [erroFontes, setErroFontes] = useState(false);

    useEffect(() => {
        const carregarRecursos = async () => {
            try {
                console.log('Carregando fontes...');
                await carregarFontes();
                console.log('Fontes carregadas com sucesso');
                setFontesCarregadas(true);
            } catch (error) {
                console.warn('Erro ao carregar fontes:', error);
                setErroFontes(true);
                setFontesCarregadas(true); // Continue mesmo com erro nas fontes
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
        backgroundColor: '#f8f9fa',
    },
});