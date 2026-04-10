import React, { useState, useMemo, useEffect } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import styled, { createGlobalStyle, css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, Coffee, X, Plus, Minus, Trash2, 
  Navigation, Star, Search, Moon, Sun, MapPin, Zap, Save, RotateCcw, CheckCircle
} from 'lucide-react';

// --- STORE ENGINE ---
const useStore = create(
  persist(
    (set, get) => ({
      cart: [],
      inventory: { 1: 12, 2: 6, 3: 15, 4: 9, 5: 10, 6: 14 },
      snapshots: [],
      orders: [], // Local Order History
      
      addToCart: (product) => {
        const currentStock = get().inventory[product.id];
        if (currentStock <= 0) return;
        set((state) => ({
          inventory: { ...state.inventory, [product.id]: currentStock - 1 },
          cart: state.cart.find(i => i.id === product.id) 
            ? state.cart.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
            : [...state.cart, { ...product, quantity: 1 }]
        }));
      },

      updateQuantity: (id, delta) => set((state) => {
        const item = state.cart.find(i => i.id === id);
        if (!item || (delta > 0 && state.inventory[id] <= 0)) return state;
        return {
          inventory: { ...state.inventory, [id]: state.inventory[id] - delta },
          cart: state.cart.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i)
        };
      }),

      // THE CHECKOUT ENGINE
      processCheckout: () => {
        const { cart } = get();
        if (cart.length === 0) return;
        
        const newOrder = {
          id: `ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          items: [...cart],
          timestamp: Date.now(),
          status: 'Brewing'
        };

        set((state) => ({
          orders: [newOrder, ...state.orders],
          cart: [] // Clear basket after successful "transaction"
        }));
      },

      simulateDemand: () => {
        if (document.visibilityState !== 'visible') return;
        const id = Math.floor(Math.random() * 6) + 1;
        const currentStock = get().inventory[id];
        const userHolding = get().cart.find(i => i.id === id)?.quantity || 0;
        if (currentStock > 0 && currentStock > userHolding) {
          set((state) => ({ inventory: { ...state.inventory, [id]: currentStock - 1 } }));
        }
      },

      saveSnapshot: () => set((state) => {
        if (state.cart.length === 0) return state;
        const newSnapshot = { id: Date.now(), data: JSON.parse(JSON.stringify(state.cart)) };
        return { snapshots: [newSnapshot, ...state.snapshots].slice(0, 5) };
      }),

      loadSnapshot: (snapshot) => set({ cart: [...snapshot.data] })
    }),
    { name: 'noir-bean-v22-3' }
  )
);

// --- STYLES ---
const GlobalStyle = createGlobalStyle`
  :root {
    ${props => props.$isNight ? css`
      --primary: #d4a373; --bg: #1a1512; --card: #2d241e; --text: #fdfcfb; --border: #3d342e;
    ` : css`
      --primary: #6f4e37; --bg: #fdfcfb; --card: #ffffff; --text: #1a1512; --border: #f0f0f0;
    `}
  }
  body { margin: 0; font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text); transition: background 0.4s; overflow-x: hidden; }
`;

const AppContainer = styled.div`
  max-width: 480px; margin: 0 auto; min-height: 100vh; position: relative;
  display: flex; flex-direction: column; background: var(--bg);
`;

const FooterNav = styled.footer`
  position: fixed; bottom: 0; width: 100%; max-width: 480px; height: 80px;
  background: var(--card); border-top: 1px solid var(--border); display: flex;
  justify-content: space-around; align-items: center; z-index: 3000;
  padding-bottom: env(safe-area-inset-bottom);
`;

const NavItem = styled.div`
  display: flex; flex-direction: column; align-items: center; cursor: pointer;
  color: ${props => props.$active ? 'var(--primary)' : '#888'};
  span { font-size: 0.65rem; font-weight: 800; margin-top: 4px; }
`;

export default function App() {
  const store = useStore();
  const [activeTab, setActiveTab] = useState('menu');
  const [isNight, setIsNight] = useState(new Date().getHours() >= 18 || new Date().getHours() <= 6);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    const interval = setInterval(() => store.simulateDemand(), 15000);
    return () => clearInterval(interval);
  }, [store]);

  const hasCombo = useMemo(() => {
    const ids = store.cart.map(i => i.id);
    return ids.includes(1) && ids.includes(3);
  }, [store.cart]);

  const totalCost = store.cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);

  const handleCheckout = () => {
    store.processCheckout();
    setActiveTab('pickup'); // Redirect to order tracking
  };

  if (!hydrated) return null;

  return (
    <AppContainer>
      <GlobalStyle $isNight={isNight} />
      
      <header style={{ padding: '1.5rem', position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.65rem', fontWeight: 900, color: 'var(--primary)' }}>TUNIS • LAC 2</div>
            <div style={{ fontWeight: 900, fontSize: '1.5rem' }}>NOIR BEAN</div>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <motion.button whileTap={{scale: 0.9}} onClick={store.saveSnapshot} style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer' }}><Save size={20}/></motion.button>
            <motion.button whileTap={{scale: 0.9}} onClick={() => setIsNight(!isNight)} style={{ background: 'none', border: 'none', color: 'var(--text)', cursor: 'pointer' }}>
              {isNight ? <Moon size={22} /> : <Sun size={22} />}
            </motion.button>
          </div>
        </div>
      </header>

      <main style={{ flex: 1, padding: '0 1.5rem 120px' }}>
        <AnimatePresence mode="wait">
          {activeTab === 'menu' && (
            <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.2rem', marginTop: '1rem' }}>
                {[
                  { id: 1, name: 'Sand Coffee', price: 4.5 },
                  { id: 2, name: 'Zgougou Latte', price: 7.2 },
                  { id: 3, name: 'Bambalouni', price: 3.5 },
                  { id: 4, name: 'Nitro Brew', price: 6.5 },
                  { id: 5, name: 'Citronnade', price: 4.0 },
                  { id: 6, name: 'Kaak Warka', price: 2.5 },
                ].map(item => (
                  <div key={item.id} style={{ background: 'var(--card)', borderRadius: '24px', border: '1px solid var(--border)', overflow: 'hidden' }}>
                    <div style={{ height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: isNight ? '#2a221c' : '#f9f9f9' }}>
                      <Coffee size={32} color={isNight ? '#d4a373' : '#6f4e37'} />
                    </div>
                    <div style={{ padding: '1rem' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800 }}>{item.name}</div>
                      <div style={{ fontSize: '0.6rem', opacity: 0.5 }}>{store.inventory[item.id]} left</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.8rem', alignItems: 'center' }}>
                        <span style={{ fontWeight: 900, color: 'var(--primary)' }}>${item.price.toFixed(2)}</span>
                        <button onClick={() => store.addToCart(item)} disabled={store.inventory[item.id] <= 0}
                          style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', padding: '6px', cursor: 'pointer', opacity: store.inventory[item.id] <= 0 ? 0.2 : 1 }}>
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'pickup' && (
            <motion.div key="pickup" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ paddingTop: '1rem' }}>
              <h2 style={{ fontWeight: 900 }}>Active Orders</h2>
              {store.orders.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '4rem' }}>
                  <Navigation size={48} color="var(--primary)" style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                  <p style={{ opacity: 0.6 }}>No orders found.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {store.orders.map(order => (
                    <div key={order.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '20px', padding: '1.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ fontWeight: 900, fontSize: '0.8rem', color: 'var(--primary)' }}>{order.id}</span>
                        <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>{new Date(order.timestamp).toLocaleTimeString()}</span>
                      </div>
                      {order.items.map(i => <div key={i.id} style={{ fontSize: '0.9rem', marginBottom: '4px' }}>{i.quantity}x {i.name}</div>)}
                      <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <CheckCircle size={16} color="#4CAF50" />
                        <span style={{ fontWeight: 800, fontSize: '0.8rem' }}>Status: {order.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'cart' && (
            <motion.div key="cart" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
              <h2 style={{ fontWeight: 900, marginBottom: '2rem' }}>My Basket</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {store.cart.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--card)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontWeight: 800 }}>{item.name}</div>
                      <div style={{ color: 'var(--primary)', fontWeight: 800 }}>${(item.price * item.quantity).toFixed(2)}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Minus size={20} onClick={() => store.updateQuantity(item.id, -1)} style={{ cursor: 'pointer' }} />
                      <span style={{ fontWeight: 900 }}>{item.quantity}</span>
                      <Plus size={20} onClick={() => store.updateQuantity(item.id, 1)} style={{ cursor: 'pointer' }} />
                    </div>
                  </div>
                ))}
                {store.cart.length === 0 && <p style={{ textAlign: 'center', opacity: 0.5, marginTop: '4rem' }}>Basket is empty</p>}
              </div>
              {store.cart.length > 0 && (
                <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--primary)', color: 'white', borderRadius: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span style={{ fontWeight: 600 }}>Total</span>
                    <span style={{ fontWeight: 900, fontSize: '1.2rem' }}>${totalCost.toFixed(2)}</span>
                  </div>
                  <button 
                    onClick={handleCheckout}
                    style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: 'none', background: 'white', color: 'var(--primary)', fontWeight: 900, cursor: 'pointer' }}
                  >
                    Confirm & Pay
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'rewards' && (
            <motion.div key="rewards" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ padding: '1rem' }}>
              <h2 style={{ fontWeight: 900 }}>Rewards</h2>
              <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '24px', padding: '2rem', textAlign: 'center' }}>
                <Star size={48} color="#FFD700" fill="#FFD700" style={{ marginBottom: '1rem' }} />
                <h3 style={{ margin: 0, fontSize: '1.5rem' }}>45 Beans</h3>
                <p style={{ opacity: 0.6, fontSize: '0.8rem' }}>You're close to a free coffee!</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <FooterNav>
        <NavItem $active={activeTab === 'menu'} onClick={() => setActiveTab('menu')}><Coffee size={24} /><span>MENU</span></NavItem>
        <NavItem $active={activeTab === 'pickup'} onClick={() => setActiveTab('pickup')}><Navigation size={24} /><span>PICKUP</span></NavItem>
        <NavItem $active={activeTab === 'rewards'} onClick={() => setActiveTab('rewards')}><Star size={24} /><span>REWARDS</span></NavItem>
        <NavItem $active={activeTab === 'cart'} onClick={() => setActiveTab('cart')}><ShoppingCart size={24} /><span>CART ({store.cart.length})</span></NavItem>
      </FooterNav>
    </AppContainer>
  );
}