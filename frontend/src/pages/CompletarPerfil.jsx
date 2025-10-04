import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Botao from '../components/Botao';
import { useNotification } from '../context/NotificationContext';
import FormularioAdmin from '../components/FormularioAdmin';

// Formulário para dados do Cliente
const FormularioCliente = ({ aoEnviar, initialData }) => {
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
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [data_nascimento, setDataNascimento] = useState('');
    const [erros, setErros] = useState({});

    useEffect(() => {
        if (initialData) {
            setNome(initialData.nome || '');
            setCpf(initialData.cpf || '');
            setTelefone(initialData.telefone || '');
            setDataNascimento(initialData.data_nascimento || '');
            if (initialData.endereco) {
                setRua(initialData.endereco.logradouro || '');
                setNumero(initialData.endereco.numero || '');
                setComplemento(initialData.endereco.complemento || '');
                setBairro(initialData.endereco.bairro || '');
                setCidade(initialData.endereco.cidade || '');
                setEstado(initialData.endereco.estado || '');
                setCep(initialData.endereco.cep || '');
                setLatitude(initialData.endereco.latitude || null);
                setLongitude(initialData.endereco.longitude || null);
            }
        }
    }, [initialData]);

    useEffect(() => {
        const fetchCoordinates = async () => {
            if (cep && numero) {
                try {
                    const response = await axios.get(`https://cep.awesomeapi.com.br/json/${cep}`);
                    if (response.data && response.data.lat && response.data.lng) {
                        setLatitude(response.data.lat);
                        setLongitude(response.data.lng);
                    }
                } catch (error) {
                    console.error('Erro ao buscar coordenadas:', error);
                }
            }
        };
        fetchCoordinates();
    }, [cep, numero]);

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
        if (!bairro) novosErros.bairro = 'Bairro é obrigatória.';
        if (!cidade) novosErros.cidade = 'Cidade é obrigatória.';
        if (!estado) novosErros.estado = 'Estado é obrigatório.';
        if (!cep) novosErros.cep = 'CEP é obrigatório.';

        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validarCampos()) {
            aoEnviar({ 
                nome, 
                cpf, 
                telefone, 
                data_nascimento,
                endereco: {
                    logradouro: rua,
                    numero,
                    complemento,
                    bairro,
                    cidade,
                    estado,
                    cep,
                    latitude,
                    longitude
                }
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <h3>Dados Pessoais</h3>
            {erros.nome && <p className="message-error">{erros.nome}</p>}
            <div className="form-group">
                <label htmlFor="nomeCliente">Nome Completo</label>
                <input type="text" id="nomeCliente" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Nome Completo" required />
            </div>
            
            {erros.cpf && <p className="message-error">{erros.cpf}</p>}
            <div className="form-group">
                <label htmlFor="cpfCliente">CPF</label>
                <input type="text" id="cpfCliente" value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="CPF" required />
            </div>
            
            <div className="form-group">
                <label htmlFor="telefoneCliente">Telefone</label>
                <input type="text" id="telefoneCliente" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="Telefone" />
            </div>
            
            <h4>Endereço</h4>
            {erros.rua && <p className="message-error">{erros.rua}</p>}
            <div className="form-group">
                <label htmlFor="ruaCliente">Rua</label>
                <input type="text" id="ruaCliente" value={rua} onChange={(e) => setRua(e.target.value)} placeholder="Rua" required />
            </div>
            {erros.numero && <p className="message-error">{erros.numero}</p>}
            <div className="form-group">
                <label htmlFor="numeroCliente">Número</label>
                <input type="text" id="numeroCliente" value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="Número" required />
            </div>
            <div className="form-group">
                <label htmlFor="complementoCliente">Complemento</label>
                <input type="text" id="complementoCliente" value={complemento} onChange={(e) => setComplemento(e.target.value)} placeholder="Apto, Bloco, etc." />
            </div>
            {erros.bairro && <p className="message-error">{erros.bairro}</p>}
            <div className="form-group">
                <label htmlFor="bairroCliente">Bairro</label>
                <input type="text" id="bairroCliente" value={bairro} onChange={(e) => setBairro(e.target.value)} placeholder="Bairro" required />
            </div>
            {erros.cidade && <p className="message-error">{erros.cidade}</p>}
            <div className="form-group">
                <label htmlFor="cidadeCliente">Cidade</label>
                <input type="text" id="cidadeCliente" value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Cidade" required />
            </div>
            {erros.estado && <p className="message-error">{erros.estado}</p>}
            <div className="form-group">
                <label htmlFor="estadoCliente">Estado (UF)</label>
                <input type="text" id="estadoCliente" value={estado} onChange={(e) => setEstado(e.target.value)} placeholder="Estado (UF)" required maxLength={2} />
            </div>
            {erros.cep && <p className="message-error">{erros.cep}</p>}
            <div className="form-group">
                <label htmlFor="cepCliente">CEP</label>
                <input type="text" id="cepCliente" value={cep} onChange={(e) => setCep(e.target.value)} placeholder="CEP" required />
            </div>

            <div className="form-group">
                <label htmlFor="dataNascimentoCliente">Data de Nascimento</label>
                <input type="date" id="dataNascimentoCliente" value={data_nascimento} onChange={(e) => setDataNascimento(e.target.value)} placeholder="Data de Nascimento" />
            </div>
            <Botao type="submit" variante="primario">Salvar Alterações</Botao>
        </form>
    );
};

// Formulário para dados do Vendedor
const FormularioVendedor = ({ aoEnviar, initialData }) => {
    const [nome_loja, setNomeLoja] = useState('');
    const [cnpj, setCnpj] = useState('');
    const [rua, setRua] = useState('');
    const [numero, setNumero] = useState('');
    const [complemento, setComplemento] = useState('');
    const [bairro, setBairro] = useState('');
    const [cidade, setCidade] = useState('');
    const [estado, setEstado] = useState('');
    const [cep, setCep] = useState('');
    const [latitude, setLatitude] = useState(null);
    const [longitude, setLongitude] = useState(null);
    const [telefone, setTelefone] = useState('');
    const [data_fundacao, setFundacao] = useState('');
    const [horario_funcionamento, setHorarioFuncionamento] = useState('');
    const [nome_responsavel, setNomeResponsavel] = useState('');
    const [cpf_responsavel, setCpfResponsavel] = useState('');
    const [breve_descricao_loja, setBreveDescricaoLoja] = useState('');
    const [logotipo_loja, setLogotipoLoja] = useState('');
    const [site_redes_sociais, setSiteRedesSociais] = useState('');
    const [categoria_loja, setCategoriaLoja] = useState('');
    const [categorias, setCategorias] = useState([]);
    const [descricao_categoria, setDescricaoCategoria] = useState('');
    const [erros, setErros] = useState({});

    useEffect(() => {
        if (initialData) {
            setNomeLoja(initialData.nome_loja || '');
            setCnpj(initialData.cnpj || '');
            setTelefone(initialData.telefone || '');
            setFundacao(initialData.data_fundacao || '');
            setHorarioFuncionamento(initialData.horario_funcionamento || '');
            setNomeResponsavel(initialData.nome_responsavel || '');
            setCpfResponsavel(initialData.cpf_responsavel || '');
            setBreveDescricaoLoja(initialData.breve_descricao_loja || '');
            setLogotipoLoja(initialData.logotipo_loja || '');
            setSiteRedesSociais(initialData.site_redes_sociais || '');
            setCategoriaLoja(initialData.categoria_loja || '');
            if (initialData.endereco) {
                setRua(initialData.endereco.logradouro || '');
                setNumero(initialData.endereco.numero || '');
                setComplemento(initialData.endereco.complemento || '');
                setBairro(initialData.endereco.bairro || '');
                setCidade(initialData.endereco.cidade || '');
                setEstado(initialData.endereco.estado || '');
                setCep(initialData.endereco.cep || '');
                setLatitude(initialData.endereco.latitude || null);
                setLongitude(initialData.endereco.longitude || null);
            }
        }
    }, [initialData]);

    useEffect(() => {
        const fetchCoordinates = async () => {
            if (cep && numero) {
                try {
                    const response = await axios.get(`https://cep.awesomeapi.com.br/json/${cep}`);
                    if (response.data && response.data.lat && response.data.lng) {
                        setLatitude(response.data.lat);
                        setLongitude(response.data.lng);
                    }
                } catch (error) {
                    console.error('Erro ao buscar coordenadas:', error);
                }
            }
        };
        fetchCoordinates();
    }, [cep, numero]);

    useEffect(() => {
        const buscarCategorias = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/categorias/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCategorias(response.data);
            } catch (error) {
                console.error('Erro ao buscar categorias:', error.response ? error.response.data : error.message);
            }
        };
        buscarCategorias();
    }, []);

    useEffect(() => {
        const categoriaSelecionada = categorias.find(cat => cat.id === parseInt(categoria_loja));
        setDescricaoCategoria(categoriaSelecionada ? categoriaSelecionada.descricao : '');
    }, [categoria_loja, categorias]);

    const validarCampos = () => {
        let novosErros = {};
        if (!nome_loja) novosErros.nome_loja = 'Nome da Loja é obrigatório.';
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
        if (!categoria_loja) novosErros.categoria_loja = 'Categoria da Loja é obrigatória.';

        setErros(novosErros);
        return Object.keys(novosErros).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validarCampos()) {
            let url = site_redes_sociais;
            if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
            }

            aoEnviar({
                nome_loja, cnpj, telefone, data_fundacao, horario_funcionamento,
                nome_responsavel, cpf_responsavel, breve_descricao_loja, 
                logotipo_loja, site_redes_sociais: url, categoria_loja,
                endereco: { logradouro: rua, numero, complemento, bairro, cidade, estado, cep, latitude, longitude }
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <h3>Dados da Loja</h3>
            {erros.nome_loja && <p className="message-error">{erros.nome_loja}</p>}
            <div className="form-group">
                <label htmlFor="nome_loja">Nome da Loja</label>
                <input type="text" id="nome_loja" value={nome_loja} onChange={(e) => setNomeLoja(e.target.value)} placeholder="Nome da Loja" required />
            </div>
            
            {erros.cnpj && <p className="message-error">{erros.cnpj}</p>}
            <div className="form-group">
                <label htmlFor="cnpj">CNPJ</label>
                <input type="text" id="cnpj" value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="CNPJ" />
            </div>
            
            <h4>Endereço</h4>
            {erros.rua && <p className="message-error">{erros.rua}</p>}
            <div className="form-group">
                <label htmlFor="ruaVendedor">Rua</label>
                <input type="text" id="ruaVendedor" value={rua} onChange={(e) => setRua(e.target.value)} placeholder="Rua" required />
            </div>
            {erros.numero && <p className="message-error">{erros.numero}</p>}
            <div className="form-group">
                <label htmlFor="numeroVendedor">Número</label>
                <input type="text" id="numeroVendedor" value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="Número" required />
            </div>
            <div className="form-group">
                <label htmlFor="complementoVendedor">Complemento</label>
                <input type="text" id="complementoVendedor" value={complemento} onChange={(e) => setComplemento(e.target.value)} placeholder="Apto, Bloco, etc." />
            </div>
            {erros.bairro && <p className="message-error">{erros.bairro}</p>}
            <div className="form-group">
                <label htmlFor="bairroVendedor">Bairro</label>
                <input type="text" id="bairroVendedor" value={bairro} onChange={(e) => setBairro(e.target.value)} placeholder="Bairro" required />
            </div>
            {erros.cidade && <p className="message-error">{erros.cidade}</p>}
            <div className="form-group">
                <label htmlFor="cidadeVendedor">Cidade</label>
                <input type="text" id="cidadeVendedor" value={cidade} onChange={(e) => setCidade(e.target.value)} placeholder="Cidade" required />
            </div>
            {erros.estado && <p className="message-error">{erros.estado}</p>}
            <div className="form-group">
                <label htmlFor="estadoVendedor">Estado (UF)</label>
                <input type="text" id="estadoVendedor" value={estado} onChange={(e) => setEstado(e.target.value)} placeholder="Estado (UF)" required maxLength={2} />
            </div>
            {erros.cep && <p className="message-error">{erros.cep}</p>}
            <div className="form-group">
                <label htmlFor="cepVendedor">CEP</label>
                <input type="text" id="cepVendedor" value={cep} onChange={(e) => setCep(e.target.value)} placeholder="CEP" required />
            </div>

            <div className="form-group">
                <label htmlFor="telefoneVendedor">Telefone da Loja</label>
                <input type="text" id="telefoneVendedor" value={telefone} onChange={(e) => setTelefone(e.target.value)} placeholder="Telefone da Loja" />
            </div>
            <div className="form-group">
                <label htmlFor="data_fundacao">Data de Fundação</label>
                <input type="date" id="data_fundacao" value={data_fundacao} onChange={(e) => setFundacao(e.target.value)} placeholder="Data de Fundação" />
            </div>
            <div className="form-group">
                <label htmlFor="horario_funcionamento">Horário de Funcionamento</label>
                <input type="text" id="horario_funcionamento" value={horario_funcionamento} onChange={(e) => setHorarioFuncionamento(e.target.value)} placeholder="Horário de Funcionamento" />
            </div>
            <div className="form-group">
                <label htmlFor="nome_responsavel">Nome do Responsável</label>
                <input type="text" id="nome_responsavel" value={nome_responsavel} onChange={(e) => setNomeResponsavel(e.target.value)} placeholder="Nome do Responsável" />
            </div>
            <div className="form-group">
                <label htmlFor="cpf_responsavel">CPF do Responsável</label>
                <input type="text" id="cpf_responsavel" value={cpf_responsavel} onChange={(e) => setCpfResponsavel(e.target.value)} placeholder="CPF do Responsável" />
            </div>
            <div className="form-group">
                <label htmlFor="breve_descricao_loja">Breve Descrição da Loja</label>
                <textarea id="breve_descricao_loja" value={breve_descricao_loja} onChange={(e) => setBreveDescricaoLoja(e.target.value)} placeholder="Breve Descrição da Loja"></textarea>
            </div>
            <div className="form-group">
                <label htmlFor="logotipo_loja">URL do Logotipo da Loja</label>
                <input type="text" id="logotipo_loja" value={logotipo_loja} onChange={(e) => setLogotipoLoja(e.target.value)} placeholder="URL do Logotipo da Loja" />
            </div>
            <div className="form-group">
                <label htmlFor="site_redes_sociais">Website/Redes Sociais</label>
                <input type="text" id="site_redes_sociais" value={site_redes_sociais} onChange={(e) => setSiteRedesSociais(e.target.value)} placeholder="Website/Redes Sociais" />
            </div>
            
            {erros.categoria_loja && <p className="message-error">{erros.categoria_loja}</p>}
            <div className="form-group">
                <label htmlFor="categoria_loja">Categoria da Loja:</label>
                <select id="categoria_loja" value={categoria_loja} onChange={(e) => setCategoriaLoja(e.target.value)} required>
                    <option value="">Selecione uma categoria</option>
                    {categorias.map(cat => (
                        <option key={cat.id} value={cat.id}>
                            {cat.nome}
                        </option>
                    ))}
                </select>
            </div>
            {descricao_categoria && <p className="text" style={{ fontSize: '0.9em', color: '#666' }}>{descricao_categoria}</p>}

            <Botao type="submit" variante="primario">Salvar Alterações</Botao>
        </form>
    );
};

