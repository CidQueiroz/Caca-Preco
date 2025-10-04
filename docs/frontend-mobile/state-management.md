# Gerenciamento de Estado (Mobile)

Assim como na aplicação web, o gerenciamento de estado global no aplicativo mobile é feito com a **Context API** do React.

## Consistência

Manter a mesma estratégia de gerenciamento de estado entre as plataformas web e mobile simplifica o raciocínio e o compartilhamento de lógica.

## Implementação

A implementação é idêntica à da web. Um `AuthContext` é criado para prover informações de autenticação para toda a árvore de componentes.

1.  **Criação do Contexto (`src/context/AuthContext.js`):**
    O código é o mesmo da versão web, gerenciando `user` e `token`. O `localStorage` é substituído por `AsyncStorage` do React Native para persistir os dados no dispositivo.

    ```javascript
    import { createContext, useState, useContext } from 'react';
    import AsyncStorage from '@react-native-async-storage/async-storage';

    const AuthContext = createContext(null);

    export const AuthProvider = ({ children }) => {
      // ... (lógica para carregar o token do AsyncStorage na inicialização)
      const [user, setUser] = useState(null);

      const login = async (userData, authToken) => {
        setUser(userData);
        await AsyncStorage.setItem('authToken', authToken);
      };

      const logout = async () => {
        setUser(null);
        await AsyncStorage.removeItem('authToken');
      };

      return (
        <AuthContext.Provider value={{ user, login, logout }}>
          {children}
        </AuthContext.Provider>
      );
    };

    export const useAuth = () => useContext(AuthContext);
    ```

2.  **Prover o Contexto (`App.js`):**
    O `AppNavigator` ou o componente raiz da aplicação deve ser envolvido pelo `AuthProvider`.

    ```jsx
    import { AuthProvider } from './src/context/AuthContext';
    import AppNavigator from './src/navigation/AppNavigator';

    export default function App() {
      return (
        <AuthProvider>
          <AppNavigator />
        </AuthProvider>
      );
    }
    ```