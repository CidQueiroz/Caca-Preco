# Busca App

Este projeto é um aplicativo de busca desenvolvido com Node.js no backend e React no frontend. O aplicativo permite que usuários se cadastrem como vendedores ou clientes, além de oferecer funcionalidades para login, cadastro, listagem de produtos e busca.

## Estrutura do Projeto

O projeto é dividido em duas partes principais: `backend` e `frontend`.

### Backend

- **src/app.js**: Ponto de entrada da aplicação backend. Configura o servidor Express, conecta ao banco de dados e define as rotas principais.
- **src/config.js**: Contém as configurações do aplicativo, como variáveis de ambiente e configurações de banco de dados.
- **src/controllers**: Contém os controladores para gerenciar autenticação, produtos e usuários.
  - **authController.js**: Funções para gerenciar a autenticação de usuários.
  - **productController.js**: Funções para gerenciar produtos.
  - **userController.js**: Funções para gerenciar usuários.
- **src/models**: Define os modelos de dados para produtos e usuários.
  - **product.js**: Modelo de dados para produtos.
  - **user.js**: Modelo de dados para usuários.
- **src/routes**: Define as rotas da aplicação.
  - **authRoutes.js**: Rotas relacionadas à autenticação.
  - **productRoutes.js**: Rotas relacionadas a produtos.
  - **userRoutes.js**: Rotas relacionadas a usuários.
- **src/middlewares**: Contém middleware para autenticação.
  - **authMiddleware.js**: Middleware para verificar se o usuário está autenticado.
- **package.json**: Configuração do npm para o backend.

### Frontend

- **src/App.jsx**: Componente principal da aplicação frontend. Define as rotas e a estrutura básica da aplicação.
- **src/index.js**: Ponto de entrada da aplicação React. Renderiza o componente App no DOM.
- **src/components**: Contém os componentes reutilizáveis da aplicação.
  - **LoginForm.jsx**: Componente para o formulário de login.
  - **RegisterForm.jsx**: Componente para o formulário de registro.
  - **ProductList.jsx**: Componente para a lista de produtos.
  - **ProductSearch.jsx**: Componente para o campo de busca de produtos.
  - **Navbar.jsx**: Componente para a barra de navegação.
- **src/pages**: Contém as páginas da aplicação.
  - **Login.jsx**: Página de login.
  - **Register.jsx**: Página de registro.
  - **Products.jsx**: Página de listagem de produtos.
  - **Home.jsx**: Página inicial.
- **package.json**: Configuração do npm para o frontend.

## Como Executar o Projeto

1. Clone o repositório.
2. Navegue até a pasta `backend` e execute `npm install` para instalar as dependências.
3. Configure as variáveis de ambiente no arquivo `.env`.
4. Execute o servidor com `node src/app.js`.
5. Navegue até a pasta `frontend` e execute `npm install` para instalar as dependências.
6. Execute o aplicativo React com `npm start`.

## Contribuição

Sinta-se à vontade para contribuir com melhorias ou correções. Crie um fork do repositório e envie um pull request com suas alterações.