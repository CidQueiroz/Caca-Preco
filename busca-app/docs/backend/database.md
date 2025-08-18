# Esquema do Banco de Dados (Django)

Esta documentação descreve o esquema do banco de dados da API principal do Caça-Preço, gerenciado pelos modelos do Django em `backend/api/models.py`.

## Tabela de Usuários e Perfis

### `api_usuario`
Armazena a base de todos os usuários, com sistema de papéis e controle de acesso.

| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `int` | Chave Primária |
| `password` | `varchar` | Hash da senha |
| `last_login` | `datetime` | Data do último login |
| `is_superuser`| `bool` | Acesso de superusuário |
| `email` | `varchar` | Email único para login |
| `tipo_usuario`| `varchar` | Define o papel: 'Cliente', 'Vendedor', 'Administrador' |
| `is_staff` | `bool` | Acesso ao painel de admin do Django |
| `is_active` | `bool` | Status da conta (ativa/inativa) |
| `date_joined` | `datetime` | Data de cadastro |
| `email_verificado` | `bool` | Flag para verificação de e-mail |
| `token_verificacao` | `uuid` | Token para validar o e-mail |

### `api_cliente`
Dados específicos para usuários do tipo "Cliente".

| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `usuario_id` | `int` | Chave Primária e Estrangeira para `api_usuario` |
| `nome` | `varchar` | Nome completo do cliente |
| `telefone` | `varchar` | Telefone de contato |
| `endereco_id` | `int` | Chave Estrangeira para `api_endereco` |
| `cpf` | `varchar` | CPF único do cliente |
| `data_nascimento` | `date` | Data de nascimento |

### `api_vendedor`
Dados específicos para usuários do tipo "Vendedor".

| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `usuario_id` | `int` | Chave Primária e Estrangeira para `api_usuario` |
| `nome_loja` | `varchar` | Nome da loja do vendedor |
| `cnpj` | `varchar` | CNPJ único da loja |
| `endereco_id` | `int` | Chave Estrangeira para `api_endereco` |
| `telefone` | `varchar` | Telefone comercial |
| `categoria_loja_id` | `int` | Chave Estrangeira para `api_categorialoja` |
| `status_aprovacao` | `varchar` | Status: 'Pendente', 'Aprovado', 'Rejeitado' |
| `breve_descricao_loja` | `text` | Descrição da loja |
| `logotipo_loja` | `varchar` | URL para o logotipo |

---

## Tabelas de Produtos e Ofertas

### `api_produto`
Catálogo central de tipos de produtos.

| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `int` | Chave Primária |
| `nome` | `varchar` | Nome do produto (ex: "Leite Integral") |
| `descricao` | `text` | Descrição detalhada |
| `subcategoria_id` | `int` | Chave Estrangeira para `api_subcategoriaproduto` |

### `api_sku`
Representa uma variação específica de um produto (ex: "Leite Integral 1L Caixa").

| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `int` | Chave Primária |
| `produto_id` | `int` | Chave Estrangeira para `api_produto` |
| `codigo_sku` | `varchar` | Código único para a variação |

### `api_ofertaproduto`
A oferta de um SKU específico por um vendedor. É aqui que o preço é definido.

| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `int` | Chave Primária |
| `vendedor_id` | `int` | Chave Estrangeira para `api_vendedor` |
| `sku_id` | `int` | Chave Estrangeira para `api_sku` |
| `preco` | `decimal` | Preço do produto ofertado |
| `quantidade_disponivel` | `int` | Estoque disponível |
| `ativo` | `bool` | Se a oferta está ativa |

---

## Tabelas de Categorização e Atributos

### `api_categorialoja`
Categorias para as lojas dos vendedores (ex: "Supermercado", "Farmácia").

| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `int` | Chave Primária |
| `nome` | `varchar` | Nome da categoria |

### `api_subcategoriaproduto`
Subcategorias de produtos, ligadas a uma categoria de loja (ex: "Laticínios" dentro de "Supermercado").

| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | `int` | Chave Primária |
| `nome` | `varchar` | Nome da subcategoria |
| `categoria_loja_id` | `int` | Chave Estrangeira para `api_categorialoja` |

### `api_atributo` e `api_valoratributo`
Permitem criar variações complexas para os SKUs (ex: Atributo "Tamanho" com Valor "500ml").

---

## Outras Tabelas

- **`api_endereco`**: Armazena endereços de forma centralizada para clientes e vendedores.
- **`api_avaliacaoloja`**: Guarda as avaliações que os clientes fazem das lojas.
- **`api_produtosmonitoradosexternos`**: Tabela para o módulo SaaS, armazena URLs de produtos concorrentes para monitoramento.