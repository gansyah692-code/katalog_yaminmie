import React from 'react';
import { MessageCircle, CheckCircle2, XCircle } from 'lucide-react';

export const ProductCard = ({ product, onSelectProduct }) => {
    const isAvailable = product.stockStatus === 'Tersedia';

    // Format Indonesian Rupiah
    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(number);
    };

    const fallbackImage = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80';
    const displayImage = product.image && product.image !== '-' ? product.image : fallbackImage;

    return (
        <div className={`product-card ${!isAvailable ? 'out-of-stock' : ''}`} id={`product-${product.id}`}>
            {/* Product Image Box */}
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

                {/* Category Pill Tag */}
                <span className="product-cat-tag">
                    {product.categoryName || 'Produk'}
                </span>

                {/* Stock Status Badge */}
                <span className={`product-stock-tag ${isAvailable ? 'available' : 'unavailable'}`}>
                    {isAvailable ? (
                        <>
                            <CheckCircle2 size={12} />
                            <span>Tersedia</span>
                        </>
                    ) : (
                        <>
                            <XCircle size={12} />
                            <span>Stok Habis</span>
                        </>
                    )}
                </span>
            </div>

            {/* Product Details */}
            <div className="product-content">
                <h3 className="product-title" title={product.name}>
                    {product.name}
                </h3>

                {product.description && (
                    <p className="product-desc">
                        {product.description}
                    </p>
                )}

                {/* Price & Order Action */}
                <div className="product-bottom-row" style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', paddingTop: '0.85rem', borderTop: '1px solid var(--slate-100)' }}>
                    <div className="product-price-group">
                        <span className="price-label">Harga</span>
                        <span className="product-price">{formatRupiah(product.price)}</span>
                    </div>

                    <button
                        className="btn btn-wa order-btn"
                        disabled={!isAvailable}
                        onClick={() => onSelectProduct(product)}
                        id={`btn-order-${product.id}`}
                        title={isAvailable ? 'Pesan produk ini via WhatsApp' : 'Produk saat ini sedang habis'}
                    >
                        <MessageCircle size={17} />
                        <span>{isAvailable ? 'Pesan via WA' : 'Habis'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
