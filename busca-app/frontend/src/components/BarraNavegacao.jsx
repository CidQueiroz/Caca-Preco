import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Global.css';

const BarraNavegacao = () => {
    const { usuario, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const handleMeuPainelClick = () => {
        // Verifica se o usuário está logado e tem um tipo de usuário
        if (usuario && usuario.tipo_usuario) {
            // Lógica para redirecionar para o painel correto
            if (usuario.tipo_usuario === 'Vendedor') {
                navigate('/dashboard-vendedor');
            } else if (usuario.tipo_usuario === 'Cliente') {
                navigate('/dashboard-cliente');
            } else {
                // Caso de tipo de usuário não reconhecido, redireciona para a página inicial
                navigate('/');
            }
        }
    };

    return (
        <header className="cabecalho">
            <nav className="cabecalho_menu">
                <Link to="/" className="cabecalho_logo_link">
                    <img src="/assets/logo.png" alt="Logo CDK TECK" className="cabecalho_logo_imagem" />
                </Link>
                <div className="cabecalho_links">
                    <Link className="cabecalho_menu_link" to="/">Início</Link>
                    
                    {usuario ? (
                        <>
                            <button onClick={handleMeuPainelClick} className="cabecalho_menu_link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                Meu Painel
                            </button>
                            <Link onClick={handleLogout} className="cabecalho_menu_link" >Sair</Link>
                        </>
                    ) : (
                        <>
                            <Link className="cabecalho_menu_link" to="/login">Login</Link>
                            <Link className="cabecalho_menu_link" to="/cadastro">Cadastrar</Link>
                        </>
                    )}
                </div>
            </nav>
        </header>
    );
};

export default BarraNavegacao;