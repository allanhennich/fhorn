import mysql from 'mysql2/promise';
import crypto from 'crypto';

// Use bcryptjs for password hashing
import bcrypt from 'bcryptjs';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME || 'fhorn_db',
  user: process.env.DB_USER || 'fhorn_db',
  password: process.env.DB_PASSWORD || '',
  waitForConnections: true,
  connectionLimit: 5,
});

async function migrate() {
  console.log('Creating tables...');

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
  console.log('  ✅ admin_users');

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
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  console.log('  ✅ admin_boxes');

  await pool.execute(`
    CREATE TABLE IF NOT EXISTS sessions (
      id VARCHAR(64) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
    )
  `);
  console.log('  ✅ sessions');

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
  console.log('  ✅ page_views');

  // Seed admin user
  const [existingUsers] = await pool.execute('SELECT id FROM admin_users WHERE email = ?', ['admin@fhorn.com.br']);
  if (existingUsers.length === 0) {
    const hash = await bcrypt.hash('fhorn2024', 10);
    await pool.execute(
      'INSERT INTO admin_users (id, name, email, password_hash, role, active) VALUES (?, ?, ?, ?, ?, ?)',
      [crypto.randomUUID(), 'Administrador', 'admin@fhorn.com.br', hash, 'admin', true]
    );
    console.log('  ✅ Admin user created (admin@fhorn.com.br / fhorn2024)');
  } else {
    console.log('  ⏭  Admin user already exists');
  }

  // Seed boxes
  const [existingBoxes] = await pool.execute('SELECT COUNT(*) as count FROM admin_boxes');
  if (existingBoxes[0].count === 0) {
    const boxes = [
      { name: 'Mini', slug: 'mini', volume: 3, volumeLabel: '3 m³', w: 1.00, h: 1.40, d: 2.08, dimLabel: '1,00 × 1,40 × 2,08 m', desc: 'Ideal para poucos itens: malas, caixas de documentos ou objetos sazonais.', items: ['2–3 malas grandes', 'Caixas de documentos', 'Itens sazonais (decoração, roupas)'], imgSrc: '/images/boxes/mini-2-9m3.webp', imgFb: '/images/boxes/mini-2-9m3.png' },
      { name: 'Mini+', slug: 'mini-plus', volume: 3.5, volumeLabel: '3,5 m³', w: 0.85, h: 1.39, d: 2.99, dimLabel: '0,85 × 1,39 × 2,99 m', desc: 'Estreito e profundo — bom para caixas empilhadas e itens compridos.', items: ['Estantes desmontadas', 'Caixas empilhadas', 'Pranchas, esquis ou itens compridos'], imgSrc: '/images/boxes/mini-2-9m3.webp', imgFb: '/images/boxes/mini-2-9m3.png' },
      { name: 'Box P', slug: 'box-p', volume: 5, volumeLabel: '5 m³', w: 1.73, h: 1.40, d: 2.07, dimLabel: '1,73 × 1,40 × 2,07 m', desc: 'Mais espaço para o dia a dia: móveis pequenos e vários volumes.', items: ['Mesa pequena', 'Cadeiras', 'Várias caixas de mudança'], imgSrc: '/images/boxes/box-p-5m3.webp', imgFb: '/images/boxes/box-p-5m3.png' },
      { name: 'Box M', slug: 'box-m', volume: 7.5, volumeLabel: '7,5 m³', w: 1.01, h: 2.88, d: 2.60, dimLabel: '1,01 × 2,88 × 2,60 m', desc: 'Pé-direito alto para empilhar: cabe o conteúdo de um quarto completo.', items: ['Cama de casal desmontada', 'Guarda-roupa pequeno', 'Caixas e itens diversos'], imgSrc: '/images/boxes/box-m-7-5m3.webp', imgFb: '/images/boxes/box-m-7-5m3.png' },
      { name: 'Box M+', slug: 'box-m-plus', volume: 8.5, volumeLabel: '8,5 m³', w: 1.20, h: 2.89, d: 2.50, dimLabel: '1,20 × 2,89 × 2,50 m', desc: 'Largura extra com pé-direito alto — ideal para sofás e estantes.', items: ['Sofá de 2 lugares', 'Estante', 'Caixas e objetos variados'], imgSrc: '/images/boxes/box-m-7-5m3.webp', imgFb: '/images/boxes/box-m-7-5m3.png' },
      { name: 'Box G', slug: 'box-g', volume: 9, volumeLabel: '9 m³', w: 1.05, h: 2.88, d: 2.97, dimLabel: '1,05 × 2,88 × 2,97 m', desc: 'Profundo e alto: comporta eletrodomésticos e móveis médios com folga.', items: ['Geladeira', 'Máquina de lavar', 'Caixas de mudança'], imgSrc: '/images/boxes/box-g-9m3.webp', imgFb: '/images/boxes/box-g-9m3.png' },
      { name: 'Box GG', slug: 'box-gg', volume: 10, volumeLabel: '10 m³', w: 1.15, h: 2.88, d: 2.97, dimLabel: '1,15 × 2,88 × 2,97 m', desc: 'Amplo e profundo: espaço para uma mudança de apartamento pequeno.', items: ['Sofá', 'Mesa de jantar', 'Eletrodomésticos', 'Várias caixas'], imgSrc: '/images/boxes/box-gg-11-7m3.webp', imgFb: '/images/boxes/box-gg-11-7m3.png' },
      { name: 'Box XG', slug: 'box-xg', volume: 11, volumeLabel: '11 m³', w: 1.30, h: 2.89, d: 2.97, dimLabel: '1,30 × 2,89 × 2,97 m', desc: 'O maior box da F.Horn: comporta geladeira, máquina de lavar, bicicleta, colchão e caixas de uma mudança.', items: ['Geladeira', 'Máquina de lavar', 'Bicicleta', 'Colchão', 'Caixas de mudança'], imgSrc: '/images/boxes/box-gg-11-7m3.webp', imgFb: '/images/boxes/box-gg-11-7m3.png' },
    ];

    for (let i = 0; i < boxes.length; i++) {
      const b = boxes[i];
      await pool.execute(
        `INSERT INTO admin_boxes (id, name, slug, volume, volume_label, dim_width, dim_height, dim_depth, dimension_label, image_src, image_fallback, image_width, image_height, image_alt, description, sample_items, is_demonstrative, active, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [crypto.randomUUID(), b.name, b.slug, b.volume, b.volumeLabel, b.w, b.h, b.d, b.dimLabel, b.imgSrc, b.imgFb, 1080, 1080, `${b.name} da F.Horn Self Storage, ${b.volumeLabel}`, b.desc, JSON.stringify(b.items), true, true, i]
      );
    }
    console.log(`  ✅ ${boxes.length} boxes created`);
  } else {
    console.log(`  ⏭  Boxes already exist (${existingBoxes[0].count})`);
  }

  console.log('\nMigration complete!');
  await pool.end();
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
