import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';


const IndicarVendedor = () => {
    const { token } = useContext(AuthContext);
    const [indicacao, setIndicacao] = useState({
        nome_indicado: '',
        email_indicado: '',
        telefone_indicado: '',
        mensagem: '',
    });
    const [notification, setNotification] = useState({ message: '', type: '' });

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => {
            setNotification({ message: '', type: '' });
        }, 3000);
    };

    const handleIndicacaoChange = (e) => {
        setIndicacao({ ...indicacao, [e.target.name]: e.target.value });
    };

    const handleIndicacaoSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/usuarios/indicate-seller', indicacao, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showNotification('Indicação enviada com sucesso!', 'success');
            setIndicacao({
                nome_indicado: '',
                email_indicado: '',
                telefone_indicado: '',
                mensagem: '',
            });
        } catch (err) {
            showNotification('Falha ao enviar indicação.', 'error');
            console.error(err);
        }
    };

    return (
        <div className="analytics-dashboard">
            {notification.message && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}
            <h1 className="apresentacao__conteudo__titulo">Indicar Novo Vendedor</h1>
            <p>Conhece alguém que deveria vender aqui? Indique-o!</p>
            <form onSubmit={handleIndicacaoSubmit} className="form-container">
                <div className="form-group">
                    <label>Nome do Indicado:</label>
                    <input
                        type="text"
                        name="nome_indicado"
                        value={indicacao.nome_indicado}
                        onChange={handleIndicacaoChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Email do Indicado:</label>
                    <input
                        type="email"
                        name="email_indicado"
                        value={indicacao.email_indicado}
                        onChange={handleIndicacaoChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Telefone do Indicado (opcional):</label>
                    <input
                        type="text"
                        name="telefone_indicado"
                        value={indicacao.telefone_indicado}
                        onChange={handleIndicacaoChange}
                    />
                </div>
                <div className="form-group">
                    <label>Mensagem (opcional):</label>
                    <textarea
                        name="mensagem"
                        value={indicacao.mensagem}
                        onChange={handleIndicacaoChange}
                    ></textarea>
                </div>
                <button type="submit" className="btn btn-primary">Enviar Indicação</button>
            </form>
        </div>
    );
};

export default IndicarVendedor;