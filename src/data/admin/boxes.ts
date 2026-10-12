/**
 * F.Horn Self Storage — Admin box (storage unit) CRUD (MariaDB).
 */

import { randomUUID } from 'node:crypto';
import { getPool } from './db.js';
import type { AdminBox } from './types.js';

/**
 * Convert a name to a URL-friendly slug.
 * Lowercases, removes accents, replaces spaces/non-alphanumeric with hyphens,
 * and collapses multiple hyphens.
 */
export function generateSlug(name: string): string {
  return name
    .normalize('NFD')                       // decompose accented chars
    .replace(/[\u0300-\u036f]/g, '')        // strip combining diacritical marks
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')          // remove non-alphanumeric (except space/hyphen)
    .replace(/[\s]+/g, '-')                 // spaces to hyphens
    .replace(/-+/g, '-')                    // collapse multiple hyphens
    .replace(/^-|-$/g, '');                 // trim leading/trailing hyphens
}

/** Map a snake_case DB row to the camelCase AdminBox interface. */
function rowToBox(row: any): AdminBox {
  let sampleItems: string[];
  if (typeof row.sample_items === 'string') {
    sampleItems = JSON.parse(row.sample_items);
  } else {
    sampleItems = row.sample_items;
  }

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    volume: Number(row.volume),
    volumeLabel: row.volume_label,
    dimensions: {
      width: Number(row.dim_width),
      height: Number(row.dim_height),
      depth: Number(row.dim_depth),
    },
    dimensionLabel: row.dimension_label,
    image: {
      src: row.image_src,
      fallback: row.image_fallback,
      width: row.image_width,
      height: row.image_height,
      alt: row.image_alt,
    },
    description: row.description,
    sampleItems,
    isDemonstrative: Boolean(row.is_demonstrative),
    active: Boolean(row.active),
    sortOrder: row.sort_order,
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
    updatedAt: row.updated_at instanceof Date ? row.updated_at.toISOString() : String(row.updated_at),
  };
}

/** List all boxes. */
export async function listBoxes(): Promise<AdminBox[]> {
  const pool = getPool();
  const [rows] = await pool.execute<any[]>('SELECT * FROM admin_boxes ORDER BY sort_order');
  return rows.map(rowToBox);
}

/** Get only active boxes, sorted by sortOrder ascending. */
export async function getActiveBoxes(): Promise<AdminBox[]> {
  const pool = getPool();
  const [rows] = await pool.execute<any[]>(
    'SELECT * FROM admin_boxes WHERE active = TRUE ORDER BY sort_order',
  );
  return rows.map(rowToBox);
}

/** Get a single box by id. */
export async function getBox(id: string): Promise<AdminBox | undefined> {
  const pool = getPool();
  const [rows] = await pool.execute<any[]>(
    'SELECT * FROM admin_boxes WHERE id = ?',
    [id],
  );
  return rows.length > 0 ? rowToBox(rows[0]) : undefined;
}

/** Get a single box by slug. */
export async function getBoxBySlug(slug: string): Promise<AdminBox | undefined> {
  const pool = getPool();
  const [rows] = await pool.execute<any[]>(
    'SELECT * FROM admin_boxes WHERE slug = ?',
    [slug],
  );
  return rows.length > 0 ? rowToBox(rows[0]) : undefined;
}

