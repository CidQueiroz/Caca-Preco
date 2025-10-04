import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import Botao from '../components/Botao';

const IndicarVendedor = () => {
    const { token } = useContext(AuthContext);
    const { showNotification } = useNotification();
    const [indicacao, setIndicacao] = useState({
        nome_indicado: '',
        email_indicado: '',
        telefone_indicado: '',
        mensagem: '',
    });

    const handleIndicacaoChange = (e) => {
        setIndicacao({ ...indicacao, [e.target.name]: e.target.value });
    };

    const handleIndicacaoSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/usuarios/indicate-seller', indicacao, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showNotification('Indicação enviada com sucesso!', 'sucesso');
            setIndicacao({
                nome_indicado: '',
                email_indicado: '',
                telefone_indicado: '',
                mensagem: '',
            });
        } catch (err) {
            showNotification('Falha ao enviar indicação.', 'erro');
            console.error(err);
        }
    };

    return (
        <div className="analytics-dashboard">
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
                <Botao type="submit" variante="primario">Enviar Indicação</Botao>
            </form>
        </div>
    );
};

export default IndicarVendedor;