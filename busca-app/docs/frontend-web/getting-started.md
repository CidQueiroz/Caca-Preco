# Guia de Início Rápido (Frontend Web)

Siga estas instruções para configurar e executar o ambiente de desenvolvimento do frontend web.

## Pré-requisitos
- Node.js e npm instalados.
- O backend Django deve estar em execução.

## Configuração

1.  **Navegue até a pasta do frontend:**
    ```bash
    cd frontend
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as Variáveis de Ambiente:**
    O projeto utiliza Vite, que carrega variáveis de ambiente de arquivos `.env`. A URL da API não deve ser fixada no código.

    Crie um arquivo chamado `.env.local` na raiz da pasta `frontend/` e adicione a seguinte variável:

    ```env
    # .env.local
    VITE_API_URL=http://127.0.0.1:8000/api
    ```
    O código em `src/api.js` deve ser atualizado para usar esta variável em vez de uma URL fixa.

4.  **Execute o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```
    A aplicação estará disponível em `http://localhost:5173` (ou outra porta indicada pelo Vite).

## Scripts Disponíveis
- `npm run dev`: Inicia o servidor de desenvolvimento.
- `npm run build`: Gera a versão de produção da aplicação na pasta `dist/`.
- `npm run lint`: Executa o linter para verificar a qualidade do código.
- `npm run preview`: Inicia um servidor local para visualizar a build de produção.