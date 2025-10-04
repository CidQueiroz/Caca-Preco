import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import Botao from '../components/Botao'; // Importando o novo componente

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
                    
                    {/* Substituindo <a> por <Botao> */}
                    <Botao to="/login" variante="secundario">
                        <FontAwesomeIcon icon={faSignInAlt} />
                        Login
                    </Botao>

                    {/* Substituindo <a> por <Botao> */}
                    <Botao to="/cadastro" variante="primario">
                        <FontAwesomeIcon icon={faUserPlus} />
                        Cadastre-se
                    </Botao>

                </div>

            </section>

            <img className="apresentacao_imagem" src="/assets/ia.png" alt="Lourdes" />

        </main>
    );
};

export default Inicio;