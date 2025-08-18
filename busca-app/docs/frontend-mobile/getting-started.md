# Guia de Início Rápido (Frontend Mobile)

Este guia irá ajudá-lo a configurar e executar o frontend mobile do Caça-Preço.

## Pré-requisitos

- Node.js (versão 14 ou superior)
- npm
- Expo CLI

## Instalação

1. Clone o repositório.
2. Navegue até o diretório `mobile`.
3. Instale as dependências:

   ```bash
   npm install
   ```

## Configuração

1. Crie um arquivo `.env` na raiz do diretório `mobile`.
2. Adicione as seguintes variáveis de ambiente ao arquivo `.env`:

   ```
   API_URL=http://localhost:3001/api
   ```

## Executando a Aplicação

Para iniciar o servidor de desenvolvimento, execute o seguinte comando:

```bash
npm start
```

Isso iniciará o Metro Bundler. Você pode então executar a aplicação em um emulador ou em seu dispositivo físico usando o aplicativo Expo Go.
