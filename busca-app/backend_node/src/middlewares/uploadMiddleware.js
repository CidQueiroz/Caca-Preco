const multer = require('multer');
const path = require('path');
const iconv = require('iconv-lite');

// Configuração de armazenamento
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Onde os arquivos serão salvos
    },
    filename: (req, file, cb) => {
        const decodedFilename = iconv.decode(Buffer.from(file.originalname, 'binary'), 'utf-8');
        cb(null, Date.now() + '-' + decodedFilename); // Nome do arquivo
    }
});

// Filtro para aceitar apenas imagens
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Apenas imagens são permitidas!'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 5 } // Limite de 5MB
});

module.exports = upload;
