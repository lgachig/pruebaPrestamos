const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || process.env.PG_HOST || 'postgres',
  user: process.env.DB_USER || process.env.PG_USER || 'admin',
  password: process.env.DB_PASSWORD || process.env.PG_PASSWORD || 'admin123',
  database: process.env.DB_NAME || process.env.PG_DATABASE || 'loansdb',
  port: parseInt(process.env.PG_PORT, 10) || 5432,
});

pool.on('connect', () => {
  console.log('✅ PostgreSQL conectado');
});

module.exports = pool;