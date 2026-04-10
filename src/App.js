import React, { useState, useMemo, useEffect } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import styled, { createGlobalStyle } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, Coffee, X, Plus, Minus, Trash2, 
  Search, MapPin, Star, Settings, Navigation, CheckCircle2,
  Clock, CreditCard, Gift, User
} from 'lucide-react';

// --- HYDRATION GUARD ---
const useHasHydrated = () => {
  const [hasHydrated, setHasHydrated] = useState(false);
  useEffect(() => { setHasHydrated(true); }, []);
  return hasHydrated;
};

// --- STORE ---
const useStore = create(
  persist(
    (set) => ({
      cart: [],
      branch: 'Lac 2',
      isCartOpen: false,
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
      addToCart: (product) => set((state) => {
        const existing = state.cart.find(i => i.id === product.id);
        if (existing) {
          return { cart: state.cart.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i) };
        }
        return { cart: [...state.cart, { ...product, quantity: 1 }] };
      }),
      updateQuantity: (id, delta) => set((state) => ({
        cart: state.cart.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i)
      })),
      removeFromCart: (id) => set((state) => ({
        cart: state.cart.filter(i => i.id !== id)
      })),
      clearCart: () => set({ cart: [] })
    }),
    { name: 'noir-bean-v15-pro' }
  )
);

// --- STYLES ---
const GlobalStyle = createGlobalStyle`
  :root { --primary: #6f4e37; --bg: #fdfcfb; --text: #1a1512; }
  body { margin: 0; font-family: 'Inter', sans-serif; background: #eee; color: var(--text); }
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
`;

const AppContainer = styled.div`
  max-width: 480px; margin: 0 auto; background: white; min-height: 100vh;
  position: relative; display: flex; flex-direction: column; overflow-x: hidden;
`;

const FooterNav = styled.footer`
  position: fixed; bottom: 0; width: 100%; max-width: 480px; height: 75px;
  background: white; border-top: 1px solid #f0f0f0; display: flex;
  justify-content: space-around; align-items: center; z-index: 2000;
  padding-bottom: env(safe-area-inset-bottom);
`;

const NavButton = styled.button`
  background: none; border: none; display: flex; flex-direction: column; 
  align-items: center; gap: 4px; cursor: pointer; transition: 0.2s;
  color: ${props => props.active ? 'var(--primary)' : '#ccc'};
  span { font-size: 0.65rem; font-weight: 800; }
`;

