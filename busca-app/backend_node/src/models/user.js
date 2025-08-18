const db = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
  create: async (email, senha, tipoUsuario) => {
    const hash = await bcrypt.hash(senha, 10);
    const tokenConfirmacao = '123456'; // Token fixo para desenvolvimento
    const [result] = await db.query(
      'INSERT INTO USUARIO (Email, Senha, TipoUsuario, Ativo, EmailConfirmado, TokenConfirmacao) VALUES (?, ?, ?, ?, ?, ?)',
      [email, hash, tipoUsuario, false, false, tokenConfirmacao]
    );
    return result.insertId;
  },

  findByEmail: async (email) => {
    const [rows] = await db.query('SELECT * FROM USUARIO WHERE Email = ?', [email]);
    return rows[0];
  },

  findById: async (id) => {
    const [rows] = await db.query('SELECT * FROM USUARIO WHERE ID_Usuario = ?', [id]);
    return rows[0];
  },

  comparePassword: (senha, hash) => {
    return bcrypt.compare(senha, hash);
  },

  activate: async (id) => {
    await db.query(
      'UPDATE USUARIO SET EmailConfirmado = ?, Ativo = ?, TokenConfirmacao = NULL WHERE ID_Usuario = ?',
      [true, true, id]
    );
  },

  updateTokenConfirmation: async (email, novoToken) => {
    await db.query(
      'UPDATE USUARIO SET TokenConfirmacao = ? WHERE Email = ?',
      [novoToken, email]
    );
  },

  updateLastLogin: async (id) => {
    await db.query(
      'UPDATE USUARIO SET UltimoLogin = CURRENT_TIMESTAMP WHERE ID_Usuario = ?',
      [id]
    );
  }
};

module.exports = User;