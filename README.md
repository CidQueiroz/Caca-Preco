# Caça-Preço – Marketplace com Monitoramento Inteligente de Concorrência

## Visão Geral

O Caça-Preço é um marketplace multiplataforma que conecta clientes e vendedores, focado em busca e comparação de preços, com autenticação JWT e controle de acesso por papéis (Cliente, Vendedor, Administrador).

Além das funcionalidades tradicionais de marketplace, o Caça-Preço oferece um módulo SaaS integrado de monitoramento de preços e análise de mercado, exclusivo para vendedores. Assim, vendedores podem acompanhar concorrentes, ajustar estratégias e potencializar vendas, tudo em um só lugar.

## Funcionalidades Principais

### Para Clientes
*   Cadastro/Login com permissões específicas.
*   Busca e Comparação de Preços: Criação de listas de compras, busca do menor preço por item e comparação entre estabelecimentos.
*   Sugestão Otimizada: Sistema sugere a melhor combinação de lojas para o menor custo total, com opção de consolidar compras.
*   Sugestões Inteligentes: IA sugere estabelecimentos próximos (Google Maps, categorização), mesmo não cadastrados.

### Para Vendedores
*   Gestão de Produtos: Cadastro, listagem e gerenciamento de produtos e lojas.
*   Dashboard de Vendas: Acompanhamento de desempenho e avaliações.
*   Monitoramento de Concorrência (SaaS Integrado):
    *   Cadastro de links de produtos concorrentes.
    *   Coleta automática de preços e estoques dos concorrentes em intervalos definidos.
    *   Visualização de dados em dashboards interativos, com análises, alertas e histórico de preços.
    *   Insights para ajuste de preços e estratégias de venda.

## Arquitetura e Tecnologias

| Componente | Tecnologia | Propósito |
| :--- | :--- | :--- |
| **Backend** | **Python, Django, Django Rest Framework** | API RESTful central que gerencia toda a lógica de negócio, incluindo usuários, produtos, ofertas, autenticação (JWT) e o módulo SaaS. |
| **Frontend Web** | **React, React Router, Axios** | Aplicação web (SPA) para clientes, vendedores e administradores interagirem com a plataforma. |
| **Frontend Mobile** | **React Native, Expo, React Navigation, Context API** | Aplicativo móvel para Android e iOS, oferecendo uma experiência nativa para os clientes em trânsito. |

| **Automação SaaS** | **Python (Selenium, BeautifulSoup, Scrapy)**  para coleta de dados de concorrentes. |
| **Análise de Dados** | **Pandas, Power BI, Machine Learning** para análises preditivas e dashboards. |
| **Banco de Dados** | **SQL** para marketplace e histórico de preços monitorados. |


| **Monetização**
| **Marketplace** Gratuito para clientes; vendedores podem ter planos gratuitos e pagos.
SaaS Integrado: Planos por assinatura para vendedores, baseados em:

    * Número de URLs monitoradas.
    * Frequência de coleta.
    * Acesso a dados históricos e análises avançadas.

**Sugestões de Melhoria para o Modelo Físico**

**1. Otimização da Busca e Comparação de Preços**
    Índices Compostos: Em OFERTA_PRODUTO para acelerar buscas por menor preço.
    Materialized Views: Tabelas pré-calculadas para sugestões de compra otimizadas.

**2. Estoque em Tempo Real**
    Triggers: Atualizam estoque automaticamente após vendas.
    Filas de Mensagens: Para alta concorrência, uso de filas (RabbitMQ, Kafka) para atualização assíncrona.

**3. Análise de Mercado e Concorrência**
    Histórico de Preços: Tabela para rastrear evolução dos preços dos concorrentes.
    Particionamento: Melhor performance em grandes volumes de dados históricos.

**4. Geolocalização e IA**
    Latitude/Longitude: Campos obrigatórios em ENDERECO.
    Índices Geoespaciais: Para buscas rápidas por proximidade.
    
**5. Variações de Produto Complexas**
    Modelo Flexível: Tabelas ATRIBUTO, VALOR_ATRIBUTO e PRODUTO_ATRIBUTO_VALOR para múltiplas combinações (ex: Tamanho, Cor, Material).
    Aplicabilidade: Catálogo flexível e filtros avançados para clientes.

**Resumo:**
    O Caça-Preço integra marketplace e SaaS de monitoramento de concorrência, oferecendo uma solução completa para clientes e vendedores, com potencial de crescimento, monetização e diferenciação no mercado.

## Estrutura do Projeto

O repositório está organizado em diretórios distintos para cada componente da aplicação.

```
/
├── busca-app/
│   ├── backend/              # API Principal (Python/Django)
│   ├── frontend/             # Aplicação Web (React)
│   └── mobile/               # Aplicativo Móvel (React Native)
└── docs/                 # Documentação detalhada do projeto
```

## Configuração e Instalação

### 1. Backend (Django)
    A API estará disponível em `http://localhost:8000`.

### 2. Frontend Web (React)
    A aplicação web será aberta em `http://localhost:3001`.

### 3. Frontend Mobile (React Native)
    "extra": {
      "apiUrl": "http://192.168.0.101:8000"
    }

## Desenvolvimento e Convenções

*   **Testes:** O `README.md` não especifica um framework de teste ou comandos para execução de testes.
*   **Estilo de Código:** Não há menção explícita a linters ou formatadores de código no `README.md`.

## Documentação Adicional

Para uma visão mais aprofundada da arquitetura, endpoints da API e esquema do banco de dados, consulte a pasta `/docs`.

*   **[Referência da API (`docs/backend/api-referencia.md`)]**
*   **[Esquema do Banco de Dados (`docs/backend/database.md`)]**
*   **[Autenticação (`docs/backend/authentication.md`)]**



ESTA PASTA É PARA DESENVOLVER O MODULO SAAS: CONFIGURAR SCRAPY E/OU PLAYWRIGHT PARA FAZER WEBSCRAPING