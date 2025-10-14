import React from 'react';
import { Link } from 'react-router-dom';

const Rodape = () => {
    return (
        <footer className="rodape">
            <div className="rodape_links">
                <Link to="/docs/privacy-policy.md" className="rodape_link">Política de Privacidade</Link>
                <Link to="/docs/terms-of-service.md" className="rodape_link">Termos de Serviço</Link>
            </div>
            <p className="rodape_texto">
                © {new Date().getFullYear()} CDK TECK. Todos os direitos reservados.
            </p>
        </footer>
    );
};

export default Rodape;
