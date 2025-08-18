# Componentes Principais (React)

A interface web do Caça-Preço é construída com uma arquitetura de componentes reutilizáveis em React. Abaixo estão alguns dos componentes mais importantes.

## `RotaProtegida.jsx`
Este é um componente de ordem superior (HOC) que funciona como um guardião para as rotas da aplicação. Ele verifica o estado de autenticação do usuário e seu papel (tipo de usuário) antes de permitir o acesso a uma página.

**Funcionalidades:**
- Se o usuário não estiver logado, ele é redirecionado para a página de `/login`.
- Se o usuário estiver logado, mas não tiver o papel (`papeisPermitidos`) necessário para acessar a rota, ele é redirecionado para uma página de `/nao-autorizado`.
- Se o usuário estiver logado e tiver a permissão necessária, o componente renderiza a página solicitada.

**Exemplo de Uso em `App.jsx`:**
```jsx
<Route 
  path="/dashboard-vendedor" 
  element={<RotaProtegida papeisPermitidos={['Vendedor']}><DashboardVendedor /></RotaProtegida>} 
/>
```

## `BarraNavegacao.jsx`
Renderiza a barra de navegação superior da aplicação. O conteúdo da barra é dinâmico e muda com base no estado de autenticação e no tipo de usuário (Cliente ou Vendedor), mostrando os links relevantes para cada contexto.

## `Estrutura.jsx`
Este componente define o layout principal da aplicação. Ele geralmente inclui a `BarraNavegacao` e o `Footer`, envolvendo o conteúdo principal da página. Isso garante uma aparência consistente em toda a aplicação.

## Formulários
- **`FormularioLogin.jsx`**: Contém os campos de e-mail e senha e a lógica para submeter os dados ao endpoint de login da API.
- **`FormularioCadastro.jsx`**: Gerencia o processo de registro de novos usuários, coletando e-mail, senha e tipo de usuário.

## Gerenciamento de Produtos
- **`BuscaProdutos.jsx`**: Componente que permite aos clientes buscar produtos na plataforma.
- **`ListaProdutos.jsx`**: Utilizado para exibir uma lista de produtos, geralmente os resultados de uma busca ou os produtos de um vendedor.
- **`AdicionarOferta.jsx`**: Um formulário específico para vendedores criarem ou editarem suas ofertas de produtos, definindo preço e quantidade.