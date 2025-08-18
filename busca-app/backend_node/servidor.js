const fs = require('fs');
const path = require('path');

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

const app = require('./src/app'); // Importar a instância do app

const port = process.env.PORT || 3000;

app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${port}.`);
});
