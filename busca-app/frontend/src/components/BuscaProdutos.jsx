import React, { useState } from 'react';

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
            <button type="submit">Buscar</button>
        </form>
    );
};

export default BuscaProdutos;