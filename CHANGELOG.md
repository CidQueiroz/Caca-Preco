# [1.1.0](https://github.com/CidQueiroz/Caca-Preco/compare/v1.0.0...v1.1.0) (2026-04-06)


### Features

* **ui:** unify Caça-Preço UI with @cidqueiroz/cdkteck-ui library core components ([5155b53](https://github.com/CidQueiroz/Caca-Preco/commit/5155b53fe10b632cb40533ca63eb387628ec5061))

# 1.0.0 (2026-04-06)


### Bug Fixes

* **build:** correct docker networking and finalize dependencies ([4dd32de](https://github.com/CidQueiroz/Caca-Preco/commit/4dd32dedb6129d03636a8e404545629cb8ad25f3))
* **ci:** correcting file paths and working-directory for Django CI (removing project prefix) ([bbd76c1](https://github.com/CidQueiroz/Caca-Preco/commit/bbd76c1be0ecc97dbc08bf14342cdb1ca057a6e4))
* **ci:** regenerate package-lock.json ([4513fa1](https://github.com/CidQueiroz/Caca-Preco/commit/4513fa13f115a5225294588cd5d9aeea7d814239))
* **ci:** sync package-lock.json ([778c8c3](https://github.com/CidQueiroz/Caca-Preco/commit/778c8c3303bc402c2dfecdd6aa98142802620c68))
* **ci:** upgrading python to 3.12 to resolve dependency install issues ([1c86254](https://github.com/CidQueiroz/Caca-Preco/commit/1c8625488f63177ef5495651107d178ac8f21779))
* **docker:** final local verification fix with Node 22, ESM support and wait_for_db orchestration ([88eee1a](https://github.com/CidQueiroz/Caca-Preco/commit/88eee1a8053a30025e49de775781bc7ba1ea1a92))
* **release:** adding --allow-same-version to npm version commands ([ded6b64](https://github.com/CidQueiroz/Caca-Preco/commit/ded6b6446bb9b8e8e856e617d308bc86fc0d4dc6))
* **release:** adding @semantic-release/exec plugin and local verification script ([7c17378](https://github.com/CidQueiroz/Caca-Preco/commit/7c17378503251efab67b576df6fd5b65d40a9701))
* **release:** replacing poetry version with sed in .releaserc.json to fix CI/CD ([326017f](https://github.com/CidQueiroz/Caca-Preco/commit/326017f05b26893d2caf458fb15f2fc3ca057c84))
* remoção de arquivos sensíveis/lixo do rastreamento ([408d252](https://github.com/CidQueiroz/Caca-Preco/commit/408d252bb2e7c5b0df01f1a3eb2ec327c8d97ba8))


### Code Refactoring

* **filename:** unificando projeto no firebase ([89665d9](https://github.com/CidQueiroz/Caca-Preco/commit/89665d9a758dc5b7f7e42d92751d2fc2a7367344))
* **service:** unificando projeto no firebase ([505da74](https://github.com/CidQueiroz/Caca-Preco/commit/505da74f7984779809abb42120bb96ebc59cc3f4))


### Features

* add standardized README and LICENSE ([6921e52](https://github.com/CidQueiroz/Caca-Preco/commit/6921e52fe9bc6c9621fa458bd52c5ff08f3fb4cd))
* **dev:** add docker environment and fix CI ([681405b](https://github.com/CidQueiroz/Caca-Preco/commit/681405bc101e834266f49d20ac56a9f519f7af9f))
* **project:** add release automation and scraperapi strategy ([629509e](https://github.com/CidQueiroz/Caca-Preco/commit/629509ee63b88f413740d00b797b6b130025986e))
* **scraper:** implement ScraperOrchestrator with multi-strategy support for scraping ([955b7e1](https://github.com/CidQueiroz/Caca-Preco/commit/955b7e1d776bffc3fe11be4e706142822860964a))
* standardizing frontend with React 19 and CI/CD Pipeline (Firebase + OCI) ([918dc20](https://github.com/CidQueiroz/Caca-Preco/commit/918dc2096628a9c09e895ed46a51387d3ad02d11))
* **ui:** standardize Caça-Preço UI with cdkteck-ui and theme sync ([093ec8b](https://github.com/CidQueiroz/Caca-Preco/commit/093ec8b5bd9955efdc4e7a136d192c92d30ae48a))
* unifying CI/CD Pipeline (SenseiDB Pattern) for Caça-Preço (Frontend + Backend) ([d3da310](https://github.com/CidQueiroz/Caca-Preco/commit/d3da310210ab6ae39c3e9cb38222736ea83c221e))
* upgrade to Node 22 and configure GitHub Packages authentication for private dependencies ([24ef17b](https://github.com/CidQueiroz/Caca-Preco/commit/24ef17b719ea6feb169b8b3d7bf634e307b81b6f))


### BREAKING CHANGES

* **filename:** Transformando CDKTECK em um unico projeto dentro do Firebase
* **service:** Transformando CDKTECK em um unico projeto dentro do Firebase

# 1.0.0 (2026-04-06)


### Bug Fixes

* **build:** correct docker networking and finalize dependencies ([4dd32de](https://github.com/CidQueiroz/Caca-Preco/commit/4dd32dedb6129d03636a8e404545629cb8ad25f3))
* **ci:** correcting file paths and working-directory for Django CI (removing project prefix) ([bbd76c1](https://github.com/CidQueiroz/Caca-Preco/commit/bbd76c1be0ecc97dbc08bf14342cdb1ca057a6e4))
* **ci:** regenerate package-lock.json ([4513fa1](https://github.com/CidQueiroz/Caca-Preco/commit/4513fa13f115a5225294588cd5d9aeea7d814239))
* **ci:** sync package-lock.json ([778c8c3](https://github.com/CidQueiroz/Caca-Preco/commit/778c8c3303bc402c2dfecdd6aa98142802620c68))
* **ci:** upgrading python to 3.12 to resolve dependency install issues ([1c86254](https://github.com/CidQueiroz/Caca-Preco/commit/1c8625488f63177ef5495651107d178ac8f21779))
* **docker:** final local verification fix with Node 22, ESM support and wait_for_db orchestration ([88eee1a](https://github.com/CidQueiroz/Caca-Preco/commit/88eee1a8053a30025e49de775781bc7ba1ea1a92))
* **release:** adding --allow-same-version to npm version commands ([ded6b64](https://github.com/CidQueiroz/Caca-Preco/commit/ded6b6446bb9b8e8e856e617d308bc86fc0d4dc6))
* **release:** adding @semantic-release/exec plugin and local verification script ([7c17378](https://github.com/CidQueiroz/Caca-Preco/commit/7c17378503251efab67b576df6fd5b65d40a9701))
* **release:** replacing poetry version with sed in .releaserc.json to fix CI/CD ([326017f](https://github.com/CidQueiroz/Caca-Preco/commit/326017f05b26893d2caf458fb15f2fc3ca057c84))
* remoção de arquivos sensíveis/lixo do rastreamento ([408d252](https://github.com/CidQueiroz/Caca-Preco/commit/408d252bb2e7c5b0df01f1a3eb2ec327c8d97ba8))


### Code Refactoring

* **filename:** unificando projeto no firebase ([89665d9](https://github.com/CidQueiroz/Caca-Preco/commit/89665d9a758dc5b7f7e42d92751d2fc2a7367344))
* **service:** unificando projeto no firebase ([505da74](https://github.com/CidQueiroz/Caca-Preco/commit/505da74f7984779809abb42120bb96ebc59cc3f4))


### Features

* add standardized README and LICENSE ([6921e52](https://github.com/CidQueiroz/Caca-Preco/commit/6921e52fe9bc6c9621fa458bd52c5ff08f3fb4cd))
* **dev:** add docker environment and fix CI ([681405b](https://github.com/CidQueiroz/Caca-Preco/commit/681405bc101e834266f49d20ac56a9f519f7af9f))
* **project:** add release automation and scraperapi strategy ([629509e](https://github.com/CidQueiroz/Caca-Preco/commit/629509ee63b88f413740d00b797b6b130025986e))
* **scraper:** implement ScraperOrchestrator with multi-strategy support for scraping ([955b7e1](https://github.com/CidQueiroz/Caca-Preco/commit/955b7e1d776bffc3fe11be4e706142822860964a))
* standardizing frontend with React 19 and CI/CD Pipeline (Firebase + OCI) ([918dc20](https://github.com/CidQueiroz/Caca-Preco/commit/918dc2096628a9c09e895ed46a51387d3ad02d11))
* unifying CI/CD Pipeline (SenseiDB Pattern) for Caça-Preço (Frontend + Backend) ([d3da310](https://github.com/CidQueiroz/Caca-Preco/commit/d3da310210ab6ae39c3e9cb38222736ea83c221e))
* upgrade to Node 22 and configure GitHub Packages authentication for private dependencies ([24ef17b](https://github.com/CidQueiroz/Caca-Preco/commit/24ef17b719ea6feb169b8b3d7bf634e307b81b6f))


### BREAKING CHANGES

* **filename:** Transformando CDKTECK em um unico projeto dentro do Firebase
* **service:** Transformando CDKTECK em um unico projeto dentro do Firebase

## [1.0.1](https://github.com/CidQueiroz/Caca-Preco/compare/v1.0.0...v1.0.1) (2025-10-14)


### Bug Fixes

* **build:** correct docker networking and finalize dependencies ([223eba2](https://github.com/CidQueiroz/Caca-Preco/commit/223eba2590da614dd9e1836898604c8c9e488480))

# 1.0.0 (2025-10-14)


### Bug Fixes

* **ci:** regenerate package-lock.json ([9b7b497](https://github.com/CidQueiroz/Caca-Preco/commit/9b7b4978bb5905d3f11ed249d0000f78d18da4dc))
* **ci:** sync package-lock.json ([a657bef](https://github.com/CidQueiroz/Caca-Preco/commit/a657bef01432873e2518952210ec030a5b2736bf))


### Features

* **dev:** add docker environment and fix CI ([bc2c67f](https://github.com/CidQueiroz/Caca-Preco/commit/bc2c67f245ca3debfded9e7fa7df26d0c0cfe260))
* **project:** add release automation and scraperapi strategy ([333ca3d](https://github.com/CidQueiroz/Caca-Preco/commit/333ca3d42bc5dc36eb3996eac7ca85e6a73831fa))
