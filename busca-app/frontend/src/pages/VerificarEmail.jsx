import React, { useState, useEffect } from 'react';
import { useLocation, /*useNavigate*/ } from 'react-router-dom';
import axios from 'axios';
import Botao from '../components/Botao';
import { useNotification } from '../context/NotificationContext';

const VerificarEmail = () => {
    //const navegar = useNavigate();
    const localizacao = useLocation();
    const { showNotification } = useNotification();
    const [email, setEmail] = useState(localizacao.state?.email || '');

    useEffect(() => {
        if (!localizacao.state?.email) {
            showNotification('Por favor, digite seu email para reenviar o link de verificação.', 'info');
        }
    }, [localizacao.state?.email, showNotification]);


    const handleReenviarEmail = async (e) => {
        e.preventDefault();

        if (!email) {
            showNotification('Por favor, digite seu email.', 'erro');
            return;
        }

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/reenviar-verificacao/`, { email });

            if (response.status === 200) {
                showNotification(response.data.message || 'Link de verificação reenviado com sucesso! Por favor, verifique seu email.', 'sucesso');
            } else {
                showNotification(response.data.message || 'Erro ao reenviar link de verificação.', 'erro');
            }
        } catch (error) {
            console.error('Erro ao reenviar link de verificação:', error.response ? error.response.data : error.message);
            showNotification(error.response?.data?.message || 'Falha ao conectar com o servidor ou erro ao reenviar link.', 'erro');
        }
    };

    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            <h2>Verifique seu Email</h2>
            <p style={{ marginBottom: '20px' }}>Para acessar todas as funcionalidades, por favor, verifique seu email clicando no link que enviamos.</p>
            
            <form onSubmit={handleReenviarEmail}>
                <div style={{ marginBottom: '15px' }}>
                    <label htmlFor="emailInput" style={{ display: 'block', marginBottom: '5px' }}>Seu Email:</label>
                    <input
                        type="email"
                        id="emailInput"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Digite seu email"
                        required
                        style={{ padding: '10px', width: '300px', borderRadius: '5px', border: '1px solid #ccc' }}
                    />
                </div>
                <Botao type="submit" variante="primario">
                    Reenviar Link de Verificação
                </Botao>
            </form>

            <p style={{ marginTop: '20px' }}>Já verificou? <a href="/login" style={{ color: '#007bff', 'text-decoration': 'none' }}>Faça login aqui</a>.</p>
        </div>
    );
};

export default VerificarEmail;
