const db = require("../config/db");

class Product {
  static async create(data) {
    const query = `
      INSERT INTO tbProducto (
         cCodPrd, cDesPrd, nUnitPrd, nMinPrd, nMaxPrd, dAltPrd, dUltPrd,
          nLinPrd, nCosPrd, nPrePrd, nInvIPrd, nInvAPrd,nUltPrd,
          cPosPrd, cPtePrd, cPrv1Prd, cPrv2Prd
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = Object.values(data);
    return db.execute(query, values);
  }

  static async getAll() {
    const query = "SELECT * FROM tbProducto";
    return db.execute(query);
  }
}

module.exports = Product;
