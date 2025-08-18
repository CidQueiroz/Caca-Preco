const db = require('../config/db');

const Category = {
  getAll: async () => {
    const [rows] = await db.query('SELECT ID_CategoriaLoja, NomeCategoria, Descricao FROM CATEGORIA_LOJA');
    return rows;
  },

  getAllSubcategories: async () => {
    const [rows] = await db.query('SELECT ID_Subcategoria, NomeSubcategoria FROM subcategoria_produto');
    return rows;
  }
};

module.exports = Category;
