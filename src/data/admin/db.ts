/**
 * F.Horn Self Storage — MariaDB connection pool.
 *
 * Uses mysql2/promise with a lazy-initialized singleton pool.
 * Environment variables are loaded automatically by Astro in the main app.
 * For standalone scripts (migrate, seed), use `import 'dotenv/config'` first.
 *
 * Production-ready: connectTimeout, keep-alive, automatic retry on transient errors.
 */

import mysql from 'mysql2/promise';

let pool: mysql.Pool | null = null;

export function getPool(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: import.meta.env?.DB_HOST || process.env.DB_HOST || '',
      port: Number(import.meta.env?.DB_PORT || process.env.DB_PORT) || 3306,
      database: import.meta.env?.DB_NAME || process.env.DB_NAME || '',
      user: import.meta.env?.DB_USER || process.env.DB_USER || '',
      password: import.meta.env?.DB_PASSWORD || process.env.DB_PASSWORD || '',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 10_000,
      enableKeepAlive: true,
      keepAliveInitialDelay: 30_000,
    });
  }
  return pool;
}

/** Transient error codes that justify a retry. */
const RETRIABLE_CODES = new Set([
  'ETIMEDOUT',
  'ECONNRESET',
  'ECONNREFUSED',
  'EPIPE',
  'PROTOCOL_CONNECTION_LOST',
  'ER_CON_COUNT_ERROR',        // too many connections
]);

/**
 * Execute a query with automatic retry on transient network errors.
 * Use this instead of `pool.execute()` directly for production resilience.
 *
 * @param sql  - SQL string
 * @param params - Bound parameters
 * @param maxRetries - Number of retry attempts (default: 2, so 3 total attempts)
 */
export async function query<T = any>(
  sql: string,
  params?: any[],
  maxRetries = 2,
): Promise<[T, any]> {
  const p = getPool();
  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await p.execute<T & mysql.RowDataPacket[]>(sql, params) as [T, any];
    } catch (err: any) {
      lastError = err;
      const code: string = err?.code || '';
      if (!RETRIABLE_CODES.has(code) || attempt === maxRetries) {
        throw err;
      }
      // Exponential backoff: 500ms, 1500ms
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
    }
  }

  throw lastError;
}
