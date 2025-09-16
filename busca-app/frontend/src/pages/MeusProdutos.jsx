import React, { useState, useEffect, useContext, useCallback } from 'react';
//import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Botao from '../components/Botao'; // Importando o componente Botao

const ArrowIcon = ({ expanded }) => (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
        <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
);

const MeusProdutos = () => {
    //const navigate = useNavigate();
    const [produtos, setProdutos] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useContext(AuthContext);
    const [categorias, setCategorias] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [notification, setNotification] = useState({ message: '', type: '' });
    
    const [viewMode, setViewMode] = useState('card');
    const [expandedRowId, setExpandedRowId] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [editingImage, setEditingImage] = useState(null); // Novo estado para a imagem em edição

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: '' }), 5000);
    };

    const fetchProdutos = useCallback(async () => {
        setLoading(true);
        try {
            const baseUrl = process.env.REACT_APP_API_URL;
            const url = selectedCategory 
                ? `${baseUrl}/api/produtos/meus-produtos/?id_categoria=${selectedCategory}` 
                : `${baseUrl}/api/produtos/meus-produtos/`;
            const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
            setProdutos(response.data);
        } catch (err) {
            console.error("Falha ao buscar produtos:", err);
        }
        setLoading(false);
    }, [token, selectedCategory]);

    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const response = await axios.get('/api/categorias/', { headers: { Authorization: `Bearer ${token}` } });
                setCategorias(response.data);
            } catch (err) {
                console.error("Falha ao buscar categorias", err);
            }
        };
        if (token) {
            fetchProdutos();
            fetchCategorias();
        }
    }, [token, fetchProdutos]);
    
    const handleEditClick = (product) => {
        setEditingProduct({ ...product });
        setEditingImage(null); // Limpa a imagem selecionada ao iniciar a edição
    };

    const handleCancelEdit = () => {
        setEditingProduct(null);
        setEditingImage(null); // Limpa a imagem selecionada ao cancelar
    };

    const handleChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setEditingImage(files[0]);
        } else {
            setEditingProduct(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSaveClick = async () => {
        if (!editingProduct) return;

        const formData = new FormData();
        formData.append('preco', editingProduct.preco);
        formData.append('quantidade_disponivel', editingProduct.quantidade_disponivel);
        
        if (editingImage) {
            formData.append('imagem', editingImage);
        }

        try {
            await axios.patch(`${process.env.REACT_APP_API_URL}/api/ofertas/${editingProduct.id}/`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            showNotification('Oferta atualizada com sucesso!', 'sucesso');
            setEditingProduct(null);
            setEditingImage(null); // Limpa imagem após salvar
            fetchProdutos();
        } catch (err) {
            showNotification('Falha ao atualizar a oferta.', 'error');
            console.error(err);
        }
    };

    const handleDeleteClick = async (ofertaId) => {
        if (window.confirm('Tem certeza que deseja excluir esta oferta de produto?')) {
            try {
                await axios.delete(`/api/ofertas/${ofertaId}/`, { headers: { Authorization: `Bearer ${token}` } });
                showNotification('Oferta excluída com sucesso!', 'sucesso');
                fetchProdutos();
            } catch (err) {
                showNotification('Falha ao excluir a oferta.', 'error');
                console.error(err);
            }
        }
    };

    const toggleImageExpansion = (produtoId) => {
        setExpandedRowId(prevId => (prevId === produtoId ? null : produtoId));
    };

    if (loading) return <div className="layout-logado-content" style={{textAlign: 'center'}}>Carregando...</div>;

    // --- RENDERIZAÇÃO PRINCIPAL ---
    return (
        <div>
            {notification.message && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h1 className="dashboard-title" style={{marginBottom: 0}}>Meus Produtos</h1>
                <Botao to="/adicionar-oferta" variante="primario">Adicionar Nova Oferta</Botao>
            </div>
            
            <div className="view-controls">
                <div className="form-group" style={{ flexGrow: 1, maxWidth: '400px' }}>
                    <label htmlFor="categoryFilter">Filtrar por Categoria:</label>
                    <select id="categoryFilter" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                        <option value="">Todas as Categorias</option>
                        {categorias.map(cat => (<option key={cat.id} value={cat.id}>{cat.nome}</option>))}
                    </select>
                </div>
                <div className="view-toggle-buttons">
                    <Botao onClick={() => setViewMode('card')} variante={viewMode === 'card' ? 'primario' : 'secundario'}>Cards</Botao>
                    <Botao onClick={() => setViewMode('list')} variante={viewMode === 'list' ? 'primario' : 'secundario'}>Lista</Botao>
                </div>
            </div>

            {produtos.length === 0 ? (
                <p style={{ textAlign: 'center', marginTop: '20px' }}>Nenhum produto encontrado.</p>
            ) : (
                <>
                    {viewMode === 'card' ? (
                        <div className="card-grid">
                            {produtos.map(produto => {
                                // Variável para verificar se este é o card que está a ser editado
                                const isEditing = editingProduct && editingProduct.id === produto.id;

                                // Define a URL da imagem a ser exibida
                                // Se uma nova imagem foi selecionada no modo de edição, mostra a pré-visualização.
                                // Senão, mostra a imagem atual do produto.
                                const imageUrl = isEditing && editingImage
                                    ? URL.createObjectURL(editingImage)
                                    : produto.url_imagem; // Supondo que o serializer envia 'imagem_principal'

                                return (
                                    // Adicionamos uma classe extra quando o card está em modo de edição
                                    <div key={produto.id} className={`card ${isEditing ? 'card--editing' : ''}`}>
                                        {isEditing ? (
                                            // --- NOVO MODO DE EDIÇÃO COM DUAS COLUNAS ---
                                            <div className="edit-mode-grid">
                                                
                                                {/* Coluna da Esquerda: Imagem e Botão de Trocar */}
                                                <div className="edit-image-container">
                                                    <img 
                                                        src={imageUrl} 
                                                        alt={produto.nome_produto} 
                                                        className="product-image"
                                                    />
                                                    <div className="form-group">
                                                        {/* Este label está estilizado para parecer um botão */}
                                                        <label htmlFor={`imagem-${produto.id}`} className="btn btn-secondary btn-file">Trocar Imagem</label>
                                                        <input 
                                                            type="file" 
                                                            id={`imagem-${produto.id}`}
                                                            name="imagem" 
                                                            onChange={handleChange} 
                                                            accept="image/png, image/jpeg, image/webp"
                                                            style={{ display: 'none' }} // O input real fica escondido
                                                        />
                                                    </div>
                                                </div>

                                                {/* Coluna da Direita: Campos de Texto e Botões de Ação */}
                                                <div className="edit-form-container">
                                                    <div className="form-group">
                                                        <label>Preço:</label>
                                                        <input type="number" name="preco" value={editingProduct.preco || ''} onChange={handleChange} step="0.01" />
                                                    </div>
                                                    
                                                    <div className="form-group">
                                                        <label>Estoque:</label>
                                                        <input type="number" name="quantidade_disponivel" value={editingProduct.quantidade_disponivel || ''} onChange={handleChange} />
                                                    </div>
                                                    
                                                    <div className="form-actions edit-actions">
                                                        <Botao onClick={handleSaveClick} variante="sucesso">Salvar</Botao>
                                                        <Botao onClick={handleCancelEdit} variante="secundario">Cancelar</Botao>
                                                        <Botao onClick={() => handleDeleteClick(editingProduct.id)} variante="perigo">Excluir</Botao>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            // --- MODO DE VISUALIZAÇÃO (sem alterações na estrutura) ---
                                            <> 
                                                <img src={produto.url_imagem} alt={produto.nome_produto} className="product-image" />
                                                <h2 className="card-title">{produto.nome_produto}</h2>
                                                <p className="card-text"><strong>Variação:</strong> {produto.variacao_formatada}</p>
                                                <p className="card-text"><strong>Preço:</strong> R$ {produto.preco}</p>
                                                <p className="card-text"><strong>Estoque:</strong> {produto.quantidade_disponivel}</p>
                                                <Botao onClick={() => handleEditClick(produto)} variante="secundario">Editar</Botao>
                                            </>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="list-view-container">
                            <table className="product-table">
                                <thead>
                                    <tr>
                                        <th>Produto</th>
                                        <th>Variação</th>
                                        <th>Preço</th>
                                        <th>Estoque</th>
                                        <th>Imagem</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {produtos.map(produto => {
                                        const isEditing = editingProduct && editingProduct.id === produto.id;
                                        const isExpanded = expandedRowId === produto.id;

                                        return (
                                            <React.Fragment key={produto.id}>
                                                {isEditing ? (
                                                    <tr className="product-row-editing">
                                                        <td>{produto.nome_produto}</td>
                                                        <td>{produto.variacao_formatada}</td>
                                                        <td><input type="number" name="preco" value={editingProduct.preco} onChange={handleChange} className="form-input-table" step="0.01"/></td>
                                                        <td><input type="number" name="quantidade_disponivel" value={editingProduct.quantidade_disponivel} onChange={handleChange} className="form-input-table"/></td>
                                                        <td><input type="file" name="imagem" onChange={handleChange} accept="image/png, image/jpeg, image/webp" /></td>
                                                        <td className="action-links-editing">
                                                            <Botao onClick={handleSaveClick} variante="sucesso">Salvar</Botao>
                                                            <Botao onClick={() => handleDeleteClick(editingProduct.id)} variante="perigo">Excluir</Botao>
                                                            <Botao onClick={handleCancelEdit} variante="terciario">Cancelar</Botao>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    <tr className="product-row">
                                                        <td>{produto.nome_produto}</td>
                                                        <td>{produto.variacao_formatada}</td>
                                                        <td>R$ {produto.preco}</td>
                                                        <td>{produto.quantidade_disponivel}</td>
                                                        <td><button onClick={() => toggleImageExpansion(produto.id)} className="expand-btn"><ArrowIcon expanded={isExpanded} /></button></td>
                                                        <td className="action-links">
                                                            <Botao onClick={() => handleEditClick(produto)} variante="secundario">Editar</Botao>
                                                        </td>
                                                    </tr>
                                                )}

                                                {isExpanded && !isEditing && (
                                                    <tr className="image-expansion-row">
                                                        <td colSpan="6"><img src={produto.url_imagem} alt={produto.nome_produto} className="expanded-product-image" /></td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default MeusProdutos;
