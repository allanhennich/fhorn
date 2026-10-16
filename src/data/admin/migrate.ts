/**
 * F.Horn Self Storage — MariaDB migration script.
 *
 * Run with: npx tsx src/data/admin/migrate.ts
 *
 * Creates all tables and seeds initial data (admin user + storage boxes).
 * Safe to run multiple times — uses IF NOT EXISTS and checks before inserting.
 */

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { getPool } from './db.js';
import { storageUnits } from '../storageUnits.js';
import { randomUUID } from 'node:crypto';

async function migrate(): Promise<void> {
  const pool = getPool();

  console.log('\nF.Horn Admin — Running MariaDB migrations\n');

  // ── 1. Create tables ──────────────────────────────────────────────────

  console.log('  Creating tables...');

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS admin_users (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('admin', 'editor') NOT NULL DEFAULT 'editor',
      active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  console.log('    admin_users ✓');

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS admin_boxes (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      volume DECIMAL(10,2) NOT NULL,
      volume_label VARCHAR(50) NOT NULL,
      dim_width DECIMAL(10,2) NOT NULL,
      dim_height DECIMAL(10,2) NOT NULL,
      dim_depth DECIMAL(10,2) NOT NULL,
      dimension_label VARCHAR(100) NOT NULL,
      image_src VARCHAR(500) NOT NULL DEFAULT '',
      image_fallback VARCHAR(500) NOT NULL DEFAULT '',
      image_width INT NOT NULL DEFAULT 1080,
      image_height INT NOT NULL DEFAULT 1080,
      image_alt VARCHAR(500) NOT NULL DEFAULT '',
      description TEXT NOT NULL,
      sample_items JSON NOT NULL,
      is_demonstrative BOOLEAN NOT NULL DEFAULT TRUE,
      active BOOLEAN NOT NULL DEFAULT TRUE,
      sort_order INT NOT NULL DEFAULT 0,
      price DECIMAL(10,2) DEFAULT NULL,
      price_promotional DECIMAL(10,2) DEFAULT NULL,
      price_visible BOOLEAN NOT NULL DEFAULT FALSE,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  console.log('    admin_boxes ✓');

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS sessions (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
    )
  `);
  console.log('    sessions ✓');

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS page_views (
      id VARCHAR(36) PRIMARY KEY,
      path VARCHAR(500) NOT NULL,
      referrer VARCHAR(500) NOT NULL DEFAULT '',
      user_agent VARCHAR(500) NOT NULL DEFAULT '',
      timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_timestamp (timestamp),
      INDEX idx_path (path)
    )
  `);
  console.log('    page_views ✓');

  // ── 1b. Add pricing columns if missing (incremental migration) ────────
  try {
    await pool.execute(`
      ALTER TABLE admin_boxes
        ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS price_promotional DECIMAL(10,2) DEFAULT NULL,
        ADD COLUMN IF NOT EXISTS price_visible BOOLEAN NOT NULL DEFAULT FALSE
    `);
    console.log('    admin_boxes pricing columns ✓');
  } catch {
    // Columns already exist or DB doesn't support IF NOT EXISTS — safe to ignore
    console.log('    admin_boxes pricing columns already exist — skipping.');
  }

  console.log('  All tables created.\n');

  // ── 2. Seed admin user ─────────────────────────────────────────────────

  console.log('  Seeding data...');

  const [existingUsers] = await pool.execute<any[]>(
    'SELECT id FROM admin_users WHERE email = ?',
    ['admin@fhorn.com.br'],
  );

  if (existingUsers.length === 0) {
    const passwordHash = await bcrypt.hash('fhorn2024', 10);
    const userId = randomUUID();
    await pool.execute(
      `INSERT INTO admin_users (id, name, email, password_hash, role, active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, 'Administrador', 'admin@fhorn.com.br', passwordHash, 'admin', true],
    );
    console.log('    Admin user created (admin@fhorn.com.br)');
  } else {
    console.log('    Admin user already exists — skipping.');
  }

  // ── 3. Seed storage boxes ──────────────────────────────────────────────

  const [existingBoxes] = await pool.execute<any[]>(
    'SELECT COUNT(*) as count FROM admin_boxes',
  );

  if (existingBoxes[0].count === 0) {
    for (let i = 0; i < storageUnits.length; i++) {
      const unit = storageUnits[i];
      const boxId = randomUUID();
      await pool.execute(
        `INSERT INTO admin_boxes
         (id, name, slug, volume, volume_label, dim_width, dim_height, dim_depth,
          dimension_label, image_src, image_fallback, image_width, image_height,
          image_alt, description, sample_items, is_demonstrative, active, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          boxId,
          unit.name,
          unit.slug,
          unit.volume,
          unit.volumeLabel,
          unit.dimensions.width,
          unit.dimensions.height,
          unit.dimensions.depth,
          unit.dimensionLabel,
          unit.image.src,
          unit.image.fallback,
          unit.image.width,
          unit.image.height,
          unit.image.alt,
          unit.description,
          JSON.stringify(unit.sampleItems),
          unit.isDemonstrative,
          true,
          i,
        ],
      );
    }
    console.log(`    ${storageUnits.length} storage boxes inserted.`);
  } else {
    console.log(`    ${existingBoxes[0].count} boxes already exist — skipping.`);
  }

  console.log('\nMigration complete.\n');

  await pool.end();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
