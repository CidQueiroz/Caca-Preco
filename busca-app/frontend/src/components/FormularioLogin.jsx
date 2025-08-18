import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const FormularioLogin = () => {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [erro, setErro] = useState('');
    const [mensagemSucesso, setMensagemSucesso] = useState('');

    const { login } = useContext(AuthContext);
    const navegar = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErro('');
        setMensagemSucesso('');

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/login/`, { email, password: senha });
            
            const { access: token, user: dadosUsuario } = response.data;
            login(token, dadosUsuario); // Função do seu AuthContext

            // Lógica de redirecionamento pós-sucesso
            if (!dadosUsuario.perfil_completo) {
                navegar('/completar-perfil');
            } else if (!dadosUsuario.email_verificado) {
                navegar('/verificar-email', { state: { email: email } });
            } else if (dadosUsuario.tipo_usuario === 'Vendedor') {
                navegar('/dashboard-vendedor');
            } else if (dadosUsuario.tipo_usuario === 'Cliente') {
                navegar('/dashboard-cliente');
            } else {
                navegar('/nao-autorizado');
            }

        } catch (err) {
            // --- ADICIONE ESTA LINHA PARA DEPURAÇÃO ---
            console.log('OBJETO DE ERRO COMPLETO RECEBIDO:', err.response); 

            // --- LÓGICA DE ERRO CORRIGIDA ---
            const errorDetail = err.response?.data?.detail;

            if (Array.isArray(errorDetail) && errorDetail[0] === 'EMAIL_NAO_VERIFICADO') {
                // Se a condição for verdadeira, a única ação é navegar.
                navegar('/verificar-email', { state: { email: email } });
            } else {
                // Para todos os outros erros, mostramos a mensagem.
                // Também pegamos o primeiro item do array de mensagens para ser mais robusto.
                const errorMessage = err.response?.data?.message?.[0] || 'Falha no login. Verifique suas credenciais.';
                setErro(errorMessage);
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <h2>Login</h2>
            {erro && (
                <p className="message-error">
                    {erro.includes("Sua conta não foi verificada") ? (
                        <>
                            Sua conta não foi verificada. Por favor,{" "}
                            <Link to="/verificar-email" state={{ email: email }}>
                                verifique seu e-mail
                            </Link>
                            .
                        </>
                    ) : (
                        erro
                    )}
                </p>
            )}
            {mensagemSucesso && <p className="message-success">{mensagemSucesso}</p>}
            <div className="form-group">
                <label>Email:</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <label>Senha:</label>
                <input
                    type="password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    onKeyPress={(e) => { if (e.key === 'Enter') handleSubmit(e); }}
                    required
                />
            </div>
            <div className="form-actions">
                <button type="submit" className="btn btn-primary">Entrar</button>
            </div>
        </form>
    );
};

export default FormularioLogin;