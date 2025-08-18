const db = require('../config/db');

const Seller = {
  create: async (idUsuario, nomeLoja, cnpj, idEndereco, telefone, fundacao, horarioFuncionamento, nomeResponsavel, cpfResponsavel, breveDescricaoLoja, logotipoLoja, websiteRedesSociais, idCategoriaLoja) => {
    const [result] = await db.query(
      `INSERT INTO VENDEDOR 
      (ID_Usuario, NomeLoja, CNPJ, ID_Endereco, Telefone, Fundacao, HorarioFuncionamento, NomeResponsavel, CPF_Responsavel, BreveDescricaoLoja, LogotipoLoja, WebsiteRedesSociais, ID_CategoriaLoja)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [idUsuario, nomeLoja, cnpj, idEndereco, telefone, fundacao, horarioFuncionamento, nomeResponsavel, cpfResponsavel, breveDescricaoLoja, logotipoLoja, websiteRedesSociais, idCategoriaLoja]
    );
    return result.insertId;
  },

  findByUserId: async (idUsuario) => {
    const [rows] = await db.query('SELECT * FROM VENDEDOR WHERE ID_Usuario = ?', [idUsuario]);
    return rows[0];
  },

  getRatings: async (idVendedor) => {
    const [rows] = await db.query('SELECT * FROM AVALIACAO_LOJA WHERE ID_Vendedor = ?', [idVendedor]);
    return rows;
  },

  createIndication: async (idCliente, idVendedor, nomeIndicado, emailIndicado, telefoneIndicado, mensagem) => {
    const [result] = await db.query(
      'INSERT INTO INDICACAO_VENDEDOR (ID_Cliente, ID_Vendedor, NomeIndicado, EmailIndicado, TelefoneIndicado, Mensagem) VALUES (?, ?, ?, ?, ?, ?)',
      [idCliente, idVendedor, nomeIndicado, emailIndicado, telefoneIndicado, mensagem]
    );
    return result.insertId;
  },

  update: async (idVendedor, updates) => {
    const fields = Object.keys(updates).map(key => `\`${key}\` = ?`).join(', ');
    const values = Object.values(updates);
    const [result] = await db.query(
      `UPDATE VENDEDOR SET ${fields} WHERE ID_Vendedor = ?`,
      [...values, idVendedor]
    );
    return result.affectedRows;
  }
};

module.exports = Seller;