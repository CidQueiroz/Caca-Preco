import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, ImageBackground, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { globalStyles, cores, fontes } from '../styles/globalStyles';
import Constants from 'expo-constants';
import Notification from '../components/Notification';

const TelaMeusProdutos = ({ navigation }) => {
    const [produtos, setProdutos] = useState([]);
    const [loading, setLoading] = useState(true);
    const { token } = useContext(AuthContext);
    const [categorias, setCategorias] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [editingProduct, setEditingProduct] = useState(null);
    const [notification, setNotification] = useState({ message: '', type: '' });

    const showNotification = (message, type) => {
        setNotification({ message, type });
    };

    const fetchProdutos = useCallback(async () => {
        try {
            const apiUrl = Constants.expoConfig.extra.apiUrl;
            const url = selectedCategory 
                ? `${apiUrl}/produtos/meus-produtos?idCategoria=${selectedCategory}` 
                : `${apiUrl}/produtos/meus-produtos`;
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProdutos(response.data);
        } catch (err) {
            showNotification('Falha ao buscar produtos.', 'error');
            console.error(err);
        }
        setLoading(false);
    }, [token, selectedCategory]);

    useEffect(() => {
        const fetchCategorias = async () => {
            try {
                const apiUrl = Constants.expoConfig.extra.apiUrl;
                const response = await axios.get(`${apiUrl}/categories`);
                setCategorias(response.data);
            } catch (err) {
                console.error('Erro ao buscar categorias:', err);
                showNotification('Erro ao buscar categorias.', 'error');
            }
        };

        if (token) {
            fetchProdutos();
            fetchCategorias();
        }
    }, [token, selectedCategory, fetchProdutos]);

    const handleEditClick = (product) => {
        setEditingProduct({ ...product });
    };

    const handleCancelEdit = () => {
        setEditingProduct(null);
    };

    const handleChange = (name, value) => {
        setEditingProduct(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveClick = async () => {
        if (!editingProduct) return;

        try {
            const apiUrl = Constants.expoConfig.extra.apiUrl;
            await axios.put(`${apiUrl}/produtos/${editingProduct.ID_Produto}`, {
                idVariacao: editingProduct.ID_Variacao,
                NomeProduto: editingProduct.NomeProduto,
                Descricao: editingProduct.Descricao,
                NomeVariacao: editingProduct.NomeVariacao,
                ValorVariacao: editingProduct.ValorVariacao,
                Preco: editingProduct.Preco,
                QuantidadeDisponivel: editingProduct.QuantidadeDisponivel,
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showNotification('Produto atualizado com sucesso!', 'success');
            setEditingProduct(null);
            fetchProdutos(); // Refresh the product list
        } catch (err) {
            showNotification('Falha ao atualizar produto.', 'error');
            console.error(err);
        }
    };

    const handleDeleteClick = async (idVariacao) => {
        Alert.alert(
            'Confirmar Exclusão',
            'Tem certeza que deseja excluir esta oferta de produto?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    onPress: async () => {
                        try {
                            const apiUrl = Constants.expoConfig.extra.apiUrl;
                            await axios.delete(`${apiUrl}/produtos/${idVariacao}`, {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                            showNotification('Oferta de produto excluída com sucesso!', 'success');
                            fetchProdutos(); // Atualiza a lista de produtos
                        } catch (err) {
                            showNotification('Falha ao excluir a oferta de produto.', 'error');
                            console.error(err);
                        }
                    },
                },
            ],
            { cancelable: true }
        );
    };

    if (loading) {
        return (
            <View style={globalStyles.container}> 
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={globalStyles.text}>Carregando...</Text>
            </View>
        );
    }

    return (
        <ImageBackground 
            source={require('../../assets/ia.png')} 
            style={globalStyles.backgroundImage}
            imageStyle={{ opacity: 0.2 }}
        >
            <ScrollView style={globalStyles.container}>
            <Notification
                message={notification.message}
                type={notification.type}
                onHide={() => setNotification({ message: '', type: '' })}
            />
            <View style={styles.headerContainer}>
                <Text style={globalStyles.title}>Meus Produtos</Text>
                <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('CadastroProduto')}>
                    <Text style={styles.addButtonText}>+</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.filterContainer}>
                <Text style={styles.label}>Filtrar por Categoria:</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={selectedCategory}
                        onValueChange={(itemValue) => setSelectedCategory(itemValue)}
                        style={styles.picker}
                    >
                        <Picker.Item label="Todas as Categorias" value="" />
                        {categorias.map(cat => (
                            <Picker.Item key={cat.ID_CategoriaLoja} label={cat.NomeCategoria} value={cat.ID_CategoriaLoja} />
                        ))}
                    </Picker>
                </View>
            </View>

            {produtos.length === 0 ? (
                <Text style={styles.noProductsText}>Você ainda não cadastrou nenhum produto ou não há produtos nesta categoria.</Text>
            ) : (
                <View style={styles.cardGrid}>
                    {produtos.map(produto => (
                        <View key={produto.ID_Variacao} style={styles.card}>
                            {editingProduct && editingProduct.ID_Variacao === produto.ID_Variacao ? (
                                <>
                                    <View style={styles.formGroup}>
                                        <Text style={styles.label}>Nome do Produto:</Text>
                                        <TextInput style={globalStyles.input} name="NomeProduto" value={editingProduct.NomeProduto || ''} onChangeText={(text) => handleChange('NomeProduto', text)} />
                                    </View>
                                    <View style={styles.formGroup}>
                                        <Text style={styles.label}>Descrição:</Text>
                                        <TextInput style={[globalStyles.input, styles.textArea]} name="Descricao" value={editingProduct.Descricao || ''} onChangeText={(text) => handleChange('Descricao', text)} multiline />
                                    </View>
                                    <View style={styles.formGroup}>
                                        <Text style={styles.label}>Nome da Variação:</Text>
                                        <TextInput style={globalStyles.input} name="NomeVariacao" value={editingProduct.NomeVariacao || ''} onChangeText={(text) => handleChange('NomeVariacao', text)} />
                                    </View>
                                    <View style={styles.formGroup}>
                                        <Text style={styles.label}>Valor da Variação:</Text>
                                        <TextInput style={globalStyles.input} name="ValorVariacao" value={editingProduct.ValorVariacao || ''} onChangeText={(text) => handleChange('ValorVariacao', text)} />
                                    </View>
                                    <View style={styles.formGroup}>
                                        <Text style={styles.label}>Preço:</Text>
                                        <TextInput style={globalStyles.input} name="Preco" value={editingProduct.Preco ? String(editingProduct.Preco) : ''} onChangeText={(text) => handleChange('Preco', text)} keyboardType="numeric" />
                                    </View>
                                    <View style={styles.formGroup}>
                                        <Text style={styles.label}>Estoque:</Text>
                                        <TextInput style={globalStyles.input} name="QuantidadeDisponivel" value={editingProduct.QuantidadeDisponivel ? String(editingProduct.QuantidadeDisponivel) : ''} onChangeText={(text) => handleChange('QuantidadeDisponivel', text)} keyboardType="numeric" />
                                    </View>
                                    <View style={styles.formActions}>
                                        <TouchableOpacity style={[globalStyles.button, globalStyles.buttonPrimary]} onPress={handleSaveClick}>
                                            <Text style={globalStyles.buttonText}>Salvar</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[globalStyles.button, globalStyles.buttonSecondary, { marginTop: 10 }]} onPress={handleCancelEdit}>
                                            <Text style={globalStyles.buttonText}>Cancelar</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={[globalStyles.button, globalStyles.buttonDanger, { marginTop: 10 }]} onPress={() => handleDeleteClick(editingProduct.ID_Variacao)}>
                                            <Text style={globalStyles.buttonText}>Excluir</Text>
                                        </TouchableOpacity>
                                    </View>
                                </>
                            ) : (
                                <>
                                    {produto.URL_Imagem && (
                                        <Image source={{ uri: `${apiUrl}/${produto.URL_Imagem}` }} style={styles.productImage} />
                                    )}
                                    <Text style={styles.cardTitle}>{produto.NomeProduto}</Text>
                                    <Text style={styles.cardText}>{produto.Descricao}</Text>
                                    <Text style={styles.cardText}><Text style={{ fontWeight: 'bold' }}>Variação:</Text> {produto.NomeVariacao} - {produto.ValorVariacao}</Text>
                                    <Text style={styles.cardText}><Text style={{ fontWeight: 'bold' }}>Preço:</Text> R$ {produto.Preco}</Text>
                                    <Text style={styles.cardText}><Text style={{ fontWeight: 'bold' }}>Estoque:</Text> {produto.QuantidadeDisponivel}</Text>
                                    <TouchableOpacity style={[globalStyles.button, globalStyles.buttonSecondary]} onPress={() => handleEditClick(produto)}>
                                        <Text style={globalStyles.buttonText}>Editar</Text>
                                    </TouchableOpacity>
                                </>
                            )}
                        </View>
                    ))}
                </View>
            )}
        </ScrollView>
    </ImageBackground>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        paddingHorizontal: 10,
    },
    addButton: {
        backgroundColor: cores.primaria,
        borderRadius: 50,
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontSize: 24,
        lineHeight: 28,
    },
    filterContainer: {
        marginBottom: 20,
        alignItems: 'center',
    },
    pickerContainer: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: cores.terciaria,
        overflow: 'hidden',
        backgroundColor: '#fff',
        width: '90%',
        marginTop: 10,
    },
    picker: {
        width: '100%',
        height: 50,
        color: cores.texto,
    },
    noProductsText: {
        textAlign: 'center',
        fontSize: 16,
        color: cores.texto,
        marginTop: 20,
    },
    cardGrid: {
        flexDirection: 'column',
        alignItems: 'center',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 20,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        width: '95%',
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    cardText: {
        fontSize: 14,
        color: '#555',
        textAlign: 'center',
        marginBottom: 5,
    },
    formGroup: {
        width: '100%',
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        color: cores.texto,
        marginBottom: 5,
        fontFamily: fontes.secundaria,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    formActions: {
        flexDirection: 'column',
        marginTop: 10,
        width: '100%',
        alignItems: 'center',
    },
    successMessage: {
        color: 'green',
        textAlign: 'center',
        marginBottom: 10,
        fontSize: 16,
    },
    errorText: {
        color: 'red',
        textAlign: 'center',
        marginBottom: 10,
        fontSize: 16,
    },
    productImage: {
        width: '100%',
        height: 150,
        resizeMode: 'contain',
        marginBottom: 10,
        borderRadius: 8,
    },
});

export default TelaMeusProdutos;