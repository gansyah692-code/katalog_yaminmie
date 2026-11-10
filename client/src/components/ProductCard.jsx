import React from 'react';
import { ArrowUpRight, CheckCircle2, Plus, XCircle } from 'lucide-react';

export const ProductCard = ({ product, onSelectProduct, onAddToCart, badge }) => {
    const isAvailable = product.stockStatus === 'Tersedia';

    // Format Indonesian Rupiah
    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number);
    };

    const fallbackImage = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=700&q=80';
    const displayImage = product.image && product.image !== '-' ? product.image : fallbackImage;

    return (
        <article className={`product-card ${!isAvailable ? 'out-of-stock' : ''}`} id={`product-${product.id}`}>
            <div className="product-image-box">
                <img
                    src={displayImage}
                    alt={product.name}
                    className="product-img"
                    loading="lazy"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = fallbackImage;
                    }}
                />

                {badge && <span className="product-feature-badge">{badge}</span>}
                <button className="product-quick-view" onClick={() => onSelectProduct(product)} aria-label={`Lihat detail ${product.name}`}><ArrowUpRight size={18} /></button>
                <span className={`product-stock-tag ${isAvailable ? 'available' : 'unavailable'}`}>
                    {isAvailable ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    <span>{isAvailable ? 'Fresh today' : 'Sold out'}</span>
                </span>
            </div>
            <div className="product-content">
                <span className="product-cat-tag">{product.categoryName || 'T’xie Cake'}</span>
                <button className="product-title-button" onClick={() => onSelectProduct(product)}>
                    {product.name}
                </button>
                <p className="product-desc">{product.description || 'Dibuat fresh dengan bahan pilihan, untuk momen manis setiap hari.'}</p>
                <div className="product-bottom-row">
                    <span className="product-price">{formatRupiah(product.price)}</span>
                    <button
                        className="product-add-button"
                        disabled={!isAvailable}
                        onClick={() => onAddToCart(product)}
                        aria-label={`Tambahkan ${product.name} ke keranjang`}
                    >
                        <Plus size={17} />
                    </button>
                </div>
            </div>
        </article>
    );
};
