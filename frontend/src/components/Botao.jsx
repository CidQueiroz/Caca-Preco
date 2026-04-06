import React from 'react';
import { Button as LibraryButton } from '@cidqueiroz/cdkteck-ui';

const Botao = ({
    children,
    onClick,
    to,
    variante = 'primary',
    tamanho,
    type = 'button',
    disabled = false,
    ...props
}) => {
    // Map local variants to library variants
    const variantMap = {
        'primario': 'primary',
        'secundario': 'secondary',
        'sucesso': 'primary', // Library doesn't have success yet, mapping to primary
        'perigo': 'danger',
        'primary': 'primary',
        'secondary': 'secondary',
        'danger': 'danger',
        'ghost': 'ghost'
    };

    const libVariant = variantMap[variante] || 'primary';

    return (
        <LibraryButton
            onClick={onClick}
            to={to}
            variant={libVariant}
            type={type}
            disabled={disabled}
            {...props}
        >
            {children}
        </LibraryButton>
    );
};

export default Botao;
