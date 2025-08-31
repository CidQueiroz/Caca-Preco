# Guia de Início Rápido (Frontend Mobile)

Siga estas instruções para configurar e executar o ambiente de desenvolvimento do aplicativo mobile com React Native e Expo.

## Pré-requisitos
- Node.js e npm instalados.
- Expo Go instalado no seu dispositivo móvel (Android/iOS) ou um emulador configurado.
- O backend Django deve estar em execução e acessível pela sua rede local.

## Configuração

1.  **Navegue até a pasta do mobile:**
    ```bash
    cd mobile
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure a URL da API:**
    O aplicativo precisa saber o endereço de IP da sua máquina na rede local para se comunicar com o backend. **Nunca fixe o IP no código.** Use o campo `extra` no arquivo `app.json`.

    Abra o arquivo `app.json` e adicione a seguinte configuração, **substituindo `192.168.0.101` pelo IP da sua máquina:**
    ```json
    {
      "expo": {
        // ... outras configurações
        "extra": {
          "apiUrl": "http://192.168.0.101:8000/api"
        }
      }
    }
    ```
    Para obter o IP da sua máquina no Windows, use o comando `ipconfig` no terminal.

    No código do `apiClient.js`, acesse essa variável da seguinte forma:
    ```javascript
    import Constants from 'expo-constants';
    const baseURL = Constants.expoConfig.extra.apiUrl;
    ```

4.  **Execute o servidor de desenvolvimento:**
    ```bash
    npx expo start
    ```
    Isso abrirá o Metro Bundler no seu navegador. Escaneie o QR code com o aplicativo Expo Go no seu celular para abrir o app.