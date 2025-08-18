import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { jwtDecode } from 'jwt-decode';


// Formulário para dados do Cliente
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
    const [data_nascimento, setDataNascimento] = useState('');
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
                idUsuario, 
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
                    cep
                }
            });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <h3>Complete seu Perfil de Cliente</h3>
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
            <button type="submit" className="btn btn-primary">Salvar e Continuar</button>
        </form>
    );
};

// Formulário para dados do Vendedor
const FormularioVendedor = ({ idUsuario, aoEnviar }) => {
    const [nome_loja, setNomeLoja] = useState('');
    const [cnpj, setCnpj] = useState('');
    const [rua, setRua] = useState('');
    const [numero, setNumero] = useState('');
    const [complemento, setComplemento] = useState('');
    const [bairro, setBairro] = useState('');
    const [cidade, setCidade] = useState('');
    const [estado, setEstado] = useState('');
    const [cep, setCep] = useState('');
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
        const buscarCategorias = async () => {
            try {
                                console.log('Buscando categorias de:', `${process.env.REACT_APP_API_URL}/api/categorias/`);
                const token = localStorage.getItem('token');
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/categorias/`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                console.log('Categorias recebidas:', response.data);
                setCategorias(response.data);
            } catch (error) {
                console.error('Erro ao buscar categorias:', error.response ? error.response.data : error.message);
            }
        };
        buscarCategorias();
    }, []);

    useEffect(() => {
        const categoriaSelecionada = categorias.find(cat => cat.id === parseInt(categoria_loja));
        if (categoriaSelecionada) {
            setDescricaoCategoria(categoriaSelecionada.descricao);
        } else {
            setDescricaoCategoria('');
        }
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
                idUsuario, 
                nome_loja, 
                cnpj, 
                telefone, 
                data_fundacao, 
                horario_funcionamento,
                nome_responsavel, 
                cpf_responsavel, 
                breve_descricao_loja, 
                logotipo_loja, 
                site_redes_sociais: url,
                categoria_loja,
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
        }
    };

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <h3>Complete seu Perfil de Vendedor</h3>
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

            <button type="submit" className="btn btn-primary">Salvar e Continuar</button>
        </form>
    );
};

const CompletarPerfil = () => {
    const navegar = useNavigate();
    const localizacao = useLocation();
    const [erro, setErro] = useState(null);
    
    // 1. OBTER O UTILIZADOR DIRETAMENTE DO AuthContext
    const { usuario, login, token } = useContext(AuthContext);
    // 2. LÓGICA ROBUSTA PARA OBTER OS DADOS DO UTILIZADOR
    // Prioridade: dados do contexto. Fallback: dados do state da navegação (para o fluxo pós-registo).
    const idUsuario = usuario?.id || localizacao.state?.idUsuario;
    const tipoUsuario = usuario?.tipo_usuario || localizacao.state?.tipoUsuario;
    const emailUsuario = usuario?.email || localizacao.state?.email;

    // A verificação agora usa os dados obtidos
    if (!idUsuario || !tipoUsuario) {
        return (
            <div className="layout-logado-content" style={{ padding: '20px', textAlign: 'center' }}>
                <p className="message-error">
                   Erro: Dados de utilizador não encontrados. A sua sessão pode ter expirado. Por favor, <Link to="/login">tente fazer login novamente</Link>.
                </p>
            </div>
        );
    }

    const aoEnviarPerfil = async (dadosPerfil) => {
        try {
            let endpoint = `${process.env.REACT_APP_API_URL}/api/perfil/`;

            // --- LÓGICA DE MAPEAMENTO CORRIGIDA ---
            let dadosParaDjango = {};
            if (tipoUsuario === 'Cliente') {
                dadosParaDjango = {
                    nome: dadosPerfil.nome,
                    cpf: dadosPerfil.cpf,
                    telefone: dadosPerfil.telefone,
                    data_nascimento: dadosPerfil.data_nascimento || null, // Garante que envia null se estiver vazio
                    endereco: dadosPerfil.endereco,
                };
            } else { // Vendedor
                dadosParaDjango = {
                    nome_loja: dadosPerfil.nome_loja,
                    cnpj: dadosPerfil.cnpj,
                    telefone: dadosPerfil.telefone,
                    // Adicione aqui os outros campos do vendedor que você quer salvar
                    data_fundacao: dadosPerfil.data_fundacao || null,
                    horario_funcionamento: dadosPerfil.horario_funcionamento,
                    nome_responsavel: dadosPerfil.nome_responsavel,
                    cpf_responsavel: dadosPerfil.cpf_responsavel,
                    breve_descricao_loja: dadosPerfil.breve_descricao_loja,
                    logotipo_loja: dadosPerfil.logotipo_loja,
                    site_redes_sociais: dadosPerfil.site_redes_sociais,
                    categoria_loja: dadosPerfil.categoria_loja, // Este é o ID da categoria
                    endereco: dadosPerfil.endereco,
                };
            }

            // Envia a requisição PUT com os dados corretos
            const response = await axios.put(endpoint, dadosParaDjango, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                }
            });

            if (response.status === 200) {
                // Atualiza o contexto para indicar que o perfil está completo
                login(token, { ...usuario, perfil_completo: true }); 
                
                // Redireciona para o painel apropriado
                if (!usuario.email_verificado) {
                    navegar('/verificar-email');
                } else {
                    navegar(tipoUsuario === 'Vendedor' ? '/dashboard-vendedor' : '/dashboard-cliente');
                }
            } else {
                setErro(response.data.message || 'Ocorreu um erro ao salvar o perfil.');
            }
        } catch (error) {
            console.error('Erro ao salvar perfil:', error.response ? error.response.data : error.message);
            const serverError = error.response?.data;
            // Mostra erros de validação específicos do Django
            if (serverError && typeof serverError === 'object') {
                const errorMessages = Object.values(serverError).flat().join(' ');
                setErro(errorMessages || 'Falha ao salvar. Verifique os dados e tente novamente.');
            } else {
                setErro('Falha ao conectar com o servidor ou erro ao salvar perfil.');
            }
        }
    };

    return (
        <div style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
            <div className="dashboard-background-layer"></div>
            <h2 className="dashboard-title">Quase lá!</h2>
            <p className="text" style={{ textAlign: 'center', marginBottom: '20px' }}>Por favor, complete as informações abaixo para finalizar seu cadastro.</p>
            {erro && <p className="message-error">{erro}</p>}
            
            {tipoUsuario === 'Cliente' ? (
                <FormularioCliente idUsuario={idUsuario} aoEnviar={aoEnviarPerfil} />
            ) : (
                <FormularioVendedor idUsuario={idUsuario} aoEnviar={aoEnviarPerfil} />
            )}
        </div>
    );
};

export default CompletarPerfil;