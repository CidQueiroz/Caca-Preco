const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
}).promise(); // Adiciona .promise() aqui

pool.getConnection()
    .then(connection => {
        console.log('Conectado ao banco de dados MySQL via pool.');
        connection.release(); // Libera a conexão de volta para o pool
    })
    .catch(err => {
        console.error('Erro ao conectar ao banco de dados via pool:', err);
    });

module.exports = pool;