/** Create a new box. Slug is auto-generated from the name. */
export async function createBox(
  data: Omit<AdminBox, 'id' | 'slug' | 'createdAt' | 'updatedAt'>,
): Promise<AdminBox> {
  const pool = getPool();
  const id = randomUUID();
  const slug = generateSlug(data.name);

  await pool.execute(
    `INSERT INTO admin_boxes
     (id, name, slug, volume, volume_label, dim_width, dim_height, dim_depth,
      dimension_label, image_src, image_fallback, image_width, image_height,
      image_alt, description, sample_items, is_demonstrative, active, sort_order)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.name,
      slug,
      data.volume,
      data.volumeLabel,
      data.dimensions.width,
      data.dimensions.height,
      data.dimensions.depth,
      data.dimensionLabel,
      data.image.src,
      data.image.fallback,
      data.image.width,
      data.image.height,
      data.image.alt,
      data.description,
      JSON.stringify(data.sampleItems),
      data.isDemonstrative,
      data.active,
      data.sortOrder,
    ],
  );

  const [rows] = await pool.execute<any[]>(
    'SELECT * FROM admin_boxes WHERE id = ?',
    [id],
  );
  return rowToBox(rows[0]);
}

/** Update an existing box. If `name` changes, slug is regenerated. */
export async function updateBox(
  id: string,
  data: Partial<Omit<AdminBox, 'id' | 'createdAt' | 'updatedAt'>>,
): Promise<AdminBox | undefined> {
  const pool = getPool();

  const fields: string[] = [];
  const values: any[] = [];

  if (data.name !== undefined) {
    fields.push('name = ?');
    values.push(data.name);
    fields.push('slug = ?');
    values.push(generateSlug(data.name));
  }
  if (data.slug !== undefined && data.name === undefined) {
    fields.push('slug = ?');
    values.push(data.slug);
  }
  if (data.volume !== undefined) {
    fields.push('volume = ?');
    values.push(data.volume);
  }
  if (data.volumeLabel !== undefined) {
    fields.push('volume_label = ?');
    values.push(data.volumeLabel);
  }
  if (data.dimensions !== undefined) {
    fields.push('dim_width = ?');
    values.push(data.dimensions.width);
    fields.push('dim_height = ?');
    values.push(data.dimensions.height);
    fields.push('dim_depth = ?');
    values.push(data.dimensions.depth);
  }
  if (data.dimensionLabel !== undefined) {
    fields.push('dimension_label = ?');
    values.push(data.dimensionLabel);
  }
  if (data.image !== undefined) {
    fields.push('image_src = ?');
    values.push(data.image.src);
    fields.push('image_fallback = ?');
    values.push(data.image.fallback);
    fields.push('image_width = ?');
    values.push(data.image.width);
    fields.push('image_height = ?');
    values.push(data.image.height);
    fields.push('image_alt = ?');
    values.push(data.image.alt);
  }
  if (data.description !== undefined) {
    fields.push('description = ?');
    values.push(data.description);
  }
  if (data.sampleItems !== undefined) {
    fields.push('sample_items = ?');
    values.push(JSON.stringify(data.sampleItems));
  }
  if (data.isDemonstrative !== undefined) {
    fields.push('is_demonstrative = ?');
    values.push(data.isDemonstrative);
  }
  if (data.active !== undefined) {
    fields.push('active = ?');
    values.push(data.active);
  }
  if (data.sortOrder !== undefined) {
    fields.push('sort_order = ?');
    values.push(data.sortOrder);
  }

  if (fields.length === 0) return undefined;

  values.push(id);
  await pool.execute(
    `UPDATE admin_boxes SET ${fields.join(', ')} WHERE id = ?`,
    values,
  );

  const [rows] = await pool.execute<any[]>(
    'SELECT * FROM admin_boxes WHERE id = ?',
    [id],
  );

  return rows.length > 0 ? rowToBox(rows[0]) : undefined;
}

/** Delete a box by id. */
export async function deleteBox(id: string): Promise<boolean> {
  const pool = getPool();
  const [result] = await pool.execute<any>(
    'DELETE FROM admin_boxes WHERE id = ?',
    [id],
  );
  return result.affectedRows > 0;
}

/** Toggle a box between active and inactive. */
export async function toggleBox(id: string): Promise<AdminBox | undefined> {
  const pool = getPool();

  await pool.execute(
    'UPDATE admin_boxes SET active = NOT active WHERE id = ?',
    [id],
  );

  const [rows] = await pool.execute<any[]>(
    'SELECT * FROM admin_boxes WHERE id = ?',
    [id],
  );

  return rows.length > 0 ? rowToBox(rows[0]) : undefined;
}
