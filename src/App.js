import React, { useState, useMemo, useEffect } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import styled, { createGlobalStyle, css, keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, Coffee, X, Plus, Minus, Trash2, 
  Navigation, Star, Search, Moon, Sun, MapPin, Zap, Save, RotateCcw, CheckCircle, Terminal
} from 'lucide-react';

// --- ANIMATIONS ---
const scanline = keyframes`
  0% { bottom: 100%; }
  100% { bottom: 0%; }
`;

// --- STORE ENGINE ---
const useStore = create(
  persist(
    (set, get) => ({
      location: 'LAC 2',
      cart: [],
      inventory: {
        'LAC 2': { 1: 12, 2: 6, 3: 15, 4: 9, 5: 10, 6: 14 },
        'TUNIS MARINE': { 1: 5, 2: 2, 3: 30, 4: 0, 5: 20, 6: 40 }
      },
      orders: [],
      unlockedBadges: [],

      setLocation: (loc) => set({ location: loc }),

      addToCart: (product) => {
        const { location, inventory, cart } = get();
        if (inventory[location][product.id] <= 0) return;
        
        const newInv = { 
          ...inventory, 
          [location]: { ...inventory[location], [product.id]: inventory[location][product.id] - 1 } 
        };
        const existing = cart.find(i => i.id === product.id);
        
        set({
          inventory: newInv,
          cart: existing 
            ? cart.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
            : [...cart, { ...product, quantity: 1 }]
        });
      },

      updateQuantity: (id, delta) => set((state) => {
        const item = state.cart.find(i => i.id === id);
        if (!item) return state;
        const currentLoc = state.location;
        if (delta > 0 && state.inventory[currentLoc][id] <= 0) return state;

        return {
          inventory: {
            ...state.inventory,
            [currentLoc]: { ...state.inventory[currentLoc], [id]: state.inventory[currentLoc][id] - delta }
          },
          cart: state.cart.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + delta) } : i)
        };
      }),

      processCheckout: () => {
        const { cart, unlockedBadges } = get();
        if (cart.length === 0) return;

        const itemIds = cart.map(i => i.id);
        const earnedPastry = itemIds.includes(3) && itemIds.includes(6);
        
        const newOrder = {
          id: `NOIR-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
          items: [...cart],
          timestamp: Date.now(),
          status: 'Brewing...'
        };

        set((state) => ({
          orders: [newOrder, ...state.orders],
          unlockedBadges: earnedPastry && !unlockedBadges.includes('Pastry Master') 
            ? [...unlockedBadges, 'Pastry Master'] 
            : unlockedBadges,
          cart: []
        }));
      }
    }),
    { name: 'noir-bean-v23-1' }
  )
);

// --- STYLES ---
const GlobalStyle = createGlobalStyle`
  :root {
    ${props => props.$isNight ? css`
      --primary: #d4a373; --bg: #110e0c; --card: #1e1a17; --text: #fdfcfb; --border: #2d2621;
    ` : css`
      --primary: #6f4e37; --bg: #fdfcfb; --card: #ffffff; --text: #1a1512; --border: #f0f0f0;
    `}
  }
  body { margin: 0; font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text); }
`;

const AppContainer = styled.div`
  max-width: 480px; margin: 0 auto; min-height: 100vh; display: flex; flex-direction: column; background: var(--bg);
`;

const FooterNav = styled.footer`
  position: fixed; bottom: 0; width: 100%; max-width: 480px; height: 80px;
  background: var(--card); border-top: 1px solid var(--border); display: flex;
  justify-content: space-around; align-items: center; z-index: 2000;
  padding-bottom: env(safe-area-inset-bottom);
`;

const NavItem = styled.div`
  display: flex; flex-direction: column; align-items: center; cursor: pointer;
  color: ${props => props.$active ? 'var(--primary)' : '#666'};
  transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  ${props => props.$active && css`transform: translateY(-5px);`}
  span { font-size: 0.6rem; font-weight: 900; margin-top: 4px; }
`;

const CRTOverlay = styled.div`
  position: relative; overflow: hidden; background: #000; border-radius: 20px;
  padding: 1.5rem; min-height: 300px; border: 2px solid #333;
  &::after {
    content: " "; position: absolute; top: 0; left: 0; bottom: 0; right: 0;
    background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 155, 0.03));
    z-index: 2; background-size: 100% 2px, 3px 100%; pointer-events: none;
  }
`;

const Scanline = styled.div`
  width: 100%; height: 2px; background: rgba(0, 255, 0, 0.1);
  position: absolute; bottom: 100%; animation: ${scanline} 4s linear infinite; z-index: 3;
