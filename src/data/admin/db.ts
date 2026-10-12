/**
 * F.Horn Self Storage — MariaDB connection pool.
 *
 * Uses mysql2/promise with a lazy-initialized singleton pool.
 * Environment variables are loaded automatically by Astro in the main app.
 * For standalone scripts (migrate, seed), use `import 'dotenv/config'` first.
 */

import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 3306,
      database: process.env.DB_NAME || 'fhorn_db',
      user: process.env.DB_USER || 'fhorn_db',
      password: process.env.DB_PASSWORD || '',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
  }
  return pool;
}
