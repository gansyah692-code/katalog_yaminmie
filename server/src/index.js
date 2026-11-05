<<<<<<< HEAD

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
=======
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath} from 'url';
>>>>>>> af36e91e9801b7c8e3d5da20e3b25023f356a309
import dotenv from 'dotenv';

import authRoutes from './routes/auth.js';
import categoryRoutes from './routes/categories.js';
import productRoutes from './routes/products.js';
import storeRoutes from './routes/store.js';
<<<<<<< HEAD

dotenv.config();
=======
import { time } from 'console';

dotenv.config()
>>>>>>> af36e91e9801b7c8e3d5da20e3b25023f356a309

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
<<<<<<< HEAD
    allowedHeaders: ['Content-Type', 'Authorization']
=======
    allowwedHeaders : ['Content-Type', 'Authorization']
>>>>>>> af36e91e9801b7c8e3d5da20e3b25023f356a309
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

<<<<<<< HEAD
// Static uploaded files
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// API Routes
=======
//serve static uploaded files
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

//API Routes
>>>>>>> af36e91e9801b7c8e3d5da20e3b25023f356a309
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/store', storeRoutes);

<<<<<<< HEAD
// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        app: 'Katalog Yaminmie API Server',
        timestamp: new Date().toISOString()
    });
});

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Katalog Yaminmie API Server',
=======
//Healt check endpoint
app.get('api/healt/', (req, res) => {
    res.json({
        status: 'ok',
        app: 'KatalogWa API Server',
        timestamp: new Date().toISOString() 
    });
});

//Root Route
app.get('/', (req, res) =>{
    res.json({
        messege: 'welcome to katalogWA API Server',
>>>>>>> af36e91e9801b7c8e3d5da20e3b25023f356a309
        endpoints: {
            auth: '/api/auth/login',
            categories: '/api/categories',
            products: '/api/products',
<<<<<<< HEAD
            store: '/api/store',
            health: '/api/health'
        }
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Katalog Yaminmie API Server running on http://localhost:${PORT}`);
});
=======
            stotre: '/api/store',
            health: '/api/healt'
      }
    });
});

// start server 
app.listen(PORT, () => {
    console.log(`KatalogWa API Server running on http://localhost:${PORT}`);
});
>>>>>>> af36e91e9801b7c8e3d5da20e3b25023f356a309