`;

export default function App() {
  const store = useStore();
  const [activeTab, setActiveTab] = useState('menu');
  const [isNight, setIsNight] = useState(new Date().getHours() >= 18);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => setHydrated(true), []);

  if (!hydrated) return null;

  return (
    <AppContainer>
      <GlobalStyle $isNight={isNight} />
      
      <header style={{ padding: '1.5rem', background: 'var(--bg)', position: 'sticky', top: 0, zIndex: 1000 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <select 
              value={store.location} 
              onChange={(e) => store.setLocation(e.target.value)}
              style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 900, padding: '2px 6px', marginBottom: '4px' }}
            >
              <option value="LAC 2">LAC 2 HUB</option>
              <option value="TUNIS MARINE">TUNIS MARINE</option>
            </select>
            <div style={{ fontWeight: 900, fontSize: '1.4rem' }}>NOIR BEAN</div>
          </div>
          <button onClick={() => setIsNight(!isNight)} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '8px', color: 'var(--text)' }}>
            {isNight ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </header>

      <main style={{ flex: 1, padding: '0 1.5rem 100px' }}>
        <AnimatePresence mode="wait">
          {activeTab === 'menu' && (
            <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {[
                  { id: 1, name: 'Sand Coffee', price: 4.5 },
                  { id: 2, name: 'Zgougou Latte', price: 7.2 },
                  { id: 3, name: 'Bambalouni', price: 3.5 },
                  { id: 4, name: 'Nitro Brew', price: 6.5 },
                  { id: 5, name: 'Citronnade', price: 4.0 },
                  { id: 6, name: 'Kaak Warka', price: 2.5 },
                ].map(item => (
                  <div key={item.id} style={{ background: 'var(--card)', borderRadius: '20px', border: '1px solid var(--border)', padding: '1rem' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800 }}>{item.name}</div>
                    <div style={{ fontSize: '0.6rem', opacity: 0.5, marginBottom: '1rem' }}>{store.inventory[store.location][item.id]} left</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 900, color: 'var(--primary)' }}>${item.price}</span>
                      <button onClick={() => store.addToCart(item)} disabled={store.inventory[store.location][item.id] <= 0}
                        style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', padding: '6px', opacity: store.inventory[store.location][item.id] <= 0 ? 0.2 : 1 }}>
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'pickup' && (
            <motion.div key="pickup" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <CRTOverlay>
                <Scanline />
                <div style={{ color: '#0f0', fontFamily: 'monospace', fontSize: '0.7rem' }}>
                  <div style={{ marginBottom: '1rem' }}>[LOGIC_STREAM_ACTIVE]</div>
                  {store.orders.map(order => (
                    <div key={order.id} style={{ marginBottom: '1.5rem', borderLeft: '2px solid #0f0', paddingLeft: '10px' }}>
                      <div>> ID: {order.id}</div>
                      <div>> STATUS: {order.status}</div>
                      <div style={{ color: '#555' }}>> {new Date(order.timestamp).toLocaleTimeString()}</div>
                    </div>
                  ))}
                  {store.orders.length === 0 && <div>> SCANNING FOR SIGNALS...</div>}
                </div>
              </CRTOverlay>
            </motion.div>
          )}

          {activeTab === 'rewards' && (
            <motion.div key="rewards" initial={{ y: 20 }} animate={{ y: 0 }}>
              <div style={{ background: 'var(--card)', borderRadius: '24px', padding: '2rem', border: '1px solid var(--border)' }}>
                <h3 style={{ margin: '0 0 1.5rem' }}>Quests Completed</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {store.unlockedBadges.map(badge => (
                    <div key={badge} style={{ background: 'var(--primary)', color: 'white', padding: '8px 12px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 900 }}>
                      {badge}
                    </div>
                  ))}
                  {store.unlockedBadges.length === 0 && <p style={{ opacity: 0.4, fontSize: '0.8rem' }}>Unlock badges by buying combos!</p>}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'cart' && (
            <motion.div key="cart" initial={{ x: 20 }} animate={{ x: 0 }}>
              <h2 style={{ fontWeight: 900 }}>Basket</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {store.cart.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'var(--card)', borderRadius: '16px', border: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontWeight: 800 }}>{item.name}</div>
                      <div style={{ color: 'var(--primary)', fontWeight: 800 }}>${item.price}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <Minus size={20} onClick={() => store.updateQuantity(item.id, -1)} style={{ cursor: 'pointer' }} />
                      <span style={{ fontWeight: 900 }}>{item.quantity}</span>
                      <Plus size={20} onClick={() => store.updateQuantity(item.id, 1)} style={{ cursor: 'pointer' }} />
                    </div>
                  </div>
                ))}
              </div>
              {store.cart.length > 0 && (
                <button onClick={() => { store.processCheckout(); setActiveTab('pickup'); }}
                  style={{ width: '100%', marginTop: '2rem', padding: '1.2rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '16px', fontWeight: 900, cursor: 'pointer' }}>
                  CONFIRM ORDER
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <FooterNav>
        <NavItem $active={activeTab === 'menu'} onClick={() => setActiveTab('menu')}><Coffee size={24} /><span>MENU</span></NavItem>
        <NavItem $active={activeTab === 'pickup'} onClick={() => setActiveTab('pickup')}><Terminal size={24} /><span>PICKUP</span></NavItem>
        <NavItem $active={activeTab === 'rewards'} onClick={() => setActiveTab('rewards')}><Star size={24} /><span>REWARDS</span></NavItem>
        <NavItem $active={activeTab === 'cart'} onClick={() => setActiveTab('cart')}>
          <ShoppingCart size={24} />
          <span>CART ({store.cart.length})</span>
        </NavItem>
      </FooterNav>
    </AppContainer>
  );
}