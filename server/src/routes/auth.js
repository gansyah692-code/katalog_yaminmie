import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/db.js';
import {
    authenticateToken,
    JWT_SECRET
} from '../db/middleware/auth.js';

const router = express.Router();

// Admin login
router.post('/login', (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email dan password wajib diisi'
            });
        }

        const admin = db.getAdmin();

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Akun admin tidak ditemukan'
            });
        }

        if (email.trim().toLowerCase() !== admin.email.toLowerCase()) {
            return res.status(401).json({
                success: false,
                message: 'Email atau password salah'
            });
        }

        const isMatch = bcrypt.compareSync(password, admin.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Email atau password salah'
            });
        }

        const token = jwt.sign(
            {
                id: admin.id,
                email: admin.email,
                name: admin.name
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        return res.json({
            success: true,
            message: 'Login berhasil',
            token,
            user: {
                id: admin.id,
                name: admin.name,
                email: admin.email
            }
        });

    } catch (error) {
        console.error('Login error:', error);

        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan pada server'
        });
    }
});

// Verify token and get current profile
router.get('/me', authenticateToken, (req, res) => {
    const admin = db.getAdmin();

    if (!admin || admin.id !== req.user.id) {
        return res.status(404).json({
            success: false,
            message: 'Admin tidak ditemukan'
        });
    }

    res.json({
        success: true,
        user: {
            id: admin.id,
            name: admin.name,
            email: admin.email
        }
    });
});

router.put('/profile', authenticateToken, (req, res) => {
    try {
        const { name, currentPassword, newPassword } = req.body;
        const admin = db.getAdmin();

        if (!admin || admin.id !== req.user.id) {
            return res.status(404).json({
                success: false,
                message: 'Admin tidak ditemukan'
            });
        }

        if (typeof name !== 'string' || !name.trim() || name.trim().length > 80) {
            return res.status(400).json({
                success: false,
                message: 'Nama admin wajib diisi dan maksimal 80 karakter'
            });
        }

        let passwordHash = admin.password;
        if (newPassword !== undefined && newPassword !== '') {
            if (typeof currentPassword !== 'string' || !bcrypt.compareSync(currentPassword, admin.password)) {
                return res.status(400).json({
                    success: false,
                    message: 'Password saat ini tidak sesuai'
                });
            }

            if (typeof newPassword !== 'string' || newPassword.length < 8) {
                return res.status(400).json({
                    success: false,
                    message: 'Password baru minimal 8 karakter'
                });
            }

            passwordHash = bcrypt.hashSync(newPassword, 10);
        }

        const updated = db.updateAdminProfile(admin.id, {
            name: name.trim(),
            password: passwordHash
        });

        if (!updated) {
            return res.status(500).json({
                success: false,
                message: 'Profil admin gagal diperbarui'
            });
        }

        return res.json({
            success: true,
            message: 'Profil admin berhasil diperbarui',
            user: {
                id: admin.id,
                name: name.trim(),
                email: admin.email
            }
        });
    } catch (error) {
        console.error('Update admin profile error:', error);
        return res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat memperbarui profil admin'
        });
    }
});

export default router;
