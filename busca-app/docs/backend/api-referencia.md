# Referência da API

Esta é a documentação de referência da API para o backend do Caça-Preço.

## Endpoints

### Autenticação

- `POST /api/auth/register`: Registrar um novo usuário.
- `POST /api/auth/login`: Autenticar um usuário e obter um token JWT.

### Usuários

- `GET /api/users`: Obter uma lista de usuários (requer autenticação de administrador).
- `GET /api/users/:id`: Obter um usuário específico.
- `PUT /api/users/:id`: Atualizar um usuário.
- `DELETE /api/users/:id`: Deletar um usuário.

### Produtos

- `GET /api/products`: Obter uma lista de produtos.
- `GET /api/products/:id`: Obter um produto específico.
- `POST /api/products`: Criar um novo produto (requer autenticação de vendedor).
- `PUT /api/products/:id`: Atualizar um produto (requer autenticação de vendedor).
- `DELETE /api/products/:id`: Deletar um produto (requer autenticação de vendedor).

### Categorias

- `GET /api/categories`: Obter uma lista de categorias.
- `GET /api/categories/:id`: Obter uma categoria específica.
- `POST /api/categories`: Criar uma nova categoria (requer autenticação de administrador).
- `PUT /api/categories/:id`: Atualizar uma categoria (requer autenticação de administrador).
- `DELETE /api/categories/:id`: Deletar uma categoria (requer autenticação de administrador).

### Dashboard

- `GET /api/dashboard`: Obter dados para o dashboard (requer autenticação).

### Monitoramento

- `GET /api/monitor`: Obter dados de monitoramento (requer autenticação de vendedor).
- `POST /api/monitor`: Adicionar um novo item para monitoramento (requer autenticação de vendedor).
