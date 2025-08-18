# Gerenciamento de Estado (React Native)

Assim como na aplicação web, o gerenciamento do estado de autenticação no aplicativo móvel é centralizado com a **Context API** do React, garantindo uma fonte única de verdade para os dados do usuário.

## `AuthContext.js`

O `AuthProvider` no mobile é conceitualmente idêntico ao do frontend web, mas adaptado para o ambiente do React Native.

### Armazenamento Persistente

A principal diferença é o mecanismo de armazenamento. Em vez de `localStorage`, o `AuthContext` do mobile utiliza `@react-native-async-storage/async-storage` para persistir o token e os dados do usuário no dispositivo. Isso garante que o usuário permaneça logado mesmo após fechar e reabrir o aplicativo.

### Estado Gerenciado

- **`token`**: Armazena o JWT `access token` do usuário, lido e salvo no `AsyncStorage`.
- **`usuario`**: O objeto com os dados do usuário logado, também persistido no `AsyncStorage`.
- **`carregando`**: Um booleano que controla a exibição da `TelaSplash` durante a verificação inicial do token no `AsyncStorage`.

### Funções e Lógica

As funções `login` e `logout` operam de forma semelhante à versão web:

- **`login(novoToken, dadosUsuario)`**: Salva os dados no `AsyncStorage` e atualiza o estado do React.
- **`logout()`**: Remove os dados do `AsyncStorage` e limpa o estado.

Da mesma forma, uma verificação de expiração do token é feita para deslogar o usuário automaticamente se a sessão for inválida.

### Como Usar o Contexto

O uso do hook `useContext` nas telas e componentes do React Native é idêntico ao do React para a web.

**Exemplo em uma Tela:**

```jsx
import React, { useContext } from 'react';
import { View, Text, Button } from 'react-native';
import { AuthContext } from '../context/AuthContext';

const TelaDashboard = () => {
  const { usuario, logout } = useContext(AuthContext);

  if (!usuario) {
    // Esta lógica normalmente é tratada pelo AppNavigator,
    // mas o acesso ao contexto é o mesmo.
    return null;
  }

  return (
    <View>
      <Text>Bem-vindo, {usuario.email}!</Text>
      <Button title="Sair" onPress={logout} />
    </View>
  );
};
```
