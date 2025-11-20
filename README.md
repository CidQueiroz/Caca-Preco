<div align="center">

# 🛒 Caça-Preço
### Seu Marketplace Inteligente com Monitoramento de Concorrência

![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)
![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Django](https://img.shields.io/badge/Django-5.0-092E20?style=for-the-badge&logo=django&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![React Native](https://img.shields.io/badge/React_Native-61DAFB?style=for-the-badge&logo=react&logoColor=black)

[**Portfólio CDKTeck**](https://www.cdkteck.com.br) | [**LinkedIn do Autor**](https://www.linkedin.com/in/ciddy-queiroz/)

<br />
</div>

---

## 🚀 Visão Geral

O **Caça-Preço** é uma plataforma completa que une um marketplace dinâmico a uma poderosa ferramenta de monitoramento de concorrência para vendedores. Construído com uma arquitetura robusta, o projeto visa otimizar a experiência de compra para clientes e potencializar as vendas para os lojistas.

- **Para Clientes:** Uma plataforma intuitiva para criar listas de compras, comparar preços entre diferentes lojas e receber sugestões otimizadas para economizar ao máximo.
- **Para Vendedores:** Um portal para gerenciar produtos, lojas e ofertas, com acesso a um dashboard de análise de vendas e a um módulo SaaS exclusivo para monitorar preços de concorrentes de forma automatizada.

---

## 🧠 Arquitetura & Tecnologias

O ecossistema do Caça-Preço é composto por três componentes principais que trabalham de forma integrada para entregar uma solução coesa e performática.

| Componente | Tecnologia | Propósito |
| :--- | :--- | :--- |
| **Backend** | **Python, Django, Django Rest Framework** | API RESTful central que gerencia toda a lógica de negócio, incluindo usuários, produtos, ofertas, autenticação (JWT) e o módulo SaaS. |
| **Frontend Web** | **React, React Router, Axios** | Aplicação web (SPA) para clientes, vendedores e administradores interagirem com a plataforma. |
| **Frontend Mobile** | **React Native, Expo, React Navigation** | Aplicativo móvel para Android e iOS, oferecendo uma experiência nativa para os clientes em trânsito. |

---

## ✨ Funcionalidades Chave

- 🛒 **Marketplace Completo:** Crie listas de compras, compare preços e economize.
- 📈 **Dashboard de Vendas:** Vendedores podem gerenciar produtos e analisar performance.
- 🕵️ **Monitoramento de Concorrência:** Módulo SaaS para monitorar preços de concorrentes.
- 🧠 **RAG Inteligente:** Sistema de busca semântica com embeddings.
- 🚀 **Groq AI:** Respostas ultra-rápidas com Llama 3.
- 🌐 **Google AI:** Fallback automático com Gemini 1.5.
- 🔐 **Segurança:** Autenticação Firebase + dados protegidos.
- 🐳 **Containerizado:** Ambiente de desenvolvimento e produção 100% em Docker.
- 🤖 **Versionamento Automático:** Releases e changelogs automáticos com semantic-release.

---

## 🛠️ Como Executar Localmente

### Pré-requisitos
* Python 3.10+
* Node.js 18+
* Docker

### 1. Clone o repositório

```bash
git clone https://github.com/CidQueiroz/Caca-Preco.git
cd Caca-Preco
```

### 2. Configuração do Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
# .\venv\Scripts\activate # Windows

pip install -r requirements.txt

# Configure as variáveis de ambiente (.env)
# DATABASE_URL=... (Se estiver usando um banco de dados externo)

python manage.py migrate
python manage.py runserver
```

### 3. Configuração do Frontend
```bash
cd ../frontend
npm install
npm start
```
A aplicação web estará disponível em `http://localhost:3001`.

### 4. Configuração do Mobile
```bash
cd ../mobile
npm install
npm start
```
Use o Expo Go app em seu dispositivo para escanear o QR code gerado.

---

## 🛣️ Roadmap

- [ ] **Implementação do Scraper:** Finalizar o scraper de preços de concorrentes.
- [ ] **Deploy Automatizado (CI/CD):** Configurar GitHub Actions para deploy contínuo na OCI.
- [ ] **Testes de Validação:** Aumentar a cobertura de testes unitários e funcionais.
- [ ] **Plano de Monetização:** Definir a estratégia de precificação e o plano de aquisição de clientes.

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👨‍💻 Autor

<img src="https://github.com/CidQueiroz.png" width="100px;" alt="Foto de Cidirclay"/>
**Cidirclay Queiroz** <br>
Solutions Architect AI | MLOps Engineer | OCI Specialist

[LinkedIn](https://www.linkedin.com/in/ciddy-queiroz/) | [Website](https://cdkteck.com.br/) | [Email](mailto:cydy.queiroz@cdkteck.com.br) | [Instagram](https://www.instagram.com/ciddyqueiroz/)

Especialista em transformar problemas de negócio complexos em soluções escaláveis na nuvem. Focado em Arquitetura Multi-Cloud e Engenharia de IA Generativa.

---

<div align="center"> <sub>Built with 💖 and Python</sub> </div>
