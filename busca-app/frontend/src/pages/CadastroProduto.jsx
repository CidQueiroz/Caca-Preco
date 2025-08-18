import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const CadastroProduto = () => {
  const { token } = useContext(AuthContext);
  const [todasSubcategorias, setTodasSubcategorias] = useState([]);
  const [nomeProduto, setNomeProduto] = useState('');
  const [descricao, setDescricao] = useState('');
  const [buscaSubcategoria, setBuscaSubcategoria] = useState('');
  const [sugestoes, setSugestoes] = useState([]);
  const [subcategoriaSelecionada, setSubcategoriaSelecionada] = useState(null);
  const [variacoes, setVariacoes] = useState([]);
  const [notification, setNotification] = useState({ message: '', type: '' });

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => {
        setNotification({ message: '', type: '' });
    }, 3000);
  };

  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        const response = await axios.get('/api/subcategorias', {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Dados da subcategoria recebidos:', response.data);
        setTodasSubcategorias(response.data.map(sub => ({ id: sub.id, nome: sub.nome })));
      } catch (error) {
        console.error('Erro ao buscar subcategorias:', error);
        showNotification('Erro ao carregar subcategorias. Tente novamente.', 'error');
      }
    };
    fetchSubcategories();
  }, [token]);

  useEffect(() => {
    if (buscaSubcategoria.length > 0) {
      const filtradas = todasSubcategorias.filter(sub =>
        sub.nome.toLowerCase().includes(buscaSubcategoria.toLowerCase())
      );
      setSugestoes(filtradas);
    } else {
      setSugestoes([]);
    }
  }, [buscaSubcategoria, todasSubcategorias]);

  const handleSelecionarSubcategoria = (sub) => {
    setSubcategoriaSelecionada(sub);
    setBuscaSubcategoria(sub.nome);
    setSugestoes([]);
  };

  const handleBlurSubcategoria = () => {
    if (buscaSubcategoria.trim() === '') {
      setSubcategoriaSelecionada(null);
      return;
    }

    if (subcategoriaSelecionada && subcategoriaSelecionada.nome.toLowerCase() === buscaSubcategoria.toLowerCase()) {
      return;
    }

    const matchedSub = todasSubcategorias.find(sub => sub.nome.toLowerCase() === buscaSubcategoria.toLowerCase());
    if (matchedSub) {
      setSubcategoriaSelecionada(matchedSub);
      setBuscaSubcategoria(matchedSub.nome);
    } else {
      setSubcategoriaSelecionada(null);
    }
  };

  const handleAdicionarVariacao = () => {
    setVariacoes([
      ...variacoes,
      {
        id: Date.now(),
        nomeVariacao: '',
        valorVariacao: '',
        preco: '',
        quantidadeDisponivel: '',
        imagens: [],
      },
    ]);
  };

  const handleRemoverVariacao = (id) => {
    setVariacoes(variacoes.filter(v => v.id !== id));
  };

  const handleVariacaoChange = (id, campo, valor) => {
    const novasVariacoes = variacoes.map(v => {
      if (v.id === id) {
        return { ...v, [campo]: valor };
      }
      return v;
    });
    setVariacoes(novasVariacoes);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!subcategoriaSelecionada) {
      showNotification('Por favor, selecione uma subcategoria válida.', 'error');
      return;
    }
    if (variacoes.length === 0) {
      showNotification('Adicione pelo menos uma variação para o produto.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('nomeProduto', nomeProduto);
    formData.append('descricao', descricao);
    formData.append('idSubcategoria', subcategoriaSelecionada.id);

    variacoes.forEach((variacao, index) => {
      formData.append(`variacoes[${index}][nomeVariacao]`, variacao.nomeVariacao);
      formData.append(`variacoes[${index}][valorVariacao]`, variacao.valorVariacao);
      formData.append(`variacoes[${index}][preco]`, variacao.preco);
      formData.append(`variacoes[${index}][quantidadeDisponivel]`, variacao.quantidadeDisponivel);

      if (variacao.imagens && variacao.imagens.length > 0) {
        for (let i = 0; i < variacao.imagens.length; i++) {
          if (variacao.imagens[i] instanceof File) {
            formData.append(`imagens_${index}`, variacao.imagens[i]);
          } else if (typeof variacao.imagens[i] === 'string') {
            formData.append(`variacoes[${index}][urlImagem]`, variacao.imagens[i]);
          }
        }
      }
    });

    try {
      await axios.post('/api/produtos/completo/', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      showNotification('Produto cadastrado com sucesso!', 'success');
      // Limpar o formulário
      setNomeProduto('');
      setDescricao('');
      setBuscaSubcategoria('');
      setSubcategoriaSelecionada(null);
      setVariacoes([]);
    } catch (error) {
      console.error('Erro ao cadastrar produto:', error);
      showNotification('Falha ao cadastrar o produto. Tente novamente.', 'error');
    }
  };

  return (
    <>
      {notification.message && (
        <div className={`notification ${notification.type}`}>
            {notification.message}
        </div>
      )}
      <h2>Cadastro de Produto</h2>
      <form onSubmit={handleSubmit}>
        {/* Seção 1: Informações Gerais */}
        <div className="form-section">
          <h3 className="form-section-title">Informações Gerais do Produto</h3>
          <div className="form-group">
            <label htmlFor="nomeProduto">Nome do Produto:</label>
            <input
              type="text"
              id="nomeProduto"
              value={nomeProduto}
              onChange={(e) => setNomeProduto(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="descricao">Descrição:</label>
            <textarea
              id="descricao"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              onKeyPress={(e) => { if (e.key === 'Enter') handleSubmit(e); }}
            />
          </div>
          <div className="form-group">
            <label htmlFor="buscaSubcategoria">Buscar Subcategoria:</label>
            <input
              type="text"
              id="buscaSubcategoria"
              value={buscaSubcategoria}
              onChange={(e) => setBuscaSubcategoria(e.target.value)}
              onBlur={handleBlurSubcategoria}
              required
            />
            {sugestoes.length > 0 && (
              <ul className="suggestions-list">
                {sugestoes.map(s => (
                  <li key={s.id} onClick={() => handleSelecionarSubcategoria(s)} className="suggestion-item">
                    {s.nome}
                  </li>
                ))}
              </ul>
            )}
            {subcategoriaSelecionada && (
              <p className="selected-subcategory">Subcategoria Selecionada: <strong>{subcategoriaSelecionada.nome}</strong></p>
            )}
          </div>
        </div>

        {/* Seção 2: Variações e Ofertas */}
        <div className="form-section">
          <h3 className="form-section-title">Variações e Ofertas</h3>
          {variacoes.map((variacao, index) => (
            <div key={variacao.id} className="variation-item">
              <h4>Variação {index + 1}</h4>
              <div className="form-group">
                <label>Nome da Variação (ex: Marca, Sabor):</label>
                <input
                  type="text"
                  value={variacao.nomeVariacao}
                  onChange={(e) => handleVariacaoChange(variacao.id, 'nomeVariacao', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Valor da Variação (ex: Ninho, Morango):</label>
                <input
                  type="text"
                  value={variacao.valorVariacao}
                  onChange={(e) => handleVariacaoChange(variacao.id, 'valorVariacao', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Preço (R$):</label>
                <input
                  type="number"
                  step="0.01"
                  value={variacao.preco}
                  onChange={(e) => handleVariacaoChange(variacao.id, 'preco', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Quantidade em Estoque:</label>
                <input
                  type="number"
                  value={variacao.quantidadeDisponivel}
                  onChange={(e) => handleVariacaoChange(variacao.id, 'quantidadeDisponivel', e.target.value)}
                  onKeyPress={(e) => { if (e.key === 'Enter') handleSubmit(e); }}
                  required
                />
              </div>
              <div className="form-group">
                <label>Imagens:</label>
                <input type="file" multiple onChange={(e) => handleVariacaoChange(variacao.id, 'imagens', Array.from(e.target.files))} />
                <input type="text" placeholder="Ou cole a URL da imagem aqui" onChange={(e) => handleVariacaoChange(variacao.id, 'imagens', [e.target.value])} />
              </div>
              <button type="button" onClick={() => handleRemoverVariacao(variacao.id)} className="btn btn-danger">Remover Variação</button>
            </div>
          ))}
          <button type="button" onClick={handleAdicionarVariacao} className="btn btn-secondary">
            + Adicionar Variação
          </button>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-success">Cadastrar Produto Completo</button>
        </div>
      </form>
    </>
  );
};

export default CadastroProduto;

