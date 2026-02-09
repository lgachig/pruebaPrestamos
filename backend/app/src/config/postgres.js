const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  user: process.env.DB_USER || 'admin',      // 👈 Asegúrate que coincida con tu docker-compose
  password: process.env.DB_PASSWORD || 'admin123',
  database: process.env.DB_NAME || 'loansdb',
  port: 5432,
});

pool.on('connect', () => {
  console.log('✅ PostgreSQL conectado');
});

module.exports = pool;