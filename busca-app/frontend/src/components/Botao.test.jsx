import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom'; // Necessário para testar o componente Link
import Botao from './Botao';

describe('Componente Botao', () => {

    test('renderiza corretamente com o texto', () => {
        render(<Botao>Clique Aqui</Botao>);
        const buttonElement = screen.getByRole('button', { name: /clique aqui/i });
        expect(buttonElement).toBeInTheDocument();
    });

    test('chama a função onClick quando clicado', () => {
        const handleClick = jest.fn(); // Cria uma função "mock" (simulada)
        render(<Botao onClick={handleClick}>Clique Aqui</Botao>);
        const buttonElement = screen.getByRole('button', { name: /clique aqui/i });
        fireEvent.click(buttonElement);
        expect(handleClick).toHaveBeenCalledTimes(1); // Verifica se a função foi chamada uma vez
    });

    test('aplica as classes de variante e tamanho corretamente', () => {
        render(<Botao variante="secundario" tamanho="sm">Botão Pequeno</Botao>);
        const buttonElement = screen.getByRole('button', { name: /botão pequeno/i });
        expect(buttonElement).toHaveClass('btn', 'btn-secundario', 'btn-sm');
    });

    test('fica desabilitado quando a propriedade disabled é passada', () => {
        render(<Botao disabled>Desabilitado</Botao>);
        const buttonElement = screen.getByRole('button', { name: /desabilitado/i });
        expect(buttonElement).toBeDisabled();
    });

    test('renderiza como um link quando a propriedade "to" é passada', () => {
        render(
            <MemoryRouter> {/* O componente Link precisa de um Router por perto */}
                <Botao to="/caminho-teste">Ir para Teste</Botao>
            </MemoryRouter>
        );
        // Quando é um link, seu "role" é 'link', não 'button'
        const linkElement = screen.getByRole('link', { name: /ir para teste/i });
        expect(linkElement).toBeInTheDocument();
        expect(linkElement).toHaveAttribute('href', '/caminho-teste');
    });

});
