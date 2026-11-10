import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight, CakeSlice, ChefHat, Clock3, Heart, Leaf, MapPin,
  MessageCircle, RefreshCw, ShieldCheck, Sparkles, Star, Truck
} from 'lucide-react';
import {
  cleanAuthToken, fetchAdminProfile, fetchCategories, fetchProducts,
  fetchStoreSettings, getAuthToken
} from './services/api';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLoginModal } from './components/AdminLoginModal';
import { CartDrawer } from './components/CartDrawer';
import { CategoryPills } from './components/CategoryPills';
import { Header } from './components/Header';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { SearchBar } from './components/SearchBar';

const testimonials = [
  { quote: 'Cake-nya lembut banget dan manisnya pas. Semua tamu di acara ulang tahun suka!', name: 'Nadia Putri', detail: 'Pelanggan Birthday Cake', stars: 5 },
  { quote: 'Pesanannya datang rapi, rasanya fresh seperti baru keluar dari oven. Pasti repeat order.', name: 'Rizky Amelia', detail: 'Pelanggan T’xie Cake', stars: 5 },
  { quote: 'Cupcake cantik dan enak, cocok banget buat hadiah. Adminnya juga ramah dan responsif.', name: 'Maya Anindita', detail: 'Pelanggan Cupcake', stars: 5 }
];
const CURRENT_YEAR = new Date().getFullYear();

