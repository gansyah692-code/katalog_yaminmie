import React from 'react';
import { ArrowLeft, CheckCircle2, Plus, XCircle } from 'lucide-react';

const formatRupiah = (number) => new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0
}).format(number || 0);

export function ProductDetailModal({ product, onClose, onAddToCart }) {
  if (!product) return null;
  const isAvailable = product.stockStatus === 'Tersedia';

  return (
    <div className="product-detail-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <article className="product-detail-dialog" role="dialog" aria-modal="true" aria-labelledby="product-detail-title">
        <button className="product-detail-close" type="button" onClick={onClose} aria-label="Tutup detail produk"><ArrowLeft size={18} /><span>Tutup</span></button>
        <img className="product-detail-image" src={product.image || ''} alt={product.name} />
        <div className="product-detail-content">
          <span className="product-detail-category">{product.categoryName || 'Menu'}</span>
          <h2 id="product-detail-title">{product.name}</h2>
          <p>{product.description || 'Dibuat fresh dengan bahan pilihan untuk momen istimewa Anda.'}</p>
          <strong className="product-detail-price">{formatRupiah(product.price)}</strong>
          <span className={`product-detail-stock ${isAvailable ? 'available' : 'unavailable'}`}>
            {isAvailable ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            {isAvailable ? 'Tersedia' : 'Stok habis'}
          </span>
          <button className="btn btn-primary" type="button" disabled={!isAvailable} onClick={() => onAddToCart(product)}>
            <Plus size={17} /> Tambahkan ke keranjang
          </button>
        </div>
      </article>
    </div>
  );
}
