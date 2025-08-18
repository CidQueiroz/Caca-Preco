const User = require('../models/user');
const Client = require('../models/client');
const Seller = require('../models/seller');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

function gerarToken(idUsuario, tipoUsuario) {
    return jwt.sign({ id: idUsuario, tipo: tipoUsuario }, JWT_SECRET, {
        expiresIn: '1h'
    });
}

exports.registrar = async (req, res) => {
    const { email, senha, tipoUsuario } = req.body;

    if (!email || !senha || !tipoUsuario) {
        return res.status(400).json({ message: 'Campos obrigatórios faltando.' });
    }

    try {
        const usuarioExistente = await User.findByEmail(email);
        if (usuarioExistente) {
            return res.status(409).json({ message: 'Usuário já existe.' });
        }

        const idUsuario = await User.create(email, senha, tipoUsuario);

        res.status(201).json({ 
            message: 'Usuário pré-cadastrado com sucesso. Por favor, complete seu perfil.', 
            idUsuario, 
            tipoUsuario 
        });

    } catch (error) {
        console.error('Erro no cadastro:', error);
        res.status(500).json({ error: 'Erro ao cadastrar usuário.' });
    }
};

exports.login = async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
    }

    try {
        const usuario = await User.findByEmail(email);
        if (!usuario) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        if (!usuario.Ativo) {
            return res.status(403).json({ message: 'Conta inativa. Por favor, verifique seu e-mail para ativar a conta.' });
        }

        const senhaCorreta = await User.comparePassword(senha, usuario.Senha);
        if (!senhaCorreta) {
            return res.status(401).json({ message: 'Credenciais inválidas.' });
        }

        // Atualiza o último login
        await User.updateLastLogin(usuario.ID_Usuario);

        let perfilCompleto = true;
        if (usuario.TipoUsuario === 'Cliente') {
            const perfilCliente = await Client.findByUserId(usuario.ID_Usuario);
            if (!perfilCliente) {
                perfilCompleto = false;
            }
        } else if (usuario.TipoUsuario === 'Vendedor') {
            const perfilVendedor = await Seller.findByUserId(usuario.ID_Usuario);
            if (!perfilVendedor) {
                perfilCompleto = false;
            }
        }

        const token = gerarToken(usuario.ID_Usuario, usuario.TipoUsuario.toLowerCase());

        res.status(200).json({ 
            message: 'Login bem-sucedido.', 
            token, 
            idUsuario: usuario.ID_Usuario, 
            tipoUsuario: usuario.TipoUsuario, 
            perfilCompleto: perfilCompleto 
        });

    } catch (error) {
        console.error('Erro durante o login:', error);
        res.status(500).json({ error: 'Erro durante o login.' });
    }
};

exports.verificarEmail = async (req, res) => {
    const { email, tokenConfirmacao } = req.body;

    if (!email || !tokenConfirmacao) {
        return res.status(400).json({ message: 'Email e código de confirmação são obrigatórios.' });
    }

    try {
        const usuario = await User.findByEmail(email);
        if (!usuario) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        if (usuario.TokenConfirmacao !== tokenConfirmacao) {
            return res.status(400).json({ message: 'Código de confirmação inválido.' });
        }

        await User.activate(usuario.ID_Usuario);

        res.status(200).json({ message: 'Email verificado e conta ativada com sucesso!' });

    } catch (error) {
        console.error('Erro na verificação de email:', error);
        res.status(500).json({ error: 'Erro ao verificar email.' });
    }
};

exports.reenviarCodigoVerificacao = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ message: 'Email é obrigatório.' });
    }

    try {
        const usuario = await User.findByEmail(email);
        if (!usuario) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        if (usuario.Ativo) {
            return res.status(400).json({ message: 'Sua conta já está ativa.' });
        }

        const novoToken = '123456'; // Código fixo para desenvolvimento
        await User.updateTokenConfirmation(email, novoToken);

        res.status(200).json({ message: 'Um novo código de verificação foi enviado para o seu email.' });

    } catch (error) {
        console.error('Erro ao reenviar código de verificação:', error);
        res.status(500).json({ error: 'Erro ao reenviar código de verificação.' });
    }
};