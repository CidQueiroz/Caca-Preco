import React from 'react';
import {
    BrowserRouter as Router,
    Routes,
    Route
} from 'react-router-dom';

// Importa o Contexto e os Componentes de Rota
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import RotaProtegida from './components/RotaProtegida';
import Estrutura from './components/Estrutura';

// Importa as páginas
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Inicio from './pages/Inicio';
import CompletarPerfil from './pages/CompletarPerfil';
import VerificarEmail from './pages/VerificarEmail';
import DashboardCliente from './pages/DashboardCliente';
import DashboardVendedor from './pages/DashboardVendedor';
import CadastroProduto from './pages/CadastroProduto'; // Importa a nova página
import MeusProdutos from './pages/MeusProdutos';
import MinhasAvaliacoesDetalhe from './pages/MinhasAvaliacoesDetalhe';
import IndicarVendedor from './pages/IndicarVendedor';
import EditarPerfilVendedor from './pages/EditarPerfilVendedor';
import AnaliseMercadoSaaS from './pages/AnaliseMercadoSaaS';
import DashboardAnalise from './pages/DashboardAnalise';
import MonitorarConcorrencia from './pages/MonitorarConcorrencia';
import Privacidade from './pages/Privacidade';
import Termos from './pages/Termos';
import Contato from './pages/Contato';
import RecuperarSenha from './pages/RecuperarSenha';
import RedefinirSenha from './pages/RedefinirSenha';
import AdicionarOferta from './components/AdicionarOferta';

// Componentes de página para demonstração. Substitua pelos seus componentes reais.
const NaoAutorizado = () => <h2>Acesso Não Autorizado</h2>;

function App() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <Router>
                    <Estrutura>
                        <Routes>
                            {/* --- Rotas Públicas --- */}
                            <Route path="/" element={<Inicio />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/cadastro" element={<Cadastro />} />
                            <Route path="/verificar-email" element={<VerificarEmail />} />
                            <Route path="/nao-autorizado" element={<NaoAutorizado />} />
                            <Route path="/privacidade" element={<Privacidade />} />
                            <Route path="/termos" element={<Termos />} />
                            <Route path="/contato" element={<Contato />} />
                            <Route path="/recuperar-senha" element={<RecuperarSenha />} />
                            <Route path="/redefinir-senha/:token" element={<RedefinirSenha />} />

                            {/* --- ROTA DE TRANSIÇÃO (Requer login, mas não perfil completo) --- */}
                            {/*
                                Protegemos esta rota para garantir que apenas um utilizador LOGADO
                                possa completar o seu perfil. A própria RotaProtegida vai
                                redirecionar utilizadores com perfil incompleto para cá. */}
                            <Route path="/completar-perfil" element={ <RotaProtegida><CompletarPerfil /></RotaProtegida>} />

                            {/* Rotas específicas para VENDEDOR */}
                            <Route path="/dashboard-vendedor" element={<RotaProtegida papeisPermitidos={['Vendedor']}><DashboardVendedor /></RotaProtegida>} />
                            <Route path="/cadastrar-produto" element={<RotaProtegida papeisPermitidos={['Vendedor']}><CadastroProduto /></RotaProtegida>} />
                            <Route path="/meus-produtos" element={<RotaProtegida papeisPermitidos={['Vendedor']}><MeusProdutos /></RotaProtegida>} />
                            <Route path="/minhas-avaliacoes" element={<RotaProtegida papeisPermitidos={['Vendedor']}><MinhasAvaliacoesDetalhe /></RotaProtegida>} />
                            <Route path="/indicar-vendedor" element={<RotaProtegida papeisPermitidos={['Vendedor', 'Cliente']}><IndicarVendedor /></RotaProtegida>} />
                            <Route path="/editar-perfil-vendedor" element={<RotaProtegida papeisPermitidos={['Vendedor']}><EditarPerfilVendedor /></RotaProtegida>} />
                            <Route path="/analise-de-mercado" element={<RotaProtegida papeisPermitidos={['Vendedor']}><AnaliseMercadoSaaS /></RotaProtegida>} />
                            <Route path="/adicionar-oferta" element={<RotaProtegida papeisPermitidos={['Vendedor']}><AdicionarOferta /></RotaProtegida>} />
                            <Route path="/dashboard-analise" element={<RotaProtegida papeisPermitidos={['Vendedor']}><DashboardAnalise /></RotaProtegida>} />
                            <Route path="/monitorar-concorrencia" element={<RotaProtegida papeisPermitidos={['Vendedor']}><MonitorarConcorrencia /></RotaProtegida>} />
                            
                            {/* Rotas específicas para CLIENTE */}
                            <Route path="/dashboard-cliente" element={<RotaProtegida papeisPermitidos={['Cliente']}><DashboardCliente /></RotaProtegida>} />

                        </Routes>
                    </Estrutura>
                </Router>
            </ThemeProvider>
        </AuthProvider>
    );
}

export default App;
