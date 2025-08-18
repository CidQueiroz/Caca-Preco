# Referência da API (Django)

Esta é a documentação de referência para a API principal do Caça-Preço, construída com Django Rest Framework.

## Autenticação

A autenticação é baseada em JSON Web Tokens (JWT). Obtenha um token enviando as credenciais de e-mail e senha e, em seguida, inclua o token no cabeçalho `Authorization` de todas as requisições protegidas.

- **Endpoint de Login:** `POST /api/login/`
- **Endpoint de Refresh de Token:** `POST /api/login/refresh/`
- **Cabeçalho:** `Authorization: Bearer <seu_access_token>`

## Endpoints Principais

A maioria dos endpoints segue o padrão RESTful e é exposta através de um `DefaultRouter`.

### Usuários e Perfis
- `POST /api/registrar/`: Cria um novo usuário base.
- `GET /api/perfil/`: Retorna o perfil completo (`Cliente` ou `Vendedor`) do usuário autenticado.
- `GET, PUT /api/clientes/{id}/`: Gerencia o perfil de um cliente.
- `GET, PUT /api/vendedores/{id}/`: Gerencia o perfil de um vendedor.

### Produtos, SKUs e Ofertas
- `GET, POST /api/produtos/`: Lista ou cria um produto base.
- `GET, POST /api/skus/`: Lista ou cria uma variação (SKU) de um produto.
- `GET, POST /api/ofertas/`: Lista ou cria uma oferta de um vendedor para um SKU específico. É aqui que o preço é definido.
- `GET, PUT, DELETE /api/ofertas/{id}/`: Gerencia uma oferta existente.

### Categorias e Atributos
- `GET /api/categorias/`: Lista todas as categorias de loja (Supermercado, Farmácia, etc.).
- `GET /api/subcategorias/`: Lista as subcategorias de produtos.
- `GET, POST /api/atributos/`: Gerencia os atributos para variações de produtos (ex: Tamanho, Cor).
- `GET, POST /api/valores-atributos/`: Gerencia os valores para os atributos (ex: P, M, G).

### Módulo SaaS - Monitoramento
- `GET, POST /api/monitoramento/`: Permite que um vendedor autenticado liste ou adicione produtos de concorrentes para monitoramento.
- `GET, PUT, DELETE /api/monitoramento/{id}/`: Gerencia um item de monitoramento específico.

### Outros Endpoints
- `GET /api/enderecos/`: Lista os endereços.
- `GET, POST /api/avaliacoes/`: Lista ou cria avaliações de lojas.
- `POST /api/sugestoes/`: Envia uma sugestão para a plataforma.

### Recuperação de Senha e Verificação de E-mail
- `POST /api/recuperar-senha/`: Inicia o fluxo de recuperação de senha.
- `POST /api/redefinir-senha/<uuid:token>/`: Define uma nova senha usando o token recebido.
- `GET /api/verificar-email/<uuid:token>/`: Verifica o e-mail do usuário usando o token de verificação.
- `POST /api/reenviar-verificacao/`: Reenvia o e-mail com o token de verificação.