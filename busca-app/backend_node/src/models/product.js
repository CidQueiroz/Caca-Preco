const db = require('../config/db');

const Product = {
  // Adiciona um produto completo com suas variações
  addComplete: async (productData) => {
    const { idVendedor, nomeProduto, descricao, idSubcategoria, variacoes } = productData;

    // Insere o produto base
    const [produtoResult] = await db.query(
      'INSERT INTO PRODUTO (ID_Vendedor, NomeProduto, Descricao, ID_Subcategoria) VALUES (?, ?, ?, ?)',
      [idVendedor, nomeProduto, descricao, idSubcategoria]
    );
    const idProduto = produtoResult.insertId;

    // Insere as variações do produto
    for (const variacao of variacoes) {
      const { nomeVariacao, valorVariacao, preco, quantidadeDisponivel } = variacao;
      await db.query(
        'INSERT INTO VARIACAO_PRODUTO (ID_Produto, NomeVariacao, ValorVariacao, Preco, QuantidadeDisponivel) VALUES (?, ?, ?, ?, ?)',
        [idProduto, nomeVariacao, valorVariacao, preco, quantidadeDisponivel]
      );
    }

    return { idProduto };
  },

  // Busca todos os produtos (exemplo simples)
  getAll: async () => {
    const [rows] = await db.query(`
      SELECT p.NomeProduto, p.Descricao, v.NomeVariacao, v.ValorVariacao, v.Preco, vend.NomeLoja 
      FROM PRODUTO p
      JOIN VARIACAO_PRODUTO v ON p.ID_Produto = v.ID_Produto
      JOIN VENDEDOR vend ON p.ID_Vendedor = vend.ID_Vendedor
    `);
    return rows;
  },

  // Atualiza um produto e sua oferta
  update: async (idProduto, idVariacao, idVendedor, updates) => {
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Separa os campos que pertencem à tabela PRODUTO e OFERTA_PRODUTO
      const { NomeProduto, Descricao, Preco, QuantidadeDisponivel } = updates;

      const camposProduto = {};
      if (NomeProduto !== undefined) camposProduto.NomeProduto = NomeProduto;
      if (Descricao !== undefined) camposProduto.Descricao = Descricao;

      if (Object.keys(camposProduto).length > 0) {
        await connection.query(
          'UPDATE PRODUTO SET ? WHERE ID_Produto = ?',
          [camposProduto, idProduto]
        );
      }

      const camposOferta = {};
      if (Preco !== undefined) camposOferta.Preco = Preco;
      if (QuantidadeDisponivel !== undefined) camposOferta.QuantidadeDisponivel = QuantidadeDisponivel;

      if (Object.keys(camposOferta).length > 0) {
        await connection.query(
          'UPDATE OFERTA_PRODUTO SET ? WHERE ID_Variacao = ? AND ID_Vendedor = ?',
          [camposOferta, idVariacao, idVendedor]
        );
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      console.error("Erro ao atualizar o produto no modelo:", error);
      throw error;
    } finally {
      connection.release();
    }
  }
};

module.exports = Product;