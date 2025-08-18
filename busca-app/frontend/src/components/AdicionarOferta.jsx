import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const AdicionarOferta = () => {
    const navigate = useNavigate();
    const { token } = useContext(AuthContext);

    // Estados para o fluxo
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '' });
    
    // Estados para as ofertas dos SKUs existentes
    const [offers, setOffers] = useState({});

    // Estados para o formulário de NOVA variação
    const [showNewVariationForm, setShowNewVariationForm] = useState(false);
    const [newVariations, setNewVariations] = useState([{ nome: '', valor: '' }]);
    const [newVariationImage, setNewVariationImage] = useState(null);

    // Efeito para carregar todos os produtos do catálogo uma única vez
    useEffect(() => {
        if (token) {
            setLoading(true);
            const url = `${process.env.REACT_APP_API_URL}/api/produtos/`;
            axios.get(url, { headers: { Authorization: `Bearer ${token}` } })
                .then(response => {
                    if (Array.isArray(response.data)) {
                        setAllProducts(response.data);
                    } else {
                        setAllProducts([]);
                    }
                })
                .catch(err => console.error("Erro ao carregar produtos:", err))
                .finally(() => setLoading(false));
        }
    }, [token]);

    // Efeito para filtrar produtos localmente conforme o usuário digita
    useEffect(() => {
        if (searchTerm.length < 2) {
            setSearchResults([]);
            return;
        }
        const lowercasedFilter = searchTerm.toLowerCase();
        const filtered = allProducts.filter(p =>
            p.nome.toLowerCase().includes(lowercasedFilter)
        );
        setSearchResults(filtered);
    }, [searchTerm, allProducts]);

    // Recarrega os dados do produto selecionado (usado após criar uma nova variação)
    const reloadSelectedProduct = async (productId) => {
        try {
            const url = `${process.env.REACT_APP_API_URL}/api/produtos/${productId}/`;
            const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
            setSelectedProduct(response.data);
            
            const initialOffers = response.data.skus.reduce((acc, sku) => {
                acc[sku.id] = { preco: '', quantidade: '' };
                return acc;
            }, {});
            setOffers(initialOffers);
        } catch (error) {
            console.error("Erro ao recarregar o produto", error);
            showNotification("Não foi possível atualizar a lista de variações.", "error");
        }
    };

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: '' }), 5000);
    };

    // Seleciona um produto da busca e carrega seus detalhes
    const handleSelectProduct = async (productSummary) => {
        setLoading(true);
        setSearchResults([]);
        setSearchTerm('');
        await reloadSelectedProduct(productSummary.id);
        setLoading(false);
    };
    
    const handleResetSelection = () => {
        setSelectedProduct(null);
        setOffers({});
    };

    // Altera o preço/estoque de uma oferta existente
    const handleOfferChange = (variationId, field, value) => {
        setOffers(prev => ({
            ...prev,
            [variationId]: { ...prev[variationId], [field]: value }
        }));
    };

    // Funções para o formulário de nova variação
    const handleVariationChange = (index, field, value) => {
        const updatedVariations = [...newVariations];
        updatedVariations[index][field] = value;
        setNewVariations(updatedVariations);
    };

    const addVariationRow = () => {
        setNewVariations([...newVariations, { nome: '', valor: '' }]);
    };

    const removeVariationRow = (index) => {
        const updatedVariations = newVariations.filter((_, i) => i !== index);
        setNewVariations(updatedVariations);
    };

    // LÓGICA PARA ADICIONAR UMA NOVA VARIAÇÃO (SKU) E IMAGEM (OPCIONAL)
    const handleAddNewVariation = async (e) => {
        e.preventDefault();
        const variationsToSave = newVariations.filter(v => v.nome.trim() !== '' && v.valor.trim() !== '');
        if (variationsToSave.length === 0) {
            showNotification('Preencha pelo menos um atributo para a variação.', 'error');
            return;
        }

        const formData = new FormData();
        formData.append('produto', selectedProduct.id);
        formData.append('variacoes', JSON.stringify(variationsToSave));
        if (newVariationImage) {
            formData.append('imagem', newVariationImage);
        }

        try {
            const url = `${process.env.REACT_APP_API_URL}/api/variacoes/`;
            await axios.post(url, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            
            showNotification('Nova variação adicionada com sucesso!', 'success');
            
            setShowNewVariationForm(false);
            setNewVariations([{ nome: '', valor: '' }]);
            setNewVariationImage(null);
            reloadSelectedProduct(selectedProduct.id);

        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Erro ao adicionar variação.';
            showNotification(errorMessage, 'error');
            console.error(err);
        }
    };

    // LÓGICA PARA SALVAR AS OFERTAS (PREÇO/ESTOQUE)
    const handleSaveAllOffers = async () => {
        const offersToSave = Object.entries(offers)
            .filter(([id, data]) => data.preco && data.quantidade)
            .map(([id, data]) => ({
                sku_id: id,
                preco: data.preco,
                quantidade_disponivel: data.quantidade,
            }));

        if (offersToSave.length === 0) {
            showNotification('Preencha o preço e o estoque de pelo menos uma variação.', 'error');
            return;
        }

        try {
            const url = `${process.env.REACT_APP_API_URL}/api/ofertas/`;
            const savePromises = offersToSave.map(offer => 
                axios.post(url, offer, { headers: { Authorization: `Bearer ${token}` } })
            );
            
            await Promise.all(savePromises);
            showNotification(`${offersToSave.length} oferta(s) cadastrada(s) com sucesso!`, 'success');
            handleResetSelection();

        } catch (err) {
            showNotification('Ocorreu um erro ao salvar as ofertas.', 'error');
            console.error(err);
        }
    };

    return (
        <div>
            {notification.message && <div className={`notification ${notification.type}`}>{notification.message}</div>}
            
            <h1 className="apresentacao__conteudo__titulo">Adicionar Nova Oferta</h1>

            {!selectedProduct ? (
                <div className="form-container" style={{maxWidth: '900px'}}>
                    <div className="form-group">
                        <label>Primeiro, busque por um produto já existente no catálogo:</label>
                        <input
                            type="text"
                            placeholder="Digite o nome do produto (ex: Leite Ninho)"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    {loading && <p>Buscando...</p>}
                    {searchResults.length > 0 && (
                        <ul className="search-results-list">
                            {searchResults.map(prod => (
                                <li key={prod.id} onClick={() => handleSelectProduct(prod)}>
                                    <strong>{prod.nome}</strong>
                                    <p>{prod.descricao}</p>
                                </li>
                            ))}
                        </ul>
                    )}
                    <div style={{textAlign: 'center', marginTop: '30px'}}>
                        <p>Não encontrou o produto que procurava?</p>
                        <button onClick={() => navigate('/cadastrar-produto')} className="btn btn-secondary">Cadastrar um Produto Completamente Novo</button>
                    </div>
                </div>
            ) : (
            <div className="form-container" style={{maxWidth: '900px'}}>
                <div className="selected-product-info">
                    <h3>{selectedProduct.nome}</h3>
                    <button onClick={handleResetSelection} className="btn-link">Buscar outro produto</button>
                </div>
                <h4>Preencha o preço e estoque para as variações que deseja vender:</h4>
                
                <div className="offers-list-grid">
                    {selectedProduct.skus.map((sku) => {
                        const skuDescription = sku.valores.map(v => `${v.atributo}: ${v.valor}`).join(' / ');
                        return (
                            <div key={sku.id} className="offer-item-card">
                                <div className="offer-variation-name">{skuDescription}</div>
                                <div className="offer-inputs-wrapper">
                                    <div className="form-group">
                                        <label>Preço (R$)</label>
                                        <input 
                                            type="number" 
                                            value={offers[sku.id]?.preco || ''} 
                                            onChange={e => handleOfferChange(sku.id, 'preco', e.target.value)} 
                                            placeholder="ex: 19,99"
                                            step="0.01"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Estoque</label>
                                        <input 
                                            type="number" 
                                            value={offers[sku.id]?.quantidade || ''} 
                                            onChange={e => handleOfferChange(sku.id, 'quantidade', e.target.value)} 
                                            placeholder="ex: 50"
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {showNewVariationForm ? (
                    <form onSubmit={handleAddNewVariation} className="new-variation-form">
                        <h5>Cadastrar Nova Variação</h5>
                        {newVariations.map((variation, index) => (
                            <div key={index} className="variation-row" style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Nome do Atributo (ex: Cor)</label>
                                    <input 
                                        type="text" 
                                        placeholder="Cor"
                                        value={variation.nome} 
                                        onChange={(e) => handleVariationChange(index, 'nome', e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Valor do Atributo (ex: Branca)</label>
                                    <input 
                                        type="text" 
                                        placeholder="Branca"
                                        value={variation.valor} 
                                        onChange={(e) => handleVariationChange(index, 'valor', e.target.value)}
                                        required
                                    />
                                </div>
                                {newVariations.length > 1 && (
                                    <button type="button" onClick={() => removeVariationRow(index)} className="btn btn-danger" style={{ alignSelf: 'flex-end', marginBottom: '1rem' }}>Remover</button>
                                )}
                            </div>
                        ))}
                        <button type="button" onClick={addVariationRow} className="btn btn-info">+ Adicionar outro atributo</button>
                        
                        <div className="form-group" style={{marginTop: '1rem'}}>
                            <label>Imagem da Variação (Opcional)</label>
                            <input 
                                type="file" 
                                onChange={e => setNewVariationImage(e.target.files[0])} 
                                accept="image/png, image/jpeg, image/webp"
                            />
                        </div>

                        <div className="form-actions" style={{ marginTop: '20px' }}>
                            <button type="submit" className="btn btn-success">Salvar Variação</button>
                            <button type="button" onClick={() => setShowNewVariationForm(false)} className="btn btn-secondary">Cancelar</button>
                        </div>
                    </form>
                ) : (
                    <button onClick={() => setShowNewVariationForm(true)} className="btn btn-secondary">+ Adicionar nova variação</button>
                )}

                <hr style={{margin: '2rem 0'}} />
                    
                <div className="form-actions">
                    <button onClick={handleSaveAllOffers} className="btn btn-primary">Salvar Todas as Ofertas Preenchidas</button>
                </div>
            </div>
        )}
        </div>
    );
};

export default AdicionarOferta;