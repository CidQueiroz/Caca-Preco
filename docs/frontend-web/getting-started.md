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
    O projeto utiliza Create React App, que carrega variáveis de ambiente de arquivos `.env`. A URL da API não deve ser fixada no código.

    Crie um arquivo chamado `.env` na raiz da pasta `frontend/` e adicione a seguinte variável:

    ```env
    # .env
    REACT_APP_API_URL=http://127.0.0.1:8000/api
    ```
    O código em `src/api.js` deve ser atualizado para usar esta variável em vez de uma URL fixa.

4.  **Execute o servidor de desenvolvimento:**
    ```bash
    npm start
    ```
    A aplicação estará disponível em `http://localhost:3001` (ou outra porta indicada pelo Create React App).

## Scripts Disponíveis
- `npm start`: Inicia o servidor de desenvolvimento.
- `npm build`: Gera a versão de produção da aplicação na pasta `build/`.
- `npm test`: Executa os testes.
- `npm eject`: Ejeta a configuração do Create React App.
