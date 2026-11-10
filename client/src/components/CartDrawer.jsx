import React, { useState } from 'react';
import { AlertCircle, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { createOrder } from '../services/api';

const formatRupiah = (number) => new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0
}).format(number || 0);

export function CartDrawer({ cart, onClose, onUpdateQuantity, onRemove, onOrderPlaced, onOrderComplete }) {
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!customerName.trim()) {
      setError('Nama pemesan wajib diisi.');
      return;
    }
    if (!cart.length) {
      setError('Keranjang masih kosong.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await createOrder({
        customerName: customerName.trim(),
        notes: notes.trim(),
        items: cart.map((item) => ({ productId: item.id, quantity: item.quantity }))
      });
      onOrderPlaced?.(response.order);
      onOrderComplete?.();
      onClose();
    } catch (submitError) {
      setError(submitError.message || 'Pesanan gagal dikirim. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="cart-drawer-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title">
        <header className="cart-drawer-header">
          <div>
            <h2 id="cart-drawer-title"><ShoppingBag size={20} /> Keranjang Belanja</h2>
            <span>{cart.length} jenis produk</span>
          </div>
          <button type="button" className="btn-icon" onClick={onClose} aria-label="Tutup keranjang"><X size={20} /></button>
        </header>

        {error && <div className="form-alert-error cart-drawer-error" role="alert"><AlertCircle size={16} />{error}</div>}

        {cart.length ? (
          <form className="cart-drawer-form" onSubmit={handleSubmit}>
            <div className="cart-drawer-items">
              {cart.map((item) => (
                <article className="cart-drawer-item" key={item.id}>
                  <img src={item.image || ''} alt="" />
                  <div className="cart-drawer-item-info">
                    <strong>{item.name}</strong>
                    <span>{formatRupiah(item.price)}</span>
                    <div className="cart-quantity-control">
                      <button type="button" onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} aria-label={`Kurangi ${item.name}`}><Minus size={13} /></button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} aria-label={`Tambah ${item.name}`}><Plus size={13} /></button>
                      <button type="button" className="cart-remove-button" onClick={() => onRemove(item.id)} aria-label={`Hapus ${item.name}`}><Trash2 size={15} /></button>
                    </div>
                  </div>
                  <strong className="cart-line-total">{formatRupiah(item.price * item.quantity)}</strong>
                </article>
              ))}
            </div>

            <div className="cart-drawer-checkout">
              <div className="cart-drawer-total"><span>Total</span><strong>{formatRupiah(total)}</strong></div>
              <label className="form-group">
                <span className="form-label">Nama pemesan</span>
                <input className="form-input" value={customerName} onChange={(event) => setCustomerName(event.target.value)} maxLength={120} required />
              </label>
              <label className="form-group">
                <span className="form-label">Catatan / alamat (opsional)</span>
                <textarea className="form-textarea" rows="2" value={notes} onChange={(event) => setNotes(event.target.value)} maxLength={1000} />
              </label>
              <button className="btn btn-primary cart-submit-button" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Mengirim pesanan...' : 'Kirim Pesanan'}
              </button>
            </div>
          </form>
        ) : (
          <div className="cart-drawer-empty"><ShoppingBag size={32} /><strong>Keranjang masih kosong</strong><span>Pilih menu favorit untuk mulai memesan.</span></div>
        )}
      </aside>
    </div>
  );
}
