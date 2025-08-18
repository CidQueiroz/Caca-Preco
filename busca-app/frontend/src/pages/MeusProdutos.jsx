import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const ArrowIcon = ({ expanded }) => (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
        <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
);

const MeusProdutos = () => {
    const navigate = useNavigate();
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
            showNotification('Oferta atualizada com sucesso!', 'success');
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
                showNotification('Oferta excluída com sucesso!', 'success');
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
                <button onClick={() => navigate('/adicionar-oferta')} className="btn btn-primary">Adicionar Nova Oferta</button>
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
                    <button onClick={() => setViewMode('card')} className={`btn ${viewMode === 'card' ? 'btn-terciaria' : 'btn-secondary'}`}>Cards</button>
                    <button onClick={() => setViewMode('list')} className={`btn ${viewMode === 'list' ? 'btn-terciaria' : 'btn-secondary'}`}>Lista</button>
                </div>
            </div>

            {produtos.length === 0 ? (
                <p style={{ textAlign: 'center', marginTop: '20px' }}>Nenhum produto encontrado.</p>
            ) : (
                <>
                    {viewMode === 'card' ? (
                        <div className="card-grid">
                            {produtos.map(produto => {
                                const imageUrl = produto.url_imagem; // Agora o backend sempre retorna uma URL válida

                                return (
                                    <div key={produto.id} className="card"> {/* Use o ID da oferta como chave */}
                                        {editingProduct && editingProduct.id === produto.id ? (
                                            <> {/* Edit mode */}
                                                
                                                <img 
                                                    src={editingProduct.url_imagem} 
                                                    alt={editingProduct.nome_produto} 
                                                    className="imagem-produto" 
                                                />
                                                
                                                <div className="form-group">
                                                    <label>Preço:</label>
                                                    <input type="number" name="preco" value={editingProduct.preco || ''} onChange={handleChange} step="0.01" />
                                                </div>
                                                
                                                <div className="form-group">
                                                    <label>Estoque:</label>
                                                    <input type="number" name="quantidade_disponivel" value={editingProduct.quantidade_disponivel || ''} onChange={handleChange} />
                                                </div>

                                                <div className="form-group">
                                                    <label>Alterar Imagem:</label>
                                                    <input type="file" name="imagem" onChange={handleChange} accept="image/png, image/jpeg, image/webp" />
                                                </div>
                                                
                                                <div className="form-actions">
                                                    <button onClick={handleSaveClick} className="btn btn-primary">Salvar</button>
                                                    <button onClick={handleCancelEdit} className="btn btn-secondary">Cancelar</button>
                                                    <button onClick={() => handleDeleteClick(editingProduct.id)} className="btn btn-danger">Excluir</button>
                                                </div>
                                            </>
                                        ) : (
                                            <> {/* Display mode */}
                                                
                                                <img src={imageUrl} alt={produto.nome_produto} className="product-image" />
                                                
                                                <h2 className="card-title">{produto.nome_produto}</h2>
                                                <p className="card-text"><strong>Categoria:</strong> {produto.nome_categoria || 'N/A'}</p>
                                                <p className="card-text">{produto.descricao}</p>
                                                <p className="card-text"><strong>Variação:</strong> {produto.variacao_formatada}</p>
                                                <p className="card-text"><strong>Preço:</strong> R$ {produto.preco}</p>
                                                <p className="card-text"><strong>Estoque:</strong> {produto.quantidade_disponivel}</p>
                                                <button onClick={() => handleEditClick(produto)} className="btn btn-secondary">Editar</button>
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
                                        const imageUrl = produto.url_imagem; // Agora o backend sempre retorna uma URL válida
                                        const isExpanded = expandedRowId === produto.id;

                                        return (
                                            <React.Fragment key={produto.id}>
                                                {isEditing ? (
                                                    // --- LINHA DE EDIÇÃO ---
                                                    <tr className="product-row-editing">
                                                        <td>{produto.nome_produto}</td>
                                                        <td>{produto.variacao_formatada}</td>
                                                        
                                                        <td>
                                                            <input
                                                                type="number"
                                                                name="preco"
                                                                value={editingProduct.preco}
                                                                onChange={handleChange}
                                                                className="form-input-table"
                                                                step="0.01"
                                                            />
                                                        </td>
                                                        
                                                        <td>
                                                            <input
                                                                type="number"
                                                                name="quantidade_disponivel"
                                                                value={editingProduct.quantidade_disponivel}
                                                                onChange={handleChange}
                                                                className="form-input-table"
                                                            />
                                                        </td>
                                                        
                                                        <td>
                                                            <input type="file" name="imagem" onChange={handleChange} accept="image/png, image/jpeg, image/webp" />
                                                        </td>
                                                        
                                                        <td className="action-links-editing">
                                                            <button onClick={handleSaveClick} className="btn-save">Salvar</button>
                                                            <button onClick={() => handleDeleteClick(editingProduct.id)} className="btn-delete">Excluir</button>
                                                            <button onClick={handleCancelEdit} className="btn-cancel">Cancelar</button>
                                                        </td>
                                                    
                                                    </tr>
                                                ) : (
                                                    // --- LINHA DE VISUALIZAÇÃO ---
                                                    <tr className="product-row">
                                                        <td>{produto.nome_produto}</td>
                                                        <td>{produto.variacao_formatada}</td>
                                                        <td>R$ {produto.preco}</td>
                                                        <td>{produto.quantidade_disponivel}</td>
                                                        <td>
                                                            <button onClick={() => toggleImageExpansion(produto.id)} className="expand-btn"><ArrowIcon expanded={isExpanded} /></button>
                                                        </td>
                                                        <td className="action-links">
                                                            <button onClick={() => handleEditClick(produto)} className="btn btn-secondary">Editar</button>
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