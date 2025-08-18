import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';


const EditarPerfilVendedor = () => {
    const { token, usuario } = useContext(AuthContext);
    const navigate = useNavigate();
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
        },
        telefone: '',
        data_fundacao: '', // CORRIGIDO
        horario_funcionamento: '', // CORRIGIDO
        nome_responsavel: '', // CORRIGIDO
        cpf_responsavel: '', // CORRIGIDO
        breve_descricao_loja: '',
        logotipo_loja: '', // CORRIGIDO
        site_redes_sociais: '', // CORRIGIDO
        categoria_loja: '', // CORRIGIDO
    });

    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [categorias, setCategorias] = useState([]);

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => {
            setNotification({ message: '', type: '' });
        }, 5000);
    };

    useEffect(() => {
        const fetchPerfilAndCategories = async () => {
            
            if (!token || usuario?.tipo_usuario !== 'Vendedor') {
                // Navega para não autorizado se a condição não for atendida
                navigate('/nao-autorizado');
                return; // Impede a execução do restante da função
            }

            try {
                // Fetch seller profile
                const perfilResponse = await axios.get('/api/perfil/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPerfil(perfilResponse.data);

                // Fetch categories
                const categoriasResponse = await axios.get('/api/categorias/', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCategorias(categoriasResponse.data);

            } catch (err) {
                showNotification('Falha ao carregar dados do perfil ou categorias.', 'error');
                console.error(err);
                // Adicionar uma verificação de erro para garantir que a tela não fique em branco
                setPerfil(null); 
            }
            setLoading(false);
        };

    // Chama a função de busca
        fetchPerfilAndCategories();
    }, [token, usuario, navigate])

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Check if the field name contains a dot, indicating a nested field
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setPerfil(prevPerfil => ({
                ...prevPerfil,
                [parent]: {
                    ...prevPerfil[parent],
                    [child]: value
                }
            }));
        } else {
            // For top-level fields
            setPerfil({ ...perfil, [name]: value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Função para adicionar https:// se necessário
        const formatarUrl = (url) => {
            if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
                return `https://${url}`;
            }
            return url;
        };

        // 1. Limpa e prepara o payload para o backend
        const payload = {
            nome_loja: perfil.nome_loja,
            cnpj: perfil.cnpj,
            endereco: perfil.endereco,
            telefone: perfil.telefone,
            categoria_loja: perfil.categoria_loja,
            nome_responsavel: perfil.nome_responsavel,
            cpf_responsavel: perfil.cpf_responsavel,
            breve_descricao_loja: perfil.breve_descricao_loja,
            data_fundacao: perfil.data_fundacao,
            horario_funcionamento: perfil.horario_funcionamento,
            // Formata as URLs e trata campos vazios
            logotipo_loja: perfil.logotipo_loja ? formatarUrl(perfil.logotipo_loja) : null,
            site_redes_sociais: perfil.site_redes_sociais ? formatarUrl(perfil.site_redes_sociais) : null,
        };

        try {
            const idVendedor = usuario.id;
            const updateUrl = `/api/vendedores/${idVendedor}/`;

            console.log('Token sendo enviado:', token);
            await axios.put(updateUrl, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            showNotification('Perfil atualizado com sucesso!', 'success');

            // Redireciona para o dashboard após 2 segundos
            setTimeout(() => {
                navigate('/dashboard-vendedor');
            }, 2000);
        } catch (err) {
            showNotification('Falha ao atualizar perfil.', 'error');
            console.error(err);
        }
    };


    if (loading) return <div>Carregando perfil...</div>;

    // Se o perfil for nulo após o carregamento (devido a um erro), exibe uma mensagem de fallback.
    if (!perfil) {
        return (
            <div className="container" style={{ textAlign: 'center' }}>
                <h1>Erro ao carregar o perfil.</h1>
                <p>Não foi possível encontrar suas informações. Por favor, tente novamente mais tarde.</p>
            </div>
        );
    }

    return (
        <div>
            {notification.message && (
                <div className={`notification ${notification.type}`}>
                    {notification.message}
                </div>
            )}
            <h1 className='apresentacao__conteudo__titulo'>Editar Perfil do Vendedor</h1>
            
            <form onSubmit={handleSubmit} className="form-container">
                
                <div className="form-group">
                    <label>Nome da Loja:</label>
                    <input type="text" name="nome_loja" value={perfil.nome_loja || ''} onChange={handleChange} required />
                </div>
                
                <div className="form-group">
                    <label>CNPJ:</label>
                    <input type="text" name="cnpj" value={perfil.cnpj || ''} onChange={handleChange} />
                </div>
                
                <div className="form-group">
                    <label>Endereço:</label>
                    <input type="text" name="endereco.logradouro" value={perfil.endereco.logradouro || ''} onChange={handleChange} />
                </div>
                
                <div className="form-group">
                    <label>Número:</label>
                    <input type="text" name="endereco.numero" value={perfil.endereco.numero || ''} onChange={handleChange} />
                </div>
                
                <div className="form-group">
                    <label>Complemento:</label>
                    <input type="text" name="endereco.complemento" value={perfil.endereco.complemento || ''} onChange={handleChange} />
                </div>
                
                <div className="form-group">
                    <label>Bairro:</label>
                    <input type="text" name="endereco.bairro" value={perfil.endereco.bairro || ''} onChange={handleChange} />
                </div>
                
                <div className="form-group">
                    <label>Cidade:</label>
                    <input type="text" name="endereco.cidade" value={perfil.endereco.cidade || ''} onChange={handleChange} />
                </div>
                
                <div className="form-group">
                    <label>Estado:</label>
                    <input type="text" name="endereco.estado" value={perfil.endereco.estado || ''} onChange={handleChange} />
                </div>
                
                <div className="form-group">
                    <label>CEP:</label>
                    <input type="text" name="endereco.cep" value={perfil.endereco.cep || ''} onChange={handleChange} />
                </div>
                
                <div className="form-group">
                    <label>Telefone:</label>
                    <input type="text" name="telefone" value={perfil.telefone || ''} onChange={handleChange} />
                </div>
                
                <div className="form-group">
                    <label>Data de Fundação:</label>
                    <input type="date" name="data_fundacao" value={perfil.data_fundacao ? perfil.data_fundacao.split('T')[0] : ''} onChange={handleChange} />
                </div>
                
                <div className="form-group">
                    <label>Horário de Funcionamento:</label>
                    <input type="text" name="horario_funcionamento" value={perfil.horario_funcionamento || ''} onChange={handleChange} />
                </div>
                
                <div className="form-group">
                    <label>Nome do Responsável:</label>
                    <input type="text" name="nome_responsavel" value={perfil.nome_responsavel || ''} onChange={handleChange} />
                </div>
                
                <div className="form-group">
                    <label>CPF do Responsável:</label>
                    <input type="text" name="cpf_responsavel" value={perfil.cpf_responsavel || ''} onChange={handleChange} />
                </div>
                
                <div className="form-group">
                    <label>Breve Descrição da Loja:</label>
                    <textarea name="breve_descricao_loja" value={perfil.breve_descricao_loja || ''} onChange={handleChange}></textarea>
                </div>
                
                <div className="form-group">
                    <label>Logotipo da Loja (URL):</label>
                    <input type="text" name="logotipo_loja" value={perfil.logotipo_loja || ''} onChange={handleChange} />
                </div>
                
                <div className="form-group">
                    <label>Website/Redes Sociais:</label>
                    <input type="text" name="site_redes_sociais" value={perfil.site_redes_sociais || ''} onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label>Categoria da Loja:</label>
                    <select name="categoria_loja" value={perfil.categoria_loja || ''} onChange={handleChange} required>
                        <option value="">Selecione uma categoria</option>
                        {categorias.map(cat => (
                            <option key={cat.id} value={cat.id}>
                                {cat.nome}
                            </option>
                        ))}
                    </select>
                </div>
                <button type="submit" className="btn btn-primary">Salvar Alterações</button>
            </form>
        </div>
    );
};

export default EditarPerfilVendedor;