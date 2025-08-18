# Gerenciamento de Estado

Este documento descreve como o gerenciamento de estado é tratado no frontend web do Caça-Preço.

## Context API

O gerenciamento de estado global é feito usando a Context API do React. O principal contexto utilizado é o `AuthContext`, que gerencia o estado de autenticação do usuário.

## Estado Local

Para o estado que é local a um componente, o hook `useState` do React é utilizado.

## Comunicação com a API

A comunicação com a API do backend é feita usando a biblioteca `axios`. As chamadas à API são encapsuladas em funções de serviço, que são então chamadas pelos componentes.
