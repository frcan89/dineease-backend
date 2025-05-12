// models/User.js
const db = require('../config/database');

class User {
  static async findAll() {
    const query = 'SELECT * FROM usuario';
    const rows = await db.query(query);
    return rows;
  }

  // Otros métodos del modelo
}

module.exports = User;
