import React, { useState } from 'react';
import Botao from './Botao';

const BuscaProdutos = ({ aoBuscar }) => {
    const [termoBusca, setTermoBusca] = useState('');

    const handleSearch = (e) => {
        e.preventDefault();
        aoBuscar(termoBusca);
    };

    return (
        <form onSubmit={handleSearch}>
            <input
                type="text"
                placeholder="Buscar produtos..."
                value={termoBusca}
                onChange={(e) => setTermoBusca(e.target.value)}
            />
            <Botao type="submit" variante="primario">Buscar</Botao>
        </form>
    );
};

export default BuscaProdutos;
