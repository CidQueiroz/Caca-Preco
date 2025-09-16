import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Botao from './Botao';
import { useNotification } from '../context/NotificationContext';

const AdicionarOferta = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { token } = useContext(AuthContext);
    const { showNotification } = useNotification();

    // Estados para o fluxo
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [allProducts, setAllProducts] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // Estados para as ofertas dos SKUs existentes
    const [offers, setOffers] = useState({});

    // Estados para o formulário de NOVA variação
    const [showNewVariationForm, setShowNewVariationForm] = useState(false);
    const [newVariations, setNewVariations] = useState([{ nome: '', valor: '' }]);
    const [newVariationImage, setNewVariationImage] = useState(null);

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
            showNotification("Não foi possível carregar o produto selecionado.", "erro");
        }
    };

    // Efeito para carregar o produto vindo do redirecionamento
    useEffect(() => {
        const newProductId = location.state?.newProductId;
        if (newProductId && token) { // Garante que o token exista antes de fazer a chamada
            setLoading(true);
            reloadSelectedProduct(newProductId).finally(() => setLoading(false));
            // Limpa o estado para não recarregar caso o usuário navegue para outra página e volte
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate, token]);

    // Efeito para carregar todos os produtos do catálogo para a busca
    useEffect(() => {
        if (token) {
            const url = `${process.env.REACT_APP_API_URL}/api/produtos/`;
            axios.get(url, { headers: { Authorization: `Bearer ${token}` } })
                .then(response => {
                    if (Array.isArray(response.data)) {
                        setAllProducts(response.data);
                    } else {
                        setAllProducts([]);
                    }
                })
                .catch(err => console.error("Erro ao carregar produtos:", err));
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
            showNotification('Preencha pelo menos um atributo para a variação.', 'erro');
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
            
            showNotification('Nova variação adicionada com sucesso!', 'sucesso');
            
            setShowNewVariationForm(false);
            setNewVariations([{ nome: '', valor: '' }]);
            setNewVariationImage(null);
            reloadSelectedProduct(selectedProduct.id);

        } catch (err) {
            const errorMessage = err.response?.data?.error || 'Erro ao adicionar variação.';
            showNotification(errorMessage, 'erro');
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
            showNotification('Preencha o preço e o estoque de pelo menos uma variação.', 'erro');
            return;
        }

        try {
            const url = `${process.env.REACT_APP_API_URL}/api/ofertas/`;
            const savePromises = offersToSave.map(offer => 
                axios.post(url, offer, { headers: { Authorization: `Bearer ${token}` } })
            );
            
            await Promise.all(savePromises);
            showNotification(`${offersToSave.length} oferta(s) cadastrada(s) com sucesso!`, 'sucesso');
            handleResetSelection();

        } catch (err) {
            showNotification('Ocorreu um erro ao salvar as ofertas.', 'erro');
            console.error(err);
        }
    };

    return (
        <div>
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
                        <Botao onClick={() => navigate('/cadastrar-produto')} variante="secundario">Cadastrar um Produto Completamente Novo</Botao>
                    </div>
                </div>
            ) : (
            <div className="form-container" style={{maxWidth: '900px'}}>
                <div className="selected-product-info">
                    <h3>{selectedProduct.nome}</h3>
                    <Botao onClick={handleResetSelection} variante="terciario">Buscar outro produto</Botao>
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
                                    <Botao type="button" onClick={() => removeVariationRow(index)} variante="perigo" style={{ alignSelf: 'flex-end', marginBottom: '1rem' }}>Remover</Botao>
                                )}
                            </div>
                        ))}
                        <Botao type="button" onClick={addVariationRow} variante="secundario">+ Adicionar outro atributo</Botao>
                        
                        <div className="form-group" style={{marginTop: '1rem'}}>
                            <label>Imagem da Variação (Opcional)</label>
                            <input 
                                type="file" 
                                onChange={e => setNewVariationImage(e.target.files[0])} 
                                accept="image/png, image/jpeg, image/webp"
                            />
                        </div>

                        <div className="form-actions" style={{ marginTop: '20px' }}>
                            <Botao type="submit" variante="sucesso">Salvar Variação</Botao>
                            <Botao type="button" onClick={() => setShowNewVariationForm(false)} variante="secundario">Cancelar</Botao>
                        </div>
                    </form>
                ) : (
                    <Botao onClick={() => setShowNewVariationForm(true)} variante="secundario">+ Adicionar nova variação</Botao>
                )}

                <hr style={{margin: '2rem 0'}} />
                    
                <div className="form-actions">
                    <Botao onClick={handleSaveAllOffers} variante="primario">Salvar Todas as Ofertas Preenchidas</Botao>
                </div>
            </div>
        )}
        </div>
    );
};

export default AdicionarOferta;
