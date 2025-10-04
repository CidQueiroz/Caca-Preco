import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Botao from '../components/Botao';
import { useNotification } from '../context/NotificationContext';

const RedefinirSenha = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== password2) {
            showNotification('As senhas não coincidem.', 'erro');
            return;
        }

        try {
            await axios.post(`/api/redefinir-senha/${token}/`, { password });
            showNotification('Senha redefinida com sucesso! Você será redirecionado para o login.', 'sucesso');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            showNotification('Falha ao redefinir a senha. O link pode ter expirado.', 'erro');
        }
    };

    return (
        <main className="apresentacao">
            <section className="apresentacao__conteudo">
                <h1 className="apresentacao__conteudo__titulo" style={{ textAlign: 'center' }}>
                    Redefinir <strong className="titulodestaque">Senha</strong>
                </h1>
                <form onSubmit={handleSubmit} className="formulario-login">
                    <div className="form-group">
                        <label htmlFor="password">Nova Senha</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password2">Confirmar Nova Senha</label>
                        <input
                            type="password"
                            id="password2"
                            value={password2}
                            onChange={(e) => setPassword2(e.target.value)}
                            required
                        />
                    </div>
                    <Botao type="submit" variante="primario">Redefinir Senha</Botao>
                </form>
            </section>
        </main>
    );
};

export default RedefinirSenha;
