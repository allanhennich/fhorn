/**
 * F.Horn Self Storage — Admin user management (MariaDB).
 */

import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { getPool } from './db.js';
import type { AdminUser } from './types.js';

const SALT_ROUNDS = 10;

/** Omit passwordHash from a user record for safe public consumption. */
type SafeUser = Omit<AdminUser, 'passwordHash'>;

/** Map a snake_case DB row to the camelCase AdminUser interface. */
function rowToUser(row: any): AdminUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    role: row.role,
    active: Boolean(row.active),
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at),
  };
}

function stripPassword(user: AdminUser): SafeUser {
  const { passwordHash: _, ...safe } = user;
  return safe;
}

/** Create a new admin user. Password is hashed automatically. */
export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  role: AdminUser['role'];
}): Promise<SafeUser> {
  const pool = getPool();
  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
  const id = randomUUID();

  await pool.execute(
    `INSERT INTO admin_users (id, name, email, password_hash, role, active)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, data.name, data.email.toLowerCase(), passwordHash, data.role, true],
  );

  const [rows] = await pool.execute<any[]>(
    'SELECT * FROM admin_users WHERE id = ?',
    [id],
  );

  return stripPassword(rowToUser(rows[0]));
}

/** Find a user by email address. */
export async function getUserByEmail(email: string): Promise<AdminUser | undefined> {
  const pool = getPool();
  const [rows] = await pool.execute<any[]>(
    'SELECT * FROM admin_users WHERE email = ?',
    [email.toLowerCase()],
  );
  return rows.length > 0 ? rowToUser(rows[0]) : undefined;
}

/** Find a user by id. */
export async function getUserById(id: string): Promise<AdminUser | undefined> {
  const pool = getPool();
  const [rows] = await pool.execute<any[]>(
    'SELECT * FROM admin_users WHERE id = ?',
    [id],
  );
  return rows.length > 0 ? rowToUser(rows[0]) : undefined;
}

/** Verify email + password credentials. Returns the user (without hash) or null. */
export async function verifyPassword(
  email: string,
  password: string,
): Promise<SafeUser | null> {
  const user = await getUserByEmail(email);
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;

  return stripPassword(user);
}

/** Update a user. If a `password` field is provided, it will be hashed. */
export async function updateUser(
  id: string,
  data: Partial<Omit<AdminUser, 'id' | 'createdAt' | 'updatedAt' | 'passwordHash'>> & {
    password?: string;
  },
): Promise<SafeUser | undefined> {
  const pool = getPool();
  const { password, ...rest } = data;

  const fields: string[] = [];
  const values: any[] = [];

  if (rest.name !== undefined) {
    fields.push('name = ?');
    values.push(rest.name);
  }
  if (rest.email !== undefined) {
    fields.push('email = ?');
    values.push(rest.email.toLowerCase());
  }
  if (rest.role !== undefined) {
    fields.push('role = ?');
    values.push(rest.role);
  }
  if (rest.active !== undefined) {
    fields.push('active = ?');
    values.push(rest.active);
  }
  if (password) {
    const hash = await bcrypt.hash(password, SALT_ROUNDS);
    fields.push('password_hash = ?');
    values.push(hash);
  }

  if (fields.length === 0) return undefined;

  values.push(id);
  await pool.execute(
    `UPDATE admin_users SET ${fields.join(', ')} WHERE id = ?`,
    values,
  );

  const [rows] = await pool.execute<any[]>(
    'SELECT * FROM admin_users WHERE id = ?',
    [id],
  );

  return rows.length > 0 ? stripPassword(rowToUser(rows[0])) : undefined;
}

/** Delete a user by id. */
export async function deleteUser(id: string): Promise<boolean> {
  const pool = getPool();
  const [result] = await pool.execute<any>(
    'DELETE FROM admin_users WHERE id = ?',
    [id],
  );
  return result.affectedRows > 0;
}

/** List all users (passwordHash stripped). */
export async function listUsers(): Promise<SafeUser[]> {
  const pool = getPool();
  const [rows] = await pool.execute<any[]>('SELECT * FROM admin_users');
  return rows.map((row: any) => stripPassword(rowToUser(row)));
}
