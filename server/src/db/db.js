import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SQLITE_FILE = path.join(__dirname, 'katalogwa.sqlite');
const BAKERY_CATEGORIES = [
  { id: 'cat-1', name: 'Birthday Cake', slug: 'birthday-cake' },
  { id: 'cat-2', name: 'Cupcake', slug: 'cupcake' },
  { id: 'cat-3', name: 'Donuts', slug: 'donuts' },
  { id: 'cat-4', name: 'Brownies', slug: 'brownies' },
  { id: 'cat-5', name: 'Cookies', slug: 'cookies' },
  { id: 'cat-6', name: 'Sponge Cake', slug: 'sponge-cake' },
  { id: 'cat-7', name: 'Pastry', slug: 'pastry' },
  { id: 'cat-8', name: 'Traditional Cakes', slug: 'traditional-cakes' }
];
const BAKERY_PRODUCTS = [
  {
    id: 'prod-1', name: 'Golden Hour Birthday Cake', categoryId: 'cat-1', price: 285000,
    description: 'Vanilla sponge lembut dengan buttercream ringan dan sentuhan buah segar untuk hari paling istimewa.',
    image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=85'
  },
  {
    id: 'prod-2', name: 'Vanilla Bloom Cupcake Box', categoryId: 'cat-2', price: 85000,
    description: 'Enam cupcake vanilla moist dengan swirl buttercream lembut, dihias manis untuk berbagi.',
    image: 'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=800&q=85'
  },
  {
    id: 'prod-3', name: 'Classic Cinnamon Donuts', categoryId: 'cat-3', price: 65000,
    description: 'Donat empuk dengan lapisan gula kayu manis yang harum, dibuat fresh setiap hari.',
    image: 'https://images.unsplash.com/photo-1551024506-0cc8c5e2e4a9?auto=format&fit=crop&w=800&q=85'
  },
  {
    id: 'prod-4', name: 'Fudgy Chocolate Brownies', categoryId: 'cat-4', price: 95000,
    description: 'Brownies cokelat pekat dengan bagian tengah fudgy dan taburan cokelat pilihan.',
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=85'
  },
  {
    id: 'prod-5', name: 'Brown Butter Cookies', categoryId: 'cat-5', price: 72000,
    description: 'Cookies renyah di tepi, chewy di tengah, dengan brown butter dan chocolate chips.',
    image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=85'
  },
  {
    id: 'prod-6', name: 'Cloud Nine Sponge Cake', categoryId: 'cat-6', price: 175000,
    description: 'Sponge cake ringan berlapis cream dan buah pilihan, lembut seperti awan di setiap gigitan.',
    image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=85'
  },
  {
    id: 'prod-7', name: 'Butter Croissant', categoryId: 'cat-7', price: 38000,
    description: 'Pastry berlapis dengan bagian luar renyah dan aroma butter yang hangat.',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=85'
  },
  {
    id: 'prod-8', name: 'Klepon Cake', categoryId: 'cat-8', price: 145000,
    description: 'Kreasi cake pandan lembut dengan gula aren dan kelapa, terinspirasi dari jajanan tradisional.',
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=85'
  }
].map((product) => ({ ...product, stockStatus: 'Tersedia' }));

const LEGACY_DEMO_PRODUCTS = [
  'Nasi Goreng Spesial Toko Berkah',
  'Ayam Bakar Madu Pedas',
  'Mie Aceh Tumis Daging Sapi',
  'Es Kopi Susu Gula Aren',
  'Matcha Latte Creamy Frappe',
  'Es Lemon Tea Segar Jumbo',
  'Pisang Goreng Keju Cokelat Lumer',
  'Dimsum Mentai Panggang (4 pcs)',
  'Cireng Crispy Bumbu Rujak Pedas'
];

class SqliteDatabase {
  constructor() {
    this.db = new DatabaseSync(SQLITE_FILE);
    this.initTables();
    this.seedInitialData();
  }

  initTables() {
    // Enable foreign keys
    this.db.exec('PRAGMA foreign_keys = ON;');

    // 1. Categories Table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        slug TEXT NOT NULL,
        image TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);
    const categoryColumns = this.db.prepare('PRAGMA table_info(categories)').all();
    if (!categoryColumns.some((column) => column.name === 'image')) {
      this.db.exec('ALTER TABLE categories ADD COLUMN image TEXT');
    }

