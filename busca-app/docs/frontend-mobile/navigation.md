# Navegação do Aplicativo (React Native)

A navegação no aplicativo móvel Caça-Preço é controlada pelo componente `AppNavigator` em `App.js`, utilizando a biblioteca **React Navigation** (`@react-navigation/native-stack`). A estrutura de navegação é dinâmica e se adapta ao estado de autenticação e ao tipo de usuário.

## Estrutura do Navegador

O `AppNavigator` usa um `StackNavigator` para gerenciar a pilha de telas. A lógica de qual conjunto de telas mostrar é baseada na existência do objeto `usuario` no `AuthContext`.

### 1. Tela de Carregamento (Splash Screen)

- **Componente:** `<TelaSplash />`
- **Condição:** Renderizada enquanto o `AuthContext` está no estado `carregando`. Isso acontece na inicialização do app, enquanto o token de autenticação está sendo verificado no `AsyncStorage`.

### 2. Pilha de Navegação para Usuários Não Autenticados

- **Condição:** `usuario` é `null`.
- **Telas Disponíveis:**
  - `TelaInicial`: A primeira tela que o usuário vê.
  - `TelaLogin`: Para usuários existentes fazerem login.
  - `TelaCadastro`: Para novos usuários se registrarem.
  - `TelaCompletarPerfil`: Parte do fluxo de registro.
  - `TelaVerificarEmail`: Parte do fluxo de registro.

Este conjunto de telas guia o usuário através do processo de login e registro antes de dar acesso ao conteúdo principal do aplicativo.

### 3. Pilha de Navegação para Usuários Autenticados

- **Condição:** O objeto `usuario` existe.
- **Lógica de Roteamento:** Após a autenticação, o navegador verifica o `usuario.tipoUsuario` para decidir qual dashboard e conjunto de ferramentas apresentar.

#### a) Pilha do Vendedor (`usuario.tipoUsuario === 'vendedor'`)
- `DashboardVendedor`: Tela principal com métricas e atalhos.
- `CadastroProduto`: Formulário para adicionar novos produtos.
- `MeusProdutos`: Lista de produtos e ofertas do vendedor.
- `EditarPerfilVendedor`: Para atualizar informações da loja.
- `AnaliseMercadoSaaS`: Acesso às ferramentas de análise de concorrência.
- E outras telas relacionadas ao ecossistema do vendedor.

#### b) Pilha do Cliente (`usuario.tipoUsuario === 'cliente'`)
- `BemVindo` / `DashboardCliente`: Tela principal do cliente.
- `BuscaProdutos`: Ferramenta para pesquisar produtos.
- `Produtos`: Tela para visualizar detalhes de produtos.
- `MinhasAvaliacoesDetalhe`: Para ver o histórico de avaliações.
- `IndicarVendedor`: Funcionalidade social.

### 4. Telas Comuns

Algumas telas, como `TelaPrivacidade`, `TelaTermos` e `TelaContato`, estão disponíveis para todos os usuários, independentemente do estado de autenticação, e são envolvidas pelo layout principal `MainLayout` para manter a consistência visual.
