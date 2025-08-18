import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import axios

const VerificarEmail = () => {
    const navegar = useNavigate();
    const localizacao = useLocation();
    const [email, setEmail] = useState(localizacao.state?.email || ''); // Initialize with email from state or empty
    const [notification, setNotification] = useState({ message: '', type: '' });

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => {
            setNotification({ message: '', type: '' });
        }, 5000); // Increased timeout for better visibility
    };

    // If email is not provided via state, user needs to input it
    useEffect(() => {
        if (!localizacao.state?.email) {
            showNotification('Por favor, digite seu email para reenviar o link de verificação.', 'info');
        }
    }, [localizacao.state?.email]);


    const handleReenviarEmail = async (e) => { // Renamed function
        e.preventDefault(); // Prevent form submission if wrapped in a form

        if (!email) {
            showNotification('Por favor, digite seu email.', 'error');
            return;
        }

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/reenviar-verificacao/`, { email }); // Correct Django endpoint

            if (response.status === 200) { // Django returns 200 OK
                showNotification(response.data.message || 'Link de verificação reenviado com sucesso! Por favor, verifique seu email.', 'success');
            } else {
                showNotification(response.data.message || 'Erro ao reenviar link de verificação.', 'error');
            }
        } catch (error) {
            console.error('Erro ao reenviar link de verificação:', error.response ? error.response.data : error.message);
            showNotification(error.response?.data?.message || 'Falha ao conectar com o servidor ou erro ao reenviar link.', 'error');
        }
    };

    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            {notification.message && (
                <div className={`notification ${notification.type}`} style={{ marginBottom: '20px', padding: '10px', borderRadius: '5px', backgroundColor: notification.type === 'success' ? '#d4edda' : '#f8d7da', color: notification.type === 'success' ? '#155724' : '#721c24' }}>
                    {notification.message}
                </div>
            )}
            <h2>Verifique seu Email</h2>
            <p style={{ marginBottom: '20px' }}>Para acessar todas as funcionalidades, por favor, verifique seu email clicando no link que enviamos.</p>
            
            <form onSubmit={handleReenviarEmail}> {/* Wrap in a form */}
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
                <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
                    Reenviar Link de Verificação
                </button>
            </form>

            <p style={{ marginTop: '20px' }}>Já verificou? <a href="/login" style={{ color: '#007bff', textDecoration: 'none' }}>Faça login aqui</a>.</p>
        </div>
    );
};

export default VerificarEmail;
