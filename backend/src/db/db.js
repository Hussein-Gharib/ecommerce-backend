const { Pool } = require('pg');


const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});


pool.on('connect', () => {
  console.log('✅ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.log('❌ PostgreSQL connection error:', err.message);
});


const query = (text, params) => {
  return pool.query(text, params);
};

module.exports = {
  pool,
  query,
};
