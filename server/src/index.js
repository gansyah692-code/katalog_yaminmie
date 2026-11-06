import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import categoryRoutes from './routes/categories.js';
import productRoutes from './routes/products.js';
import storeRoutes from './routes/store.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Configuration
const allowedOrigins = process.env.CLIENT_URL
    ? process.env.CLIENT_URL.split(',').map((origin) => origin.trim())
    : '*';

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploaded files
const uploadsPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/store', storeRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        app: 'Katalog Yaminmie API Server',
        timestamp: new Date().toISOString()
    });
});

// Serve frontend build if present (for single-service deployment)
const clientDistPath = path.join(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
    app.use(express.static(clientDistPath));
    app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
            return next();
        }
        res.sendFile(path.join(clientDistPath, 'index.html'));
    });
} else {
    // Root route fallback
    app.get('/', (req, res) => {
        res.json({
            message: 'Welcome to Katalog Yaminmie API Server',
            endpoints: {
                auth: '/api/auth/login',
                categories: '/api/categories',
                products: '/api/products',
                store: '/api/store',
                health: '/api/health'
            }
        });
    });
}

// Start server
app.listen(PORT, () => {
    console.log(`Katalog Yaminmie API Server running on port ${PORT}`);
});
