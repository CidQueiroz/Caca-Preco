# Busca App - Backend

Este projeto é um aplicativo de busca desenvolvido com Node.js e React. A parte backend da aplicação é responsável por gerenciar a autenticação de usuários, produtos e suas respectivas rotas.

## Estrutura do Projeto

A estrutura do projeto backend é a seguinte:

```
backend
├── src
│   ├── controllers
│   │   ├── authController.js      # Gerencia a autenticação de usuários
│   │   ├── productController.js    # Gerencia produtos
│   │   └── userController.js       # Gerencia usuários
│   ├── models
│   │   ├── product.js              # Modelo de dados para produtos
│   │   └── user.js                 # Modelo de dados para usuários
│   ├── routes
│   │   ├── authRoutes.js           # Rotas de autenticação
│   │   ├── productRoutes.js        # Rotas de produtos
│   │   └── userRoutes.js           # Rotas de usuários
│   ├── middlewares
│   │   └── authMiddleware.js       # Middleware de autenticação
│   ├── app.js                      # Ponto de entrada da aplicação
│   └── config.js                   # Configurações do aplicativo
├── package.json                    # Configuração do npm
└── README.md                       # Documentação do projeto
```

## Funcionalidades

- **Cadastro de Usuários**: Permite que novos usuários se registrem como vendedores ou clientes.
- **Login de Usuários**: Usuários podem fazer login para acessar suas contas.
- **Listagem de Produtos**: Usuários podem visualizar produtos disponíveis.
- **Busca de Produtos**: Funcionalidade para buscar produtos específicos.

## Tecnologias Utilizadas

- Node.js
- Express
- MongoDB (ou outro banco de dados de sua escolha)
- JWT (JSON Web Tokens) para autenticação

## Como Executar o Projeto

1. Clone o repositório:
   ```
   git clone <URL_DO_REPOSITORIO>
   ```

2. Navegue até a pasta do backend:
   ```
   cd busca-app/backend
   ```

3. Instale as dependências:
   ```
   npm install
   ```

4. Configure as variáveis de ambiente no arquivo `.env`.

5. Inicie o servidor:
   ```
   npm start
   ```

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

## Licença

Este projeto está licenciado sob a MIT License.