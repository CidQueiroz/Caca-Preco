# Fluxo de Autenticação

Este documento descreve o fluxo de autenticação para o Caça-Preço.

## Visão Geral

A autenticação é baseada em JSON Web Tokens (JWT). O fluxo geral é o seguinte:

1. O usuário se registra ou faz login com suas credenciais (email e senha).
2. O servidor valida as credenciais.
3. Se as credenciais forem válidas, o servidor gera um token JWT e o envia de volta para o cliente.
4. O cliente armazena o token JWT (por exemplo, em `localStorage` ou `sessionStorage`).
5. Para cada solicitação subsequente a uma rota protegida, o cliente envia o token JWT no cabeçalho de autorização.
6. O servidor valida o token JWT. Se for válido, o servidor permite o acesso à rota protegida.

## Middleware de Autenticação

O middleware de autenticação (`authMiddleware.js`) é responsável por proteger as rotas. Ele verifica a presença e a validade do token JWT no cabeçalho de autorização de cada solicitação.

## Papéis de Usuário

O sistema utiliza um sistema de controle de acesso baseado em papéis. Os papéis são:

- `client`: Cliente
- `seller`: Vendedor
- `admin`: Administrador

O middleware de autenticação também verifica se o usuário tem o papel necessário para acessar uma rota específica.
