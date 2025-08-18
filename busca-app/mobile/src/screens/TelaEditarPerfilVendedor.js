import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { globalStyles, cores, fontes } from '../styles/globalStyles';
import Constants from 'expo-constants';
import Notification from '../components/Notification';
import MainLayout from '../components/MainLayout';

const TelaEditarPerfilVendedor = ({ navigation }) => {
    const { token, user } = useContext(AuthContext);
    const [perfil, setPerfil] = useState({
        NomeLoja: '',
        CNPJ: '',
        Endereco: '',
        Telefone: '',
        Fundacao: '',
        HorarioFuncionamento: '',
        NomeResponsavel: '',
        CPF_Responsavel: '',
        BreveDescricaoLoja: '',
        LogotipoLoja: '',
        WebsiteRedesSocial: '',
        ID_CategoriaLoja: '',
    });
    const [loading, setLoading] = useState(true);
    const [categorias, setCategorias] = useState([]);
    const [notification, setNotification] = useState({ message: '', type: '' });

    const showNotification = (message, type) => {
        setNotification({ message, type });
    };

    useEffect(() => {
        const fetchPerfilAndCategories = async () => {
            try {
                const apiUrl = Constants.expoConfig.extra.apiUrl;
                // Fetch seller profile
                const perfilResponse = await axios.get(`${apiUrl}/usuarios/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPerfil(perfilResponse.data);

                // Fetch categories
                const categoriasResponse = await axios.get(`${apiUrl}/categories`);
                setCategorias(categoriasResponse.data);

            } catch (err) {
                showNotification('Falha ao carregar dados do perfil ou categorias.', 'error');
                console.error(err);
            }
            setLoading(false);
        };

        if (token && user?.tipoUsuario === 'vendedor') {
            fetchPerfilAndCategories();
        } else if (!user || user?.tipoUsuario !== 'vendedor') {
            showNotification('Você não tem permissão para acessar esta página.', 'error');
            navigation.navigate('TelaInicial'); // Ou navegar para uma tela de não autorizado
        }
    }, [token, user, navigation]);

    const handleChange = (name, value) => {
        setPerfil({ ...perfil, [name]: value });
    };

    const handleSubmit = async () => {
        try {
            const apiUrl = Constants.expoConfig.extra.apiUrl;
            await axios.put(`${apiUrl}/usuarios/profile`, perfil, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showNotification('Perfil atualizado com sucesso!', 'success');
        } catch (err) {
            showNotification('Falha ao atualizar perfil.', 'error');
            console.error(err);
        }
    };

    if (loading) {
        return (
            <View style={globalStyles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={globalStyles.text}>Carregando perfil...</Text>
            </View>
        );
    }

    return (
        <MainLayout>
            <ScrollView style={globalStyles.container}>
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onHide={() => setNotification({ message: '', type: '' })}
                />
                <Text style={globalStyles.title}>Editar Perfil do Vendedor</Text>
                
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Nome da Loja:</Text>
                    <TextInput style={globalStyles.input} name="NomeLoja" value={perfil.NomeLoja || ''} onChangeText={(text) => handleChange('NomeLoja', text)} />
                </View>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>CNPJ:</Text>
                    <TextInput style={globalStyles.input} name="CNPJ" value={perfil.CNPJ || ''} onChangeText={(text) => handleChange('CNPJ', text)} keyboardType="numeric" />
                </View>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Endereço:</Text>
                    <TextInput style={globalStyles.input} name="Endereco" value={perfil.Endereco || ''} onChangeText={(text) => handleChange('Endereco', text)} />
                </View>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Telefone:</Text>
                    <TextInput style={globalStyles.input} name="Telefone" value={perfil.Telefone || ''} onChangeText={(text) => handleChange('Telefone', text)} keyboardType="phone-pad" />
                </View>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Data de Fundação:</Text>
                    <TextInput style={globalStyles.input} name="Fundacao" value={perfil.Fundacao ? perfil.Fundacao.split('T')[0] : ''} onChangeText={(text) => handleChange('Fundacao', text)} placeholder="AAAA-MM-DD" />
                </View>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Horário de Funcionamento:</Text>
                    <TextInput style={globalStyles.input} name="HorarioFuncionamento" value={perfil.HorarioFuncionamento || ''} onChangeText={(text) => handleChange('HorarioFuncionamento', text)} />
                </View>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Nome do Responsável:</Text>
                    <TextInput style={globalStyles.input} name="NomeResponsavel" value={perfil.NomeResponsavel || ''} onChangeText={(text) => handleChange('NomeResponsavel', text)} />
                </View>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>CPF do Responsável:</Text>
                    <TextInput style={globalStyles.input} name="CPF_Responsavel" value={perfil.CPF_Responsavel || ''} onChangeText={(text) => handleChange('CPF_Responsavel', text)} keyboardType="numeric" />
                </View>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Breve Descrição da Loja:</Text>
                    <TextInput style={[globalStyles.input, styles.textArea]} name="BreveDescricaoLoja" value={perfil.BreveDescricaoLoja || ''} onChangeText={(text) => handleChange('BreveDescricaoLoja', text)} multiline />
                </View>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Logotipo da Loja (URL):</Text>
                    <TextInput style={globalStyles.input} name="LogotipoLoja" value={perfil.LogotipoLoja || ''} onChangeText={(text) => handleChange('LogotipoLoja', text)} />
                </View>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Website/Redes Sociais:</Text>
                    <TextInput style={globalStyles.input} name="WebsiteRedesSociais" value={perfil.WebsiteRedesSociais || ''} onChangeText={(text) => handleChange('WebsiteRedesSocial', text)} />
                </View>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Categoria da Loja:</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={perfil.ID_CategoriaLoja || ''}
                            onValueChange={(itemValue) => handleChange('ID_CategoriaLoja', itemValue)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Selecione uma categoria" value="" />
                            {categorias.map(cat => (
                                <Picker.Item key={cat.ID_CategoriaLoja} label={cat.NomeCategoria} value={cat.ID_CategoriaLoja} />
                            ))}
                        </Picker>
                    </View>
                </View>
                <TouchableOpacity style={[globalStyles.button, globalStyles.buttonPrimary]} onPress={handleSubmit}>
                    <Text style={globalStyles.buttonText}>Salvar Alterações</Text>
                </TouchableOpacity>
            </ScrollView>
        </MainLayout>
    );
};

const styles = StyleSheet.create({
    formGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        color: cores.texto,
        marginBottom: 5,
        fontFamily: fontes.secundaria,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    pickerContainer: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: cores.terciaria,
        overflow: 'hidden',
        backgroundColor: '#fff',
    },
    picker: {
        width: '100%',
        height: 50,
        color: cores.texto,
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
});

export default TelaEditarPerfilVendedor;
