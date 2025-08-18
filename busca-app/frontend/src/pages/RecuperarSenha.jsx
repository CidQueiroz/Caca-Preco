import React, { useState } from 'react';
import apiClient from '../api'; // Usando o apiClient central
import { Link } from 'react-router-dom';

const RecuperarSenha = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ text: '', type: '' });
        try {
            // A URL já está configurada no apiClient
            await apiClient.post('/recuperar-senha/', { email });
            setMessage({ text: 'Se um usuário com este e-mail existir, um link de recuperação foi enviado.', type: 'success' });
        } catch (err) {
            // Exibe a mesma mensagem para não revelar se um email existe ou não
            setMessage({ text: 'Se um usuário com este e-mail existir, um link de recuperação foi enviado.', type: 'success' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="form-page-container">
            <h1 className="page-title">
                Recuperar <strong className="titulodestaque">Senha</strong>
            </h1>
            <p className="page-subtitle" style={{marginBottom: '20px'}}>
                Digite seu e-mail e enviaremos um link para você voltar a acessar sua conta.
            </p>

            {message.text && (
                <div className={`message message-${message.type}`}>
                    {message.text}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="email">E-mail</label>
                    <input
                        type="email"
                        id="email"
                        className="form-control" // Classe padronizada
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seuemail@exemplo.com"
                        required
                        disabled={loading}
                    />
                </div>
                <button 
                    type="submit" 
                    className="btn btn-primary" 
                    style={{ width: '100%' }}
                    disabled={loading}
                >
                    {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
                </button>
            </form>
            <p style={{ marginTop: '20px', textAlign: 'center' }}>
                Lembrou a senha? <Link to="/login">Voltar para o Login</Link>
            </p>
        </div>
    );
};

export default RecuperarSenha;
