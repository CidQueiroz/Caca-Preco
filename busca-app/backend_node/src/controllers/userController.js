const Client = require('../models/client');
const Seller = require('../models/seller');
const User = require('../models/user');
const Endereco = require('../models/Endereco');

exports.registrarCliente = async (req, res) => {
    const { idUsuario, nome, telefone, cpf, dataNascimento, endereco } = req.body;

    if (!idUsuario || !nome || !cpf || !endereco) {
        return res.status(400).json({ message: 'Campos obrigatórios faltando.' });
    }

    try {
        const clienteExistente = await Client.findByUserId(idUsuario);
        if (clienteExistente) {
            return res.status(409).json({ message: 'Cliente já cadastrado.' });
        }

        const { logradouro, numero, complemento, bairro, cidade, estado, cep } = endereco;
        const idEndereco = await Endereco.create(logradouro, numero, complemento, bairro, cidade, estado, cep);

        await Client.create(idUsuario, nome, telefone, idEndereco, cpf, dataNascimento);

        const usuario = await User.findById(idUsuario);
        const usuarioAtivo = usuario ? usuario.Ativo : false;

        res.status(201).json({ message: 'Cadastro de cliente realizado com sucesso.', usuarioAtivo });
    } catch (error) {
        console.error('Erro no cadastro de cliente:', error);
        res.status(500).json({ error: 'Erro ao cadastrar cliente.' });
    }
};

exports.registrarVendedor = async (req, res) => {
    let corpoRequisicao = req.body;
    if (typeof corpoRequisicao.body === 'string') {
        try {
            corpoRequisicao = JSON.parse(corpoRequisicao.body);
        } catch (e) {
            console.error('Erro ao parsear JSON do body:', e);
            return res.status(400).json({ message: 'Formato de requisição inválido.' });
        }
    }

    const {
        idUsuario, nomeLoja, cnpj, telefone, fundacao, horarioFuncionamento,
        nomeResponsavel, cpf_Responsavel, breveDescricaoLoja, logotipoLoja, websiteRedesSociais, id_categorialoja, endereco
    } = corpoRequisicao;

    if (!idUsuario || !nomeLoja || !id_categorialoja || !endereco) {
        return res.status(400).json({ message: 'Campos obrigatórios faltando.' });
    }

    try {
        const vendedorExistente = await Seller.findByUserId(idUsuario);
        if (vendedorExistente) {
            return res.status(409).json({ message: 'Vendedor já cadastrado.' });
        }

        const { logradouro, numero, complemento, bairro, cidade, estado, cep } = endereco;
        const idEndereco = await Endereco.create(logradouro, numero, complemento, bairro, cidade, estado, cep);

        await Seller.create(idUsuario, nomeLoja, cnpj, idEndereco, telefone, fundacao, horarioFuncionamento, nomeResponsavel, cpf_Responsavel, breveDescricaoLoja, logotipoLoja, websiteRedesSociais, id_categorialoja);

        const usuario = await User.findById(idUsuario);
        const usuarioAtivo = usuario ? usuario.Ativo : false;

        res.status(201).json({ message: 'Cadastro de vendedor realizado com sucesso.', usuarioAtivo });
    } catch (error) {
        console.error('Erro no cadastro de vendedor:', error);
        res.status(500).json({ error: 'Erro ao cadastrar vendedor.' });
    }
};

exports.obterPerfil = async (req, res) => {
    try {
        console.log('--- Início obterPerfil ---');
        console.log('req.user no obterPerfil:', req.user);
        const idUsuario = req.user.id;
        const tipoUsuario = req.user.tipo;
        console.log('Tentando buscar perfil para idUsuario:', idUsuario, 'tipo:', tipoUsuario);

        let dadosPerfil;

        if (tipoUsuario.toLowerCase() === 'cliente') {
            dadosPerfil = await Client.findByUserId(idUsuario);
            if (!dadosPerfil) {
                console.log('Perfil de cliente não encontrado para idUsuario:', idUsuario);
                return res.status(404).json({ message: 'Perfil de cliente não encontrado.' });
            }
            console.log('Perfil de cliente encontrado:', dadosPerfil);
        } else if (tipoUsuario.toLowerCase() === 'vendedor') {
            console.log('Chamando Seller.findByUserId com idUsuario:', idUsuario);
            dadosPerfil = await Seller.findByUserId(idUsuario);
            console.log('Resultado de Seller.findByUserId:', dadosPerfil);
            if (!dadosPerfil) {
                console.log('Perfil de vendedor não encontrado para idUsuario:', idUsuario);
                return res.status(404).json({ message: 'Perfil de vendedor não encontrado.' });
            }
            console.log('Perfil de vendedor encontrado:', dadosPerfil);
        } else {
            console.log('Tipo de usuário desconhecido:', tipoUsuario);
            return res.status(400).json({ message: 'Tipo de usuário desconhecido.' });
        }

        console.log('Dados do perfil encontrados (final):', dadosPerfil);
        res.status(200).json(dadosPerfil);

    } catch (error) {
        console.error('Erro ao buscar perfil (controller):', error);
        res.status(500).json({ error: 'Erro ao buscar perfil.' });
    }
};