export function App() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [storeSettings, setStoreSettings] = useState(null);
  const [activeCategoryId, setActiveCategoryId] = useState('');
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAdminView, setIsAdminView] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [trackedOrders, setTrackedOrders] = useState(() => {
    try {
      const savedHistory = JSON.parse(localStorage.getItem('txie_order_history') || '[]');
      const history = Array.isArray(savedHistory)
        ? savedHistory.filter((order) => typeof order?.trackingToken === 'string')
        : [];
      const lastOrder = JSON.parse(localStorage.getItem('txie_last_order') || 'null');
      if (lastOrder?.trackingToken && !history.some((order) => order.trackingToken === lastOrder.trackingToken)) {
        return [lastOrder, ...history];
      }
      return history;
    } catch (error) {
      console.error('Gagal membaca riwayat pesanan tersimpan:', error);
      return [];
    }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadData = async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true);
      setErrorMessage('');
    }
    try {
      const [prodRes, catRes, storeRes] = await Promise.all([
        fetchProducts(), fetchCategories(), fetchStoreSettings()
      ]);
      setProducts(prodRes?.data || []);
      setCategories(catRes?.data || []);
      setStoreSettings(storeRes?.data || null);
    } catch (error) {
      console.error('Gagal mengambil data katalog:', error);
      setErrorMessage(error.message || 'Katalog belum dapat dimuat. Coba lagi sebentar.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(false);
    const token = getAuthToken();
    if (token) {
      fetchAdminProfile()
        .then((response) => {
          if (response?.user) setAdminUser(response.user);
        })
        .catch(() => {
          cleanAuthToken();
          setAdminUser(null);
        });
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('txie_order_history', JSON.stringify(trackedOrders));
    } catch (error) {
      console.error('Gagal menyimpan riwayat pesanan:', error);
    }
  }, [trackedOrders]);

  const filteredProducts = useMemo(() => products.filter((product) => {
    const matchesCategory = !activeCategoryId || product.categoryId === activeCategoryId;
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || [product.name, product.description, product.categoryName]
      .some((value) => value?.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  }), [products, activeCategoryId, search]);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const whatsappUrl = `https://wa.me/${(storeSettings?.phone || '6281234567890').replace(/[^0-9]/g, '')}?text=${encodeURIComponent('Halo T’xie Cake, saya ingin bertanya tentang menu kue.')}`;

  const addToCart = (product) => {
    setCart((items) => {
      const existing = items.find((item) => item.id === product.id);
      return existing
        ? items.map((item) => item.id === product.id
          ? { ...item, quantity: Math.min(item.quantity + 1, 99) }
          : item)
        : [...items, { ...product, quantity: 1 }];
    });
    setSelectedProduct(null);
    setIsCartOpen(true);
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity < 1) {
      setCart((items) => items.filter((item) => item.id !== productId));
      return;
    }
    setCart((items) => items.map((item) => item.id === productId
      ? { ...item, quantity: Math.min(quantity, 99) }
      : item));
  };

  const handleLogout = () => {
    cleanAuthToken();
    setAdminUser(null);
    setIsAdminView(false);
  };

  if (isAdminView && adminUser) {
    return (
      <AdminDashboard
        key={storeSettings ? 'settings-loaded' : 'settings-loading'}
        products={products}
        categories={categories}
        storeSettings={storeSettings}
        adminUser={adminUser}
        onRefreshData={loadData}
        onAdminProfileUpdate={setAdminUser}
        onBackToCatalog={() => setIsAdminView(false)}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="app-layout">
      <Header
        storeSettings={storeSettings}
        isAdminView={isAdminView}
        setIsAdminView={setIsAdminView}
        adminUser={adminUser}
        onOpenLogin={() => setIsAdminLoginOpen(true)}
        onLogout={handleLogout}
        onOpenCart={() => setIsCartOpen(true)}
        cartCount={cartCount}
        trackedOrders={trackedOrders}
        onTrackedOrdersChange={setTrackedOrders}
      />

      <main className="customer-catalog-view">
        <section className="bakery-hero" id="home">
          <div className="container bakery-hero-grid">
            <div className="bakery-hero-copy">
              <span className="eyebrow"><Sparkles size={15} /> Fresh from our oven</span>
              <h1>Made with Love,<br /><em>Baked for Happiness.</em></h1>
              <p>Discover the sweetness in every bite. Freshly baked cakes and delightful treats made specially for your sweetest moments.</p>
              <div className="hero-actions">
                <a className="cake-button cake-button-primary" href="#products">Explore Our Menu <ArrowRight size={17} /></a>
                <a className="cake-button cake-button-outline" href="#products">
                  <MessageCircle size={17} /> Order Now
                </a>
              </div>
              <div className="hero-note">
                <div className="hero-avatar-stack" aria-hidden="true"><span>♡</span><span>✿</span><span>✦</span></div>
                <span>Small batches, made with love every day</span>
              </div>
            </div>
            <div className="bakery-hero-visual">
              <div className="hero-image-frame">
                <img
                  src="https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1150&q=90"
                  alt="Kue ulang tahun berlapis dengan dekorasi krim"
                />
              </div>
              <div className="hero-image-caption"><span className="caption-sparkle">✳</span><span>Made fresh, just for you</span></div>
              <div className="hero-roundel"><span>BAKED<br />WITH LOVE</span><Heart size={20} fill="currentColor" /></div>
            </div>
          </div>
        </section>

        <section className="bakery-perks" aria-label="Keunggulan T'xie Cake">
          <div className="container bakery-perks-grid">
            <div><ChefHat /><span><strong>Freshly baked</strong><small>Made daily with care</small></span></div>
            <div><Leaf /><span><strong>Quality ingredients</strong><small>Goodness in every bite</small></span></div>
            <div><Truck /><span><strong>Made for moments</strong><small>Thoughtful delivery</small></span></div>
            <div><Heart /><span><strong>Made with love</strong><small>A little joy in every box</small></span></div>
          </div>
        </section>

        <div className="container bakery-main">
          {errorMessage && (
            <div className="bakery-error" role="alert">
              <span>{errorMessage}</span>
              <button className="cake-button cake-button-outline" onClick={loadData}><RefreshCw size={15} /> Coba lagi</button>
            </div>
          )}

          <section className="bakery-section category-section" id="categories">
            <div className="section-heading">
              <div><span className="eyebrow">A little something for everyone</span><h2>Find your <em>favorite</em></h2></div>
              <p>Manis, lembut, dan selalu dibuat dengan sepenuh hati.</p>
            </div>
            <div className="category-list">
              {categories.map((category) => (
                <button
                  className={`category-link ${activeCategoryId === category.id ? 'selected' : ''}`}
                  key={category.id}
                  onClick={() => {
                    setActiveCategoryId(category.id === activeCategoryId ? '' : category.id);
                    document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  aria-pressed={activeCategoryId === category.id}
                >
                  <span>{category.name}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="bakery-section products-section" id="products">
            <div className="section-heading products-heading">
              <div><span className="eyebrow">Best Seller Products & new arrivals</span><h2>Our <em>sweetest picks</em></h2></div>
              <a className="text-link" href="#all-products">See all treats <ArrowRight size={16} /></a>
            </div>
            <div className="product-tools">
              <SearchBar search={search} setSearch={setSearch} placeholder="Cari cake, cupcake, cookies..." />
              <CategoryPills
                categories={categories}
                activeCategoryId={activeCategoryId}
                onSelectCategory={setActiveCategoryId}
              />
            </div>
            {isLoading ? (
              <div className="bakery-loading"><RefreshCw className="animate-spin" size={24} /> Sedang menyiapkan etalase...</div>
            ) : filteredProducts.length ? (
              <div className="catalog-grid" id="all-products">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    badge={product.id === 'prod-1' ? 'Best Seller' : product.id === 'prod-2' ? 'New Arrival' : ''}
                    onSelectProduct={setSelectedProduct}
                    onAddToCart={addToCart}
                  />
                ))}
              </div>
            ) : (
              <div className="catalog-empty-state">
                <CakeSlice size={34} />
                <h3>Belum ada yang cocok</h3>
                <p>{search ? `Kami belum menemukan menu untuk “${search}”.` : 'Produk di kategori ini akan segera hadir.'}</p>
                {(search || activeCategoryId) && <button className="text-link" onClick={() => { setSearch(''); setActiveCategoryId(''); }}>Lihat semua menu</button>}
              </div>
            )}
          </section>

          <section className="best-seller-banner">
            <div className="best-seller-copy"><span className="eyebrow">Made for your special moments</span><h2>A little sweetness<br />goes a <em>long way.</em></h2><p>Temukan kue istimewa untuk merayakan momen yang paling berarti.</p><a className="cake-button cake-button-light" href="#products">Shop our treats <ArrowRight size={16} /></a></div>
            <img src="https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=1000&q=85" alt="Kue cantik untuk momen istimewa" loading="lazy" />
            <div className="banner-sticker">A little<br />joy for you <Heart size={15} /></div>
          </section>

          <section className="bakery-section about-section" id="about">
            <div className="about-photo-wrap">
              <img src="https://images.unsplash.com/photo-1486427944299-d1955d23e34d?auto=format&fit=crop&w=900&q=85" alt="Cupcake T'xie Cake yang baru dipanggang" loading="lazy" />
              <span className="about-photo-note">Baked fresh, always ♡</span>
            </div>
            <div className="about-copy">
              <span className="eyebrow">A little story about us</span>
              <h2>Sweet moments,<br /><em>made from scratch.</em></h2>
              <p>T’xie Cake berawal dari cinta sederhana pada kue rumahan. Kini, setiap kreasi kami dibuat dalam batch kecil, dengan bahan pilihan dan sentuhan hangat yang terasa di setiap gigitan.</p>
              <div className="about-signoff"><span className="signature">Made with love</span><span>— from our kitchen to yours</span></div>
            </div>
          </section>

          <section className="why-section">
            <div className="section-heading centered-heading">
              <div><span className="eyebrow">The T’xie touch</span><h2>Little things, <em>big difference.</em></h2></div>
            </div>
            <div className="why-grid">
              <article><span className="why-icon"><Clock3 /></span><h3>Fresh, every day</h3><p>Dipanggang dalam batch kecil agar selalu fresh saat sampai di tanganmu.</p></article>
              <article><span className="why-icon"><Leaf /></span><h3>Thoughtful ingredients</h3><p>Bahan berkualitas pilihan untuk rasa yang lembut dan istimewa.</p></article>
              <article><span className="why-icon"><Heart /></span><h3>Made just for you</h3><p>Dibuat penuh perhatian untuk momen kecil maupun perayaan besar.</p></article>
            </div>
          </section>

          <section className="bakery-section testimonials-section">
            <div className="section-heading"><div><span className="eyebrow">Kind words from our table</span><h2>Made sweeter by <em>you.</em></h2></div><div className="testimonial-stars"><Star fill="currentColor" /><Star fill="currentColor" /><Star fill="currentColor" /><Star fill="currentColor" /><Star fill="currentColor" /></div></div>
            <div className="testimonial-grid">
              {testimonials.map((testimonial) => (
                <article className="testimonial-card" key={testimonial.name}>
                  <div className="testimonial-stars">{Array.from({ length: testimonial.stars }).map((_, index) => <Star key={index} size={14} fill="currentColor" />)}</div>
                  <p>“{testimonial.quote}”</p>
                  <div className="testimonial-author"><span className="author-mark">{testimonial.name.charAt(0)}</span><span><strong>{testimonial.name}</strong><small>{testimonial.detail}</small></span></div>
                </article>
              ))}
            </div>
          </section>

          <section className="contact-strip" id="contact">
            <div><span className="eyebrow">Let’s make it a little sweeter</span><h2>Something sweet is just a message away.</h2><p><MapPin size={15} /> {storeSettings?.address || 'Jakarta, Indonesia'}</p></div>
            <a className="cake-button cake-button-primary" href={whatsappUrl} target="_blank" rel="noreferrer"><MessageCircle size={17} /> Order on WhatsApp</a>
          </section>
        </div>

        <footer className="bakery-footer">
          <div className="container footer-main">
            <div className="footer-brand"><span className="brand-monogram">T</span><div><strong>T’xie Cake</strong><small>A Little Sweetness, A Lot of Happiness.</small></div></div>
            <div className="footer-links"><a href="#home">Home</a><a href="#products">Our Products</a><a href="#categories">Categories</a><a href="#about">About Us</a><a href="#contact">Contact</a></div>
            <div className="footer-contact"><span><MapPin size={14} /> {storeSettings?.address || 'Jakarta, Indonesia'}</span><span><MessageCircle size={14} /> {storeSettings?.phone || '6281234567890'}</span></div>
          </div>
          <div className="container footer-bottom"><span>© {CURRENT_YEAR} T’xie Cake. Made with love.</span><button onClick={() => setIsAdminLoginOpen(true)}><ShieldCheck size={14} /> Admin</button></div>
        </footer>
      </main>

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addToCart}
        />
      )}
      {isCartOpen && (
        <CartDrawer
          cart={cart}
          storeSettings={storeSettings}
          onClose={() => setIsCartOpen(false)}
          onUpdateQuantity={updateCartQuantity}
          onRemove={(id) => setCart((items) => items.filter((item) => item.id !== id))}
          onOrderPlaced={(order) => setTrackedOrders((orders) => [
            {
              trackingToken: order.trackingToken,
              orderCode: order.orderCode,
              status: order.status,
              createdAt: order.createdAt,
              confirmedAt: order.confirmedAt,
              items: order.items.map((item) => ({
                productId: item.productId,
                name: item.name,
                quantity: item.quantity,
                subtotal: item.subtotal
              })),
              total: order.total
            },
            ...orders.filter((savedOrder) => savedOrder.trackingToken !== order.trackingToken)
          ])}
          onOrderComplete={() => setCart([])}
        />
      )}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={(user) => {
          setAdminUser(user);
          setIsAdminView(true);
          setIsAdminLoginOpen(false);
        }}
      />
      <a className="floating-order" href={whatsappUrl} target="_blank" rel="noreferrer" aria-label="Chat T'xie Cake via WhatsApp">
        <MessageCircle size={20} /><span>Chat us</span>
      </a>
    </div>
  );
}

export default App;
