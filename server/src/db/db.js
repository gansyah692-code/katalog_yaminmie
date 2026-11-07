import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SQLITE_FILE = path.join(__dirname, 'katalogwa.sqlite');
const JSON_FILE = path.join(__dirname, 'katalogwa-db.json');

const INITIAL_SETTINGS = {
  storeName: 'Toko Berkah Nusantara',
  tagline: 'Kuliner Lezat & Segar Siap Antar Setiap Hari',
  phone: '6281234567890',
  address: 'Jl. Melati No. 12, Kebayoran Baru, Jakarta Selatan',
  currency: 'Rp'
};

const INITIAL_CATEGORIES = [
  { id: 'cat-1', name: 'Makanan', slug: 'makanan', createdAt: '2026-01-01T00:00:00.000Z' },
  { id: 'cat-2', name: 'Minuman', slug: 'minuman', createdAt: '2026-01-01T00:00:01.000Z' },
  { id: 'cat-3', name: 'Camilan', slug: 'camilan', createdAt: '2026-01-01T00:00:02.000Z' }
];

const INITIAL_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Nasi Goreng Spesial Toko Berkah',
    categoryId: 'cat-1',
    price: 28000,
    stockStatus: 'Tersedia',
    description: 'Nasi goreng racikan bumbu rempah otentik disajikan dengan telur mata sapi, ayam suwir, dan kerupuk renyah.',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod-2',
    name: 'Ayam Bakar Madu Pedas',
    categoryId: 'cat-1',
    price: 32000,
    stockStatus: 'Tersedia',
    description: 'Potongan ayam bakar empuk dilumuri saus madu gurih pedas manis dengan lalapan segar dan sambal terasi.',
    image: 'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod-3',
    name: 'Mie Aceh Tumis Daging Sapi',
    categoryId: 'cat-1',
    price: 30000,
    stockStatus: 'Tersedia',
    description: 'Mie kuning kenyal khas Aceh dimasak bumbu kari pekat dengan irisan daging sapi empuk, tauge, dan emping.',
    image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod-4',
    name: 'Es Kopi Susu Gula Aren',
    categoryId: 'cat-2',
    price: 18000,
    stockStatus: 'Tersedia',
    description: 'Espresso robusta & arabica pilihan dipadu susu creamy fresh dan sirup gula aren murni organik.',
    image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod-5',
    name: 'Matcha Latte Creamy Frappe',
    categoryId: 'cat-2',
    price: 22000,
    stockStatus: 'Tersedia',
    description: 'Bubuk green tea matcha Uji Jepang premium dipadu susu segar dingin yang lembut dan harum.',
    image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod-6',
    name: 'Es Lemon Tea Segar Jumbo',
    categoryId: 'cat-2',
    price: 10000,
    stockStatus: 'Tersedia',
    description: 'Seduhan teh melati wangi dengan perasan lemon asli segar dan es batu dingin, penghilang dahaga terbaik.',
    image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod-7',
    name: 'Pisang Goreng Keju Cokelat Lumer',
    categoryId: 'cat-3',
    price: 18000,
    stockStatus: 'Tersedia',
    description: 'Pisang raja manis digoreng tepung crispy diselimuti keju parut gurih dan saus cokelat Belgian lumer.',
    image: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod-8',
    name: 'Dimsum Mentai Panggang (4 pcs)',
    categoryId: 'cat-3',
    price: 25000,
    stockStatus: 'Tersedia',
    description: 'Dimsum ayam udang lembut dengan topping saus mentai gurih dibakar torch aroma smoky menggoda.',
    image: 'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'prod-9',
    name: 'Cireng Crispy Bumbu Rujak Pedas',
    categoryId: 'cat-3',
    price: 15000,
    stockStatus: 'Habis',
    description: 'Cireng kenyal gurih dengan lapisan renyah di luar, dicocol saus rujak manis asam pedas nagih.',
    image: 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80'
  }
];

class SqliteDatabase {
  constructor(DatabaseSync) {
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
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

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
      for (const [key, val] of Object.entries(INITIAL_SETTINGS)) {
        insertSetting.run(key, val);
      }
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
      for (const cat of INITIAL_CATEGORIES) {
        insertCat.run(cat.id, cat.name, cat.slug);
      }
    }

