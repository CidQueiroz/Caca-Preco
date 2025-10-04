import React, { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormularioLogin from '../components/FormularioLogin';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
    const { token, perfilCompleto } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (token && perfilCompleto) {
            navigate('/painel');
        }
        // If the token exists but the profile is not complete,
        // the logic in FormularioLogin will handle the redirect to /completar-perfil.
        // This useEffect is mainly for users who are already logged in and revisit the login page.
    }, [token, perfilCompleto, navigate]);

    return (
        <main className="apresentacao"> 
            <section className="apresentacao__conteudo">
                <h1 className="apresentacao__conteudo__titulo" style={{ textAlign: 'center' }}>
                    Faça seu <strong className="titulodestaque">Login!</strong>
                </h1>

                <FormularioLogin />
                <p style={{ marginTop: '20px', textAlign: 'center', width: '100%' }}> 
                    Não tem cadastro? <Link to="/cadastro">Cadastre-se aqui</Link>
                </p>
                <p style={{ marginTop: '10px', textAlign: 'center', width: '100%' }}> 
                    <Link to="/recuperar-senha">Esqueceu a senha?</Link>
                </p>
            </section>
            <img 
                src="/assets/ia.png" 
                alt="Unicórnio" 
                className="apresentacao_imagem"
            />
        </main>
    );
};

export default Login;