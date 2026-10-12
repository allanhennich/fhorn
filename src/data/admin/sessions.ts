/**
 * F.Horn Self Storage — Session management (MariaDB).
 */

import { randomBytes } from 'node:crypto';
import { getPool } from './db.js';
import type { Session } from './types.js';

const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

/** Map a snake_case DB row to the camelCase Session interface. */
function rowToSession(row: any): Session {
  return {
    id: row.id,
    userId: row.user_id,
    expiresAt: row.expires_at instanceof Date ? row.expires_at.toISOString() : String(row.expires_at),
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
  };
}

/** Create a new session for a user. Returns the session token (the id). */
export async function createSession(userId: string): Promise<string> {
  const pool = getPool();
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await pool.execute(
    'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)',
    [token, userId, expiresAt],
  );

  return token;
}

/**
 * Validate a session token.
 * Returns the session if valid and not expired, otherwise null.
 * Also cleans up expired sessions.
 */
export async function validateSession(token: string): Promise<Session | null> {
  const pool = getPool();

  // Clean up expired sessions
  await pool.execute('DELETE FROM sessions WHERE expires_at <= NOW()');

  // Find the target session (only if not expired)
  const [rows] = await pool.execute<any[]>(
    'SELECT * FROM sessions WHERE id = ? AND expires_at > NOW()',
    [token],
  );

  if (rows.length === 0) return null;

  return rowToSession(rows[0]);
}

/** Destroy (delete) a session by its token. */
export async function destroySession(token: string): Promise<void> {
  const pool = getPool();
  await pool.execute('DELETE FROM sessions WHERE id = ?', [token]);
}
