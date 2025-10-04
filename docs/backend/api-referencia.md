# Referência da API Backend

Esta documentação descreve os principais endpoints da API do Caça-Preço.

## Endpoints Principais

A API é construída com Django Rest Framework e utiliza ViewSets, que geram automaticamente os endpoints padrão para um recurso (list, create, retrieve, update, delete).

### Autenticação e Gerenciamento de Usuários

-   `POST /api/token/`
    -   **Recurso:** `MyTokenObtainPairView`
    -   **Descrição:** Autentica um usuário e retorna um par de tokens JWT (acesso e atualização).
-   `POST /api/usuarios/`
    -   **Recurso:** `UserCreateView`
    -   **Descrição:** Cria um novo usuário.
-   `GET/PUT /api/perfil/`
    -   **Recurso:** `ObterPerfilView`
    -   **Descrição:** Obtém e atualiza o perfil do usuário autenticado (cliente ou vendedor).
-   `POST /api/recuperar-senha/`
    -   **Recurso:** `RecuperarSenhaView`
    -   **Descrição:** Inicia o processo de recuperação de senha.
-   `POST /api/redefinir-senha/<token>/`
    -   **Recurso:** `RedefinirSenhaView`
    -   **Descrição:** Redefine a senha do usuário usando um token de verificação.
-   `GET /api/verificar-email/<token>/`
    -   **Recurso:** `VerificarEmailView`
    -   **Descrição:** Verifica o e-mail de um usuário usando um token de verificação.
-   `POST /api/reenviar-verificacao/`
    -   **Recurso:** `ReenviarVerificacaoView`
    -   **Descrição:** Reenvia o e-mail de verificação.

### Produtos e Ofertas

-   `/api/produtos/`
    -   **Recurso:** `ProdutoViewSet`
    -   **Descrição:** Gerencia os produtos cadastrados. Vendedores podem criar, editar e deletar seus próprios produtos. Clientes podem apenas visualizar.
    -   **Permissões:** `IsAuthenticated`, `IsVendedorOrAdmin` (para escrita), `IsOwnerOrReadOnly`
-   `GET /api/produtos/meus-produtos/`
    -   **Recurso:** `ProdutoViewSet` (ação customizada)
    -   **Descrição:** Lista os produtos do vendedor autenticado.
-   `/api/ofertas/`
    -   **Recurso:** `OfertaProdutoViewSet`
    -   **Descrição:** Gerencia as ofertas de um produto.
    -   **Permissões:** `IsAuthenticated`

### Monitoramento de Concorrência

-   `/api/monitoramentos/`
    -   **Recurso:** `ProdutosMonitoradosExternosViewSet`
    -   **Descrição:** Permite que vendedores gerenciem os links de produtos concorrentes que desejam monitorar. A criação de um novo monitoramento dispara uma tarefa de scraping para a URL fornecida.
    -   **Permissões:** `IsAuthenticated`, `IsVendedor`
-   `GET /api/historico-precos/<pk>/`
    -   **Recurso:** `HistoricoPrecosView`
    -   **Descrição:** Retorna o histórico de preços de um produto monitorado.
-   **⚠️ AVISO CRÍTICO:** O scraping é executado de forma **síncrona** dentro da requisição, o que o torna lento e instável. Ele bloqueia o servidor e pode causar timeouts facilmente. **NÃO USE EM PRODUÇÃO.** A arquitetura deve ser refatorada para usar uma fila de tarefas assíncronas (ex: Celery).

### Outros

-   `/api/categorias-loja/`
    -   **Recurso:** `CategoriaLojaViewSet`
    -   **Descrição:** Gerencia as categorias de loja.
-   `/api/sugestoes/`
    -   **Recurso:** `SugestaoCreateView`
    -   **Descrição:** Permite que usuários enviem sugestões.
