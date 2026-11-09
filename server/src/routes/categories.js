import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from '../db/db.js'
import { authenticateToken } from '../db/middleware/auth.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const categoryImageUpload = multer({
    storage: multer.diskStorage({
        destination: (req, file, callback) => callback(null, uploadsDir),
        filename: (req, file, callback) => {
            const extension = path.extname(file.originalname).toLowerCase();
            callback(null, `category-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
        }
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
        const validExtension = /\.(jpeg|jpg|png|webp|gif)$/i.test(path.extname(file.originalname));
        const validMimeType = /^image\/(jpeg|png|webp|gif)$/i.test(file.mimetype);

        if (validExtension && validMimeType) return callback(null, true);
        return callback(new Error('Format gambar tidak didukung. Gunakan JPG, PNG, WEBP, atau GIF.'));
    }
});

// GET all categories (public)
router.get('/', (req, res) => {
    const categories = db.getCategories();
    res.json({
        success: true,
        data: categories
    });
});

// POST Create Category (Admin protected)
router.post('/', authenticateToken, (req, res) => {
    const { name } = req.body;
    if (!name || !name.trim()) {
        return res.status(400).json({
            success: false,
            message: 'Nama kategori wajib diisi'
        });
    }

    // Check duplicate
    const existing = db.getCategories().find(c => c.name.toLowerCase() === name.trim().toLowerCase());
    if (existing) {
        return res.status(400).json({
            success: false,
            message: 'Kategori dengan nama tersebut sudah ada'
        });
    }

    try {
        const newCat = db.addCategory(name.trim());
        res.status(201).json({
            success: true,
            message: 'Kategori berhasil ditambahkan',
            data: newCat,
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// PUT Update Category (Admin protected)
router.put('/:id', authenticateToken, categoryImageUpload.single('photo'), (req, res) => {
    const { id } = req.params;
    const { name } = req.body;

    if (!name || !name.trim()) {
        return res.status(400).json({
            success: false,
            message: 'Nama kategori wajib diisi'
        });
    }

    try {
        const image = req.file ? `/uploads/${req.file.filename}` : undefined;
        const updated = db.updateCategory(id, name.trim(), image);
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: 'Kategori tidak ditemukan'
            })
        }

        res.json({
            success: true,
            message: 'Kategori berhasil diperbarui',
            data: updated
        });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

//DELETE category (admin protected)
router.delete('/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    const products = db.getProducts({ categoryId: id });

    if (products.length > 0) {
        return res.status(400).json({
            success: false,
            message: `Tidak dapat menghapus kategori karena memiliki ${products.length} produk terkait. Hapus atau pindahkan produk terlebih dahulu.`
        });
    }

    const deleted = db.deleteCategory(id);
    if (!deleted) {
        return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
    }

    res.json({
        success: true,
        message: 'Kategori berhasil dihapus'
    });
});

router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        return res.status(400).json({
            success: false,
            message: error.code === 'LIMIT_FILE_SIZE'
                ? 'Ukuran gambar maksimal 5 MB'
                : error.message
        });
    }

    if (error) {
        return res.status(400).json({
            success: false,
            message: error.message || 'Gambar kategori gagal diunggah'
        });
    }

    return next();
});

export default router;