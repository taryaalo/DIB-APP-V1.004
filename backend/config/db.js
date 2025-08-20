const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  port: process.env.PG_PORT || 5432,
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || '',
  database: process.env.PG_DATABASE || 'dib_app_data',
});

pool.on('connect', () => console.log('Database connected'));
pool.on('error', (err) => console.error('Database error', err));

module.exports = pool;
