import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ListaProdutos = () => {
  const [produtos, setProdutos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    const buscarProdutos = async () => {
      try {
        const response = await axios.get('/api/products');
        setProdutos(response.data);
      } catch (err) {
        setErro(err.message);
      } finally {
        setCarregando(false);
      }
    };

    buscarProdutos();
  }, []);

  if (carregando) return <div>Carregando...</div>;
  if (erro) return <div>Erro: {erro}</div>;

  return (
    <div>
      <h2>Lista de Produtos</h2>
      <ul>
        {produtos.map(produto => (
          <li key={produto.id}>
            <h3>{produto.nome}</h3>
            <p>{produto.descricao}</p>
            <p>Preço: ${produto.preco}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ListaProdutos;