// models/User.js
let dbPool;

const initDb = async () => {
  dbPool = await require('../config/database');
};

initDb();

class User {
  static async create(userData) {
    const { name, email, password_surfebe } = userData;
    const [result] = await dbPool.execute(
      'INSERT INTO users (name, email, password_surfebe, payeerPassword, uuid) VALUES (?, ?, ?, ?, UUID())',
      [name, email, password_surfebe, password_surfebe]  // payeerPassword = password_surfebe
    );
    return result;
  }

  static async findAll() {
    const [rows] = await dbPool.query('SELECT * FROM users');
    return rows;
  }

  static async findByEmail(email) {
    const [rows] = await dbPool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0];
  }

  static async updateByEmail(email, userData) {
    const [result] = await dbPool.execute(
      `UPDATE users SET 
        name = ?,
        password_surfebe = ?,
        cookieSurfebe = ?,
        secret2faSurfebe = ?,
        userIdSurfebe = ?,
        balanceSurfebe = ?,
        isRegisterSurfebe = ?,
        isLoginSurfebe = ?,
        payeerAccount = ?,
        payeerPassword = ?,
        payeerMasterKey = ?,
        payeerSecretKey = ?,
        payeerBalance = ?,
        payeerCookie = ?,
        isRegisterPayeer = ?,
        isLoginPayeer = ?,
        isRunning = ?,
        message = ?
      WHERE email = ?`,
      [
        userData.name,
        userData.password_surfebe,
        userData.cookieSurfebe,
        userData.secret2faSurfebe,
        userData.userIdSurfebe,
        userData.balanceSurfebe,
        userData.isRegisterSurfebe,
        userData.isLoginSurfebe,
        userData.payeerAccount,
        userData.payeerPassword,
        userData.payeerMasterKey,
        userData.payeerSecretKey,
        userData.payeerBalance,
        userData.payeerCookie,
        userData.isRegisterPayeer,
        userData.isLoginPayeer,
        userData.isRunning,
        userData.message,
        email
      ]
    );
    return result;
  }

  static async deleteByEmail(email) {
    const [result] = await dbPool.execute(
      'DELETE FROM users WHERE email = ?',
      [email]
    );
    return result;
  }
}

module.exports = User;