# Esquema do Banco de Dados

Esta documentação descreve o esquema do banco de dados para o projeto Caça-Preço.

## Tabelas

### `users`

- `id` (INT, PK, AI)
- `name` (VARCHAR)
- `email` (VARCHAR, UNIQUE)
- `password` (VARCHAR)
- `role` (ENUM('client', 'seller', 'admin'))
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### `products`

- `id` (INT, PK, AI)
- `name` (VARCHAR)
- `description` (TEXT)
- `price` (DECIMAL)
- `image_url` (VARCHAR)
- `seller_id` (INT, FK to `users.id`)
- `category_id` (INT, FK to `categories.id`)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### `categories`

- `id` (INT, PK, AI)
- `name` (VARCHAR, UNIQUE)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### `addresses`

- `id` (INT, PK, AI)
- `user_id` (INT, FK to `users.id`)
- `street` (VARCHAR)
- `city` (VARCHAR)
- `state` (VARCHAR)
- `zip_code` (VARCHAR)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### `monitoring`

- `id` (INT, PK, AI)
- `seller_id` (INT, FK to `users.id`)
- `product_url` (VARCHAR)
- `last_price` (DECIMAL)
- `last_checked_at` (TIMESTAMP)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
