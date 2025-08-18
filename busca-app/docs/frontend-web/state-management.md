# Gerenciamento de Estado com Context API

O gerenciamento do estado de autenticação do usuário na aplicação web é centralizado usando a **Context API** do React. O `AuthContext` é o responsável por armazenar e compartilhar os dados do usuário e o token de autenticação entre todos os componentes.

## `AuthContext.jsx`

Este arquivo exporta um `AuthProvider` que envolve a árvore de componentes da aplicação, disponibilizando o contexto de autenticação para qualquer componente que precise dele.

### Estado Gerenciado

O `AuthProvider` mantém os seguintes estados:

- **`token`**: Armazena o JWT `access token` do usuário. É lido e salvo no `localStorage` para persistir a sessão entre recargas da página.
- **`usuario`**: Um objeto contendo as informações do usuário logado (ex: `email`, `tipo_usuario`, `perfil_completo`). Também é persistido no `localStorage`.
- **`carregando`**: Um booleano que indica se a verificação inicial do token ainda está em andamento. É útil para exibir uma tela de splash ou um indicador de carregamento ao iniciar a aplicação.

### Funções Expostas

O contexto também expõe funções para modificar o estado de autenticação:

- **`login(novoToken, dadosUsuario)`**: Chamada após uma autenticação bem-sucedida. Ela salva o token e os dados do usuário no `localStorage` e atualiza o estado do React, propagando a mudança para toda a aplicação.
- **`logout()`**: Remove o token e os dados do usuário do `localStorage` e do estado, efetivamente deslogando o usuário.

### Verificação de Token

Um `useEffect` dentro do `AuthProvider` monitora o estado do `token`. Ao carregar a aplicação, ele decodifica o token para verificar sua data de expiração. Se o token estiver expirado, a função `logout()` é chamada automaticamente para limpar a sessão inválida.

### Como Usar o Contexto

Qualquer componente que precise acessar os dados de autenticação pode usar o hook `useContext`.

**Exemplo em um componente:**

```jsx
import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const MeuComponente = () => {
  const { usuario, logout } = useContext(AuthContext);

  if (!usuario) {
    return <p>Por favor, faça o login.</p>;
  }

  return (
    <div>
      <p>Bem-vindo, {usuario.email}!</p>
      <button onClick={logout}>Sair</button>
    </div>
  );
};
```