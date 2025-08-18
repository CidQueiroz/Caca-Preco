import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const RedefinirSenha = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [notification, setNotification] = useState({ message: '', type: '' });

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => {
            setNotification({ message: '', type: '' });
        }, 5000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== password2) {
            showNotification('As senhas não coincidem.', 'error');
            return;
        }

        try {
            await axios.post(`/api/redefinir-senha/${token}/`, { password });
            showNotification('Senha redefinida com sucesso! Você será redirecionado para o login.', 'success');
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            showNotification('Falha ao redefinir a senha. O link pode ter expirado.', 'error');
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
                    <button type="submit" className="btn btn-primary">Redefinir Senha</button>
                </form>
                {notification.message && (
                    <div className={`notification ${notification.type}`}>
                        {notification.message}
                    </div>
                )}
            </section>
        </main>
    );
};

export default RedefinirSenha;
