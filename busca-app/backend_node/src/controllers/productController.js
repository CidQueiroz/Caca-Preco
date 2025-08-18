const db = require('../config/db');
const ProductModel = require('../models/product');

exports.getProducts = async (req, res) => {
    const { q } = req.query;

    try {
        let query = 'SELECT * FROM PRODUTO';
        const params = [];

        if (q) {
            query += ' WHERE NomeProduto LIKE ?';
            params.push(`%${q}%`);
        }

        const [products] = await db.promise().query(query, params);
        res.status(200).json(produtos);

    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        res.status(500).json({ error: 'Erro ao buscar produtos.' });
    }
};

exports.addProduct = async (req, res) => {
    if (req.user.tipo !== 'vendedor') {
        return res.status(403).json({ message: 'Acesso negado. Apenas vendedores podem adicionar produtos.' });
    }

    const { nomeProduto, descricao, preco, idCategoria, estoque } = req.body;
    const idVendedor = req.user.id;

    if (!nomeProduto || !preco || !idCategoria) {
        return res.status(400).json({ message: 'Campos obrigatórios faltando.' });
    }

    try {
        await db.promise().query(
            'INSERT INTO PRODUTO (ID_Vendedor, NomeProduto, Descricao, Preco, ID_Categoria, Estoque) VALUES (?, ?, ?, ?, ?, ?)',
            [idVendedor, nomeProduto, descricao, preco, idCategoria, estoque]
        );

        res.status(201).json({ message: 'Produto adicionado com sucesso.' });

    } catch (error) {
        console.error('Erro ao adicionar produto:', error);
        res.status(500).json({ error: 'Erro ao adicionar produto.' });
    }
};

exports.addCompleteProduct = async (req, res) => {
    console.log("--- INICIANDO addCompleteProduct ---");
    console.log("req.body recebido:", JSON.stringify(req.body, null, 2));
    console.log("req.files recebido:", req.files);

    if (req.user.tipo.toLowerCase() !== 'vendedor') {
        return res.status(403).json({ message: 'Acesso negado. Apenas vendedores podem adicionar produtos.' });
    }

    let { nomeProduto, descricao, idSubcategoria } = req.body;
    let { variacoes } = req.body; // Pega as variações do corpo
    const imagens = req.files; // Arquivos de upload
    let connection;

    try {
        // Garante que 'variacoes' seja sempre um array para um processamento consistente
        if (variacoes && !Array.isArray(variacoes)) {
            variacoes = [variacoes];
        }

        if (!nomeProduto || !idSubcategoria || !variacoes || variacoes.length === 0) {
            console.log("Erro de validação: Dados do produto ou variações estão faltando.");
            return res.status(400).json({ message: 'Dados do produto ou variações estão faltando.' });
        }

        console.log("Variações prontas para processar:", variacoes);

        connection = await db.getConnection();
        await connection.beginTransaction();

        const [vendedor] = await connection.execute('SELECT ID_Vendedor FROM VENDEDOR WHERE ID_Usuario = ?', [req.user.id]);
        if (vendedor.length === 0) {
            await connection.rollback();
            return res.status(403).json({ message: 'Vendedor não encontrado ou perfil incompleto.' });
        }
        const idVendedor = vendedor[0].ID_Vendedor;

        const [produtoResult] = await connection.execute(
            'INSERT INTO PRODUTO (NomeProduto, Descricao, ID_Subcategoria) VALUES (?, ?, ?)',
            [nomeProduto, descricao, idSubcategoria]
        );
        const idProduto = produtoResult.insertId;
        console.log(`Produto base inserido com ID: ${idProduto}`);

        let imagemIndex = 0;

        for (const variacaoData of variacoes) {
            const { nomeVariacao, valorVariacao, preco, quantidadeDisponivel, imagens: imagensInfo } = variacaoData;

            const [variacaoResult] = await connection.execute(
                'INSERT INTO VARIACAO_PRODUTO (ID_Produto, NomeVariacao, ValorVariacao) VALUES (?, ?, ?)',
                [idProduto, nomeVariacao, valorVariacao]
            );
            const idVariacao = variacaoResult.insertId;
            console.log(`Variação inserida com ID: ${idVariacao}`);

            await connection.execute(
                'INSERT INTO OFERTA_PRODUTO (ID_Vendedor, ID_Variacao, Preco, QuantidadeDisponivel) VALUES (?, ?, ?, ?)',
                [idVendedor, idVariacao, preco, quantidadeDisponivel]
            );
            console.log(`Oferta inserida para a variação ID: ${idVariacao}`);

            // Verifica se foi enviada uma URL de imagem
            if (imagensInfo && typeof imagensInfo[0] === 'string' && imagensInfo[0].startsWith('http')) {
                await connection.execute(
                    'INSERT INTO IMAGEM_VARIACAO (ID_Variacao, URL_Imagem) VALUES (?, ?)',
                    [idVariacao, imagensInfo[0]]
                );
            } 
            // Verifica se foi enviado um arquivo de upload
            else if (imagens && imagemIndex < imagens.length) {
                const imagem = imagens[imagemIndex];
                const caminhoImagem = imagem.path.replace(/\\/g, '/');
                await connection.execute(
                    'INSERT INTO IMAGEM_VARIACAO (ID_Variacao, URL_Imagem) VALUES (?, ?)',
                    [idVariacao, caminhoImagem]
                );
                imagemIndex++;
            }
        }

        await connection.commit();
        console.log("--- COMMIT DA TRANSAÇÃO ---");
        res.status(201).json({ message: 'Produto e suas ofertas cadastrados com sucesso!' });

    } catch (error) {
        if (connection) {
            console.log("--- ROLLBACK DA TRANSAÇÃO ---");
            await connection.rollback();
        }
        console.error('Erro detalhado ao cadastrar produto completo:', error);
        res.status(500).json({ error: 'Falha ao cadastrar o produto. Tente novamente.' });
    } finally {
        if (connection) {
            connection.release();
            console.log("--- CONEXÃO LIBERADA ---");
        }
    }
};

