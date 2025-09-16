import React, { useState, useEffect, useContext } from 'react';
import apiClient from '../api';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Botao from '../components/Botao';
import { useNotification } from '../context/NotificationContext';

const CadastroProduto = () => {
  const { token } = useContext(AuthContext);
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  // Estados do componente
  const [sellerCategoryId, setSellerCategoryId] = useState(null);
  const [subcategories, setSubcategories] = useState([]);
  const [nomeProduto, setNomeProduto] = useState('');
  const [descricao, setDescricao] = useState('');
  const [subcategoriaId, setSubcategoriaId] = useState(''); // Pode conter um ID ou a string 'new'
  const [newSubcategoryName, setNewSubcategoryName] = useState(''); // Para o campo de texto dinâmico
  const [loading, setLoading] = useState(true);

  // Efeito para buscar dados iniciais
  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;
      setLoading(true);
      try {
        // 1. Busca o perfil do vendedor para obter sua categoria principal
        const profileResponse = await apiClient.get('/perfil/');
        const categoryId = profileResponse.data?.categoria_loja;

        if (categoryId) {
          setSellerCategoryId(categoryId);
          // 2. Busca apenas as subcategorias que pertencem à categoria do vendedor
          const subcatResponse = await apiClient.get(`/subcategorias/?categoria_loja=${categoryId}`);
          setSubcategories(subcatResponse.data || []);
        } else {
          showNotification('Não foi possível identificar a categoria da sua loja. Complete seu perfil.', 'aviso');
        }
      } catch (error) {
        console.error('Erro ao buscar dados iniciais:', error);
        showNotification('Erro ao carregar dados da página. Tente novamente.', 'erro');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, showNotification]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    let finalSubcategoryId = subcategoriaId;

    try {
      // Etapa 1: Se o vendedor está criando uma nova subcategoria
      if (subcategoriaId === 'new') {
        if (!newSubcategoryName.trim()) {
          showNotification('Por favor, digite o nome da nova subcategoria.', 'erro');
          setLoading(false);
          return;
        }
        // Cria a nova subcategoria primeiro
        const newSubcatResponse = await apiClient.post('/subcategorias/', {
          nome: newSubcategoryName,
          categoria_loja: sellerCategoryId,
        });
        finalSubcategoryId = newSubcatResponse.data.id; // Pega o ID da subcategoria recém-criada
        showNotification(`Subcategoria '${newSubcategoryName}' criada com sucesso!`, 'sucesso');
      }

      if (!finalSubcategoryId) {
        showNotification('Por favor, selecione uma subcategoria.', 'erro');
        setLoading(false);
        return;
      }

      // Etapa 2: Cria o produto base com o ID da subcategoria (seja ela existente ou nova)
      const produtoData = {
        nome: nomeProduto,
        descricao: descricao,
        subcategoria: finalSubcategoryId,
      };

      const productResponse = await apiClient.post('/produtos/', produtoData);
      showNotification('Produto base cadastrado! Agora, adicione as variações e ofertas.', 'sucesso');
      
      // Etapa 3: Redireciona para a página de adicionar oferta
      navigate('/adicionar-oferta', { state: { newProductId: productResponse.data.id } });

    } catch (error) {
      console.error('Erro no processo de cadastro de produto:', error);
      const errorMsg = error.response?.data?.detail || error.response?.data?.nome?.[0] || 'Falha ao cadastrar o produto.';
      showNotification(errorMsg, 'erro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container" style={{maxWidth: '900px'}}>
      <h1 className="apresentacao__conteudo__titulo">Cadastrar Novo Produto no Catálogo</h1>
      <p>Esta etapa cria o produto base. Após o cadastro, você será direcionado para adicionar as variações (cores, tamanhos) e suas ofertas (preço, estoque).</p>
      
      {loading && <p>Carregando dados da sua loja...</p>}

      {!loading && (
        <form onSubmit={handleSubmit} style={{marginTop: '2rem'}}>
          <div className="form-group">
            <label htmlFor="nomeProduto">Nome do Produto:</label>
            <input
              type="text"
              id="nomeProduto"
              value={nomeProduto}
              onChange={(e) => setNomeProduto(e.target.value)}
              placeholder="Ex: Camiseta de Algodão Pima"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="descricao">Descrição:</label>
            <textarea
              id="descricao"
              value={descricao}
              placeholder="Uma breve descrição sobre o produto"
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="subcategoria">Subcategoria do Produto:</label>
            <select
              id="subcategoria"
              value={subcategoriaId}
              onChange={(e) => setSubcategoriaId(e.target.value)}
              required
            >
              <option value="">Selecione uma subcategoria</option>
              {subcategories.map(sub => (
                <option key={sub.id} value={sub.id}>
                  {sub.nome}
                </option>
              ))}
              <option value="new">Outra... (especificar)</option>
            </select>
          </div>

          {subcategoriaId === 'new' && (
            <div className="form-group">
              <label htmlFor="newSubcategoryName">Nome da Nova Subcategoria:</label>
              <input
                type="text"
                id="newSubcategoryName"
                value={newSubcategoryName}
                onChange={(e) => setNewSubcategoryName(e.target.value)}
                placeholder="Ex: Camisetas Manga Longa"
                required
              />
            </div>
          )}

          <div className="form-actions">
            <Botao type="submit" variante="sucesso" disabled={loading}>
              {loading ? 'Salvando...' : 'Cadastrar Produto e Adicionar Variações'}
            </Botao>
          </div>
        </form>
      )}
    </div>
  );
};

export default CadastroProduto;