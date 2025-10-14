import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { ThemeContext } from '../context/ThemeContext.jsx';

const Cabecalho = () => {
    const { toggleTheme } = useContext(ThemeContext);

    return (
        <header className="cabecalho">
            <Link to="/" className="cabecalho-logo">
                <img id="header-logo" src="/assets/favicon2.png" alt="Logo CDK TECK" />
                <span>CDK TECK</span>
            </Link>

            <nav className="main-nav">
                <div className="dropdown">
                    <button className="dropdown-toggle">Universo CDK ▼</button>
                    <div className="dropdown-menu">
                        <Link to="/">Página Inicial</Link>
                        <a href="/PBI/portfolio_pbi.html">Portfólio de Dashboards</a>
                        <a href="https://sensei.cdkteck.com.br" target="_blank" rel="noopener noreferrer">SenseiDB</a>
                        <a href="https://gestao.cdkteck.com.br" target="_blank" rel="noopener noreferrer">Gestão RPD</a>
                        <a href="/Portfolio_html/labs.html">Laboratório de Projetos</a>
                        <a href="/caca_preco/caca_preco.html">Caça-Preço</a>
                        <a href="/Portfolio_html/AdivinhaNumero/adivinha_numero.html">AdivinhaNumero</a>
                        <a href="/Portfolio_html/geocoding/geocoding.html">Geocodificação</a>
                        <a href="/Portfolio_html/unicornio/unicorn.html">Unicórnio</a>
                    </div>
                </div>
                
                <button id="theme-toggle-btn" className="btn-theme" title="Alterar tema" onClick={toggleTheme}>
                    <span className="logo-tema-escuro">☀️</span>
                    <span className="logo-tema-claro">🌙</span>
                </button>
                
                <a href="#contact-modal">Contato</a>
            </nav>
        </header>
    );
};

export default Cabecalho;