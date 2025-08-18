const db = require('../config/db');

exports.addUrlToMonitor = async (req, res) => {
    if (req.user.tipo.toLowerCase() !== 'vendedor') {
        return res.status(403).json({ message: 'Acesso negado. Apenas vendedores podem monitorar URLs.' });
    }

    const { url } = req.body;
    const idUsuario = req.user.id; // ID do usuário logado
    let connection; // Declarar a conexão aqui

    if (!url) {
        return res.status(400).json({ message: 'URL é obrigatória.' });
    }

    try {
        connection = await db.getConnection(); // Obter a conexão
        await connection.beginTransaction(); // Iniciar a transação

        // Buscar o ID_Vendedor a partir do ID_Usuario
        const [vendedor] = await connection.execute('SELECT ID_Vendedor FROM VENDEDOR WHERE ID_Usuario = ?', [idUsuario]);
        if (!vendedor || vendedor.length === 0) {
            await connection.rollback();
            return res.status(403).json({ message: 'Vendedor não encontrado ou perfil incompleto.' });
        }
        const idVendedor = vendedor[0].ID_Vendedor;

        console.log(`Vendedor ${idVendedor} (ID_Usuario: ${idUsuario}) solicitou monitoramento para a URL: ${url}`);

        // Dados fictícios para simular o resultado do scraping
        const precoFicticio = (Math.random() * (100 - 10) + 10).toFixed(2);
        const nomeProdutoFicticio = `Produto Fictício da URL: ${url.substring(0, 30)}...`;
        const dataColeta = new Date();

        // Inserir no banco de dados
        await connection.execute(
            'INSERT INTO PRODUTOS_MONITORADOS_EXTERNOS (ID_Vendedor, URL_Produto, Nome_Produto, Preco_Atual, Ultima_Coleta) VALUES (?, ?, ?, ?, ?)',
            [idVendedor, url, nomeProdutoFicticio, precoFicticio, dataColeta]
        );
        console.log(`Dados da URL ${url} armazenados no banco de dados para o vendedor ${idVendedor}.`);

        await connection.commit(); // Confirmar a transação

        res.status(200).json({
            message: 'URL recebida para monitoramento. Dados fictícios retornados e armazenados.',
            nomeProduto: nomeProdutoFicticio,
            preco: precoFicticio,
            dataColeta: dataColeta,
        });

    } catch (error) {
        if (connection) {
            await connection.rollback(); // Reverter a transação em caso de erro
        }
        console.error('Erro ao armazenar dados da URL:', error);
        res.status(500).json({ error: 'Falha ao monitorar o produto. Tente novamente.' });
    } finally {
        if (connection) {
            connection.release(); // Liberar a conexão
        }
    }
};