const CompletarPerfil = () => {
    const navigate = useNavigate();
    const { usuario, login, token } = useContext(AuthContext);
    const { showNotification } = useNotification();
    const [isEditMode, setIsEditMode] = useState(false);
    const [initialData, setInitialData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/perfil/`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                // Se a resposta for bem-sucedida e tiver dados, estamos no modo de edição
                if (response.status === 200 && response.data) {
                    setInitialData(response.data);
                    setIsEditMode(true);
                }
            } catch (error) {
                // Um erro 404 significa que o perfil ainda não existe, o que é esperado para novos usuários.
                if (error.response && error.response.status === 404) {
                    setIsEditMode(false);
                } else {
                    showNotification('Erro ao carregar dados do perfil.', 'erro');
                }
            }
            setLoading(false);
        };

        fetchProfileData();
    }, [token, showNotification]);

    const aoEnviarPerfil = async (dadosPerfil) => {
        const method = isEditMode ? 'put' : 'post';
        let endpoint;

        if (isEditMode) {
            endpoint = `${process.env.REACT_APP_API_URL}/api/perfil/`;
        } else {
            console.log(usuario.tipo_usuario);
            if (usuario.tipo_usuario === 'Cliente') {
                console.log("Matched: Cliente");
                endpoint = `${process.env.REACT_APP_API_URL}/api/clientes/`;
            } else if (usuario.tipo_usuario === 'Vendedor') {
                console.log("Matched: Vendedor");
                endpoint = `${process.env.REACT_APP_API_URL}/api/vendedores/`;
            } else if (usuario.tipo_usuario === 'Administrador') {
                console.log("Matched: Administrador");
                endpoint = `${process.env.REACT_APP_API_URL}/api/admins/`;
            } else {
                console.log("No match. Falling back to else.");
                showNotification('Tipo de usuário inválido.', 'erro');
                return;
            }
        }

        try {
            const response = await axios[method](endpoint, dadosPerfil, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.status === 200 || response.status === 201) {
                showNotification('Perfil salvo com sucesso!', 'sucesso');
                const updatedUser = { ...usuario, perfil_completo: true };
                login(token, updatedUser); // Atualiza o contexto de autenticação
                
                let destination = '/nao-autorizado';
                if (usuario.tipo_usuario === 'Vendedor') {
                    destination = '/dashboard-vendedor';
                } else if (usuario.tipo_usuario === 'Cliente') {
                    destination = '/dashboard-cliente';
                } else if (usuario.tipo_usuario === 'Administrador') {
                    destination = '/dashboard-admin';
                }
                navigate(destination);
            }
        } catch (error) {
            const serverError = error.response?.data;
            if (serverError && typeof serverError === 'object') {
                const errorMessages = Object.values(serverError).flat().join(' ');
                showNotification(errorMessages || 'Falha ao salvar. Verifique os dados e tente novamente.', 'erro');
            } else {
                showNotification('Falha ao conectar com o servidor ou erro ao salvar perfil.', 'erro');
            }
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '40px' }}>Carregando...</div>;
    }

    if (!usuario) {
        return (
            <div className="layout-logado-content" style={{ padding: '20px', textAlign: 'center' }}>
                <p className="message-error">
                   Sua sessão pode ter expirado. Por favor, <Link to="/login">tente fazer login novamente</Link>.
                </p>
            </div>
        );
    }

    return (
        <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
            <div className="dashboard-background-layer"></div>
            <h2 className="dashboard-title">{isEditMode ? 'Editar Perfil' : 'Quase lá!'}</h2>
            <p className="text" style={{ textAlign: 'center', marginBottom: '20px' }}>
                {isEditMode ? 'Atualize suas informações abaixo.' : 'Por favor, complete as informações abaixo para finalizar seu cadastro.'}
            </p>
            
            {usuario.tipo_usuario === 'Cliente' &&
                <FormularioCliente aoEnviar={aoEnviarPerfil} initialData={initialData} />
            }
            {usuario.tipo_usuario === 'Vendedor' &&
                <FormularioVendedor aoEnviar={aoEnviarPerfil} initialData={initialData} />
            }
            {usuario.tipo_usuario === 'Administrador' &&
                <FormularioAdmin aoEnviar={aoEnviarPerfil} initialData={initialData} />
            }
        </div>
    );
};

export default CompletarPerfil;