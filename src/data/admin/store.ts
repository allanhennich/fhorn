/**
 * @deprecated This module is no longer used. The admin data layer has been
 * migrated to MariaDB. See db.ts for the connection pool and the individual
 * modules (users.ts, sessions.ts, boxes.ts, analytics.ts) for the new
 * database-backed implementations.
 *
 * F.Horn Self Storage — Generic JSON-file-based DataStore.
 *
 * Each store manages a single JSON file containing an array of records.
 * Writes are atomic (write to temp file, then rename).
 */

import { readFile, writeFile, rename, mkdir, access } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

/** Resolve the project-root `data/` directory from import.meta.url. */
const PROJECT_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
const DATA_DIR = join(PROJECT_ROOT, 'data');

export interface Timestamped {
  id: string;
  createdAt: string;
  updatedAt?: string;
}

export class DataStore<T extends Timestamped> {
  private filePath: string;

  constructor(filename: string) {
    this.filePath = join(DATA_DIR, filename);
  }

  // ── helpers ───────────────────────────────────────────────────────────

  /** Ensure the data directory and JSON file exist. */
  private async ensureFile(): Promise<void> {
    const dir = dirname(this.filePath);
    await mkdir(dir, { recursive: true });

    try {
      await access(this.filePath);
    } catch {
      await writeFile(this.filePath, '[]', 'utf-8');
    }
  }

  /** Read the entire array from disk. */
  private async read(): Promise<T[]> {
    await this.ensureFile();
    const raw = await readFile(this.filePath, 'utf-8');
    return JSON.parse(raw) as T[];
  }

  /** Atomic write: write to a temp file, then rename over the original. */
  private async write(data: T[]): Promise<void> {
    await this.ensureFile();
    const tmp = `${this.filePath}.tmp`;
    await writeFile(tmp, JSON.stringify(data, null, 2), 'utf-8');
    await rename(tmp, this.filePath);
  }

  // ── public API ────────────────────────────────────────────────────────

  /** Return every record. */
  async getAll(): Promise<T[]> {
    return this.read();
  }

  /** Find a single record by its id, or undefined. */
  async getById(id: string): Promise<T | undefined> {
    const all = await this.read();
    return all.find((item) => item.id === id);
  }

  /** Create a new record. An `id` and `createdAt` are auto-assigned. */
  async create(data: Omit<T, 'id' | 'createdAt'>): Promise<T> {
    const all = await this.read();
    const now = new Date().toISOString();
    const record = {
      id: randomUUID(),
      createdAt: now,
      ...data,
    } as unknown as T;
    all.push(record);
    await this.write(all);
    return record;
  }

  /** Create a record with a caller-supplied id (e.g. session tokens). */
  async createWithId(id: string, data: Omit<T, 'id' | 'createdAt'>): Promise<T> {
    const all = await this.read();
    const now = new Date().toISOString();
    const record = {
      id,
      createdAt: now,
      ...data,
    } as unknown as T;
    all.push(record);
    await this.write(all);
    return record;
  }

  /** Update an existing record by id with a partial payload. */
  async update(id: string, partial: Partial<T>): Promise<T | undefined> {
    const all = await this.read();
    const idx = all.findIndex((item) => item.id === id);
    if (idx === -1) return undefined;

    const now = new Date().toISOString();
    all[idx] = { ...all[idx], ...partial, id, updatedAt: now } as T;
    await this.write(all);
    return all[idx];
  }

  /** Delete a record by id. Returns true if it existed. */
  async delete(id: string): Promise<boolean> {
    const all = await this.read();
    const idx = all.findIndex((item) => item.id === id);
    if (idx === -1) return false;
    all.splice(idx, 1);
    await this.write(all);
    return true;
  }

  /** Return all records matching a predicate. */
  async query(predicate: (item: T) => boolean): Promise<T[]> {
    const all = await this.read();
    return all.filter(predicate);
  }
}
