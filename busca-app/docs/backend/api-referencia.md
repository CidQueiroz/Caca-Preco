# Referência da API Backend

Esta documentação descreve os principais endpoints da API do Caça-Preço.

## Endpoints Principais

A API é construída com Django Rest Framework e utiliza ViewSets, que geram automaticamente os endpoints padrão para um recurso (list, create, retrieve, update, delete).

### `/api/usuarios/`
- **Recurso:** `UsuarioViewSet`
- **Descrição:** Gerencia os usuários do sistema. Apenas administradores têm acesso total. Usuários podem visualizar e editar seus próprios dados.
- **Permissões:** `IsAuthenticated`

### `/api/produtos/`
- **Recurso:** `ProdutoViewSet`
- **Descrição:** Gerencia os produtos cadastrados. Vendedores podem criar, editar e deletar seus próprios produtos. Clientes podem apenas visualizar.
- **Permissões:** `IsAuthenticated`, `IsVendedorOrAdmin` (para escrita), `IsOwnerOrReadOnly`

### `/api/ofertas/`
- **Recurso:** `OfertaProdutoViewSet`
- **Descrição:** Gerencia as ofertas de um produto.
- **Permissões:** `IsAuthenticated`

### `/api/monitoramentos/`
- **Recurso:** `MonitoramentoViewSet`
- **Descrição:** Permite que vendedores gerenciem os links de produtos concorrentes que desejam monitorar.
- **Permissões:** `IsAuthenticated`, `IsVendedorOrAdmin`, `IsOwnerOrReadOnly`

### `/api/scrape/`
- **Recurso:** `scrape_product_view` (View customizada)
- **Método:** `POST`
- **Corpo da Requisição:** `{ "url": "http://url.do.produto.concorrente" }`
- **Descrição:** Dispara uma tarefa de scraping para a URL fornecida.
- **⚠️ AVISO CRÍTICO:** Este endpoint executa o scraping de forma **síncrona**, o que o torna extremamente lento e instável. Ele bloqueia o servidor e pode causar timeouts facilmente. **NÃO USE EM PRODUÇÃO.** A arquitetura deve ser refatorada para usar uma fila de tarefas assíncronas (ex: Celery).