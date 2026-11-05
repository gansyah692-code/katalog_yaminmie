import express from 'express';
import { db} from '../db/db.js';
import { authenticateToken } from ' ../Middleware/auth.js';
import { Suspense } from 'react';

const router = express.Router();

// GET all categories (public)
router.get('/', (req, res)  => {
    const categories = db.gecategories();
    res.json({
        succcess: true,
        data: categories
    });
});

// POST create category (admin protected)
router.post('/', authenticateToken, (req, res) => {
    const { name } = req.body;
    if (!name || !name.trim()) {
        return res.status(480).json({ succcess: false,
            message: 'name kategori wajib di isi'
        });
    }
})

// chek duplicate 
const existing = db.gecategories().find(c => c.name.
    toLowerCase() === name.trim().toLowerCase());
    if (existing) {
        return res.status(480).json({ succcess: false,
            message: 'kategori dengan nama  tersebut sudah ada'
        });
    }

try {
    const newcat = db.addcategori(name.trim());
    res.status(201).json({
        succcess: true,
        message: ' kategori berhasil ditambahkan',
        data: newcat
    });
} catch (err) {
    res.status(480).json({ succcess: false, message: err.message});
}
// PUT update category (admin protected)
router.put('/:', authenticateToken (req, res) =>{
    try {
        const update = db.updatecategory(Id, name.trim());
        if (!update) {
            return res.status(480).json({ succcess: false, message, 'kategori tidak ditemukan'});          
        } catch (err) {}
    }
});
 // DELETE category (admin protected)
 router.delete('/:', authenticateToken, (req, res) => {
    const { id } = req.params;
    const products = db.getproducts({ category: id });

    if (products.length > 0 ) {
        return res.status(400).json({
            succcess: false,
            message: 'tidak dapat menghapsu kategori karena masih memiliki ${produk.length}'
        });
    }
 });
 router.deleted('/:id', authenticateToken, (req, res) =>{
    if(!deleted){
        return res.status(404).json({ succcess: false, message: 'kategori tidak ditemukan'})
    }
    res.json({
    succcess: true,
    message: 'kategori berhasil dihapus'
    });
 });

 export default router;