
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from '../db/db.js';
import { authenticateToken } from '../db/middleware/auth.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const logoUpload = multer({
    storage: multer.diskStorage({
        destination: (req, file, callback) => callback(null, uploadsDir),
        filename: (req, file, callback) => {
            const extension = path.extname(file.originalname).toLowerCase();
            callback(null, `store-logo-${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`);
        }
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
        const allowedExtension = /\.(jpeg|jpg|png|webp|gif)$/i.test(path.extname(file.originalname));
        const allowedMimeType = /^image\/(jpeg|png|webp|gif)$/i.test(file.mimetype);

        if (allowedExtension && allowedMimeType) return callback(null, true);
        return callback(new Error('Format logo tidak didukung. Gunakan JPG, PNG, WEBP, atau GIF.'));
    }
});

// GET Store settings (public)
router.get('/', (req, res) => {
    try {
        const settings = db.getSettings();

        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

// PUT Update store settings (admin protected)
router.put('/', authenticateToken, logoUpload.single('logo'), (req, res) => {
    try {
        const { storeName, tagline, phone, address, logoUrl } = req.body;

        const current = db.getSettings();

        const updated = db.updateSettings({
            storeName: storeName ?? current.storeName,
            tagline: tagline ?? current.tagline,
            phone: phone !== undefined
                ? phone.replace(/[^0-9]/g, '')
                : current.phone,
            address: address ?? current.address,
            logo: req.file ? `/uploads/${req.file.filename}` : (logoUrl ?? current.logo ?? '')
        });

        res.json({
            success: true,
            message: 'Pengaturan toko berhasil disimpan',
            data: updated
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});

router.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        return res.status(error.code === 'LIMIT_FILE_SIZE' ? 400 : 400).json({
            success: false,
            message: error.code === 'LIMIT_FILE_SIZE'
                ? 'Ukuran logo maksimal 5 MB'
                : error.message
        });
    }

    if (error) {
        return res.status(400).json({
            success: false,
            message: error.message || 'Logo toko gagal diunggah'
        });
    }

    return next();
});

export default router;
