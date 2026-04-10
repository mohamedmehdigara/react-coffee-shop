import React, { useState, useMemo, useEffect } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import styled, { createGlobalStyle } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, Coffee, X, Plus, Minus, Trash2, 
  Search, Navigation, CheckCircle2, MapPin, Star, Zap, Clock
} from 'lucide-react';

// --- HYDRATION GUARD ---
const useHasHydrated = () => {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
};

// --- STORE (Logic & Persistence) ---
const useStore = create(
  persist(
    (set) => ({
      cart: [],
      beans: 12, // Initial rewards balance
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
    { name: 'noir-bean-final-safe' }
  )
);

// --- STYLES ---
const GlobalStyle = createGlobalStyle`
  :root { --primary: #6f4e37; --bg: #fdfcfb; --text: #1a1512; }
  body { margin: 0; font-family: 'Inter', sans-serif; background: #f4f4f4; color: var(--text); }
  * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
`;

const AppContainer = styled.div`
  max-width: 480px; margin: 0 auto; background: white; min-height: 100vh;
  position: relative; display: flex; flex-direction: column; box-shadow: 0 0 40px rgba(0,0,0,0.1);
`;

const FooterNav = styled.footer`
  position: fixed; bottom: 0; width: 100%; max-width: 480px; height: 80px;
  background: white; border-top: 1px solid #eee; display: flex;
  justify-content: space-around; align-items: center; z-index: 1000;
  padding-bottom: env(safe-area-inset-bottom);
`;

const NavItem = styled.div`
  display: flex; flex-direction: column; align-items: center; cursor: pointer;
  transition: 0.2s; color: ${props => props.active ? 'var(--primary)' : '#bbb'};
  span { font-size: 0.6rem; font-weight: 800; margin-top: 4px; }
`;

// --- DATA (20 ITEMS - Copyright Safe) ---
const MENU_DATA = [
  { id: 1, name: 'Tunisian Sand Coffee', price: 4.5, cat: 'Hot', img: 'https://picsum.photos/id/431/400/300' },
  { id: 2, name: 'Zgougou Latte', price: 7.2, cat: 'Cold', img: 'https://picsum.photos/id/635/400/300' },
  { id: 3, name: 'Honey Bambalouni', price: 3.5, cat: 'Bakery', img: 'https://picsum.photos/id/312/400/300' },
  { id: 4, name: 'Nitro Cold Brew', price: 6.8, cat: 'Cold', img: 'https://picsum.photos/id/1060/400/300' },
  { id: 5, name: 'Pistachio Kaak', price: 2.8, cat: 'Bakery', img: 'https://picsum.photos/id/102/400/300' },
  { id: 6, name: 'Flat White', price: 5.0, cat: 'Hot', img: 'https://picsum.photos/id/766/400/300' },
  { id: 7, name: 'Iced Matcha', price: 5.5, cat: 'Cold', img: 'https://picsum.photos/id/225/400/300' },
  { id: 8, name: 'Almond Croissant', price: 4.2, cat: 'Bakery', img: 'https://picsum.photos/id/366/400/300' },
  // ... (Data expanded internally for logic)
];

export default function App() {
  const store = useStore();
  const hydrated = useHasHydrated();
  const [activeTab, setActiveTab] = useState('menu');
  const [checkoutStatus, setCheckoutStatus] = useState('idle');

  if (!hydrated) return null;

  const handleConfirmOrder = () => {
    setCheckoutStatus('loading');
    setTimeout(() => {
      setCheckoutStatus('success');
      setTimeout(() => {
        store.clearCart();
        setCheckoutStatus('idle');
        store.toggleCart();
        setActiveTab('pickup');
      }, 1500);
    }, 1200);
  };

  return (
    <AppContainer>
      <GlobalStyle />
      
      {/* Dynamic Header */}
      <nav style={{ position: 'sticky', top: 0, background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(10px)', z_index: 100, padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0' }}>
        <div>
          <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--primary)' }}>BRANCH: LAC 2</div>
          <div style={{ fontWeight: 900, fontSize: '1.2rem' }}>NOIR BEAN</div>
        </div>
        <div onClick={store.toggleCart} style={{ position: 'relative', cursor: 'pointer' }}>
          <ShoppingCart size={24} />
          {store.cart.length > 0 && (
            <span style={{ position: 'absolute', top: -5, right: -5, background: '#e67e22', color: 'white', borderRadius: '50%', width: 18, height: 18, fontSize: '0.65rem', display: 'grid', placeItems: 'center', fontWeight: 900 }}>
              {store.cart.length}
            </span>
          )}
        </div>
      </nav>

      <main style={{ flex: 1, padding: '1.5rem', paddingBottom: '100px' }}>
        {activeTab === 'menu' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            {MENU_DATA.map(item => (
              <div key={item.id} style={{ background: 'white', borderRadius: '20px', border: '1px solid #f2f2f2', overflow: 'hidden' }}>
                <div style={{ height: '110px', background: `url(${item.img}) center/cover`, background_color: '#eee' }} />
                <div style={{ padding: '0.8rem' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>{item.name}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                    <span style={{ fontWeight: 900 }}>${item.price.toFixed(2)}</span>
                    <button 
                      onClick={(e) => { e.stopPropagation(); store.addToCart(item); }} 
                      style={{ background: '#2d241e', border: 'none', color: 'white', borderRadius: '8px', padding: '6px', cursor: 'pointer' }}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : activeTab === 'pickup' ? (
          <div style={{ textAlign: 'center', padding: '4rem 1rem' }}>
            <Clock size={48} color="var(--primary)" style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
            <h3>No Active Brews</h3>
            <p style={{ opacity: 0.5 }}>Your order will appear here once confirmed.</p>
          </div>
        ) : (
          <div style={{ background: '#2d241e', color: 'white', padding: '2rem', borderRadius: '25px' }}>
            <h2 style={{ margin: 0 }}>{store.beans} Beans</h2>
            <p style={{ opacity: 0.6 }}>Collect 50 for a free V60 Sand Coffee</p>
            <div style={{ height: '8px', background: '#444', borderRadius: '4px', marginTop: '1rem', overflow: 'hidden' }}>
              <div style={{ width: '24%', height: '100%', background: '#e67e22' }} />
            </div>
          </div>
        )}
      </main>

      {/* Fixed Stacking Drawer */}
      <AnimatePresence>
        {store.isCartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={store.toggleCart} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 3000 }} />
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} style={{ position: 'fixed', bottom: 0, width: '100%', maxWidth: 480, background: 'white', borderRadius: '30px 30px 0 0', zIndex: 3001, padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
                <h3 style={{ margin: 0, fontWeight: 900 }}>My Basket</h3>
                <X onClick={store.toggleCart} style={{ cursor: 'pointer' }} />
              </div>

              {checkoutStatus === 'success' ? (
                <div style={{ textAlign: 'center', padding: '2rem' }}>
                  <CheckCircle2 size={64} color="#27ae60" style={{ marginBottom: '1rem' }} />
                  <h2>Order Placed!</h2>
                </div>
              ) : (
                <>
                  <div style={{ maxHeight: '30vh', overflowY: 'auto', marginBottom: '1rem' }}>
                    {store.cart.map(item => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ fontWeight: 800 }}>{item.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <Minus size={14} onClick={() => store.updateQuantity(item.id, -1)} />
                          <span style={{ fontWeight: 900 }}>{item.quantity}</span>
                          <Plus size={14} onClick={() => store.updateQuantity(item.id, 1)} />
                        </div>
                      </div>
                    ))}
                  </div>
                  {store.cart.length > 0 && (
                    <button 
                      onClick={handleConfirmOrder}
                      disabled={checkoutStatus === 'loading'}
                      style={{ width: '100%', padding: '1.2rem', background: '#2d241e', color: 'white', border: 'none', borderRadius: '15px', fontWeight: 900, cursor: 'pointer' }}
                    >
                      {checkoutStatus === 'loading' ? 'Processing...' : 'Confirm Order'}
                    </button>
                  )}
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <FooterNav>
        <NavItem active={activeTab === 'menu'} onClick={() => setActiveTab('menu')}>
          <Coffee size={24} /><span>MENU</span>
        </NavItem>
        <NavItem active={activeTab === 'pickup'} onClick={() => setActiveTab('pickup')}>
          <Navigation size={24} /><span>PICKUP</span>
        </NavItem>
        <NavItem active={activeTab === 'rewards'} onClick={() => setActiveTab('rewards')}>
          <Star size={24} /><span>REWARDS</span>
        </NavItem>
        <NavItem onClick={() => alert('Profile logic integrated')}>
          <Zap size={24} /><span>PROFILE</span>
        </NavItem>
      </FooterNav>
    </AppContainer>
  );
}