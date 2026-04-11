import React, { useState, useEffect, useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import styled, { createGlobalStyle, css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, Coffee, Radio, Zap, 
  MapPin, ShoppingBag, Activity, Info
} from 'lucide-react';

// --- STORE ENGINE (Hardened Logic) ---
const useStore = create(
  persist(
    (set, get) => ({
      location: 'LAC 2',
      power: 100,
      transitStatus: 'IDLE',
      cart: [],
      inventory: { 
        'LAC 2': { 1: 15, 2: 10, 3: 25, 5: 20 }, 
        'TUNIS MARINE': { 1: 5, 2: 3, 3: 40, 5: 15 } 
      },

      setHub: (loc) => {
        if (get().location === loc || get().transitStatus === 'SWITCHING') return;
        set({ transitStatus: 'SWITCHING' });
        setTimeout(() => set({ location: loc, transitStatus: 'IDLE' }), 1000);
      },

      addToCart: (item) => {
        const { location, inventory, cart, power } = get();
        if (inventory[location][item.id] <= 0 || power < 5) return;
        
        const existingIndex = cart.findIndex(i => i.id === item.id);
        const newCart = [...cart];
        
        if (existingIndex > -1) {
          newCart[existingIndex] = { ...newCart[existingIndex], qty: newCart[existingIndex].qty + 1 };
        } else {
          newCart.push({ ...item, qty: 1 });
        }

        set({
          power: Math.max(0, power - 5),
          inventory: { 
            ...inventory, 
            [location]: { ...inventory[location], [item.id]: inventory[location][item.id] - 1 } 
          },
          cart: newCart
        });
      },

      recharge: () => set({ power: 100 })
    }),
    { name: 'noir-bean-v29-1' }
  )
);

// --- REFINED STYLES ---
const GlobalStyle = createGlobalStyle`
  :root {
    --primary: #6f4e37;
    --accent: #d4a373;
    --noir: #1a1512;
    --cream: #fdfcfb;
    --border: #f1f3f5;
  }
  body { 
    margin: 0; padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: var(--cream);
    color: var(--noir);
    overflow-x: hidden;
  }
`;

const Nav = styled.nav`
  position: fixed; bottom: 0; width: 100%; max-width: 480px; height: 75px;
  background: white; border-top: 1px solid var(--border);
  display: flex; justify-content: space-around; align-items: center;
  z-index: 1000; padding-bottom: env(safe-area-inset-bottom);
`;

const ProductCard = styled(motion.div)`
  background: white; border-radius: 20px; padding: 1.25rem;
  border: 1px solid var(--border); display: flex; flex-direction: column;
  gap: 0.5rem; position: relative;
`;

// --- MAIN APPLICATION ---
export default function App() {
  const store = useStore();
  const [activeTab, setActiveTab] = useState('menu');
  const [isHydrated, setIsHydrated] = useState(false);

  // Rehydration Guard
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const menu = [
    { id: 1, name: 'Sand Coffee', price: 4.5, note: 'Sidi Bou Said Style' },
    { id: 2, name: 'Zgougou Latte', price: 7.2, note: 'Aleppo Pine Cream' },
    { id: 3, name: 'Bambalouni', price: 3.5, note: 'Traditional Fry-bread' },
    { id: 5, name: 'Citronnade', price: 4.0, note: 'Fresh Mint & Lemon' },
  ];

  if (!isHydrated) return null;

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <GlobalStyle />

      <header style={{ padding: '1.5rem', background: 'white', position: 'sticky', top: 0, zIndex: 900, borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
              <div style={{ background: '#f8f9fa', padding: '4px 10px', borderRadius: '100px', fontSize: '0.65rem', fontWeight: 800, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={10} /> {store.location}
              </div>
              <div style={{ background: store.power < 20 ? '#fff5f5' : '#f8f9fa', padding: '4px 10px', borderRadius: '100px', fontSize: '0.65rem', fontWeight: 800, color: store.power < 20 ? '#ff6b6b' : '#228be6', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Zap size={10} /> {store.power}%
              </div>
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>Noir Bean</h1>
          </div>
          <button 
            onClick={() => store.setHub(store.location === 'LAC 2' ? 'TUNIS MARINE' : 'LAC 2')}
            style={{ background: 'var(--noir)', color: 'white', border: 'none', borderRadius: '12px', padding: '10px', cursor: 'pointer' }}
          >
            <Radio size={20} />
          </button>
        </div>
      </header>

      <main style={{ padding: '1.5rem 1.5rem 100px', flex: 1 }}>
        <AnimatePresence mode="wait">
          {store.transitStatus === 'SWITCHING' ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ textAlign: 'center', marginTop: '5rem' }}>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}>
                <Coffee size={40} color="var(--primary)" />
              </motion.div>
              <p style={{ fontWeight: 800, fontSize: '0.9rem', color: '#adb5bd', marginTop: '1rem' }}>Rerouting Hub Data...</p>
            </motion.div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {activeTab === 'menu' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  {menu.map(item => (
                    <ProductCard key={item.id} whileHover={{ y: -4 }}>
                      <div style={{ fontSize: '0.6rem', fontWeight: 900, color: 'var(--accent)', textTransform: 'uppercase' }}>{item.note}</div>
                      <div style={{ fontWeight: 800, fontSize: '1rem' }}>{item.name}</div>
                      <div style={{ fontWeight: 900, fontSize: '1.2rem', margin: '0.5rem 0' }}>${item.price.toFixed(2)}</div>
                      <div style={{ fontSize: '0.6rem', color: '#adb5bd', marginBottom: '1rem' }}>STOCK: {store.inventory[store.location][item.id]}</div>
                      <button 
                        onClick={() => store.addToCart(item)}
                        disabled={store.inventory[store.location][item.id] <= 0}
                        style={{ 
                          width: '100%', padding: '10px', borderRadius: '10px', background: 'var(--noir)',
                          color: 'white', border: 'none', fontWeight: 800, fontSize: '0.7rem',
                          cursor: 'pointer', opacity: store.inventory[store.location][item.id] <= 0 ? 0.2 : 1
                        }}
                      >
                        ADD TO BAG
                      </button>
                    </ProductCard>
                  ))}
                </div>
              )}

              {activeTab === 'cart' && (
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '24px', border: '1px solid var(--border)' }}>
                  <h2 style={{ fontWeight: 900, marginTop: 0 }}>My Order</h2>
                  {store.cart.length === 0 ? <p style={{ color: '#adb5bd' }}>Bag is empty.</p> : (
                    <>
                      {store.cart.map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem 0', borderBottom: '1px solid #f8f9fa' }}>
                          <div>
                            <div style={{ fontWeight: 800 }}>{item.name}</div>
                            <div style={{ fontSize: '0.7rem', color: '#adb5bd' }}>Qty: {item.qty}</div>
                          </div>
                          <div style={{ fontWeight: 900 }}>${(item.price * item.qty).toFixed(2)}</div>
                        </div>
                      ))}
                      <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', fontWeight: 900, fontSize: '1.2rem' }}>
                        <span>Total</span>
                        <span>${store.cart.reduce((acc, i) => acc + i.price * i.qty, 0).toFixed(2)}</span>
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === 'status' && (
                <div style={{ background: 'var(--noir)', color: 'white', padding: '1.5rem', borderRadius: '24px', fontFamily: 'monospace' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                    <Activity size={16} color="#00ff00" />
                    <span style={{ fontSize: '0.8rem', fontWeight: 900 }}>SYSTEM_TELEMETRY</span>
                  </div>
                  <div style={{ fontSize: '0.7rem', opacity: 0.7, lineHeight: 1.6 }}>
                    LOCATION: {store.location}<br />
                    NETWORK_GRID: {store.power}% OPERATIONAL<br />
                    LATENCY: 12ms<br />
                    DATA_ENCRYPTION: AES-256<br />
                    HUB_STATUS: SECURE
                  </div>
                  {store.power < 50 && (
                    <button onClick={store.recharge} style={{ marginTop: '1.5rem', width: '100%', padding: '10px', background: '#333', border: '1px solid #444', color: 'white', borderRadius: '8px', fontSize: '0.6rem' }}>
                      RE-INITIALIZE POWER GRID
                    </button>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Nav>
        <div onClick={() => setActiveTab('menu')} style={{ opacity: activeTab === 'menu' ? 1 : 0.3, textAlign: 'center', cursor: 'pointer' }}>
          <Coffee size={24} /><div style={{ fontSize: '0.55rem', fontWeight: 900 }}>MENU</div>
        </div>
        <div onClick={() => setActiveTab('cart')} style={{ opacity: activeTab === 'cart' ? 1 : 0.3, textAlign: 'center', cursor: 'pointer', position: 'relative' }}>
          <ShoppingBag size={24} />
          {store.cart.length > 0 && <span style={{ position: 'absolute', top: -4, right: -8, background: 'var(--primary)', color: 'white', fontSize: '0.5rem', width: 14, height: 14, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{store.cart.reduce((a, b) => a + b.qty, 0)}</span>}
          <div style={{ fontSize: '0.55rem', fontWeight: 900 }}>CART</div>
        </div>
        <div onClick={() => setActiveTab('status')} style={{ opacity: activeTab === 'status' ? 1 : 0.3, textAlign: 'center', cursor: 'pointer' }}>
          <Activity size={24} /><div style={{ fontSize: '0.55rem', fontWeight: 900 }}>STATUS</div>
        </div>
      </Nav>
    </div>
  );
}