import React, { useEffect, useState } from 'react';
import ListaProdutos from '../components/ListaProdutos';
import BuscaProdutos from '../components/BuscaProdutos';


const Produtos = () => {
  const [produtos, setProdutos] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');

  useEffect(() => {
    const buscarProdutos = async () => {
      try {
        const response = await fetch('/api/products');
        const data = await response.json();
        setProdutos(data);
      } catch (error) {
        console.error('Erro ao buscar produtos:', error);
      }
    };

    buscarProdutos();
  }, []);

  const produtosFiltrados = produtos.filter(produto =>
    produto.nome.toLowerCase().includes(termoBusca.toLowerCase())
  );

  return (
    <div>
      <h1>Produtos</h1>
      <BuscaProdutos setTermoBusca={setTermoBusca} />
      <ListaProdutos produtos={produtosFiltrados} />
    </div>
  );
};

export default Produtos;