# Caça-Preço - Marketplace com Monitoramento Inteligente

## Visão Geral

O **Caça-Preço** é uma plataforma completa que une um marketplace dinâmico a uma poderosa ferramenta de monitoramento de concorrência para vendedores. Construído com uma arquitetura robusta, o projeto visa otimizar a experiência de compra para clientes e potencializar as vendas para os lojistas.

- **Para Clientes:** Uma plataforma intuitiva para criar listas de compras, comparar preços entre diferentes lojas e receber sugestões otimizadas para economizar ao máximo.
- **Para Vendedores:** Um portal para gerenciar produtos, lojas e ofertas, com acesso a um dashboard de análise de vendas e a um módulo SaaS exclusivo para monitorar preços de concorrentes de forma automatizada.

Este documento fornece um guia detalhado sobre a arquitetura do projeto, a estrutura dos diretórios e as instruções para configuração e execução de cada componente.

---

## Arquitetura e Tecnologias

O ecossistema do Caça-Preço é composto por três componentes principais que trabalham de forma integrada para entregar uma solução coesa e performática.

| Componente | Tecnologia | Propósito |
| :--- | :--- | :--- |
| **Backend** | **Python, Django, Django Rest Framework** | API RESTful central que gerencia toda a lógica de negócio, incluindo usuários, produtos, ofertas, autenticação (JWT) e o módulo SaaS. |
| **Frontend Web** | **React, React Router, Axios** | Aplicação web (SPA) para clientes, vendedores e administradores interagirem com a plataforma. |
| **Frontend Mobile** | **React Native, Expo, React Navigation** | Aplicativo móvel para Android e iOS, oferecendo uma experiência nativa para os clientes em trânsito. |

---

## Estrutura do Projeto

O repositório está organizado em diretórios distintos para cada componente da aplicação.

```
/
├── backend/              # API Principal (Python/Django)
├── frontend/             # Aplicação Web (React)
├── mobile/               # Aplicativo Móvel (React Native)
└── docs/                 # Documentação detalhada do projeto
```

---

## Configuração e Instalação

Siga os passos abaixo para configurar o ambiente de desenvolvimento local. É crucial instalar e executar o **Backend (Django)** e o **Frontend Web (React)** para a aplicação principal funcionar.

### 1. Backend (Django)

Este é o cérebro da aplicação.

1.  **Navegue até o diretório:**
    ```bash
    cd busca-app/backend
    ```

2.  **Crie e ative um ambiente virtual:**
    ```bash
    python -m venv venv
    # Windows
    .\venv\Scripts\activate
    # macOS/Linux
    source venv/bin/activate
    ```

3.  **Instale as dependências:**
    *Nota: Um arquivo `requirements.txt` não foi encontrado. Com base em `core/settings.py`, as dependências principais são `django`, `djangorestframework`, `djangorestframework-simplejwt`, `mysqlclient` e `django-cors-headers`.*
    ```bash
    pip install django djangorestframework djangorestframework-simplejwt mysqlclient django-cors-headers
    ```

4.  **Configure o Banco de Dados:**
    *   Abra o arquivo `core/settings.py`.
    *   Localize a seção `DATABASES` e atualize com suas credenciais do MySQL. O banco de dados `testecacapreco_django` deve ser criado previamente.

5.  **Execute as migrações e inicie o servidor:**
    ```bash
    python manage.py migrate
    python manage.py runserver
    ```
    A API estará disponível em `http://localhost:8000`.

### 2. Frontend Web (React)

A interface principal para interagir com o Caça-Preço.

1.  **Navegue até o diretório:**
    ```bash
    cd busca-app/frontend
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as Variáveis de Ambiente:**
    O projeto utiliza arquivos `.env` para carregar variáveis de ambiente, evitando que a URL da API seja fixada no código.

    Crie um arquivo chamado `.env` na raiz da pasta `frontend/` e adicione a seguinte variável, garantindo que a URL corresponda ao endereço do seu backend:
    ```env
    # .env
    REACT_APP_API_URL=http://127.0.0.1:8000/api
    ```
    O código em `src/api.js` deve ser configurado para usar esta variável.

4.  **Inicie a aplicação:**
    ```bash
    npm start
    ```
    A aplicação web será aberta em `http://localhost:3001`.

### 3. Frontend Mobile (React Native)

1.  **Navegue até o diretório:**
    ```bash
    cd busca-app/mobile
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure a URL da API:**
    *   Abra o arquivo `app.json`.
    *   Na seção `expo.extra`, adicione a chave `apiUrl` com o endereço IP da sua máquina na rede local onde o backend Django está rodando. **Não use `localhost`**.
    ```json
    "extra": {
      "apiUrl": "http://192.168.X.X:8000"
    }
    ```

4.  **Inicie a aplicação:**
    ```bash
    npm start
    ```
    Use o Expo Go app em seu dispositivo para escanear o QR code gerado.

---

## Documentação Adicional

Para uma visão mais aprofundada da arquitetura, endpoints da API e esquema do banco de dados, consulte a pasta `/docs`.

- **[Referência da API (`docs/backend/api-referencia.md`)]**
- **[Esquema do Banco de Dados (`docs/backend/database.md`)]**
- **[Autenticação (`docs/backend/authentication.md`)]**