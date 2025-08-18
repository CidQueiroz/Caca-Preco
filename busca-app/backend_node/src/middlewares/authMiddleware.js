const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

exports.verifyToken = (req, res, next) => {
    console.log("--- EXECUTANDO verifyToken ---");
    const authHeader = req.headers['authorization'];
    console.log("Cabeçalho de Autorização:", authHeader);

    if (!authHeader) {
        console.log("Token não fornecido (cabeçalho ausente).");
        return res.status(401).json({ message: 'Token não fornecido.' });
    }

    const token = authHeader.split(' ')[1];
    console.log("Token extraído:", token);

    if (!token) {
        console.log("Token não fornecido (formato inválido).");
        return res.status(401).json({ message: 'Token não fornecido.' });
    }

    if (!JWT_SECRET) {
        console.error("ERRO CRÍTICO: JWT_SECRET não está definido no ambiente!");
        return res.status(500).json({ message: 'Erro interno do servidor.' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error("Erro na verificação do JWT:", err);
            return res.status(403).json({ message: 'Token inválido.' });
        }
        console.log("Token decodificado com sucesso:", decoded);
        req.user = decoded;
        next();
    });
};