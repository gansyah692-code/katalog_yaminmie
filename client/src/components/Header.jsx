import React from 'react';
import { ShoppingBag, Lock, LogOut, LayoutDashboard, Store, ExternalLink } from 'lucide-react';

export const Header = ({
    storeSettings,
    isAdminView,
    setIsAdminView,
    adminUser,
    onOpenLogin,
    onLogout
}) => {
    return (
        <header className="site-header">
            <div className="container header-container">
                {/* Brand / Logo */}
                <div className="brand-group" onClick={() => setIsAdminView(false)} style={{ cursor: 'pointer' }}>
                    <div className="brand-icon">
                        <ShoppingBag size={24} color="#ffffff" />
                    </div>
                    <div className="brand-info">
                        <div className="brand-title-wrap">
                            <span className="brand-name">KatalogWA</span>
                            <span className="brand-tag">Pesan via WhatsApp</span>
                        </div>
                        <p className="store-subtext">
                            {storeSettings?.storeName || 'Toko Berkah Nusantara'} • <span className="text-emerald">{storeSettings?.tagline || 'Kuliner Lezat & Segar'}</span>
                        </p>
                    </div>
                </div>
                {/* Action Controls */}
                <div className="header-actions">
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
                            className="btn btn-secondary btn-sm admin-login-btn"
                            onClick={onOpenLogin}
                            id="admin-login-trigger"
                        >
                            <Lock size={16} />
                            <span>Login Admin</span>
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};
