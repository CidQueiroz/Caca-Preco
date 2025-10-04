import React from 'react';
import FormularioCadastro from '../components/FormularioCadastro';
import { Link } from 'react-router-dom';

const Cadastro = () => {
    return (
        <main className="apresentacao">
            <section className="apresentacao__conteudo">
                <h1 className="apresentacao__conteudo__titulo" style={{ textAlign: 'center' }}>
                    Faça seu <strong className="titulodestaque">Cadastro!</strong>
                </h1>
                <FormularioCadastro />
                
                <p style={{ marginTop: '20px', textAlign: 'center', width: '100%' }}>
                    Já tem cadastro? <Link to="/login" style={{ color: 'var(--cor-primaria)', textDecoration: 'none', fontWeight: '600' }}>Faça Login aqui</Link>
                </p>
            </section>
            
            <img 
                src="/assets/ia.png"
                alt="Unicórnio Lourdes" 
                className="apresentacao_imagem" 
            />
        </main>
    );
};

export default Cadastro;