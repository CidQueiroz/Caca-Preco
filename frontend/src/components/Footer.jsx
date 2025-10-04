import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Global.css';

const Footer = () => {
    return (
        <footer className="rodape">
            <p className="rodape_texto">© 2025 <b>CDK TECK</b>. Todos os direitos reservados.</p>
            <div className="rodape_links">
                <Link to="/privacidade" className="rodape_link">Privacidade</Link>
                <Link to="/termos" className="rodape_link">Termos</Link>
                <Link to="/contato" className="rodape_link">Contato</Link>
            </div>
        </footer>
    );
};

export default Footer;