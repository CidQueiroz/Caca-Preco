# Gerenciamento de Estado (Web)

O gerenciamento de estado global da aplicação web é feito utilizando a **Context API** nativa do React.

## Por que Context API?

Para o escopo atual do projeto, a Context API é suficiente para compartilhar estado global (como informações de autenticação do usuário) sem a necessidade de adicionar bibliotecas externas como Redux ou MobX.

## Contexto Principal: `AuthContext`

O contexto mais importante é o `AuthContext`, responsável por gerenciar os dados do usuário logado e o status da autenticação.

### Estrutura Sugerida

1.  **Criação do Contexto (`src/context/AuthContext.js`):**
    ```javascript
    import { createContext, useState, useContext } from 'react';

    const AuthContext = createContext(null);

    export const AuthProvider = ({ children }) => {
      const [user, setUser] = useState(null);
      const [token, setToken] = useState(localStorage.getItem('authToken'));

      // Funções de login, logout, etc.
      const login = (userData, authToken) => {
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('authToken', authToken);
      };

      const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('authToken');
      };

      return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
          {children}
        </AuthContext.Provider>
      );
    };

    export const useAuth = () => useContext(AuthContext);
    ```

2.  **Prover o Contexto (`src/App.jsx`):**
    Envolver a aplicação com o `AuthProvider` para que todos os componentes filhos tenham acesso a ele.
    ```jsx
    import { AuthProvider } from './context/AuthContext';
    import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

    function App() {
      return (
        <AuthProvider>
          <Router>
            {/* ... Rotas ... */}
          </Router>
        </AuthProvider>
      );
    }
    ```

3.  **Consumir o Contexto:**
    Use o hook customizado `useAuth` em qualquer componente que precise de informações do usuário.
    ```jsx
    import { useAuth } from '../context/AuthContext';

    function UserProfile() {
      const { user, logout } = useAuth();

      if (!user) return <p>Por favor, faça o login.</p>;

      return (
        <div>
          <h1>Bem-vindo, {user.nome_completo}!</h1>
          <button onClick={logout}>Sair</button>
        </div>
      );
    }
    ```