    // Seed Products
    const existingProducts = this.db.prepare('SELECT COUNT(*) AS count FROM products').get();
    if (existingProducts.count === 0) {
      const insertProduct = this.db.prepare(`
        INSERT INTO products (id, name, category_id, price, stock_status, description, image)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      for (const p of INITIAL_PRODUCTS) {
        insertProduct.run(p.id, p.name, p.categoryId, p.price, p.stockStatus, p.description, p.image);
      }
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

  // --- Category SQL Operations ---
  getCategories() {
    return this.db.prepare(`
      SELECT 
        c.id, 
        c.name, 
        c.slug, 
        c.created_at AS createdAt,
        COUNT(p.id) AS productCount
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      GROUP BY c.id
      ORDER BY c.created_at ASC
    `).all();
  }

  getCategoryById(id) {
    return this.db.prepare('SELECT id, name, slug FROM categories WHERE id = ?').get(id);
  }

  addCategory(name) {
    const id = `cat-${Date.now()}`;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    this.db.prepare('INSERT INTO categories (id, name, slug) VALUES (?, ?, ?)').run(id, name, slug);
    return { id, name, slug, productCount: 0 };
  }

  updateCategory(id, name) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const res = this.db.prepare('UPDATE categories SET name = ?, slug = ? WHERE id = ?').run(name, slug, id);
    if (res.changes === 0) return null;
    return { id, name, slug };
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

class JsonDatabase {
  constructor() {
    this.data = this.loadOrSeed();
  }

  loadOrSeed() {
    if (fs.existsSync(JSON_FILE)) {
      try {
        return JSON.parse(fs.readFileSync(JSON_FILE, 'utf-8'));
      } catch (err) {
        console.error('Gagal membaca file database JSON, membuat ulang data awal:', err.message);
      }
    }

    const now = new Date().toISOString();
    const initialData = {
      settings: { ...INITIAL_SETTINGS },
      admins: [
        {
          id: 'admin-1',
          name: 'Owner Toko Berkah',
          email: 'admin@katalogwa.com',
          password: bcrypt.hashSync('admin123', 10),
          createdAt: now
        }
      ],
      categories: INITIAL_CATEGORIES.map((c) => ({ ...c })),
      products: INITIAL_PRODUCTS.map((p, idx) => ({
        ...p,
        createdAt: new Date(Date.now() - idx * 1000).toISOString(),
        updatedAt: new Date(Date.now() - idx * 1000).toISOString()
      }))
    };

    this.save(initialData);
    return initialData;
  }

  save(data = this.data) {
    fs.writeFileSync(JSON_FILE, JSON.stringify(data, null, 2), 'utf-8');
  }

  getSettings() {
    return { ...this.data.settings };
  }

  updateSettings(newSettings) {
    for (const [key, val] of Object.entries(newSettings)) {
      this.data.settings[key] = String(val);
    }
    this.save();
    return this.getSettings();
  }

  getAdmin() {
    return this.data.admins[0] || null;
  }

  getCategories() {
    return this.data.categories.map((c) => {
      const productCount = this.data.products.filter((p) => p.categoryId === c.id).length;
      return {
        id: c.id,
        name: c.name,
        slug: c.slug,
        createdAt: c.createdAt,
        productCount
      };
    });
  }

  getCategoryById(id) {
    const cat = this.data.categories.find((c) => c.id === id);
    if (!cat) return undefined;
    return { id: cat.id, name: cat.name, slug: cat.slug };
  }

  addCategory(name) {
    const exists = this.data.categories.some(
      (c) => c.name.toLowerCase() === name.toLowerCase()
    );
    if (exists) {
      throw new Error('Kategori dengan nama tersebut sudah ada');
    }
    const id = `cat-${Date.now()}`;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const createdAt = new Date().toISOString();
    this.data.categories.push({ id, name, slug, createdAt });
    this.save();
    return { id, name, slug, productCount: 0 };
  }

  updateCategory(id, name) {
    const idx = this.data.categories.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    this.data.categories[idx].name = name;
    this.data.categories[idx].slug = slug;
    this.save();
    return { id, name, slug };
  }

  deleteCategory(id) {
    const idx = this.data.categories.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    this.data.categories.splice(idx, 1);
    this.save();
    return true;
  }

  getProducts(filters = {}) {
    const catMap = new Map(this.data.categories.map((c) => [c.id, c.name]));
    let list = this.data.products
      .filter((p) => catMap.has(p.categoryId))
      .map((p) => ({
        ...p,
        categoryName: catMap.get(p.categoryId)
      }));

    if (filters.categoryId) {
      list = list.filter((p) => p.categoryId === filters.categoryId);
    }

    if (filters.stockStatus) {
      list = list.filter((p) => p.stockStatus === filters.stockStatus);
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (p) =>
          (p.name && p.name.toLowerCase().includes(q)) ||
          (p.description && p.description.toLowerCase().includes(q))
      );
    }

    return list.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));
  }

  getProductById(id) {
    const p = this.data.products.find((item) => item.id === id);
    if (!p) return undefined;
    const cat = this.getCategoryById(p.categoryId);
    return {
      ...p,
      categoryName: cat ? cat.name : ''
    };
  }

  addProduct(productData) {
    const id = `prod-${Date.now()}`;
    const now = new Date().toISOString();
    const newProduct = {
      id,
      name: productData.name,
      categoryId: productData.categoryId,
      price: Number(productData.price) || 0,
      stockStatus: productData.stockStatus || 'Tersedia',
      description: productData.description || '',
      image: productData.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
      createdAt: now,
      updatedAt: now
    };
    this.data.products.unshift(newProduct);
    this.save();
    return this.getProductById(id);
  }

  updateProduct(id, productData) {
    const idx = this.data.products.findIndex((p) => p.id === id);
    if (idx === -1) return null;

    const current = this.data.products[idx];
    this.data.products[idx] = {
      ...current,
      name: productData.name !== undefined ? productData.name : current.name,
      categoryId: productData.categoryId !== undefined ? productData.categoryId : current.categoryId,
      price: productData.price !== undefined ? Number(productData.price) : current.price,
      stockStatus: productData.stockStatus !== undefined ? productData.stockStatus : current.stockStatus,
      description: productData.description !== undefined ? productData.description : current.description,
      image: productData.image !== undefined ? productData.image : current.image,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.getProductById(id);
  }

  toggleStock(id) {
    const idx = this.data.products.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    const current = this.data.products[idx];
    current.stockStatus = current.stockStatus === 'Tersedia' ? 'Habis' : 'Tersedia';
    current.updatedAt = new Date().toISOString();
    this.save();
    return this.getProductById(id);
  }

  deleteProduct(id) {
    const idx = this.data.products.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    this.data.products.splice(idx, 1);
    this.save();
    return true;
  }
}

let dbInstance;
try {
  const sqliteModule = await import('node:sqlite');
  dbInstance = new SqliteDatabase(sqliteModule.DatabaseSync);
} catch {
  dbInstance = new JsonDatabase();
}

export const db = dbInstance;
