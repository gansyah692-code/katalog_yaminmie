import React, { useEffect, useState } from 'react';
import { CakeSlice, Clock3, History, Lock, LogOut, LayoutDashboard, Menu, PackageCheck, ShoppingBag, Store, X } from 'lucide-react';
import { fetchOrderStatus } from '../services/api';

const formatOrderDate = (value) => {
    if (!value) return '';
    const dateValue = value.includes('T') ? value : `${value.replace(' ', 'T')}Z`;
    const date = new Date(dateValue);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString('id-ID');
};

const formatRupiah = (number) => new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
}).format(number || 0);

export const Header = ({
    storeSettings,
    isAdminView,
    setIsAdminView,
    adminUser,
    onOpenLogin,
    onLogout,
    onOpenCart,
    cartCount,
    trackedOrders,
    onTrackedOrdersChange
}) => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);
    const [trackingErrors, setTrackingErrors] = useState({});
    const trackingTokens = trackedOrders.map((order) => order.trackingToken).filter(Boolean).join('|');

    useEffect(() => {
        if (!trackingTokens) return undefined;
        const requestState = { isActive: true };
        const refreshStatus = async () => {
            const results = await Promise.all(trackingTokens.split('|').map(async (trackingToken) => {
                try {
                    const response = await fetchOrderStatus(trackingToken);
                    return { trackingToken, data: response.data };
                } catch (error) {
                    console.error(`Gagal memperbarui status pesanan ${trackingToken}:`, error);
                    return { trackingToken, error: error.message || 'Status pesanan belum dapat diperbarui.' };
                }
            }));
            if (!requestState.isActive) return;

            const statusUpdates = new Map(results.filter((result) => result.data).map((result) => [result.trackingToken, result.data]));
            onTrackedOrdersChange((orders) => orders.map((order) => {
                const update = statusUpdates.get(order.trackingToken);
                if (!update) return order;
                if (
                    order.orderCode === update.orderCode &&
                    order.status === update.status &&
                    order.createdAt === update.createdAt &&
                    order.confirmedAt === update.confirmedAt
                ) return order;
                return { ...order, ...update };
            }));
            setTrackingErrors(Object.fromEntries(results
                .filter((result) => result.error)
                .map((result) => [result.trackingToken, result.error])));
        };
        refreshStatus();
        const intervalId = window.setInterval(refreshStatus, 15000);
        return () => {
            requestState.isActive = false;
            window.clearInterval(intervalId);
        };
    }, [trackingTokens, onTrackedOrdersChange]);

    return (
        <header className="site-header">
            <div className="container header-container">
                <a className="bakery-brand" href="#home" onClick={() => { setMenuOpen(false); setIsAdminView(false); }}>
                    <span className="brand-monogram">
                        {storeSettings?.logo ? <img src={storeSettings.logo} alt="" /> : <CakeSlice size={22} />}
                    </span>
                    <span><strong>{storeSettings?.storeName || 'T’xie Cake'}</strong><small>{storeSettings?.tagline || 'A Little Sweetness, A Lot of Happiness.'}</small></span>
                </a>
                <button className="mobile-menu-toggle" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? 'Tutup menu' : 'Buka menu'} aria-expanded={menuOpen}>
                    {menuOpen ? <X size={21} /> : <Menu size={21} />}
                </button>
                <nav className={`bakery-nav ${menuOpen ? 'open' : ''}`} aria-label="Navigasi utama">
                    <a href="#home" onClick={() => setMenuOpen(false)}>Home</a>
                    <a href="#categories" onClick={() => setMenuOpen(false)}>Categories</a>
                    <a href="#about" onClick={() => setMenuOpen(false)}>About Us</a>
                    <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
                </nav>
                <div className="header-actions">
                    <button
                        className="order-history-trigger"
                        onClick={() => setIsOrderHistoryOpen(true)}
                        title="Lihat riwayat pesanan"
                        aria-label={`Riwayat pesanan, ${trackedOrders.length} pesanan`}
                    >
                        <History size={16} />
                        <span>Riwayat Pesanan</span>
                        {trackedOrders.length > 0 && <span className="order-history-count">{trackedOrders.length}</span>}
                    </button>
                    <button className="cart-trigger" onClick={onOpenCart} aria-label={`Buka keranjang, ${cartCount} item`}>
                        <ShoppingBag size={19} /><span className="cart-trigger-label">Cart</span>
                        {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
                    </button>
                    {adminUser ? (
                        <div className="admin-status-bar">
                            <span className="admin-badge">
                                <span className="admin-dot"></span>
                                Admin: {adminUser.name || 'Owner'}
                            </span>

                            {isAdminView ? (
                                <button
                                    className="btn btn-secondary btn-sm"
                                    onClick={() => setIsAdminView(false)}
                                    title="Kembali ke tampilan pelanggan"
                                >
                                    <Store size={16} />
                                    <span>Lihat Katalog</span>
                                </button>
                            ) : (
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => setIsAdminView(true)}
                                    title="Buka panel admin"
                                >
                                    <LayoutDashboard size={16} />
                                    <span>Dashboard Admin</span>
                                </button>
                            )}

                            <button
                                className="btn btn-danger-soft btn-sm"
                                onClick={onLogout}
                                title="Keluar dari akun admin"
                            >
                                <LogOut size={16} />
                                <span>Logout</span>
                            </button>
                        </div>
                    ) : (
                        <button
                            className="admin-login-btn"
                            onClick={onOpenLogin}
                            id="admin-login-trigger"
                        >
                            <Lock size={16} />
                            <span>Admin</span>
                        </button>
                    )}
                    <a className="header-order-button" href="#products">Order Now</a>
                </div>
            </div>
            {isOrderHistoryOpen && (
                <div className="order-status-overlay" onClick={() => setIsOrderHistoryOpen(false)}>
                    <section className="order-status-modal order-history-modal" role="dialog" aria-modal="true" aria-labelledby="order-history-title" onClick={(event) => event.stopPropagation()}>
                        <button className="icon-button order-status-close" onClick={() => setIsOrderHistoryOpen(false)} aria-label="Tutup riwayat pesanan"><X size={18} /></button>
                        <span className="eyebrow">Pesanan Anda</span>
                        <h2 id="order-history-title">Riwayat Pesanan</h2>
                        <p className="order-status-help">Status diperbarui otomatis setelah tim T’xie Cake mengonfirmasi pesanan.</p>
                        {trackedOrders.length ? (
                            <div className="order-history-list" aria-live="polite">
                                {trackedOrders.map((order) => (
                                    <article className="order-history-card" key={order.trackingToken}>
                                        <div className="order-history-card-heading">
                                            <div>
                                                <strong>{order.orderCode}</strong>
                                                {order.createdAt && <small>{formatOrderDate(order.createdAt)}</small>}
                                            </div>
                                            <span className={`order-history-status ${order.status === 'confirmed' ? 'is-confirmed' : ''}`}>
                                                {order.status === 'confirmed' ? <PackageCheck size={14} /> : <Clock3 size={14} />}
                                                {order.status === 'confirmed' ? 'Selesai dikonfirmasi' : 'Menunggu konfirmasi'}
                                            </span>
                                        </div>
                                        {order.items?.length > 0 && (
                                            <div className="order-history-items">
                                                {order.items.map((item, index) => (
                                                    <span key={`${order.trackingToken}-${item.productId || item.name}-${index}`}>{item.name} × {item.quantity}</span>
                                                ))}
                                            </div>
                                        )}
                                        {Number.isFinite(order.total) && (
                                            <div className="order-history-total">
                                                <span>Total pesanan</span>
                                                <strong>{formatRupiah(order.total)}</strong>
                                            </div>
                                        )}
                                        {trackingErrors[order.trackingToken] && (
                                            <p className="order-tracking-error" role="alert">{trackingErrors[order.trackingToken]}</p>
                                        )}
                                        {order.confirmedAt && <small className="order-history-confirmed-at">Dikonfirmasi {formatOrderDate(order.confirmedAt)}</small>}
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <div className="order-history-empty">
                                <ShoppingBag size={26} />
                                <strong>Belum ada riwayat pesanan</strong>
                                <span>Pesanan yang dibuat dari perangkat ini akan muncul di sini.</span>
                            </div>
                        )}
                        <button className="cake-button cake-button-outline order-history-close-button" onClick={() => setIsOrderHistoryOpen(false)}>Tutup</button>
                    </section>
                </div>
            )}
        </header>
    );
};
