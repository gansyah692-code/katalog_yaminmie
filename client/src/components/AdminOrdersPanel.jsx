import React from 'react';
import { CheckCircle2, Clock3, PackageCheck, RefreshCw, ShoppingBag, Trash2 } from 'lucide-react';

const formatRupiah = (number) => new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0
}).format(number || 0);

const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value.replace(' ', 'T') + (value.endsWith('Z') ? '' : 'Z'));
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString('id-ID');
};

export function AdminOrdersPanel({
  orders, history, loading, error, onRefresh, onConfirm, confirmingOrderId, onDelete, deletingOrderId
}) {
  const heading = history ? 'Riwayat Pemesanan' : 'Pesanan Masuk';

  return (
    <section className={`admin-orders-panel ${history ? 'order-history-panel' : ''}`}>
      <div className="admin-orders-heading">
        <div>
          <span className="eyebrow">{history ? 'Pesanan terkonfirmasi' : 'Perlu tindakan admin'}</span>
          <h2>{heading}</h2>
          <p>{history ? 'Pesanan yang sudah dikonfirmasi tersimpan di sini.' : 'Periksa detail pesanan pelanggan, lalu konfirmasi untuk memindahkannya ke riwayat.'}</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={onRefresh} disabled={loading}>
          <RefreshCw size={15} className={loading ? 'animate-spin' : ''} /><span>Perbarui</span>
        </button>
      </div>

      {error && <div className="form-alert-error" role="alert">{error}</div>}
      {!history && (
        <div className="admin-order-confirm-help" role="note">
          <CheckCircle2 size={17} />
          <span>Setelah pesanan diperiksa, klik <strong>Konfirmasi Pesanan</strong>. Status pelanggan akan berubah menjadi <strong>Selesai dikonfirmasi</strong> di riwayat pesanan pada header website, dan pesanan ini masuk ke riwayat admin.</span>
        </div>
      )}

      {loading && !orders.length ? (
        <div className="admin-orders-empty"><RefreshCw size={24} className="animate-spin" /><span>Memuat pesanan...</span></div>
      ) : orders.length ? (
        <div className="admin-order-grid">
          {orders.map((order) => (
            <article className={`admin-order-card ${history ? 'confirmed-order-card' : ''}`} key={order.id}>
              <header className="admin-order-card-header">
                <div><span className="admin-order-code">{order.orderCode}</span><small>{formatDate(order.createdAt)}</small></div>
                <span className={`admin-order-status ${history ? 'confirmed' : 'pending'}`}>
                  {history ? <CheckCircle2 size={14} /> : <Clock3 size={14} />}{history ? 'Selesai' : 'Menunggu'}
                </span>
              </header>
              <div className="admin-order-customer"><strong>{order.customerName}</strong>{order.notes && <p>{order.notes}</p>}</div>
              <div className="admin-order-items">
                {order.items.map((item) => (
                  <div className="admin-order-item" key={`${order.id}-${item.productId}`}>
                    <span>{item.name} <small>× {item.quantity}</small></span><strong>{formatRupiah(item.subtotal)}</strong>
                  </div>
                ))}
              </div>
              <div className="admin-order-total"><span>Total pesanan</span><strong>{formatRupiah(order.total)}</strong></div>
              {history ? (
                <div className="admin-order-history-actions">
                  <div className="admin-order-confirmed-note"><PackageCheck size={16} /> Dikonfirmasi {formatDate(order.confirmedAt)}</div>
                  <button className="btn btn-danger btn-sm" onClick={() => onDelete(order)} disabled={deletingOrderId === order.id}>
                    <Trash2 size={14} /><span>{deletingOrderId === order.id ? 'Menghapus...' : 'Hapus Riwayat'}</span>
                  </button>
                </div>
              ) : (
                <button className="btn btn-primary admin-order-confirm-button" onClick={() => onConfirm(order.id)} disabled={confirmingOrderId === order.id}>
                  <CheckCircle2 size={16} /><span>{confirmingOrderId === order.id ? 'Mengonfirmasi...' : 'Konfirmasi Pesanan'}</span>
                </button>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="admin-orders-empty">
          <ShoppingBag size={30} />
          <strong>{history ? 'Belum ada riwayat pesanan' : 'Belum ada pesanan masuk'}</strong>
          <span>{history ? 'Pesanan akan tercatat di sini setelah dikonfirmasi.' : 'Pesanan baru dari checkout pelanggan akan muncul di sini.'}</span>
        </div>
      )}
    </section>
  );
}