exports.getSellerProducts = async (req, res) => {
    console.log("--- INICIANDO getSellerProducts ---");
    if (req.user.tipo.toLowerCase() !== 'vendedor') {
        return res.status(403).json({ message: 'Acesso negado. Apenas vendedores podem visualizar seus produtos.' });
    }

    const { idCategoria } = req.query;
    console.log(`Filtrando pela categoria ID: ${idCategoria || 'Nenhuma'}`);

    let connection;
    try {
        connection = await db.getConnection();
        console.log("Conexão com o banco de dados obtida.");

        const [vendedor] = await connection.execute('SELECT ID_Vendedor FROM VENDEDOR WHERE ID_Usuario = ?', [req.user.id]);
        if (vendedor.length === 0) {
            console.log("Vendedor não encontrado para o usuário ID:", req.user.id);
            return res.status(404).json({ message: 'Vendedor não encontrado.' });
        }
        const idVendedor = vendedor[0].ID_Vendedor;
        console.log(`Vendedor encontrado com ID: ${idVendedor}`);

        let query = `
            SELECT 
                p.ID_Produto,
                p.NomeProduto,
                p.Descricao,
                vp.ID_Variacao,
                vp.NomeVariacao,
                vp.ValorVariacao,
                op.Preco,
                op.QuantidadeDisponivel,
                c.NomeCategoria,
                ip.URL_Imagem
            FROM PRODUTO p
            JOIN VARIACAO_PRODUTO vp ON p.ID_Produto = vp.ID_Produto
            JOIN OFERTA_PRODUTO op ON vp.ID_Variacao = op.ID_Variacao
            LEFT JOIN SUBCATEGORIA_PRODUTO sc ON p.ID_Subcategoria = sc.ID_Subcategoria
            LEFT JOIN CATEGORIA_LOJA c ON sc.ID_CategoriaLoja = c.ID_CategoriaLoja
            LEFT JOIN IMAGEM_VARIACAO ip ON vp.ID_Variacao = ip.ID_Variacao
            WHERE op.ID_Vendedor = ?
        `;

        const params = [idVendedor];

        if (idCategoria) {
            query += ' AND c.ID_CategoriaLoja = ?';
            params.push(idCategoria);
        }

        query += ' ORDER BY p.NomeProduto, vp.NomeVariacao;';
        console.log("Executando a query:", query);
        console.log("Com os parâmetros:", params);

        const [produtos] = await connection.execute(query, params);
        console.log(`Query executada com sucesso. ${produtos.length} produtos encontrados.`);

        res.status(200).json(produtos);

    } catch (error) {
        console.error('Erro detalhado ao buscar produtos do vendedor:', error);
        res.status(500).json({ error: 'Falha ao buscar produtos. Tente novamente.' });
    } finally {
        if (connection) {
            connection.release();
            console.log("--- CONEXÃO LIBERADA (getSellerProducts) ---");
        }
    }
};

