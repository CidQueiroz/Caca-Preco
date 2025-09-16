import React, { useState, useEffect } from 'react';
import Botao from './Botao';

const FormularioAdmin = ({ aoEnviar, initialData }) => {
    const [nome, setNome] = useState('');
    const [erros, setErros] = useState({});

    useEffect(() => {
        if (initialData) {
            setNome(initialData.nome || '');
        }
    }, [initialData]);

    const validarCampos = () => {
        let novosErros = {};
        if (!nome) novosErros.nome = 'O nome é obrigatório.';
        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validarCampos()) {
            aoEnviar({ nome });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <h3>Dados de Administrador</h3>
            {erros.nome && <p className="message-error">{erros.nome}</p>}
            <div className="form-group">
                <label htmlFor="nomeAdmin">Nome Completo</label>
                <input type="text" id="nomeAdmin" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome Completo" required />
            </div>
            <Botao type="submit" variante="primario">Salvar Alterações</Botao>
        </form>
    );
};

export default FormularioAdmin;