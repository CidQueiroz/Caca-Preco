import React, { useState } from 'react';
import apiClient from '../api'; // Usando o apiClient central
import { Link } from 'react-router-dom';
import Botao from '../components/Botao';
import { useNotification } from '../context/NotificationContext';

const RecuperarSenha = () => {
    const [email, setEmail] = useState('');
    const { showNotification } = useNotification();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await apiClient.post('/recuperar-senha/', { email });
            showNotification('Se um usuário com este e-mail existir, um link de recuperação foi enviado.', 'sucesso');
        } catch (err) {
            // Exibe a mesma mensagem para não revelar se um email existe ou não
            showNotification('Se um usuário com este e-mail existir, um link de recuperação foi enviado.', 'sucesso');
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
                <Botao 
                    type="submit" 
                    variante="primario" 
                    style={{ width: '100%' }}
                    disabled={loading}
                >
                    {loading ? 'Enviando...' : 'Enviar Link de Recuperação'}
                </Botao>
            </form>
            <p style={{ marginTop: '20px', textAlign: 'center' }}>
                Lembrou a senha? <Link to="/login">Voltar para o Login</Link>
            </p>
        </div>
    );
};

export default RecuperarSenha;
