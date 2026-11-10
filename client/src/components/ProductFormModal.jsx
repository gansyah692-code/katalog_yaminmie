import React, { useState, useEffect } from 'react';
import { X, Upload, Image as ImageIcon, Save, AlertCircle } from 'lucide-react';

const PRESET_CAKE_IMAGES = [
    { label: 'Birthday Cake', url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=85' },
    { label: 'Cupcake', url: 'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=800&q=85' },
    { label: 'Donuts', url: 'https://images.unsplash.com/photo-1551024506-0cc8c5e2e4a9?auto=format&fit=crop&w=800&q=85' },
    { label: 'Brownies', url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=85' },
    { label: 'Cookies', url: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=800&q=85' },
    { label: 'Pastry', url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=85' }
];

export const ProductFormModal = ({ isOpen, onClose, onSave, editingProduct, categories }) => {
    const [name, setName] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [price, setPrice] = useState('');
    const [stockStatus, setStockStatus] = useState('Tersedia');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewSrc, setPreviewSrc] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (editingProduct) {
            setName(editingProduct.name || '');
            setCategoryId(editingProduct.categoryId || (categories[0]?.id || ''));
            setPrice(editingProduct.price ? String(editingProduct.price) : '');
            setStockStatus(editingProduct.stockStatus || 'Tersedia');
            setDescription(editingProduct.description || '');
            setImageUrl(editingProduct.image || '');
            setPreviewSrc(editingProduct.image || '');
            setSelectedFile(null);
        } else {
            setName('');
            setCategoryId(categories[0]?.id || '');
            setPrice('');
            setStockStatus('Tersedia');
            setDescription('');
            setImageUrl(PRESET_CAKE_IMAGES[0].url);
            setPreviewSrc(PRESET_CAKE_IMAGES[0].url);
            setSelectedFile(null);
        }
        setErrorMsg('');
    }, [editingProduct, categories, isOpen]);

    if (!isOpen) return null;

    // Handle file picker
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreviewSrc(objectUrl);
        }
    };

    // Handle preset image click
    const handleSelectPreset = (url) => {
        setSelectedFile(null);
        setImageUrl(url);
        setPreviewSrc(url);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (!name.trim()) {
            setErrorMsg('Nama produk wajib diisi.');
            return;
        }
        if (!categoryId) {
            setErrorMsg('Kategori produk wajib dipilih.');
            return;
        }
        if (!price || isNaN(price) || Number(price) <= 0) {
            setErrorMsg('Harga produk harus angka positif.');
            return;
        }

        setIsSubmitting(true);
        try {
            let payload;
            if (selectedFile) {
                payload = new FormData();
                payload.append('name', name.trim());
                payload.append('categoryId', categoryId);
                payload.append('price', price);
                payload.append('stockStatus', stockStatus);
                payload.append('description', description.trim());
                payload.append('photo', selectedFile);
            } else {
                payload = {
                    name: name.trim(),
                    categoryId,
                    price: Number(price),
                    stockStatus,
                    description: description.trim(),
                    imageUrl: previewSrc || imageUrl
                };
            }

            await onSave(payload, editingProduct?.id);
            onClose();
        } catch (err) {
            setErrorMsg(err.message || 'Gagal menyimpan produk.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div
                className="modal-content animate-slide-up"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '600px' }}
            >
                <div className="modal-header">
                    <div className="modal-title-group">
                        <h2 className="modal-title">
                            {editingProduct ? 'Edit Informasi Produk' : 'Tambah Produk Baru'}
                        </h2>
                        <p className="modal-subtitle">
                            Lengkapi data produk untuk katalog T’xie Cake
                        </p>
                    </div>
                    <button className="btn-icon" onClick={onClose} title="Tutup">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        {errorMsg && (
                            <div className="form-alert-error animate-fade-in">
                                <AlertCircle size={18} />
                                <span>{errorMsg}</span>
                            </div>
                        )}

                        {/* Product Image Preview & Selector */}
                        <div className="product-form-media-section">
                            <div className="media-preview-box">
                                {previewSrc ? (
                                    <img src={previewSrc} alt="Preview" className="media-preview-img" />
                                ) : (
                                    <div className="media-placeholder">
                                        <ImageIcon size={32} />
                                        <span>Belum ada foto</span>
                                    </div>
                                )}
                            </div>

                            <div className="media-controls">
                                <label className="btn btn-secondary btn-sm upload-file-btn">
                                    <Upload size={15} />
                                    <span>Upload Foto dari Perangkat</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        style={{ display: 'none' }}
                                    />
                                </label>

                                <div className="preset-images-row">
                                    <span className="preset-label">Atau pilih sampel cepat:</span>
                                    <div className="preset-thumbs">
                                        {PRESET_CAKE_IMAGES.map((preset, idx) => (
                                            <button
                                                type="button"
                                                key={idx}
                                                className={`preset-thumb-btn ${previewSrc === preset.url ? 'active' : ''}`}
                                                onClick={() => handleSelectPreset(preset.url)}
                                                title={preset.label}
                                            >
                                                <img src={preset.url} alt={preset.label} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Product Name */}
                        <div className="form-group">
                            <label className="form-label">
                                <span>Nama Produk</span>
                                <span className="text-danger">*</span>
                            </label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="cth: Golden Hour Birthday Cake"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>

                        {/* Category & Price Row */}
                        <div className="form-row-2">
                            <div className="form-group">
                                <label className="form-label">
                                    <span>Kategori</span>
                                    <span className="text-danger">*</span>
                                </label>
                                <select
                                    className="form-select"
                                    value={categoryId}
                                    onChange={(e) => setCategoryId(e.target.value)}
                                    required
                                >
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <span>Harga (Rp)</span>
                                    <span className="text-danger">*</span>
                                </label>
                                <input
                                    type="number"
                                    className="form-input"
                                    placeholder="25000"
                                    min="0"
                                    step="500"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    required
                                />
                            </div>
                        </div>

                        {/* Stock Status Selector */}
                        <div className="form-group">
                            <label className="form-label">
                                <span>Status Stok</span>
                            </label>
                            <div className="stock-radio-group">
                                <label className={`stock-radio-card ${stockStatus === 'Tersedia' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="stockStatus"
                                        value="Tersedia"
                                        checked={stockStatus === 'Tersedia'}
                                        onChange={() => setStockStatus('Tersedia')}
                                    />
                                    <div>
                                        <strong>Tersedia</strong>
                                        <p>Produk dapat dipesan pelanggan via WhatsApp</p>
                                    </div>
                                </label>

                                <label className={`stock-radio-card ${stockStatus === 'Habis' ? 'selected-out' : ''}`}>
                                    <input
                                        type="radio"
                                        name="stockStatus"
                                        value="Habis"
                                        checked={stockStatus === 'Habis'}
                                        onChange={() => setStockStatus('Habis')}
                                    />
                                    <div>
                                        <strong>Habis</strong>
                                        <p>Tombol pemesanan dinonaktifkan di katalog</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="form-group">
                            <label className="form-label">
                                <span>Deskripsi Menu</span>
                            </label>
                            <textarea
                                rows="2"
                                className="form-textarea"
                                placeholder="Jelaskan bumbu, bahan, porsi, atau keunikan rasa menu ini..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSubmitting}
                        >
                            <Save size={16} />
                            <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Produk'}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};