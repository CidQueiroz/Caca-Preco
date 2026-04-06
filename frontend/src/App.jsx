import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTheme } from '@cidqueiroz/cdkteck-ui';

// Importa o Contexto e os Componentes de Rota
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
import CadastroProduto from './pages/CadastroProduto';
import MeusProdutos from './pages/MeusProdutos';
import MinhasAvaliacoesDetalhe from './pages/MinhasAvaliacoesDetalhe';
import IndicarVendedor from './pages/IndicarVendedor';
import AnaliseMercadoSaaS from './pages/AnaliseMercadoSaaS';
import DashboardAnalise from './pages/DashboardAnalise';
import MonitorarConcorrencia from './pages/MonitorarConcorrencia';
import Privacidade from './pages/Privacidade';
import Termos from './pages/Termos';
import Contato from './pages/Contato';
import RecuperarSenha from './pages/RecuperarSenha';
import RedefinirSenha from './pages/RedefinirSenha';
import AdicionarOferta from './components/AdicionarOferta';
import DashboardAdmin from './pages/DashboardAdmin';
import '@cidqueiroz/cdkteck-ui/global.css';

// Substitua seu componente atual por este:
const NaoAutorizado = () => (
    <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: '20px',
        textAlign: 'center' 
    }}>
        <h2 style={{
            fontSize: '2rem',
            color: 'var(--cor-primaria)',
            fontFamily: 'var(--fonte-primaria)',
            margin: 0
        }}>
            Acesso Não Autorizado
        </h2>
        
        <p style={{
            fontSize: '1.1rem',
            color: 'var(--cor-texto)',
            margin: 0,
            maxWidth: '400px'
        }}>
            Você não tem permissão para acessar esta área.
        </p>
        
        <button 
            className="btn btn-primario"
            onClick={() => window.history.back()}
            style={{ marginTop: '20px' }}
        >
            Voltar
        </button>
    </div>
);

function App() {
    const { theme, toggleTheme } = useTheme();

    useEffect(() => {
        // Sincroniza o tema inicial com localStorage
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme && savedTheme !== theme) {
            toggleTheme();
        }
    }, []);

    const handleThemeToggle = () => {
        const nextTheme = theme === 'light' ? 'dark' : 'light';
        localStorage.setItem('theme', nextTheme);
        toggleTheme();
    };

    return (
        <Estrutura onThemeToggle={handleThemeToggle}>
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
                <Route path="/completar-perfil" element={ <RotaProtegida><CompletarPerfil /></RotaProtegida>} />

                {/* Rotas específicas para VENDEDOR */}
                <Route path="/dashboard-vendedor" element={<RotaProtegida papeisPermitidos={['Vendedor']}><DashboardVendedor /></RotaProtegida>} />
                <Route path="/cadastrar-produto" element={<RotaProtegida papeisPermitidos={['Vendedor']}><CadastroProduto /></RotaProtegida>} />
                <Route path="/meus-produtos" element={<RotaProtegida papeisPermitidos={['Vendedor']}><MeusProdutos /></RotaProtegida>} />
                <Route path="/minhas-avaliacoes" element={<RotaProtegida papeisPermitidos={['Vendedor']}><MinhasAvaliacoesDetalhe /></RotaProtegida>} />
                <Route path="/indicar-vendedor" element={<RotaProtegida papeisPermitidos={['Vendedor', 'Cliente']}><IndicarVendedor /></RotaProtegida>} />
                <Route path="/completar-perfil" element={<RotaProtegida papeisPermitidos={['Vendedor']}><CompletarPerfil /></RotaProtegida>} />
                <Route path="/analise-de-mercado" element={<RotaProtegida papeisPermitidos={['Vendedor']}><AnaliseMercadoSaaS /></RotaProtegida>} />
                <Route path="/adicionar-oferta" element={<RotaProtegida papeisPermitidos={['Vendedor']}><AdicionarOferta /></RotaProtegida>} />
                <Route path="/dashboard-analise" element={<RotaProtegida papeisPermitidos={['Vendedor']}><DashboardAnalise /></RotaProtegida>} />
                <Route path="/monitorar-concorrencia" element={<RotaProtegida papeisPermitidos={['Vendedor']}><MonitorarConcorrencia /></RotaProtegida>} />
                
                {/* Rotas específicas para CLIENTE */}
                <Route path="/dashboard-cliente" element={<RotaProtegida papeisPermitidos={['Cliente']}><DashboardCliente /></RotaProtegida>} />

                {/* Rotas específicas para ADMIN */}
                <Route path="/dashboard-admin" element={<RotaProtegida papeisPermitidos={['Administrador']}><DashboardAdmin /></RotaProtegida>} />

            </Routes>
        </Estrutura>
    );
}

export default App;

