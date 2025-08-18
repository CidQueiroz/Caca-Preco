const db = require('../config/db');

const Client = {
  create: async (idUsuario, nome, telefone, idEndereco, cpf, dataNascimento) => {
    const [result] = await db.query(
      'INSERT INTO CLIENTE (ID_Usuario, Nome, Telefone, ID_Endereco, CPF, DataNascimento) VALUES (?, ?, ?, ?, ?, ?)',
      [idUsuario, nome, telefone, idEndereco, cpf, dataNascimento]
    );
    return result.insertId;
  },

  findByUserId: async (idUsuario) => {
    const [rows] = await db.query('SELECT * FROM CLIENTE WHERE ID_Usuario = ?', [idUsuario]);
    return rows[0];
  }
};

module.exports = Client;