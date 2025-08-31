# Arquitetura de Componentes (Web)

Esta seção descreve a organização de componentes React no projeto.

## Filosofia

Componentes devem ser pequenos, reutilizáveis e focados em uma única responsabilidade.

## Estrutura de Pastas

A pasta `src/components/` é organizada da seguinte forma para melhor manutenção:

### `src/components/common/`
Contém componentes de UI genéricos e reutilizáveis em toda a aplicação. Eles não possuem lógica de negócio específica.
- **Exemplos:** `Button.jsx`, `Input.jsx`, `Modal.jsx`, `Spinner.jsx`.

### `src/components/layout/`
Contém componentes responsáveis pela estrutura visual principal da página.
- **Exemplos:** `Navbar.jsx`, `Footer.jsx`, `Sidebar.jsx`.

### `src/components/feature/` (Sugestão)
Para componentes mais complexos e específicos de uma funcionalidade.
- **Exemplos:** `ProductCard.jsx`, `ShoppingCart.jsx`, `PriceChart.jsx`.

## Boas Práticas
- **Props:** Use `PropTypes` para documentar e validar as props dos componentes.
- **Estilização:** A estilização deve ser consistente. Se usar CSS-in-JS ou Módulos CSS, mantenha o padrão.
- **Estado:** Componentes devem ser, sempre que possível, "burros" (stateless), recebendo dados e funções via props. A lógica de estado deve ficar nos componentes de página ou no gerenciador de estado.