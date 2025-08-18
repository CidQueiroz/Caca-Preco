
const db = require('../config/db');

const Endereco = {
  create: async (logradouro, numero, complemento, bairro, cidade, estado, cep) => {
    const [result] = await db.query(
      'INSERT INTO ENDERECO (Logradouro, Numero, Complemento, Bairro, Cidade, Estado, CEP) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [logradouro, numero, complemento, bairro, cidade, estado, cep]
    );
    return result.insertId;
  },

  findById: async (idEndereco) => {
    const [rows] = await db.query('SELECT * FROM ENDERECO WHERE ID_Endereco = ?', [idEndereco]);
    return rows[0];
  }
};

module.exports = Endereco;
