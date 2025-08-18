import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Importar axios

const FormularioCadastro = () => {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [tipo_usuario, setTipoUsuario] = useState('Cliente');
    const [erro, setErro] = useState(null);

    const navegar = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErro(null);

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/registrar/`, { email, senha, tipo_usuario });

            if (response.status === 201) {
                navegar('/completar-perfil', { state: { idUsuario: response.data.id, tipoUsuario: response.data.tipo_usuario, email: email } });
            } else {
                setErro(response.data.message || 'Ocorreu um erro no cadastro.');
            }
        } catch (error) {
            console.error('Falha no cadastro:', error.response?.data);
            // Extrai a mensagem de erro específica do backend
            if (error.response?.data?.email) {
                setErro(`E-mail: ${error.response.data.email[0]}`);
            } else {
                setErro(error.response?.data?.message || 'Não foi possível conectar ao servidor. Tente novamente mais tarde.');
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <h2>Cadastrar</h2>
            {erro && <p className="message-error">{erro}</p>}
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
            <div className="form-group">
                <label>Tipo de Usuário:</label>
                <select value={tipo_usuario} onChange={(e) => setTipoUsuario(e.target.value)}>
                    <option value="Cliente">Cliente</option>
                    <option value="Vendedor">Vendedor</option>
                </select>
            </div>
            <div className="form-actions">
                <button type="submit" className="btn btn-primary">Cadastrar</button>
            </div>
        </form>
    );
};

export default FormularioCadastro;