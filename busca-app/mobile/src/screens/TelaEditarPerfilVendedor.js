import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { globalStyles, cores, fontes } from '../styles/globalStyles';
import Constants from 'expo-constants';
import Notification from '../components/Notification';
import MainLayout from '../components/MainLayout';
import { CommonActions } from '@react-navigation/native';

const TelaEditarPerfilVendedor = ({ navigation }) => {
    const { token, usuario } = useContext(AuthContext);
    const [perfil, setPerfil] = useState({
        nome_loja: '',
        cnpj: '',
        endereco: {
            logradouro: '',
            numero: '',
            complemento: '',
            bairro: '',
            cidade: '',
            estado: '',
            cep: '',
            pais: 'Brasil',
            latitude: null,
            longitude: null,
        },
        telefone: '',
        data_fundacao: '',
        horario_funcionamento: '',
        nome_responsavel: '',
        cpf_responsavel: '',
        breve_descricao_loja: '',
        logotipo_loja: '',
        site_redes_sociais: '',
        categoria_loja: '',
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
                const perfilResponse = await axios.get(`${apiUrl}/api/perfil/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPerfil({
                    ...perfilResponse.data,
                    endereco: perfilResponse.data.endereco || perfil.endereco,
                    categoria_loja: perfilResponse.data.categoria_loja?.id || ''
                });

                // Fetch categories
                const categoriasResponse = await axios.get(`${apiUrl}/api/categorias/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCategorias(categoriasResponse.data);

            } catch (err) {
                showNotification('Falha ao carregar dados do perfil ou categorias.', 'error');
                console.error(err);
            }
            setLoading(false);
        };

        if (token && usuario?.tipo_usuario === 'Vendedor') {
            fetchPerfilAndCategories();
        } else if (!usuario || usuario?.tipo_usuario !== 'Vendedor') {
            showNotification('Você não tem permissão para aceder a esta página.', 'error');
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: 'TelaInicial' }],
                })
            );
        } // <--- A CHAVETA DE FECHO FOI ADICIONADA AQUI

    }, [token, usuario]);

    const handleChange = (name, value) => {
        if (name.startsWith('endereco.')) {
            const enderecoField = name.split('.')[1];
            setPerfil(prevPerfil => ({
                ...prevPerfil,
                endereco: {
                    ...prevPerfil.endereco,
                    [enderecoField]: value
                }
            }));
        } else {
            setPerfil({ ...perfil, [name]: value });
        }
    };

    const handleSubmit = async () => {
        try {
            const apiUrl = Constants.expoConfig.extra.apiUrl;
            const dataToSend = {
                ...perfil,
                categoria_loja: perfil.categoria_loja || null, // Ensure it's null if empty string
            };
            await axios.put(`${apiUrl}/api/perfil/`, dataToSend, {
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
                    <TextInput style={globalStyles.input} name="nome_loja" value={perfil.nome_loja || ''} onChangeText={(text) => handleChange('nome_loja', text)} />
                </View>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>CNPJ:</Text>
                    <TextInput style={globalStyles.input} name="cnpj" value={perfil.cnpj || ''} onChangeText={(text) => handleChange('cnpj', text)} keyboardType="numeric" />
                </View>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Logradouro:</Text>
                    <TextInput style={globalStyles.input} name="endereco.logradouro" value={perfil.endereco.logradouro || ''} onChangeText={(text) => handleChange('endereco.logradouro', text)} />
                </View>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Número:</Text>
                    <TextInput style={globalStyles.input} name="endereco.numero" value={perfil.endereco.numero || ''} onChangeText={(text) => handleChange('endereco.numero', text)} keyboardType="numeric" />
                </View>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Complemento:</Text>
                    <TextInput style={globalStyles.input} name="endereco.complemento" value={perfil.endereco.complemento || ''} onChangeText={(text) => handleChange('endereco.complemento', text)} />
                </View>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Bairro:</Text>
                    <TextInput style={globalStyles.input} name="endereco.bairro" value={perfil.endereco.bairro || ''} onChangeText={(text) => handleChange('endereco.bairro', text)} />
                </View>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Cidade:</Text>
                    <TextInput style={globalStyles.input} name="endereco.cidade" value={perfil.endereco.cidade || ''} onChangeText={(text) => handleChange('endereco.cidade', text)} />
                </View>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Estado (UF):</Text>
                    <TextInput style={globalStyles.input} name="endereco.estado" value={perfil.endereco.estado || ''} onChangeText={(text) => handleChange('endereco.estado', text)} maxLength={2} autoCapitalize="characters" />
                </View>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>CEP:</Text>
                    <TextInput style={globalStyles.input} name="endereco.cep" value={perfil.endereco.cep || ''} onChangeText={(text) => handleChange('endereco.cep', text)} keyboardType="numeric" maxLength={9} />
                </View>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Telefone:</Text>
                    <TextInput style={globalStyles.input} name="telefone" value={perfil.telefone || ''} onChangeText={(text) => handleChange('telefone', text)} keyboardType="phone-pad" />
                </View>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Data de Fundação:</Text>
                    <TextInput style={globalStyles.input} name="data_fundacao" value={perfil.data_fundacao ? perfil.data_fundacao.split('T')[0] : ''} onChangeText={(text) => handleChange('data_fundacao', text)} placeholder="AAAA-MM-DD" />
                </View>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Horário de Funcionamento:</Text>
                    <TextInput style={globalStyles.input} name="horario_funcionamento" value={perfil.horario_funcionamento || ''} onChangeText={(text) => handleChange('horario_funcionamento', text)} />
                </View>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Nome do Responsável:</Text>
                    <TextInput style={globalStyles.input} name="nome_responsavel" value={perfil.nome_responsavel || ''} onChangeText={(text) => handleChange('nome_responsavel', text)} />
                </View>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>CPF do Responsável:</Text>
                    <TextInput style={globalStyles.input} name="cpf_responsavel" value={perfil.cpf_responsavel || ''} onChangeText={(text) => handleChange('cpf_responsavel', text)} keyboardType="numeric" />
                </View>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Breve Descrição da Loja:</Text>
                    <TextInput style={[globalStyles.input, styles.textArea]} name="breve_descricao_loja" value={perfil.breve_descricao_loja || ''} onChangeText={(text) => handleChange('breve_descricao_loja', text)} multiline />
                </View>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Logotipo da Loja (URL):</Text>
                    <TextInput style={globalStyles.input} name="logotipo_loja" value={perfil.logotipo_loja || ''} onChangeText={(text) => handleChange('logotipo_loja', text)} />
                </View>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Website/Redes Sociais:</Text>
                    <TextInput style={globalStyles.input} name="site_redes_sociais" value={perfil.site_redes_sociais || ''} onChangeText={(text) => handleChange('site_redes_sociais', text)} />
                </View>
                <View style={styles.formGroup}>
                    <Text style={styles.label}>Categoria da Loja:</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={perfil.categoria_loja || ''}
                            onValueChange={(itemValue) => handleChange('categoria_loja', itemValue)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Selecione uma categoria" value="" />
                            {categorias.map(cat => (
                                <Picker.Item key={cat.id} label={cat.nome} value={cat.id} />
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