exports.getSellerRatings = async (req, res) => {
    if (req.user.tipo.toLowerCase() !== 'vendedor') {
        console.log('Acesso negado para getSellerRatings: Tipo de usuário não é vendedor.');
        return res.status(403).json({ message: 'Acesso negado. Apenas vendedores podem visualizar suas avaliações.' });
    }

    try {
        console.log('--- Início getSellerRatings ---');
        const idUsuario = req.user.id;
        console.log('Tentando buscar avaliações para idUsuario:', idUsuario);
        const vendedor = await Seller.findByUserId(idUsuario);
        if (!vendedor) {
            console.log('Vendedor não encontrado para idUsuario:', idUsuario);
            return res.status(404).json({ message: 'Vendedor não encontrado.' });
        }
        console.log('Vendedor encontrado para avaliações:', vendedor);

        const avaliacoes = await Seller.getRatings(vendedor.ID_Vendedor);
        console.log('Avaliações encontradas:', avaliacoes);
        res.status(200).json(avaliacoes);

    } catch (error) {
        console.error('Erro ao buscar avaliações (controller):', error);
        res.status(500).json({ error: 'Erro ao buscar avaliações.' });
    }
};

exports.indicateSeller = async (req, res) => {
    const { nomeIndicado, emailIndicado, telefoneIndicado, mensagem } = req.body;
    const idUsuario = req.user.id;
    const tipoUsuario = req.user.tipo;

    if (!nomeIndicado || !emailIndicado) {
        return res.status(400).json({ message: 'Nome e e-mail do indicado são obrigatórios.' });
    }

    try {
        let idCliente = null;
        let idVendedor = null;

        if (tipoUsuario === 'Cliente') {
            const cliente = await Client.findByUserId(idUsuario);
            if (cliente) idCliente = cliente.ID_Cliente;
        } else if (tipoUsuario === 'Vendedor') {
            const vendedor = await Seller.findByUserId(idUsuario);
            if (vendedor) idVendedor = vendedor.ID_Vendedor;
        }

        await Seller.createIndication(idCliente, idVendedor, nomeIndicado, emailIndicado, telefoneIndicado, mensagem);

        res.status(201).json({ message: 'Indicação enviada com sucesso!' });

    } catch (error) {
        console.error('Erro ao indicar vendedor:', error);
        res.status(500).json({ error: 'Erro ao enviar indicação.' });
    }
};

exports.updateSellerProfile = async (req, res) => {
    if (req.user.tipo.toLowerCase() !== 'vendedor') {
        return res.status(403).json({ message: 'Acesso negado. Apenas vendedores podem atualizar seus dados.' });
    }

    const idUsuario = req.user.id;
    const { nomeLoja, cnpj, telefone, fundacao, horarioFuncionamento, nomeResponsavel, cpf_Responsavel, breveDescricaoLoja, logotipoLoja, websiteRedesSociais, id_categorialoja } = req.body;

    try {
        const vendedor = await Seller.findByUserId(idUsuario);
        if (!vendedor) {
            return res.status(404).json({ message: 'Vendedor não encontrado.' });
        }

        const idVendedor = vendedor.ID_Vendedor;

        await Seller.update(idVendedor, { nomeLoja, cnpj, telefone, fundacao, horarioFuncionamento, nomeResponsavel, cpf_Responsavel, breveDescricaoLoja, logotipoLoja, websiteRedesSociais, id_categorialoja });

        res.status(200).json({ message: 'Perfil do vendedor atualizado com sucesso!' });

    } catch (error) {
        console.error('Erro ao atualizar perfil do vendedor:', error);
        res.status(500).json({ error: 'Erro ao atualizar perfil do vendedor.' });
    }
};

exports.submitSuggestion = async (req, res) => {
    const { suggestion } = req.body;
    const idUsuario = req.user.id;
    const tipoUsuario = req.user.tipo;

    if (!suggestion) {
        return res.status(400).json({ message: 'A sugestão não pode ser vazia.' });
    }

    console.log(`Sugestão recebida de ${tipoUsuario} (ID: ${idUsuario}): ${suggestion}`);
    // Aqui você pode adicionar a lógica para salvar a sugestão em um banco de dados
    // Por enquanto, apenas logamos no console.

    res.status(200).json({ message: 'Sugestão enviada com sucesso!' });
};
