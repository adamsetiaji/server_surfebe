// models/Recaptcha.js
let dbPool;

const initDb = async () => {
  dbPool = await require('../config/database');
};

initDb();

class Recaptcha {
  static async create(recaptchaData) {
    const { site, site_key } = recaptchaData;
    const [result] = await dbPool.execute(
      'INSERT INTO recaptchas (site, site_key, uuid) VALUES (?, ?, UUID())',
      [site, site_key]
    );
    return result;
  }

  static async findAll() {
    const [rows] = await dbPool.query('SELECT * FROM recaptchas');
    return rows;
  }

  static async findBySiteKey(siteKey) {
    const [rows] = await dbPool.execute(
      'SELECT * FROM recaptchas WHERE site_key = ?',
      [siteKey]
    );
    return rows[0];
  }

  static async updateBySiteKey(siteKey, recaptchaData) {
    const [result] = await dbPool.execute(
      `UPDATE recaptchas SET 
        site = ?,
        g_response = ?,
        status_g_response = ?,
        time_g_response = ?
      WHERE site_key = ?`,
      [
        recaptchaData.site,
        recaptchaData.g_response,
        recaptchaData.status_g_response,
        recaptchaData.time_g_response,
        siteKey
      ]
    );
    return result;
  }

  static async deleteBySiteKey(siteKey) {
    const [result] = await dbPool.execute(
      'DELETE FROM recaptchas WHERE site_key = ?',
      [siteKey]
    );
    return result;
  }
}

module.exports = Recaptcha;