# Autenticação

O sistema de autenticação é baseado em JSON Web Tokens (JWT).

## Fluxo de Autenticação

1.  **Obtenção do Token:** O cliente (web ou mobile) envia as credenciais (`email` e `password`) para um endpoint de login.
    - `POST /api/token/` (Endpoint padrão do `djangorestframework-simplejwt`)
2.  **Resposta:** A API valida as credenciais e retorna um `access_token` e um `refresh_token`.
3.  **Uso do Token:** Em todas as requisições subsequentes para endpoints protegidos, o cliente deve enviar o `access_token` no cabeçalho `Authorization`.

    ```
    Authorization: Bearer <seu_access_token>
    ```

## Níveis de Acesso (Papéis)

O sistema utiliza flags no modelo `Usuario` para controlar o acesso:

-   **`is_cliente`**: Acesso a funcionalidades de cliente, como criar listas de compra e ver produtos.
-   **`is_vendedor`**: Acesso a funcionalidades de vendedor, como cadastrar produtos e usar o dashboard de monitoramento.
-   **`is_staff` / `is_superuser`**: Acesso ao painel de administração do Django e, geralmente, a todos os endpoints da API.

As permissões nos endpoints da API (ex: `IsVendedorOrAdmin`) garantem que apenas usuários com o papel correto possam executar determinadas ações (como criar um produto).