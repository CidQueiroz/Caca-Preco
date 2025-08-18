require('dotenv').config(); // Adicione esta linha no topo

module.exports = {
  PORT: process.env.PORT || 5000,
  DB_HOST: process.env.DB_HOST,
  DB_PORT: process.env.DB_PORT,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1h',
};