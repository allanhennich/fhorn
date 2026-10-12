/**
 * F.Horn Self Storage — Seed script for admin data layer (MariaDB).
 *
 * Run with: npx tsx src/data/admin/seed.ts
 *
 * Inserts initial admin user and storage boxes into the database.
 * Tables must already exist (run migrate.ts first).
 * Skips records that already exist to avoid duplicates.
 */

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { getPool } from './db.js';
import { storageUnits } from '../storageUnits.js';

async function seed(): Promise<void> {
  const pool = getPool();

  console.log('\nF.Horn Admin — Seeding MariaDB data\n');

  // ── 1. Admin user ──────────────────────────────────────────────────────

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
    console.log('  Admin user created (admin@fhorn.com.br)');
  } else {
    console.log('  Admin user already exists — skipping.');
  }

  // ── 2. Storage boxes ──────────────────────────────────────────────────

  const [existingBoxes] = await pool.execute<any[]>(
    'SELECT COUNT(*) AS count FROM admin_boxes',
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
    console.log(`  ${storageUnits.length} storage boxes inserted.`);
  } else {
    console.log(`  ${existingBoxes[0].count} boxes already exist — skipping.`);
  }

  console.log('\nSeed complete.\n');

  await pool.end();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