// --- EXPANDED DATA (20 ITEMS) ---
const MENU_DATA = [
  { id: 1, name: 'Tunisian Sand Coffee', price: 4.5, cat: 'Hot', img: 'https://images.unsplash.com/photo-1595914352220-333e387c336b?w=400' },
  { id: 2, name: 'Zgougou Latte', price: 7.2, cat: 'Tunis', img: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400' },
  { id: 3, name: 'Nitro Cold Brew', price: 6.8, cat: 'Cold', img: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400' },
  { id: 4, name: 'Honey Bambalouni', price: 3.5, cat: 'Bakery', img: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400' },
  { id: 5, name: 'Matcha Cloud', price: 5.5, cat: 'Cold', img: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400' },
  { id: 6, name: 'Kaak Warka', price: 2.8, cat: 'Bakery', img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400' },
  { id: 7, name: 'Citronnade Sfax', price: 4.5, cat: 'Tunis', img: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400' },
  { id: 8, name: 'Pistachio Baklawa', price: 5.5, cat: 'Bakery', img: 'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=400' },
  { id: 9, name: 'V60 Ethiopian', price: 6.0, cat: 'Hot', img: 'https://images.unsplash.com/photo-1544787210-2211d7c928c7?w=400' },
  { id: 10, name: 'Flat White', price: 5.0, cat: 'Hot', img: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=400' },
  { id: 11, name: 'Iced Rose Tea', price: 3.8, cat: 'Cold', img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400' },
  { id: 12, name: 'Espresso Romano', price: 4.0, cat: 'Hot', img: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400' },
  { id: 13, name: 'Dates Muffin', price: 4.2, cat: 'Bakery', img: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400' },
  { id: 14, name: 'Affogato', price: 7.5, cat: 'Cold', img: 'https://images.unsplash.com/photo-1594631252845-29fc4586c55c?w=400' },
  { id: 15, name: 'Turkish Sand Brew', price: 4.2, cat: 'Hot', img: 'https://images.unsplash.com/photo-1595914352220-333e387c336b?w=400' },
  { id: 16, name: 'Chocolate Fondant', price: 6.0, cat: 'Bakery', img: 'https://images.unsplash.com/photo-1589119908995-c6837fa14848?w=400' },
  { id: 17, name: 'Mint Green Tea', price: 3.5, cat: 'Tunis', img: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400' },
  { id: 18, name: 'Saffron Latte', price: 7.0, cat: 'Hot', img: 'https://images.unsplash.com/photo-1544198365-f5d60b6d8190?w=400' },
  { id: 19, name: 'Almond Croissant', price: 4.5, cat: 'Bakery', img: 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=400' },
  { id: 20, name: 'Hibiscus Spritz', price: 4.8, cat: 'Cold', img: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400' },
];

export default function App() {
  const store = useStore();
  const hydrated = useHasHydrated();
  const [activeTab, setActiveTab] = useState('menu');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!hydrated) return null;

  const handleCheckout = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowSuccess(true);
      setTimeout(() => {
        store.clearCart();
        setShowSuccess(false);
        store.toggleCart();
        setActiveTab('pickup');
      }, 2000);
    }, 1200);
  };

  const cartTotal = store.cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);

  return (
    <AppContainer>
      <GlobalStyle />
      
      {/* Header */}
      <nav style={{ position: 'sticky', top: 0, background: 'white', zIndex: 100, padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0' }}>
        <div>
          <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--primary)' }}>BRANCH: {store.branch}</div>
          <div style={{ fontWeight: 900, fontSize: '1.2rem' }}>NOIR BEAN</div>
        </div>
        <div onClick={store.toggleCart} style={{ position: 'relative', cursor: 'pointer' }}>
          <ShoppingCart size={24} />
          {store.cart.length > 0 && (
            <span style={{ position: 'absolute', top: -5, right: -5, background: '#e67e22', color: 'white', borderRadius: '50%', width: 18, height: 18, fontSize: '0.65rem', display: 'grid', placeItems: 'center', fontWeight: 900 }}>
              {store.cart.reduce((a, b) => a + b.quantity, 0)}
            </span>
          )}
        </div>
      </nav>

      {/* Content Switcher */}
      <main style={{ flex: 1, padding: '1.5rem', paddingBottom: '100px' }}>
        {activeTab === 'menu' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {MENU_DATA.map(item => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'white', borderRadius: '15px', border: '1px solid #f0f0f0', overflow: 'hidden' }}>
                <div style={{ height: '110px', background: `url(${item.img}) center/cover` }} />
                <div style={{ padding: '0.8rem' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.8rem', height: '2rem' }}>{item.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                    <span style={{ fontWeight: 900, color: 'var(--primary)' }}>${item.price.toFixed(2)}</span>
                    <button onClick={() => store.addToCart(item)} style={{ background: '#2d241e', border: 'none', color: 'white', borderRadius: '8px', padding: '4px' }}>
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'pickup' && (
          <div style={{ textAlign: 'center', paddingTop: '4rem' }}>
            <Clock size={48} opacity={0.2} style={{ margin: '0 auto 1rem' }} />
            <h3>No active orders</h3>
            <p style={{ opacity: 0.5, fontSize: '0.9rem' }}>Fresh beans are waiting for you.</p>
          </div>
        )}

        {activeTab === 'rewards' && (
          <div style={{ background: '#2d241e', color: 'white', padding: '2rem', borderRadius: '20px' }}>
            <h2>0 Points</h2>
            <p style={{ opacity: 0.6 }}>Collect 10 points for a free coffee.</p>
            <div style={{ height: '8px', background: '#444', borderRadius: '4px', marginTop: '1rem' }} />
          </div>
        )}

        {activeTab === 'profile' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
              <div style={{ width: 60, height: 60, background: '#f0f0f0', borderRadius: '50%' }} />
              <div><h3 style={{ margin: 0 }}>Guest User</h3><p style={{ margin: 0, opacity: 0.5 }}>Silver Member</p></div>
            </div>
            <div style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: '#f9f9f9', borderRadius: '12px', fontWeight: 700 }}>Order History</div>
              <div style={{ padding: '1rem', background: '#f9f9f9', borderRadius: '12px', fontWeight: 700 }}>Payment Methods</div>
            </div>
          </div>
        )}
      </main>

      {/* Cart Drawer */}
      <AnimatePresence>
        {store.isCartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={store.toggleCart} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 3000 }} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} style={{ position: 'fixed', bottom: 0, width: '100%', maxWidth: 480, background: 'white', borderRadius: '30px 30px 0 0', zIndex: 3001, padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontWeight: 900 }}>Your Basket</h3>
                <X onClick={store.toggleCart} style={{ cursor: 'pointer' }} />
              </div>

              {showSuccess ? (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                  <CheckCircle2 size={64} color="#27ae60" style={{ marginBottom: '1rem' }} />
                  <h2>Order Placed!</h2>
                  <p>Preparing your brew at {store.branch}.</p>
                </div>
              ) : (
                <>
                  <div style={{ maxHeight: '35vh', overflowY: 'auto', marginBottom: '1.5rem' }}>
                    {store.cart.length === 0 ? (
                      <p style={{ textAlign: 'center', opacity: 0.4 }}>Your basket is empty</p>
                    ) : (
                      store.cart.map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                          <div style={{ fontWeight: 800 }}>{item.name}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f5f5f5', padding: '4px 10px', borderRadius: '8px' }}>
                              <Minus size={14} onClick={() => store.updateQuantity(item.id, -1)} style={{ cursor: 'pointer' }} />
                              <span style={{ fontWeight: 900 }}>{item.quantity}</span>
                              <Plus size={14} onClick={() => store.updateQuantity(item.id, 1)} style={{ cursor: 'pointer' }} />
                            </div>
                            <Trash2 size={16} color="#e74c3c" onClick={() => store.removeFromCart(item.id)} style={{ cursor: 'pointer' }} />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  
                  {store.cart.length > 0 && (
                    <div style={{ borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 900, marginBottom: '1.5rem' }}>
                        <span>Total</span><span>${cartTotal.toFixed(2)}</span>
                      </div>
                      <button 
                        onClick={handleCheckout} 
                        disabled={isProcessing}
                        style={{ width: '100%', padding: '1.2rem', borderRadius: '15px', background: '#2d241e', color: 'white', border: 'none', fontWeight: 900, fontSize: '1rem', cursor: 'pointer' }}
                      >
                        {isProcessing ? 'Processing...' : 'Confirm Order'}
                      </button>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Footer Navigation */}
      <FooterNav>
        <NavButton active={activeTab === 'menu'} onClick={() => setActiveTab('menu')}>
          <Coffee size={24} /><span>MENU</span>
        </NavButton>
        <NavButton active={activeTab === 'pickup'} onClick={() => setActiveTab('pickup')}>
          <Navigation size={24} /><span>PICKUP</span>
        </NavButton>
        <NavButton active={activeTab === 'rewards'} onClick={() => setActiveTab('rewards')}>
          <Star size={24} /><span>REWARDS</span>
        </NavButton>
        <NavButton active={activeTab === 'profile'} onClick={() => setActiveTab('profile')}>
          <User size={24} /><span>PROFILE</span>
        </NavButton>
      </FooterNav>
    </AppContainer>
  );
}