const express = require('express');
const cors = require('cors');
require('dotenv').config();
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes'); // Importar rotas de categoria
const monitorRoutes = require('./routes/monitorRoutes'); // Importar rotas de monitoramento
const dashboardRoutes = require('./routes/dashboardRoutes');


const app = express();

app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use((req, res, next) => {
  console.log(`Requisição recebida: ${req.method} ${req.url}`);
  next();
});

// Montar as rotas
app.use('/autenticacao', authRoutes);
app.use('/usuarios', userRoutes);
app.use('/produtos', productRoutes);
app.use('/', categoryRoutes);
app.use('/monitor', monitorRoutes); // Montar rotas de monitoramento
app.use('/dashboard', dashboardRoutes);


module.exports = app;
