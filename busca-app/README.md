# Caça-Preço (Web) / CacaPreco (Mobile)

 ## Visão Geral do Projeto

O "Caça-Preço" é um marketplace multiplataforma inovador que visa conectar clientes e vendedores, empoderando os usuários a encontrar os melhores preços em produtos do dia a dia. Expandindo o conceito tradicional de listas de compras, a plataforma permite que vendedores cadastrem e gerenciem seus produtos e lojas, enquanto os clientes podem otimizar suas compras através de comparação de preços e sugestões inteligentes.

A aplicação é construída sobre um ecossistema unificado de JavaScript/TypeScript, garantindo coesão e eficiência no desenvolvimento entre as diferentes plataformas.

## Funcionalidades Chave

### Gerenciamento de Usuários e Papéis
*   **Cadastro e Login:** Clientes, Vendedores e Administradores podem se cadastrar e fazer login com permissões distintas.
*   **Verificação de E-mail:** Fluxo robusto de confirmação de e-mail para garantir a validade das contas, com opção de reenvio de código.
*   **Preenchimento de Perfil Obrigatório:** Após o cadastro inicial e verificação de e-mail, os usuários são direcionados para completar seus perfis com informações específicas (cliente ou vendedor).

### Gestão de Produtos por Vendedores
*   Vendedores podem adicionar, listar e gerenciar seus próprios produtos (funcionalidade a ser expandida).

### Busca e Comparação de Preços para Clientes
*   Clientes podem criar listas de compras e buscar o menor preço para cada item.
*   Comparação de preços entre diferentes estabelecimentos.

### Sugestão de Compra Otimizada
*   O aplicativo sugere a combinação de estabelecimentos com o melhor custo-benefício para a lista completa do cliente.
*   Flexibilidade para o usuário consolidar a compra em menos lojas, mesmo com pequenas variações de preço.

### Sugestões Inteligentes (Fase Inicial)
*   Utiliza inteligência artificial (baseada em localização via Google Maps e categorização) para sugerir estabelecimentos próximos que vendem os itens desejados, mesmo que não estejam formalmente cadastrado plataforma.

## Arquitetura e Tecnologias

A aplicação é dividida em três componentes principais, todos utilizando um ecossistema unificado de JavaScript/TypeScript:

### 1. Backend (API Central)
*   **Tecnologias:** Node.js, Express.js, MySQL (Banco de Dados), JSON Web Tokens (JWT) para autenticação.
*   **Estrutura:** Segue um padrão modular com `controllers` (lógica de negócio para autenticação, produtos, usuários, categorias), `models` (schemas para `USUARIO`, `CLIENTE`, `VENDEDOR`, `CATEGORIA_LOJA`, `PRODUTO`, etc.), `routes` (endpoints da API) e `middlewares` (autenticação de rota).

### 2. Frontend Web (Aplicação Web para Cliente/Vendedor/Admin)
*   **Tecnologias:** React, React Router, Axios (comunicação com API), Context API (para gerenciamento de estado de autenticação).
*   **Funcionalidades:** Páginas para Home, Login, Cadastro, Completar Perfil, Verificar E-mail e rotas protegidas que validam o tipo de usuário. Inclui um `DashboardRedirect` para direcionar usuários após o login.

### 3. Frontend Mobile (Aplicação para Android/iOS)
*   **Tecnologias:** React Native, React Navigation, Axios, Context API (autenticação).
*   **Funcionalidades:** Telas de Home (com personagem "Lourdes", layout responsivo), Login, Cadastro, Completar Perfil, Verificar E-mail.

## Configuração e Instalação

Para configurar e rodar o projeto localmente, siga os passos abaixo para cada componente.

### Pré-requisitos
*   Node.js (versão 18 ou superior recomendada)
*   npm (Node Package Manager) ou Yarn
*   MySQL Server

### 1. Backend (API Central)

1.  **Navegue até o diretório do backend:**

      cd busca-app/backend

2.  **Instale as dependências:**

      npm install

