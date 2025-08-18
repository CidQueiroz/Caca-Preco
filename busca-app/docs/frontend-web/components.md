# Guia de Componentes React

Este documento fornece uma visão geral dos principais componentes React usados no frontend web do Caça-Preço.

## Componentes Principais

- `BarraNavegacao.jsx`: A barra de navegação superior.
- `BuscaProdutos.jsx`: O componente de busca de produtos.
- `Estrutura.jsx`: O layout principal da aplicação.
- `Footer.jsx`: O rodapé da aplicação.
- `FormularioCadastro.jsx`: O formulário de cadastro de usuário.
- `FormularioLogin.jsx`: O formulário de login de usuário.
- `ListaProdutos.jsx`: A lista de produtos.
- `RotaProtegida.jsx`: Um componente de ordem superior para proteger rotas que requerem autenticação.

## Contexto de Autenticação

O `AuthContext.jsx` fornece o contexto de autenticação para a aplicação. Ele expõe o usuário atual, o token JWT e as funções de login e logout.

## Páginas

As páginas da aplicação estão localizadas no diretório `src/pages`. Cada página corresponde a uma rota na aplicação.

- `Privacidade.jsx`: A página de política de privacidade.
- `Termos.jsx`: A página de termos de serviço.
- `Contato.jsx`: A página de contato.
