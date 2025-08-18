# Guia de Início Rápido (Frontend Web)

Este guia irá ajudá-lo a configurar e executar o frontend web do Caça-Preço.

## Pré-requisitos

- Node.js (versão 14 ou superior)
- npm ou yarn

## Instalação

1. Clone o repositório.
2. Navegue até o diretório `frontend`.
3. Instale as dependências:

   ```bash
   npm install
   ```

   ou

   ```bash
   yarn install
   ```

## Configuração

1. Crie um arquivo `.env.development` na raiz do diretório `frontend`.
2. Adicione as seguintes variáveis de ambiente ao arquivo `.env.development`:

   ```
   REACT_APP_API_URL=http://localhost:3001/api
   ```

## Executando a Aplicação

Para iniciar o servidor de desenvolvimento, execute o seguinte comando:

```bash
npm start
```

ou

```bash
yarn start
```

A aplicação estará disponível em `http://localhost:3001`.
