import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import Constants from 'expo-constants';
import axios from 'axios';
import { Picker } from '@react-native-picker/picker';
import { globalStyles, cores, fontes } from '../styles/globalStyles';
import MainLayout from '../components/MainLayout';

// Componente de Input reutilizável
const StyledInput = (props) => (
    <TextInput
        style={styles.input}
        placeholderTextColor={cores.hover}
        {...props}
    />
);

const FormularioCliente = ({ idUsuario, aoEnviar }) => {
    const [nome, setNome] = useState('');
    const [cpf, setCpf] = useState('');
    const [telefone, setTelefone] = useState('');
    const [rua, setRua] = useState('');
    const [numero, setNumero] = useState('');
    const [complemento, setComplemento] = useState('');
    const [bairro, setBairro] = useState('');
    const [cidade, setCidade] = useState('');
    const [estado, setEstado] = useState('');
    const [cep, setCep] = useState('');
    const [dataNascimento, setDataNascimento] = useState('');
    const [erros, setErros] = useState({});

    const validarCampos = () => {
        let novosErros = {};
        if (!nome) novosErros.nome = 'Nome Completo é obrigatório.';
        if (!cpf) {
            novosErros.cpf = 'CPF é obrigatório.';
        } else if (cpf.length !== 11 || !/^[0-9]+$/.test(cpf)) {
            novosErros.cpf = 'CPF deve conter 11 dígitos numéricos.';
        }
        if (!rua) novosErros.rua = 'Rua é obrigatória.';
        if (!numero) novosErros.numero = 'Número é obrigatório.';
        if (!bairro) novosErros.bairro = 'Bairro é obrigatório.';
        if (!cidade) novosErros.cidade = 'Cidade é obrigatória.';
        if (!estado) novosErros.estado = 'Estado é obrigatória.';
        if (!cep) novosErros.cep = 'CEP é obrigatório.';

        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const handleSubmit = () => {
        if (validarCampos()) {
            aoEnviar({
                idUsuario,
                nome,
                cpf,
                telefone,
                dataNascimento,
                endereco: {
                    logradouro: rua,
                    numero,
                    complemento,
                    bairro,
                    cidade,
                    estado,
                    cep
                }
            });
        } else {
            const mensagemErro = Object.values(erros).join('\n');
            Alert.alert('Erro de Validação', mensagemErro);
        }
    };

    return (
        <View>
            <Text style={styles.sectionTitle}>Complete seu Perfil de Cliente</Text>
            {erros.nome && <Text style={styles.errorText}>{erros.nome}</Text>}
            <StyledInput placeholder="Nome Completo" value={nome} onChangeText={setNome} />
            
            {erros.cpf && <Text style={styles.errorText}>{erros.cpf}</Text>}
            <StyledInput placeholder="CPF (somente números)" value={cpf} onChangeText={setCpf} keyboardType="numeric" maxLength={11} />
            
            <StyledInput placeholder="Telefone (Opcional)" value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" />
            
            <Text style={styles.sectionTitle}>Endereço</Text>
            {erros.rua && <Text style={styles.errorText}>{erros.rua}</Text>}
            <StyledInput placeholder="Rua" value={rua} onChangeText={setRua} />
            {erros.numero && <Text style={styles.errorText}>{erros.numero}</Text>}
            <StyledInput placeholder="Número" value={numero} onChangeText={setNumero} keyboardType="numeric" />
            <StyledInput placeholder="Complemento (Opcional)" value={complemento} onChangeText={setComplemento} />
            {erros.bairro && <Text style={styles.errorText}>{erros.bairro}</Text>}
            <StyledInput placeholder="Bairro" value={bairro} onChangeText={setBairro} />
            {erros.cidade && <Text style={styles.errorText}>{erros.cidade}</Text>}
            <StyledInput placeholder="Cidade" value={cidade} onChangeText={setCidade} />
            {erros.estado && <Text style={styles.errorText}>{erros.estado}</Text>}
            <StyledInput placeholder="Estado (UF)" value={estado} onChangeText={setEstado} maxLength={2} autoCapitalize="characters" />
            {erros.cep && <Text style={styles.errorText}>{erros.cep}</Text>}
            <StyledInput placeholder="CEP" value={cep} onChangeText={setCep} keyboardType="numeric" />

            <StyledInput placeholder="Data de Nascimento (AAAA-MM-DD)" value={dataNascimento} onChangeText={setDataNascimento} />
            <TouchableOpacity style={globalStyles.button} onPress={handleSubmit}>
                <Text style={globalStyles.buttonText}>Salvar e Continuar</Text>
            </TouchableOpacity>
        </View>
    );
};

const FormularioVendedor = ({ idUsuario, aoEnviar }) => {
    const [nomeLoja, setNomeLoja] = useState('');
    const [cnpj, setCnpj] = useState('');
    const [rua, setRua] = useState('');
    const [numero, setNumero] = useState('');
    const [complemento, setComplemento] = useState('');
    const [bairro, setBairro] = useState('');
    const [cidade, setCidade] = useState('');
    const [estado, setEstado] = useState('');
    const [cep, setCep] = useState('');
    const [telefone, setTelefone] = useState('');
    const [fundacao, setFundacao] = useState('');
    const [horarioFuncionamento, setHorarioFuncionamento] = useState('');
    const [nomeResponsavel, setNomeResponsavel] = useState('');
    const [cpfResponsavel, setCpfResponsavel] = useState('');
    const [breveDescricaoLoja, setBreveDescricaoLoja] = useState('');
    const [logotipoLoja, setLogotipoLoja] = useState('');
    const [websiteRedesSociais, setWebsiteRedesSociais] = useState('');
    const [idCategoriaLoja, setIdCategoriaLoja] = useState('');
    const [categorias, setCategorias] = useState([]);
    const [descricaoCategoria, setDescricaoCategoria] = useState('');
    const [erros, setErros] = useState({});

    useEffect(() => {
        const buscarCategorias = async () => {
            try {
                const apiUrl = Constants.expoConfig.extra.apiUrl;
                const response = await axios.get(`${apiUrl}/categories`);
                setCategorias(response.data);
            } catch (error) {
                console.error('Erro ao buscar categorias:', error.response ? error.response.data : error.message);
                Alert.alert('Erro', 'Erro ao carregar categorias. Tente novamente.');
            }
        };
        buscarCategorias();
    }, []);

    useEffect(() => {
        const categoriaSelecionada = categorias.find(cat => cat.ID_CategoriaLoja === parseInt(idCategoriaLoja));
        if (categoriaSelecionada) {
            setDescricaoCategoria(categoriaSelecionada.Descricao);
        } else {
            setDescricaoCategoria('');
        }
    }, [idCategoriaLoja, categorias]);

    const validarCampos = () => {
        let novosErros = {};
        if (!nomeLoja) novosErros.nomeLoja = 'Nome da Loja é obrigatório.';
        if (!cnpj) {
            novosErros.cnpj = 'CNPJ é obrigatório.';
        } else if (cnpj.length !== 14 || !/^[0-9]+$/.test(cnpj)) {
            novosErros.cnpj = 'CNPJ deve conter 14 dígitos numéricos.';
        }
        if (!rua) novosErros.rua = 'Rua é obrigatória.';
        if (!numero) novosErros.numero = 'Número é obrigatório.';
        if (!bairro) novosErros.bairro = 'Bairro é obrigatório.';
        if (!cidade) novosErros.cidade = 'Cidade é obrigatória.';
        if (!estado) novosErros.estado = 'Estado é obrigatório.';
        if (!cep) novosErros.cep = 'CEP é obrigatório.';
        if (!idCategoriaLoja) novosErros.idCategoriaLoja = 'Categoria da Loja é obrigatória.';

        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const handleSubmit = () => {
        if (validarCampos()) {
            aoEnviar({
                idUsuario,
                nomeLoja,
                cnpj,
                telefone,
                fundacao,
                horarioFuncionamento,
                nomeResponsavel,
                cpfResponsavel,
                breveDescricaoLoja,
                logotipoLoja,
                websiteRedesSociais,
                idCategoriaLoja,
                endereco: {
                    logradouro: rua,
                    numero,
                    complemento,
                    bairro,
                    cidade,
                    estado,
                    cep
                }
            });
        } else {
            const mensagemErro = Object.values(erros).join('\n');
            Alert.alert('Erro de Validação', mensagemErro);
        }
    };

    return (
        <View>
            <Text style={styles.sectionTitle}>Complete seu Perfil de Vendedor</Text>
            {erros.nomeLoja && <Text style={styles.errorText}>{erros.nomeLoja}</Text>}
            <StyledInput placeholder="Nome da Loja" value={nomeLoja} onChangeText={setNomeLoja} />
            
            {erros.cnpj && <Text style={styles.errorText}>{erros.cnpj}</Text>}
            <StyledInput placeholder="CNPJ (somente números)" value={cnpj} onChangeText={setCnpj} keyboardType="numeric" maxLength={14} />
            
            <Text style={styles.sectionTitle}>Endereço</Text>
            {erros.rua && <Text style={styles.errorText}>{erros.rua}</Text>}
            <StyledInput placeholder="Rua" value={rua} onChangeText={setRua} />
            {erros.numero && <Text style={styles.errorText}>{erros.numero}</Text>}
            <StyledInput placeholder="Complemento (Opcional)" value={complemento} onChangeText={setComplemento} />
            {erros.bairro && <Text style={styles.errorText}>{erros.bairro}</Text>}
            <StyledInput placeholder="Bairro" value={bairro} onChangeText={setBairro} />
            {erros.cidade && <Text style={styles.errorText}>{erros.cidade}</Text>}
            <StyledInput placeholder="Cidade" value={cidade} onChangeText={setCidade} />
            {erros.estado && <Text style={styles.errorText}>{erros.estado}</Text>}
            <StyledInput placeholder="Estado (UF)" value={estado} onChangeText={setEstado} maxLength={2} autoCapitalize="characters" />
            {erros.cep && <Text style={styles.errorText}>{erros.cep}</Text>}
            <StyledInput placeholder="CEP" value={cep} onChangeText={setCep} keyboardType="numeric" />

            <StyledInput placeholder="Telefone da Loja" value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" />
            <StyledInput placeholder="Data de Fundação (AAAA-MM-DD)" value={fundacao} onChangeText={setFundacao} />
            <StyledInput placeholder="Horário de Funcionamento" value={horarioFuncionamento} onChangeText={setHorarioFuncionamento} />
            <StyledInput placeholder="Nome do Responsável" value={nomeResponsavel} onChangeText={setNomeResponsavel} />
            <StyledInput placeholder="CPF do Responsável" value={cpfResponsavel} onChangeText={setCpfResponsavel} keyboardType="numeric" maxLength={11} />
            <StyledInput multiline placeholder="Breve Descrição da Loja" value={breveDescricaoLoja} onChangeText={setBreveDescricaoLoja} style={[styles.input, styles.textArea]} />
            <StyledInput placeholder="URL do Logotipo da Loja" value={logotipoLoja} onChangeText={setLogotipoLoja} />
            <StyledInput placeholder="Website ou Rede Social" value={websiteRedesSociais} onChangeText={setWebsiteRedesSociais} />
            
            {erros.idCategoriaLoja && <Text style={styles.errorText}>{erros.idCategoriaLoja}</Text>}
            <View style={styles.pickerContainer}>
                <Picker selectedValue={idCategoriaLoja} onValueChange={setIdCategoriaLoja} style={styles.picker}>
                    <Picker.Item label="Selecione uma categoria" value="" />
                    {categorias.map(cat => (
                        <Picker.Item key={cat.ID_CategoriaLoja} label={cat.NomeCategoria} value={cat.ID_CategoriaLoja} />
                    ))}
                </Picker>
            </View>
            {descricaoCategoria && <Text style={styles.descriptionText}>{descricaoCategoria}</Text>}

            <TouchableOpacity style={globalStyles.button} onPress={handleSubmit}>
                <Text style={globalStyles.buttonText}>Salvar e Continuar</Text>
            </TouchableOpacity>
        </View>
    );
};

const TelaCompletarPerfil = ({ route, navigation }) => {
    const { idUsuario, tipoUsuario, email } = route.params;
    const [erro, setErro] = useState(null);
    const { atualizarStatusPerfil } = useContext(AuthContext);

    const aoEnviarPerfil = async (dadosPerfil) => {
        const endpoint = tipoUsuario === 'Cliente' 
            ? '/usuarios/client/complete-profile' 
            : '/usuarios/seller/complete-profile';

        try {
            const apiUrl = Constants.expoConfig.extra.apiUrl;
            const response = await axios.post(`${apiUrl}${endpoint}`, dadosPerfil);

            if (response.status === 200) {
                atualizarStatusPerfil(true);
                if (response.data.usuarioAtivo) {
                    if (tipoUsuario === 'Cliente') {
                        navigation.navigate('BemVindo'); // Ou para o Dashboard do Cliente
                    } else {
                        navigation.navigate('DashboardVendedor');
                    }
                } else {
                    navigation.navigate('TelaVerificarEmail', { email: email });
                }
            } else {
                setErro(response.data.message || 'Ocorreu um erro ao salvar o perfil.');
                Alert.alert('Erro', response.data.message || 'Ocorreu um erro ao salvar o perfil.');
            }
        } catch (error) {
            setErro('Falha ao conectar com o servidor.');
            Alert.alert('Erro', 'Falha ao conectar com o servidor.');
            console.error('Erro ao enviar perfil:', error.response ? error.response.data : error.message);
        }
    };

    if (!idUsuario || !tipoUsuario) {
        return (
            <View style={globalStyles.container}>
                <Text style={styles.errorText}>Erro: Dados de usuário não encontrados. Por favor, volte e tente novamente.</Text>
                <TouchableOpacity style={globalStyles.button} onPress={() => navigation.navigate('TelaCadastro')}>
                    <Text style={globalStyles.buttonText}>Voltar ao Cadastro</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <MainLayout>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={globalStyles.title}>Quase lá!</Text>
                <Text style={styles.subtitle}>Complete as informações abaixo para uma experiência mágica.</Text>
                {erro && <Text style={styles.errorText}>{erro}</Text>}
                
                {tipoUsuario === 'Cliente' ? (
                    <FormularioCliente idUsuario={idUsuario} aoEnviar={aoEnviarPerfil} />
                ) : (
                    <FormularioVendedor idUsuario={idUsuario} aoEnviar={aoEnviarPerfil} />
                )}
            </ScrollView>
        </MainLayout>
    );
};


const styles = StyleSheet.create({
    container: {
        ...globalStyles.container,
        flexGrow: 1,
        justifyContent: 'center',
    },
    title: {
        ...globalStyles.title,
        marginBottom: 10,
    },
    subtitle: {
        ...globalStyles.text,
        textAlign: 'center',
        marginBottom: 30,
        color: cores.hover,
    },
    sectionTitle: {
        fontFamily: fontes.semiBold,
        fontSize: 18,
        color: cores.primaria,
        marginTop: 20,
        marginBottom: 10,
        borderBottomWidth: 1,
        borderColor: cores.terciaria,
        paddingBottom: 5,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 20,
        paddingVertical: 15,
        fontSize: 16,
        fontFamily: fontes.secundaria,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: cores.terciaria,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    pickerContainer: {
        borderRadius: 12,
        borderWidth: 1,
        borderColor: cores.terciaria,
        marginBottom: 20,
        overflow: 'hidden',
        backgroundColor: '#fff',
    },
    picker: {
        width: '100%',
        height: 50,
        color: cores.texto,
    },
    errorText: {
        ...globalStyles.text,
        color: 'red',
        textAlign: 'center',
        marginBottom: 20,
    }
});

export default TelaCompletarPerfil;
