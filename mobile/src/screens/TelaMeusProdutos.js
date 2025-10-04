import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Image, Alert, FlatList } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { AuthContext } from '../context/AuthContext';
import { globalStyles, cores, fontes } from '../styles/globalStyles';
import apiClient from '../../apiClient';

const TelaMeusProdutos = ({ navigation }) => {
    const { token } = useContext(AuthContext);
    const [produtos, setProdutos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categorias, setCategorias] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [viewMode, setViewMode] = useState('card');
    const [editingProduct, setEditingProduct] = useState(null);
    const [editingImage, setEditingImage] = useState(null);
    const [expandedRowId, setExpandedRowId] = useState(null);

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: '', type: '' }), 3000);
    };

    const fetchProdutos = useCallback(async () => {
        setLoading(true);
        try {
            const url = selectedCategory 
                ? `/api/produtos/meus-produtos/?id_categoria=${selectedCategory}` 
                : `/api/produtos/meus-produtos/`;
                
            const response = await apiClient.get(url);
            
            setProdutos(response.data.results || response.data || []);
            console.log("Produtos fetched after update:", response.data.results || response.data || []);

        } catch (err) {
            console.error("Falha ao buscar produtos:", err);
            showNotification('Falha ao carregar os seus produtos.', 'error');
            setProdutos([]);
        } finally {
            setLoading(false);
        }
    }, [token, selectedCategory]);

    useEffect(() => {
        if (!token) {
            setLoading(false);
            return;
        }

        const carregarDadosDaPagina = async () => {
            setLoading(true);
            try {
                const urlProdutos = selectedCategory 
                    ? `/api/produtos/meus-produtos/?id_categoria=${selectedCategory}` 
                    : `/api/produtos/meus-produtos/`;

                const urlCategorias = `/api/categorias/`;

                const [respostaProdutos, respostaCategorias] = await Promise.all([
                    apiClient.get(urlProdutos),
                    apiClient.get(urlCategorias)
                ]);

                setProdutos(respostaProdutos.data.results || respostaProdutos.data || []);
                console.log(JSON.stringify(respostaProdutos.data, null, 2));
                setCategorias(respostaCategorias.data.results || respostaCategorias.data || []);

            } catch (err) {
                console.error("Falha ao carregar dados da página:", err);
                showNotification('Falha ao carregar os dados. Tente atualizar a página.', 'error');
                setProdutos([]);
                setCategorias([]);
            } finally {
                setLoading(false);
            }
        };

        carregarDadosDaPagina();

    }, [token, selectedCategory]);

    const handleEditClick = (product) => {
        setEditingProduct({ ...product });
        setEditingImage(null);
    };
    const handleCancelEdit = () => setEditingProduct(null);
    
    const handleChange = (name, value) => setEditingProduct(prev => ({ ...prev, [name]: value }));

    const handleChooseImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setEditingImage(result.assets[0]);
        }
    };

    const handleSaveClick = async () => {
        if (!editingProduct) return;

        const formData = new FormData();
        formData.append('preco', editingProduct.preco);
        formData.append('quantidade_disponivel', editingProduct.quantidade_disponivel);
        
        if (editingImage) {
            let uriParts = editingImage.uri.split('.');
            let fileType = uriParts[uriParts.length - 1];
            formData.append('imagem', {
                uri: editingImage.uri,
                name: `photo.${fileType}`,
                type: `image/${fileType}`,
            });
        }

        console.log("Editing image:", editingImage);
        console.log("FormData:", formData);
        try {
            await apiClient.patch(`/api/ofertas/${editingProduct.id}/`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            showNotification('Oferta atualizada com sucesso!', 'success');
            setEditingProduct(null);
            setEditingImage(null);
            fetchProdutos();
        } catch (err) {
            showNotification('Falha ao atualizar a oferta.', 'error');
            console.error(err.response?.data || err);
        }
    };

    const handleDeleteClick = (idOferta) => {
        Alert.alert(
            'Confirmar Exclusão', 'Tem certeza de que deseja excluir esta oferta?',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    onPress: async () => {
                        try {
                            await apiClient.delete(`/api/ofertas/${idOferta}/`);
                            showNotification('Oferta excluída com sucesso!', 'success');
                            fetchProdutos();
                        } catch (err) {
                            showNotification('Falha ao excluir a oferta.', 'error');
                            console.error(err);
                        }
                    },
                    style: 'destructive'
                },
            ]
        );
    };

    const toggleImageExpansion = (id) => {
        setExpandedRowId(expandedRowId === id ? null : id);
    };

    const Notification = ({ message, type, onHide }) => {
        if (!message) return null;
        return (
            <View style={[styles.notification, type === 'success' ? styles.success : styles.error]}>
                <Text style={styles.notificationText}>{message}</Text>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={globalStyles.loadingContainer}> 
                <ActivityIndicator size="large" color={cores.primaria} />
                <Text style={globalStyles.text}>A carregar...</Text>
            </View>
        );
    }

    const renderItem = ({ item: produto }) => {
11
        // TEMPORARY TEST: Display product name to check FlatList rendering
        if (produto && produto.sku && produto.sku.produto && produto.sku.produto.nome) {
            console.log("Rendering product:", produto.sku.produto.nome); // Log to confirm this part is reached
            // return <Text style={{ color: 'red', fontSize: 20, padding: 10 }}>{produto.sku.produto.nome}</Text>; // Uncomment to only show name
        }
        // END TEMPORARY TEST

        
        const isEditing = editingProduct && editingProduct.id === produto.id;
        const imageUrl = editingImage?.uri || produto.url_imagem;
        const imageSource = imageUrl ? { uri: imageUrl } : require('../../assets/ia.png');
        
        if (isEditing) {
            return (
                <View style={[styles.card, styles.editingCard]}>
                    <TouchableOpacity onPress={handleChooseImage}>
                        <Image source={{ uri: imageUrl }} style={styles.productImage} />
                        <Text style={styles.changeImageText}>Trocar Imagem</Text>
                    </TouchableOpacity>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Preço:</Text>
                        <TextInput style={globalStyles.input} value={String(editingProduct.preco)} onChangeText={(text) => handleChange('preco', text)} keyboardType="numeric" />
                    </View>
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Estoque:</Text>
                        <TextInput style={globalStyles.input} value={String(editingProduct.quantidade_disponivel)} onChangeText={(text) => handleChange('quantidade_disponivel', text)} keyboardType="numeric" />
                    </View>
                    <TouchableOpacity style={[globalStyles.button, globalStyles.buttonPrimary]} onPress={handleSaveClick}>
                        <Text style={globalStyles.buttonText}>Salvar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[globalStyles.button, globalStyles.buttonSecondary, { marginTop: 10 }]} onPress={handleCancelEdit}>
                        <Text style={globalStyles.buttonText}>Cancelar</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (viewMode === 'card') {
            return (
                <View style={styles.card}>
                    <Image source={imageSource} style={styles.productImage} />
                    <Text style={styles.cardTitle}>{produto.nome_produto}</Text>
                    {produto.variacao_formatada && <Text style={styles.cardText}>{produto.variacao_formatada}</Text>}
                    <Text style={styles.cardText}><Text style={{fontWeight: 'bold'}}>Preço:</Text> R$ {produto.preco}</Text>
                    <Text style={styles.cardText}><Text style={{fontWeight: 'bold'}}>Estoque:</Text> {produto.quantidade_disponivel}</Text>
                    <TouchableOpacity style={[globalStyles.button, globalStyles.buttonSecondary]} onPress={() => handleEditClick(produto)}>
                        <Text style={globalStyles.buttonText}>Editar</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (viewMode === 'list') {
            const isExpanded = expandedRowId === produto.id;
            return (
                <View style={styles.listItemContainer}>
                    <View style={styles.listItem}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.listItemTitle}>{produto.nome_produto}</Text>
                            {produto.variacao_formatada && <Text style={styles.cardText}>{produto.variacao_formatada}</Text>}
                            <Text style={styles.cardText}>Preço: R$ {produto.preco} | Estoque: {produto.quantidade_disponivel}</Text>
                        </View>
                        <TouchableOpacity onPress={() => toggleImageExpansion(produto.id)} style={{ padding: 5 }}>
                             <Text style={{color: cores.primaria, fontSize: 24}}>{isExpanded ? '▲' : '▼'}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleEditClick(produto)} style={{ padding: 5, marginLeft: 10 }}>
                             <Text style={{color: cores.hover, fontSize: 18}}>✏️</Text>
                        </TouchableOpacity>
                    </View>
                    {isExpanded && (
                         <Image source={imageSource} style={[styles.productImage, { resizeMode: "contain", marginVertical: 10 }]} />
                    )}
                </View>
            );
        }
    };

    
    return (
        <View style={{flex: 1}}>
            <Notification message={notification.message} type={notification.type} onHide={() => setNotification({ message: '', type: '' })} />
            {console.log("Produtos array length before FlatList:", produtos.length)}
            {console.log("Produtos array content before FlatList:", produtos)}
            <FlatList
                ListHeaderComponent={
                    <>
                        <View style={styles.headerContainer}>
                            <Text style={globalStyles.title}>Meus Produtos</Text>
                            <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('AdicionarOferta')}>
                                <Text style={styles.addButtonText}>+</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.viewControls}>
                             <TouchableOpacity onPress={() => setViewMode('card')} style={[globalStyles.button, viewMode === 'card' ? globalStyles.buttonPrimary : globalStyles.buttonSecondary]}>
                                <Text style={globalStyles.buttonText}>Cards</Text>
                             </TouchableOpacity>
                             <TouchableOpacity onPress={() => setViewMode('list')} style={[globalStyles.button, viewMode === 'list' ? globalStyles.buttonPrimary : globalStyles.buttonSecondary]}>
                                <Text style={globalStyles.buttonText}>Lista</Text>
                             </TouchableOpacity>
                        </View>
                    </>
                }
                data={produtos}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={{ padding: 10 }}
                key={viewMode}
            />
        </View>
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
    viewControls: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 10,
        marginVertical: 10,
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
    editingCard: {
        borderColor: cores.primaria,
        borderWidth: 1,
    },
    changeImageText: {
        color: cores.primaria,
        textAlign: 'center',
        marginVertical: 10,
        textDecorationLine: 'underline',
    },
    productImage: {
        width: '100%',
        height: 150,
        marginBottom: 10,
        borderRadius: 8,
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
    listItemContainer: {
        backgroundColor: cores.branco,
        borderRadius: 8,
        padding: 15,
        marginBottom: 10,
        elevation: 2,
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    listItemTitle: {
        fontSize: 16,
        fontFamily: fontes.semiBold,
        color: cores.texto,
    },
    notification: {
        padding: 10,
        borderRadius: 5,
        margin: 10,
    },
    success: {
        backgroundColor: 'green',
    },
    error: {
        backgroundColor: 'red',
    },
    notificationText: {
        color: 'white',
    }
});

export default TelaMeusProdutos;
