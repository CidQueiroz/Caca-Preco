# Navegação (Mobile)

A navegação no aplicativo mobile é gerenciada pela biblioteca **React Navigation**.

## Estrutura de Navegação

A estrutura de navegação é definida no arquivo `App.js` (ou em um arquivo dedicado como `src/navigation/AppNavigator.js`). A abordagem comum é separar a navegação em diferentes "stacks" (pilhas de telas).

### Exemplo de Estrutura

1.  **Auth Stack:** Telas relacionadas à autenticação.
    - `LoginScreen`
    - `RegisterScreen`
    - `ForgotPasswordScreen`

2.  **Main App Stack (Tab Navigator):** A interface principal da aplicação após o login, geralmente usando uma navegação por abas na parte inferior.
    - `HomeScreen` (Tela inicial)
    - `SearchScreen` (Tela de busca)
    - `ProfileScreen` (Tela de perfil do usuário)

### Implementação

O `App.js` principal deve conter um `NavigationContainer` e, condicionalmente, renderizar o `AuthStack` ou o `MainAppStack` com base no estado de autenticação do usuário (obtido via Context API).

```jsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from './src/context/AuthContext'; // Supondo que exista

// Importe suas telas aqui
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';

const Stack = createNativeStackNavigator();

function AppNavigator() {
  const { user } = useAuth(); // Hook para verificar se o usuário está logado

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          // Telas para usuários logados
          <Stack.Screen name="Home" component={HomeScreen} />
        ) : (
          // Telas para usuários não logados
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;
```
Este é um exemplo básico. A estrutura pode ser mais complexa, com navegadores aninhados (Stack dentro de Tab).