    // 2. Products Table (Relational with Foreign Key to categories)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
        price INTEGER NOT NULL,
        stock_status TEXT NOT NULL DEFAULT 'Tersedia',
        description TEXT,
        image TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Settings Key-Value Table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);

    // 4. Admin Authentication Table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS admins (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS orders (
        id TEXT PRIMARY KEY,
        order_code TEXT NOT NULL UNIQUE,
        tracking_token TEXT NOT NULL UNIQUE,
        customer_name TEXT NOT NULL,
        notes TEXT NOT NULL DEFAULT '',
        items_json TEXT NOT NULL,
        total INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed')),
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        confirmed_at TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at DESC);
    `);

    // Indexes
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_products_cat ON products(category_id);
      CREATE INDEX IF NOT EXISTS idx_products_stock ON products(stock_status);
    `);
  }

  seedInitialData() {
    // Seed Settings
    const existingSettings = this.db.prepare('SELECT COUNT(*) AS count FROM settings').get();
    if (existingSettings.count === 0) {
      const insertSetting = this.db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)');
      insertSetting.run('storeName', "T'xie Cake");
      insertSetting.run('tagline', 'A Little Sweetness, A Lot of Happiness.');
      insertSetting.run('phone', '6281234567890');
      insertSetting.run('address', 'Jl. Melati No. 12, Kebayoran Baru, Jakarta Selatan');
      insertSetting.run('currency', 'Rp');
    }

    // Seed Admin
    const existingAdmin = this.db.prepare('SELECT COUNT(*) AS count FROM admins').get();
    if (existingAdmin.count === 0) {
      const hashedPassword = bcrypt.hashSync('admin123', 10);
      this.db.prepare(
        'INSERT INTO admins (id, name, email, password) VALUES (?, ?, ?, ?)'
      ).run('admin-1', 'Owner Toko Berkah', 'admin@katalogwa.com', hashedPassword);
    }

    // Seed Categories
    const existingCategories = this.db.prepare('SELECT COUNT(*) AS count FROM categories').get();
    if (existingCategories.count === 0) {
      const insertCat = this.db.prepare('INSERT INTO categories (id, name, slug) VALUES (?, ?, ?)');
      for (const category of BAKERY_CATEGORIES) {
        insertCat.run(category.id, category.name, category.slug);
      }
    }

    // Seed Products
    const existingProducts = this.db.prepare('SELECT COUNT(*) AS count FROM products').get();
    if (existingProducts.count === 0) {
      const insertProduct = this.db.prepare(`
        INSERT INTO products (id, name, category_id, price, stock_status, description, image)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      for (const p of BAKERY_PRODUCTS) {
        insertProduct.run(p.id, p.name, p.categoryId, p.price, p.stockStatus, p.description, p.image);
      }
    }

    this.migrateLegacyDemoCatalog();
  }

  migrateLegacyDemoCatalog() {
    const settings = this.getSettings();
    if (settings.storeName !== 'Toko Berkah Nusantara') return;

    const currentCategories = this.db.prepare('SELECT name FROM categories ORDER BY id').all().map((row) => row.name);
    if (currentCategories.join('|') !== 'Makanan|Minuman|Camilan') return;

    const currentProducts = this.db.prepare('SELECT id, name FROM products ORDER BY id').all();
    if (
      currentProducts.length !== LEGACY_DEMO_PRODUCTS.length ||
      currentProducts.some((product, index) => product.id !== `prod-${index + 1}` || product.name !== LEGACY_DEMO_PRODUCTS[index])
    ) return;

    this.db.exec('BEGIN');
    try {
      this.db.exec('DELETE FROM products; DELETE FROM categories;');
      const insertCategory = this.db.prepare('INSERT INTO categories (id, name, slug) VALUES (?, ?, ?)');
      for (const category of BAKERY_CATEGORIES) {
        insertCategory.run(category.id, category.name, category.slug);
      }
      const insertProduct = this.db.prepare(`
        INSERT INTO products (id, name, category_id, price, stock_status, description, image)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);
      for (const product of BAKERY_PRODUCTS) {
        insertProduct.run(product.id, product.name, product.categoryId, product.price, product.stockStatus, product.description, product.image);
      }
      this.db.prepare('UPDATE settings SET value = ? WHERE key = ?').run("T'xie Cake", 'storeName');
      this.db.prepare('UPDATE settings SET value = ? WHERE key = ?').run('A Little Sweetness, A Lot of Happiness.', 'tagline');
      this.db.exec('COMMIT');
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }
  }

  // --- Settings SQL Operations ---
  getSettings() {
    const rows = this.db.prepare('SELECT key, value FROM settings').all();
    const settings = {};
    for (const row of rows) {
      settings[row.key] = row.value;
    }
    return settings;
  }

  updateSettings(newSettings) {
    const upsert = this.db.prepare(`
      INSERT INTO settings (key, value) VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `);

    for (const [key, val] of Object.entries(newSettings)) {
      upsert.run(key, String(val));
    }
    return this.getSettings();
  }

  // --- Admin SQL Operations ---
  getAdmin() {
    return this.db.prepare('SELECT id, name, email, password FROM admins LIMIT 1').get();
  }

  updateAdminProfile(id, { name, password }) {
    const result = this.db.prepare(`
      UPDATE admins
      SET name = ?, password = ?
      WHERE id = ?
    `).run(name, password, id);

    return result.changes > 0;
  }

  createOrder({ id, orderCode, trackingToken, customerName, notes, items, total }) {
    this.db.prepare(`
      INSERT INTO orders (
        id, order_code, tracking_token, customer_name, notes, items_json, total
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, orderCode, trackingToken, customerName, notes, JSON.stringify(items), total);

    return this.getOrderById(id);
  }

  getOrderById(id) {
    const row = this.db.prepare(`
      SELECT id, order_code AS orderCode, customer_name AS customerName,
        notes, items_json AS itemsJson, total, status,
        created_at AS createdAt, confirmed_at AS confirmedAt
      FROM orders
      WHERE id = ?
    `).get(id);
    return row ? this.deserializeOrder(row) : null;
  }

  getOrderByTrackingToken(trackingToken) {
    const row = this.db.prepare(`
      SELECT id, order_code AS orderCode, customer_name AS customerName,
        notes, items_json AS itemsJson, total, status,
        created_at AS createdAt, confirmed_at AS confirmedAt
      FROM orders
      WHERE tracking_token = ?
    `).get(trackingToken);
    return row ? this.deserializeOrder(row) : null;
  }

  getOrders(status) {
    const rows = status
      ? this.db.prepare(`
        SELECT id, order_code AS orderCode, customer_name AS customerName,
          notes, items_json AS itemsJson, total, status,
          created_at AS createdAt, confirmed_at AS confirmedAt
        FROM orders
        WHERE status = ?
        ORDER BY created_at DESC, rowid DESC
      `).all(status)
      : this.db.prepare(`
        SELECT id, order_code AS orderCode, customer_name AS customerName,
          notes, items_json AS itemsJson, total, status,
          created_at AS createdAt, confirmed_at AS confirmedAt
        FROM orders
        ORDER BY created_at DESC, rowid DESC
      `).all();
    return rows.map((row) => this.deserializeOrder(row));
  }

  confirmOrder(id) {
    const result = this.db.prepare(`
      UPDATE orders
      SET status = 'confirmed', confirmed_at = CURRENT_TIMESTAMP
      WHERE id = ? AND status = 'pending'
    `).run(id);
    return result.changes > 0 ? this.getOrderById(id) : null;
  }

  deleteConfirmedOrder(id) {
    const result = this.db.prepare(`
      DELETE FROM orders
      WHERE id = ? AND status = 'confirmed'
    `).run(id);
    return result.changes > 0;
  }

  deserializeOrder(row) {
    const { itemsJson, ...order } = row;
    return { ...order, items: JSON.parse(itemsJson) };
  }

  // --- Category SQL Operations ---
  getCategories() {
    // Relational SQL query with LEFT JOIN and COUNT
    return this.db.prepare(`
      SELECT 
        c.id, 
        c.name, 
        c.slug, 
        c.image,
        c.created_at AS createdAt,
        COUNT(p.id) AS productCount
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY c.created_at ASC
    `).all();
  }

  getCategoryById(id) {
    return this.db.prepare('SELECT id, name, slug, image FROM categories WHERE id = ?').get(id);
  }

  addCategory(name) {
    const id = `cat-${Date.now()}`;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    this.db.prepare('INSERT INTO categories (id, name, slug) VALUES (?, ?, ?)').run(id, name, slug);
    return { id, name, slug, productCount: 0 };
  }

  updateCategory(id, name, image) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const res = this.db.prepare('UPDATE categories SET name = ?, slug = ?, image = COALESCE(?, image) WHERE id = ?').run(name, slug, image ?? null, id);
    if (res.changes === 0) return null;
    return this.getCategoryById(id);
  }

  deleteCategory(id) {
    const res = this.db.prepare('DELETE FROM categories WHERE id = ?').run(id);
    return res.changes > 0;
  }

  // --- Product SQL Operations ---
  getProducts(filters = {}) {
    let sql = `
      SELECT 
        p.id, 
        p.name, 
        p.category_id AS categoryId, 
        c.name AS categoryName, 
        p.price, 
        p.stock_status AS stockStatus, 
        p.description, 
        p.image, 
        p.created_at AS createdAt,
        p.updated_at AS updatedAt
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.categoryId) {
      sql += ' AND p.category_id = ?';
      params.push(filters.categoryId);
    }

    if (filters.stockStatus) {
      sql += ' AND p.stock_status = ?';
      params.push(filters.stockStatus);
    }

    if (filters.search) {
      sql += ' AND (LOWER(p.name) LIKE ? OR LOWER(p.description) LIKE ?)';
      const queryPattern = `%${filters.search.toLowerCase()}%`;
      params.push(queryPattern, queryPattern);
    }

    sql += ' ORDER BY p.created_at DESC';

    return this.db.prepare(sql).all(...params);
  }

  getProductById(id) {
    return this.db.prepare(`
      SELECT 
        p.id, 
        p.name, 
        p.category_id AS categoryId, 
        c.name AS categoryName, 
        p.price, 
        p.stock_status AS stockStatus, 
        p.description, 
        p.image, 
        p.created_at AS createdAt,
        p.updated_at AS updatedAt
      FROM products p
      JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `).get(id);
  }

  addProduct(productData) {
    const id = `prod-${Date.now()}`;
    const price = Number(productData.price) || 0;
    const stockStatus = productData.stockStatus || 'Tersedia';
    const description = productData.description || '';
    const image = productData.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';

    this.db.prepare(`
      INSERT INTO products (id, name, category_id, price, stock_status, description, image)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, productData.name, productData.categoryId, price, stockStatus, description, image);

    return this.getProductById(id);
  }

  updateProduct(id, productData) {
    const current = this.getProductById(id);
    if (!current) return null;

    const name = productData.name !== undefined ? productData.name : current.name;
    const categoryId = productData.categoryId !== undefined ? productData.categoryId : current.categoryId;
    const price = productData.price !== undefined ? Number(productData.price) : current.price;
    const stockStatus = productData.stockStatus !== undefined ? productData.stockStatus : current.stockStatus;
    const description = productData.description !== undefined ? productData.description : current.description;
    const image = productData.image !== undefined ? productData.image : current.image;

    this.db.prepare(`
      UPDATE products 
      SET name = ?, category_id = ?, price = ?, stock_status = ?, description = ?, image = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(name, categoryId, price, stockStatus, description, image, id);

    return this.getProductById(id);
  }

  toggleStock(id) {
    const product = this.getProductById(id);
    if (!product) return null;

    const newStock = product.stockStatus === 'Tersedia' ? 'Habis' : 'Tersedia';
    this.db.prepare(`
      UPDATE products 
      SET stock_status = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `).run(newStock, id);

    return this.getProductById(id);
  }

  deleteProduct(id) {
    const res = this.db.prepare('DELETE FROM products WHERE id = ?').run(id);
    return res.changes > 0;
  }
}

export const db = new SqliteDatabase();
