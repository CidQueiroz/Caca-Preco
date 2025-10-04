import React from 'react';
import { Link } from 'react-router-dom';

const Botao = ({
    children,
    onClick,
    to,
    variante = 'primario',
    tamanho, // Nova propriedade de tamanho
    type = 'button',
    disabled = false,
    ...outrasProps
}) => {
    // Adiciona a classe de tamanho se a propriedade for fornecida
    const classes = `btn btn-${variante} ${tamanho === 'sm' ? 'btn-sm' : ''}`.trim();

    if (to) {
        return (
            <Link to={to} className={classes} {...outrasProps}>
                {children}
            </Link>
        );
    }

    return (
        <button
            onClick={onClick}
            className={classes}
            type={type}
            disabled={disabled}
            {...outrasProps}
        >
            {children}
        </button>
    );
};

export default Botao;