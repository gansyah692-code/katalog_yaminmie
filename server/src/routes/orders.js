import { randomBytes, randomUUID } from 'crypto';
import express from 'express';
import { db } from '../db/db.js';
import { authenticateToken } from '../db/middleware/auth.js';

const router = express.Router();

router.post('/', (req, res) => {
    try {
        const { customerName, notes = '', items } = req.body;
        if (typeof customerName !== 'string' || !customerName.trim() || customerName.trim().length > 120) {
            return res.status(400).json({ success: false, message: 'Nama pemesan wajib diisi (maksimal 120 karakter)' });
        }
        if (typeof notes !== 'string' || notes.length > 1000) {
            return res.status(400).json({ success: false, message: 'Catatan pesanan maksimal 1000 karakter' });
        }
        if (!Array.isArray(items) || items.length < 1 || items.length > 30) {
            return res.status(400).json({ success: false, message: 'Keranjang pesanan tidak valid' });
        }

        const seenProductIds = new Set();
        const orderItems = [];
        for (const item of items) {
            if (
                typeof item?.productId !== 'string' ||
                seenProductIds.has(item.productId) ||
                !Number.isInteger(item.quantity) ||
                item.quantity < 1 ||
                item.quantity > 99
            ) {
                return res.status(400).json({ success: false, message: 'Produk atau jumlah pesanan tidak valid' });
            }
            seenProductIds.add(item.productId);
            const product = db.getProductById(item.productId);
            if (!product) {
                return res.status(404).json({ success: false, message: 'Salah satu produk tidak lagi tersedia' });
            }
            if (product.stockStatus !== 'Tersedia') {
                return res.status(400).json({ success: false, message: `${product.name} sedang habis` });
            }

            const subtotal = product.price * item.quantity;
            if (!Number.isSafeInteger(product.price) || !Number.isSafeInteger(subtotal)) {
                return res.status(400).json({ success: false, message: 'Harga atau jumlah produk tidak valid' });
            }

            orderItems.push({
                productId: product.id,
                name: product.name,
                categoryName: product.categoryName,
                image: product.image,
                price: product.price,
                quantity: item.quantity,
                subtotal
            });
        }

        const total = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
        if (!Number.isSafeInteger(total)) {
            return res.status(400).json({ success: false, message: 'Total pesanan tidak valid' });
        }

        const trackingToken = randomBytes(32).toString('hex');
        const orderCode = `TXC-${Date.now().toString(36).toUpperCase()}-${randomBytes(2).toString('hex').toUpperCase()}`;
        const order = db.createOrder({
            id: randomUUID(),
            orderCode,
            trackingToken,
            customerName: customerName.trim(),
            notes: notes.trim(),
            items: orderItems,
            total
        });

        return res.status(201).json({
            success: true,
            message: 'Pesanan berhasil dicatat',
            order: {
                ...order,
                trackingToken
            }
        });
    } catch (error) {
        console.error('Create order error:', error);
        return res.status(500).json({ success: false, message: 'Pesanan gagal dicatat. Silakan coba kembali.' });
    }
});

router.get('/admin', authenticateToken, (req, res) => {
    const { status } = req.query;
    if (status !== undefined && !['pending', 'confirmed'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Filter status pesanan tidak valid' });
    }
    return res.json({ success: true, data: db.getOrders(status) });
});

router.patch('/admin/:id/confirm', authenticateToken, (req, res) => {
    const order = db.confirmOrder(req.params.id);
    if (!order) {
        const existing = db.getOrderById(req.params.id);
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
        }
        return res.status(409).json({ success: false, message: 'Pesanan sudah dikonfirmasi sebelumnya' });
    }
    return res.json({ success: true, message: 'Pesanan berhasil dikonfirmasi', data: order });
});

router.delete('/admin/:id', authenticateToken, (req, res) => {
    const deleted = db.deleteConfirmedOrder(req.params.id);
    if (!deleted) {
        const existing = db.getOrderById(req.params.id);
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Pesanan tidak ditemukan' });
        }
        return res.status(409).json({ success: false, message: 'Hanya riwayat pesanan yang sudah dikonfirmasi yang dapat dihapus' });
    }

    return res.json({ success: true, message: 'Riwayat pesanan berhasil dihapus' });
});

router.get('/track/:trackingToken', (req, res) => {
    const order = db.getOrderByTrackingToken(req.params.trackingToken);
    if (!order) {
        return res.status(404).json({ success: false, message: 'Status pesanan tidak ditemukan' });
    }
    return res.json({
        success: true,
        data: {
            orderCode: order.orderCode,
            status: order.status,
            createdAt: order.createdAt,
            confirmedAt: order.confirmedAt
        }
    });
});

export default router;
