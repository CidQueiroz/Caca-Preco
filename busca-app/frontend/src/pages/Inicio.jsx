import React from 'react';
import { Link } from 'react-router-dom';

const Inicio = () => {
    return (
        <main className="apresentacao">
            <section className="apresentacao__conteudo" style={{ textAlign: 'center' }}>
                <h1 className="apresentacao__conteudo__titulo">
                    BEM-VINDO AO
                </h1>
                <h1 className="apresentacao__conteudo__titulo">
                    <strong className="titulodestaque"><b>CAÇA-PREÇO!</b></strong>
                </h1>
                <p className="apresentacao__conteudo__texto">
                    Olá, eu sou a Lourdes. Sua aventura mágica financeira começa aqui!
                </p>
                <div className="apresentacao__links">
                    <h2 className="apresentacao__links__subtitulo">Acesse a plataforma:</h2>
                    <Link to="/login" className="apresentacao__links__navegacao">
                        <img src="/assets/twitter.png" alt="Entrar" />
                        Login
                    </Link>
                    <Link to="/cadastro" className="apresentacao__links__navegacao">
                        <img src="/assets/github.png" alt="Cadastrar" />
                        Cadastre-se
                    </Link>
                </div>
            </section>
            <img className="apresentacao_imagem" src="/assets/ia.png" alt="Lourdes" />
        </main>
    );
};

export default Inicio;
