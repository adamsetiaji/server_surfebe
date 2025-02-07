// config/database.js
const mysql = require('mysql2');
require('dotenv').config();

const initDatabase = async () => {
  try {
    // Initial connection without database
    const pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost', 
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    }).promise();

    await pool.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);

    // Create new pool with database
    const dbPool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    }).promise();

    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT(11) AUTO_INCREMENT PRIMARY KEY,
        uuid CHAR(36),
        name VARCHAR(255),
        email VARCHAR(255),
        password_surfebe VARCHAR(255),
        cookieSurfebe TEXT,
        secret2faSurfebe VARCHAR(255),
        userIdSurfebe VARCHAR(255),
        balanceSurfebe DECIMAL(16,8),
        isRegisterSurfebe TINYINT(1) DEFAULT 0,
        isLoginSurfebe TINYINT(1) DEFAULT 0,
        payeerAccount VARCHAR(255),
        payeerPassword VARCHAR(255),
        payeerMasterKey VARCHAR(255),
        payeerSecretKey VARCHAR(255),
        payeerBalance DECIMAL(16,8),
        payeerCookie TEXT,
        isRegisterPayeer TINYINT(1) DEFAULT 0,
        isLoginPayeer TINYINT(1) DEFAULT 0,
        isRunning TINYINT(1) DEFAULT 0,
        message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await dbPool.query(`
      CREATE TABLE IF NOT EXISTS recaptchas (
        id INT(11) AUTO_INCREMENT PRIMARY KEY,
        uuid CHAR(36),
        site VARCHAR(255),
        site_key VARCHAR(255),
        g_response LONGTEXT,
        status_g_response TINYINT(1) DEFAULT 0,
        time_g_response TIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    console.log('Database and tables initialized successfully');
    return dbPool;
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

module.exports = initDatabase();