3.  **Configuração do Banco de Dados:**
*   Crie um banco de dados MySQL.
*   Utilize o script SQL fornecido em `banco.txt` para criar as tabelas necessárias.
*   **Importante:** Popule a tabela `CATEGORIA_LOJA` com algumas categorias para que o frontend possa carregá-las (ex: `INSERT INTO CATEGORIA_LOJA (NomeCategoria, Descricao) VALUES ('Supermercado', 'Lojas que vendem produtos alimentícios e de uso doméstico.');`).
4.  **Variáveis de Ambiente:**
*   Crie um arquivo `.env` na raiz do diretório `busca-app/backend/` com as seguintes variáveis:

          PORT=3000
          JWT_SECRET=sua_chave_secreta_jwt_aqui
          DB_HOST=localhost
          DB_USER=seu_usuario_mysql
          DB_PASSWORD=sua_senha_mysql
          DB_NAME=seu_nome_do_banco_de_dados

5.  **Inicie o servidor:**

      node servidor.js


   O servidor estará rodando na porta especificada (padrão: 3000).

### 2. Frontend Web
1.  **Navegue até o diretório do frontend web:**

      cd busca-app/frontend

2.  **Instale as dependências:**

      npm install


3.  **Variáveis de Ambiente:**
*   Crie um arquivo `.env.development` na raiz do diretório `busca-app/frontend/` com a seguinte variável:

          REACT_APP_API_URL=http://localhost:3001


         (Certifique-se de que a porta corresponde à porta do seu backend).

4.  **Inicie a aplicação web:**

      npm start

  A aplicação será aberta no seu navegador (padrão: `http://localhost:3001`).

### 3. Frontend Mobile

1.  **Navegue até o diretório do frontend mobile:**

      cd busca-app/mobile

2.  **Instale as dependências:**

      npm install


3.  **Configuração da API URL:**
*   Abra o arquivo `app.json` e adicione a URL da sua API dentro da seção `expo.extra`:

          {
            "expo": {
              "name": "CacaPrecoMobile",
              "slug": "CacaPrecoMobile",
              // ... outras configurações
              "extra": {
                "apiUrl": "http://192.168.x.x:3000" // Use o IP da sua máquina e a porta do backend
              }
            }
          }


**Importante:** Para testes em dispositivos reais ou emuladores, `localhost` não funcionará. Use o endereço IP da sua máquina na
     rede local.

4.  **Inicie a aplicação mobile:**

      npm start


  Isso abrirá o Expo Dev Tools no seu navegador, onde você pode escolher como rodar a aplicação (emulador, dispositivo físico, etc.).
  
## Fluxo de Uso (Exemplo de Cadastro e Login)

1.  **Cadastro Inicial:**
*   Acesse a tela de cadastro (Web: `/cadastro`, Mobile: `TelaCadastro`).
*   Preencha E-mail, Senha e Tipo de Usuário (Cliente/Vendedor).

2.  **Completar Perfil:**
*   Após o cadastro inicial, você será redirecionado para a tela "Completar Perfil".
*   Preencha os dados específicos para o seu tipo de usuário (Cliente ou Vendedor), incluindo os campos de endereço detalhados e a categoria da loja (para vendedores).

3.  **Verificação de E-mail:**
*   Após completar o perfil, você será direcionado para a tela "Verificar E-mail".
*   Para fins de desenvolvimento, o código de verificação é **`123456`**.
*   Você pode usar o botão "Reenviar Código" para "resetar" o código para `123456` a qualquer momento.

4.  **Login:**
*   Após a verificação bem-sucedida, você será redirecionado para a tela de Login.
*   Faça login com suas credenciais.
*   Se a conta estiver inativa, você será redirecionado para a tela de verificação de e-mail.
*   Se o perfil estiver incompleto, você será redirecionado para a tela de "Completar Perfil".
*   Após o login bem-sucedido e com o perfil completo, você será direcionado para o painel principal da aplicação.

## Contribuição

24 Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

26 ## Licença

MIT License

Copyright (c) 2028 Este projeto está licenciado sob a licença MIT.