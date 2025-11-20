# Caça-Preço: Marketplace com Monitoramento Inteligente

## Visão Geral

O Caça-Preço é uma plataforma multifacetada que combina um marketplace para consumidores e vendedores com um módulo SaaS de monitoramento de concorrência. A plataforma é dividida em três componentes principais: um backend robusto em Django, uma aplicação web em React e um aplicativo móvel em React Native.

## Funcionalidades

### Para Clientes
*   **Busca e Comparação de Preços:** Crie listas de compras e encontre os melhores preços.
*   **Sugestões Otimizadas:** O sistema sugere a melhor combinação de lojas para o menor custo total.

### Para Vendedores
*   **Gestão de Produtos e Lojas:** Cadastre e gerencie produtos, lojas e ofertas.
*   **Dashboard de Vendas:** Acompanhe o desempenho e as avaliações.
*   **Monitoramento de Concorrência (SaaS):** Monitore preços de concorrentes de forma automatizada usando web scraping.

## Arquitetura e Tecnologias

| Componente | Tecnologia | Propósito |
| :--- | :--- | :--- |
| **Backend** | **Python, Django, Django Rest Framework** | API RESTful central que gerencia toda a lógica de negócio, incluindo o módulo de scraping. |
| **Frontend Web** | **React, React Router, Axios** | Aplicação web (SPA) para todas as interações da plataforma. |
| **Frontend Mobile** | **React Native, Expo** | Aplicativo móvel para Android e iOS. |
| **Scraping** | **Scrapy, Selenium, Playwright, BeautifulSoup** | Coleta automatizada de dados de preços de concorrentes. |
| **Banco de Dados** | **MySQL** | Armazenamento de dados da plataforma. |
| **Tarefas Assíncronas** | **Celery, Redis** | Execução de tarefas de scraping em segundo plano. |

## Estrutura do Projeto

```
/
├── backend/              # API Principal (Python/Django)
├── frontend/             # Aplicação Web (React)
├── mobile/               # Aplicativo Móvel (React Native)
└── docs/                 # Documentação detalhada
```

## Como Executar

*   **Backend:** Navegue para `backend/`, instale as dependências de `requirements.txt`, configure o banco de dados no `settings.py` e execute `python manage.py runserver`.
*   **Frontend Web:** Navegue para `frontend/`, execute `npm install`, configure a URL da API em um arquivo `.env` e execute `npm start`.
*   **Frontend Mobile:** Navegue para `mobile/`, execute `npm install`, configure a URL da API em `app.json` e execute `npm start`.