exports.updateProduct = async (req, res) => {
    if (req.user.tipo.toLowerCase() !== 'vendedor') {
        return res.status(403).json({ message: 'Acesso negado. Apenas vendedores podem atualizar produtos.' });
    }

    const { idProduto } = req.params;
    const { idVariacao, ...updates } = req.body; // idVariacao é necessário para atualizar a oferta
    const idUsuario = req.user.id;

    if (!idVariacao) {
        return res.status(400).json({ message: 'ID da variação é obrigatório para atualização.' });
    }

    try {
        // Verificar se o produto pertence ao vendedor logado
        const connection = await db.getConnection();
        const [vendedor] = await connection.execute('SELECT ID_Vendedor FROM VENDEDOR WHERE ID_Usuario = ?', [idUsuario]);
        if (vendedor.length === 0) {
            connection.release();
            return res.status(404).json({ message: 'Vendedor não encontrado.' });
        }
        const idVendedor = vendedor[0].ID_Vendedor;

        const [productOwner] = await connection.execute(
            'SELECT op.ID_Vendedor FROM OFERTA_PRODUTO op WHERE op.ID_Variacao = ? AND op.ID_Vendedor = ?',
            [idVariacao, idVendedor]
        );

        if (productOwner.length === 0) {
            connection.release();
            return res.status(403).json({ message: 'Você não tem permissão para editar este produto.' });
        }
        connection.release();

        await ProductModel.update(idProduto, idVariacao, idVendedor, updates);

        res.status(200).json({ message: 'Produto atualizado com sucesso!' });

    } catch (error) {
        console.error('Erro ao atualizar produto:', error);
        res.status(500).json({ error: 'Falha ao atualizar produto. Tente novamente.' });
    }
};

exports.deleteProduct = async (req, res) => {
    if (req.user.tipo.toLowerCase() !== 'vendedor') {
        return res.status(403).json({ message: 'Acesso negado. Apenas vendedores podem excluir produtos.' });
    }

    const { idVariacao } = req.params;
    const idUsuario = req.user.id;

    let connection;
    try {
        connection = await db.getConnection();

        // Verificar se o produto pertence ao vendedor logado
        const [vendedor] = await connection.execute('SELECT ID_Vendedor FROM VENDEDOR WHERE ID_Usuario = ?', [idUsuario]);
        if (vendedor.length === 0) {
            return res.status(404).json({ message: 'Vendedor não encontrado.' });
        }
        const idVendedor = vendedor[0].ID_Vendedor;

        const [productOwner] = await connection.execute(
            'SELECT ID_Vendedor FROM OFERTA_PRODUTO WHERE ID_Variacao = ? AND ID_Vendedor = ?',
            [idVariacao, idVendedor]
        );

        if (productOwner.length === 0) {
            return res.status(403).json({ message: 'Você não tem permissão para excluir esta oferta de produto.' });
        }

        // Excluir a oferta do produto
        await connection.execute('DELETE FROM OFERTA_PRODUTO WHERE ID_Variacao = ? AND ID_Vendedor = ?', [idVariacao, idVendedor]);

        res.status(200).json({ message: 'Oferta de produto excluída com sucesso!' });

    } catch (error) {
        console.error('Erro ao excluir oferta de produto:', error);
        res.status(500).json({ error: 'Falha ao excluir a oferta de produto. Tente novamente.' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
};