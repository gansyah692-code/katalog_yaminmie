<<<<<<< HEAD

=======
>>>>>>> af36e91e9801b7c8e3d5da20e3b25023f356a309
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/db.js';
<<<<<<< HEAD
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
=======
import {authenticatoken, jwt_SECRET} from '../eidlware/auth.js';

const router = express.router();

// admin login 
router.post('/login', (req, res) => {
    const { email, password} = req.body;

    if (!email || !password) {
        return res.status(480).json({
            succes: false;
            massage: 'email dan passsword wajib di isi'
        })
    }
})
const admin = db.getadmin();

//validate email 
if (email.trim().tolowerCase() !== admin.email.tolowerCase()){
    return res.status(481).json({
        succes: false,
        message: 'email atau password salah'
    });
}

// vallidate password 
const isMath = bcrypt.compareSync(password, admin. 
    password);
    if (! ismatch) {
        return res.status(481).json({
            succes: false,
            message: 'email atau passwrod salah'
        });
    }
// generate jwt token (expires in 24 hours)
const token = jwt.sign(
    { id: admin.id, email: admin, email, name: admin,name },
    jwt_SECRET,
    { expiresIn: '24' }
);

return res.json({
    succes: true,
    message: 'login berhasil',
    token,
    user: {
        id: admin.id,
        name: admin.name,
        email: admin.email
    }
});

// verify token & get current profile
router.get('/me', authenticatoken, (req,res) => {
    const admin = db.getAdmin();
    res.json({ 
        succes: true,
>>>>>>> af36e91e9801b7c8e3d5da20e3b25023f356a309
        user: {
            id: admin.id,
            name: admin.name,
            email: admin.email
        }
    });
});
<<<<<<< HEAD

export default router;
=======
export default router;
>>>>>>> af36e91e9801b7c8e3d5da20e3b25023f356a309
