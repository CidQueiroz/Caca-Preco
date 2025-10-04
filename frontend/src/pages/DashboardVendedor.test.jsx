import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import DashboardVendedor from './DashboardVendedor';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

// Mock do useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock do axios
jest.mock('axios');

const renderWithRouter = (ui, { providerProps, ...renderOptions } = {}) => {
  return render(
    <AuthContext.Provider {...providerProps}>
      <Router>{ui}</Router>
    </AuthContext.Provider>,
    renderOptions
  );
};

describe('DashboardVendedor', () => {
  const defaultProviderProps = {
    value: {
      token: 'fake-token',
      user: { nome_responsavel: 'TestUser' },
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockResolvedValue({ data: [] }); // Mock para as avaliações
  });

  test('renderiza o painel do vendedor corretamente', async () => {
    renderWithRouter(<DashboardVendedor />, { providerProps: defaultProviderProps });
    expect(screen.getByText(/Painel do Vendedor/i)).toBeInTheDocument();
    expect(screen.getByText(/Bem-vindo, TestUser!/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText(/Gerenciar Meus Produtos/i)).toBeInTheDocument());
  });

  // Testes para os botões de navegação
  test('navega para /meus-produtos ao clicar em Gerenciar Meus Produtos', async () => {
    renderWithRouter(<DashboardVendedor />, { providerProps: defaultProviderProps });
    fireEvent.click(screen.getByText(/Gerenciar Meus Produtos/i));
    expect(mockNavigate).toHaveBeenCalledWith('/meus-produtos');
  });

  test('navega para /analise-de-mercado ao clicar em Monitorar Concorrência (Premium)', async () => {
    renderWithRouter(<DashboardVendedor />, { providerProps: defaultProviderProps });
    fireEvent.click(screen.getByText(/Monitorar Concorrência \(Premium\)/i));
    expect(mockNavigate).toHaveBeenCalledWith('/analise-de-mercado');
  });

  test('navega para /editar-perfil-vendedor ao clicar em Editar Perfil e Dados da Loja', async () => {
    renderWithRouter(<DashboardVendedor />, { providerProps: defaultProviderProps });
    fireEvent.click(screen.getByText(/Editar Perfil e Dados da Loja/i));
    expect(mockNavigate).toHaveBeenCalledWith('/editar-perfil-vendedor');
  });

  test('navega para /minhas-avaliacoes ao clicar em Ver Todas as Avaliações (quando habilitado)', async () => {
    axios.get.mockResolvedValue({ data: [{ id: 1, nota: 5 }] }); // Mock com avaliações
    renderWithRouter(<DashboardVendedor />, { providerProps: defaultProviderProps });
    await waitFor(() => expect(screen.getByText(/Você possui 1 avaliação\(ões\)./i)).toBeInTheDocument());
    fireEvent.click(screen.getByText(/Ver Todas as Avaliações/i));
    expect(mockNavigate).toHaveBeenCalledWith('/minhas-avaliacoes');
  });

  test('o botão Ver Todas as Avaliações está desabilitado quando não há avaliações', async () => {
    axios.get.mockResolvedValue({ data: [] }); // Mock sem avaliações
    renderWithRouter(<DashboardVendedor />, { providerProps: defaultProviderProps });
    await waitFor(() => expect(screen.getByText(/Você ainda não possui avaliações./i)).toBeInTheDocument());
    expect(screen.getByText(/Ver Todas as Avaliações/i)).toBeDisabled();
  });

  test('navega para /indicar-vendedor ao clicar em Indicar Novo Vendedor', async () => {
    renderWithRouter(<DashboardVendedor />, { providerProps: defaultProviderProps });
    fireEvent.click(screen.getByText(/Indicar Novo Vendedor/i));
    expect(mockNavigate).toHaveBeenCalledWith('/indicar-vendedor');
  });

  test('navega para / ao clicar em Voltar ao Início', async () => {
    renderWithRouter(<DashboardVendedor />, { providerProps: defaultProviderProps });
    fireEvent.click(screen.getByText(/Voltar ao Início/i));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  // Testes para o formulário de sugestão
  test('mostra e esconde o formulário de sugestão ao clicar em Enviar Sugestão/Cancelar Sugestão', async () => {
    renderWithRouter(<DashboardVendedor />, { providerProps: defaultProviderProps });
    const toggleButton = screen.getByText(/Enviar Sugestão/i);
    fireEvent.click(toggleButton);
    expect(screen.getByPlaceholderText(/Digite sua sugestão aqui.../i)).toBeInTheDocument();
    expect(toggleButton).toHaveTextContent(/Cancelar Sugestão/i);

    fireEvent.click(toggleButton);
    expect(screen.queryByPlaceholderText(/Digite sua sugestão aqui.../i)).not.toBeInTheDocument();
    expect(toggleButton).toHaveTextContent(/Enviar Sugestão/i);
  });

  test('envia sugestão com sucesso', async () => {
    axios.post.mockResolvedValue({ data: {} });
    renderWithRouter(<DashboardVendedor />, { providerProps: defaultProviderProps });

    fireEvent.click(screen.getByText(/Enviar Sugestão/i)); // Abre o formulário
    fireEvent.change(screen.getByPlaceholderText(/Digite sua sugestão aqui.../i), {
      target: { value: 'Minha sugestão de teste' },
    });
    fireEvent.click(screen.getByText(/Enviar Sugestão/i)); // Envia a sugestão

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        `${process.env.REACT_APP_API_URL}/api/sugestoes/`,
        { texto: 'Minha sugestão de teste' },
        { headers: { Authorization: 'Bearer fake-token' } }
      );
      expect(screen.getByText(/Sugestão enviada com sucesso!/i)).toBeInTheDocument();
    });
    expect(screen.queryByPlaceholderText(/Digite sua sugestão aqui.../i)).not.toBeInTheDocument();
  });

  test('mostra erro ao tentar enviar sugestão vazia', async () => {
    renderWithRouter(<DashboardVendedor />, { providerProps: defaultProviderProps });

    fireEvent.click(screen.getByText(/Enviar Sugestão/i)); // Abre o formulário
    fireEvent.click(screen.getByText(/Enviar Sugestão/i)); // Tenta enviar vazio

    await waitFor(() => {
      expect(screen.getByText(/A sugestão não pode ser vazia./i)).toBeInTheDocument();
    });
    expect(axios.post).not.toHaveBeenCalled();
  });

  test('mostra erro ao falhar o envio da sugestão', async () => {
    axios.post.mockRejectedValue(new Error('Network Error'));
    renderWithRouter(<DashboardVendedor />, { providerProps: defaultProviderProps });

    fireEvent.click(screen.getByText(/Enviar Sugestão/i)); // Abre o formulário
    fireEvent.change(screen.getByPlaceholderText(/Digite sua sugestão aqui.../i), {
      target: { value: 'Minha sugestão de teste' },
    });
    fireEvent.click(screen.getByText(/Enviar Sugestão/i)); // Envia a sugestão

    await waitFor(() => {
      expect(screen.getByText(/Falha ao enviar sugestão./i)).toBeInTheDocument();
    });
  });
});