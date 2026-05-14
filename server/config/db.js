const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for Neon/managed PostgreSQL
  },
});

pool.on('connect', () => {
  console.log('[DATABASE] Connection established');
});

pool.on('error', (err) => {
  console.error('[DATABASE] Unexpected error on idle client', err);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
