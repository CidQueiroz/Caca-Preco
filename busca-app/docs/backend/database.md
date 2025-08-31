# Esquema do Banco de Dados

Este documento descreve as principais tabelas (modelos Django) do banco de dados da aplicação.

## Modelos Principais

### `Usuario`
Herda do `AbstractUser` do Django. É a base para todos os usuários.
- `email`: Usado como login principal.
- `nome_completo`: Nome do usuário.
- `is_cliente`: Booleano que indica se o usuário é um cliente.
- `is_vendedor`: Booleano que indica se o usuário é um vendedor.

### `Cliente`
Relacionamento 1-para-1 com `Usuario`.
- `cpf`: CPF do cliente.
- `telefone`: Telefone de contato.

### `Vendedor`
Relacionamento 1-para-1 com `Usuario`.
- `nome_loja`: Nome da loja do vendedor.
- `cnpj`: CNPJ da loja.
- `telefone_comercial`: Telefone da loja.

### `Endereco`
- `logradouro`, `numero`, `bairro`, `cidade`, `estado`, `cep`
- `usuario`: Chave estrangeira para `Usuario`, indicando a qual usuário o endereço pertence.

### `Produto`
- `nome`: Nome do produto.
- `descricao`: Descrição detalhada.
- `marca`: Marca do produto.
- `vendedor`: Chave estrangeira para `Vendedor`, indicando quem vende o produto.

### `OfertaProduto`
Representa o preço de um produto em uma loja.
- `produto`: Chave estrangeira para `Produto`.
- `preco`: Preço da oferta.
- `link_oferta`: Link direto para a página da oferta.

### `Monitoramento`
Armazena as configurações de monitoramento para um vendedor.
- `vendedor`: Chave estrangeeira para `Vendedor`.
- `produto_url`: A URL do produto concorrente a ser monitorado.
- `intervalo_verificacao`: Frequência em que o scraping deve ocorrer (em horas).