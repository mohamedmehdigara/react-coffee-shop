import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import styled, { createGlobalStyle, css, keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, Coffee, Star, Moon, Sun, Zap, Save, RotateCcw, Terminal, Radio, TrendingUp, AlertCircle
} from 'lucide-react';

// --- UTILS & AUDIO ---
const playTone = (freq, type = 'sine', duration = 0.1) => {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
  osc.connect(gain); gain.connect(ctx.destination);
  osc.start(); osc.stop(ctx.currentTime + duration);
};

// --- STORE ENGINE ---
const useStore = create(
  persist(
    (set, get) => ({
      location: 'LAC 2',
      isTransiting: false,
      cart: [],
      inventory: {
        'LAC 2': { 1: 15, 2: 8, 3: 20, 4: 10, 5: 15, 6: 25 },
        'TUNIS MARINE': { 1: 5, 2: 2, 3: 40, 4: 0, 5: 10, 6: 50 }
      },
      orders: [],
      history: [], // Temporal State Snapshots
      marketOscillator: 1.0, // Economic Edict factor

      setHub: (loc) => {
        set({ isTransiting: true });
        playTone(150, 'square', 0.4);
        setTimeout(() => set({ location: loc, isTransiting: false }), 1200);
      },

      updateMarket: () => {
        // Simulates economic flux: 0.85 to 1.15 multiplier
        const newFactor = 0.85 + Math.random() * 0.3;
        set({ marketOscillator: newFactor });
      },

      saveSnapshot: () => {
        const { cart, inventory, location } = get();
        const snap = { id: Date.now(), cart: [...cart], inventory: JSON.parse(JSON.stringify(inventory)), location };
        set(state => ({ history: [snap, ...state.history].slice(0, 5) }));
        playTone(1000, 'sine', 0.1);
      },

      restoreSnapshot: (snap) => {
        set({ cart: snap.cart, inventory: snap.inventory, location: snap.location });
        playTone(400, 'square', 0.2);
      },

      addToCart: (product, price) => {
        const { location, inventory, cart } = get();
        if (inventory[location][product.id] <= 0) return;
        
        playTone(800);
        const newInv = { ...inventory, [location]: { ...inventory[location], [product.id]: inventory[location][product.id] - 1 } };
        const existing = cart.find(i => i.id === product.id);

        set({
          inventory: newInv,
          cart: existing 
            ? cart.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
            : [...cart, { ...product, quantity: 1, currentPrice: price }]
        });
      },

      processCheckout: () => {
        const { cart, location } = get();
        if (cart.length === 0) return;
        
        // Traffic Logic: More items/Station density = Higher delay
        const stationLoad = location === 'TUNIS MARINE' ? 1.5 : 1.0;
        const waitTime = Math.floor((Math.random() * 10 + 5) * stationLoad);

        const newOrder = { 
          id: `TX-${Math.random().toString(36).substr(2, 4).toUpperCase()}`, 
          items: [...cart], 
          timestamp: Date.now(),
          eta: waitTime,
          status: 'Brewing'
        };
        set(state => ({ orders: [newOrder, ...state.orders], cart: [] }));
        playTone(200, 'sawtooth', 0.3);
      }
    }),
    { name: 'noir-bean-v25-ledger' }
  )
);

// --- STYLES ---
const GlobalStyle = createGlobalStyle`
  :root {
    ${props => props.$isNight ? css`
      --primary: #d4a373; --bg: #0a0a0a; --card: #151515; --text: #ffffff; --border: #222;
    ` : css`
      --primary: #6f4e37; --bg: #fdfcfb; --card: #ffffff; --text: #1a1512; --border: #eee;
    `}
  }
  body { margin: 0; font-family: 'Inter', sans-serif; background: var(--bg); color: var(--text); overflow-x: hidden; }
`;

const HubWipe = keyframes`
  from { clip-path: inset(0 100% 0 0); }
  to { clip-path: inset(0 0 0 0); }
`;

const MainContent = styled(motion.main)`
  flex: 1; padding: 0 1.5rem 120px;
  &.hub-switching { animation: ${HubWipe} 0.8s cubic-bezier(0.77, 0, 0.175, 1); }
`;

const PriceTag = styled.span`
  font-weight: 900; color: var(--primary);
  display: flex; alignItems: center; gap: 4px;
  font-size: 1rem;
`;

const FooterNav = styled.footer`
  position: fixed; bottom: 0; width: 100%; max-width: 480px; height: 80px;
  background: var(--card); border-top: 1px solid var(--border); display: flex;
  justify-content: space-around; align-items: center; z-index: 2000;
  padding-bottom: env(safe-area-inset-bottom);
`;

const NavItem = styled.div`
  display: flex; flex-direction: column; align-items: center; cursor: pointer;
  color: ${props => props.$active ? 'var(--primary)' : '#555'};
  span { font-size: 0.6rem; font-weight: 900; margin-top: 4px; text-transform: uppercase; }
`;

// --- MAIN APP ---
export default function App() {
  const store = useStore();
  const [activeTab, setActiveTab] = useState('menu');
  const [isNight, setIsNight] = useState(new Date().getHours() >= 18);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    const economyInterval = setInterval(() => store.updateMarket(), 30000);
    return () => clearInterval(economyInterval);
  }, [store]);

  const menuItems = [
    { id: 1, name: 'Sand Coffee', basePrice: 4.5 },
    { id: 2, name: 'Zgougou Latte', basePrice: 7.2 },
    { id: 3, name: 'Bambalouni', basePrice: 3.5 },
    { id: 4, name: 'Nitro Brew', basePrice: 6.5 },
    { id: 5, name: 'Citronnade', basePrice: 4.0 },
    { id: 6, name: 'Kaak Warka', basePrice: 2.5 },
  ];

  if (!hydrated) return null;

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      <GlobalStyle $isNight={isNight} />
      
      <header style={{ padding: '1.5rem', background: 'var(--bg)', position: 'sticky', top: 0, zIndex: 1000 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
              <select 
                value={store.location} 
                onChange={(e) => store.setHub(e.target.value)}
                style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '4px', fontSize: '0.6rem', fontWeight: 900, padding: '2px 6px' }}
              >
                <option value="LAC 2">LAC 2 HUB</option>
                <option value="TUNIS MARINE">TUNIS MARINE</option>
              </select>
              {store.marketOscillator > 1.05 && <TrendingUp size={14} color="#FF4D4D" />}
            </div>
            <div style={{ fontWeight: 900, fontSize: '1.5rem', letterSpacing: '-1px' }}>NOIR BEAN</div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={store.saveSnapshot} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px', color: 'var(--text)' }}><Save size={18}/></button>
            <button onClick={() => setIsNight(!isNight)} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '10px', padding: '8px', color: 'var(--text)' }}>
              {isNight ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </div>
      </header>

      <MainContent className={store.isTransiting ? 'hub-switching' : ''}>
        <AnimatePresence mode="wait">
          {activeTab === 'menu' && (
            <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                {menuItems.map(item => {
                  const currentPrice = item.basePrice * store.marketOscillator;
                  return (
                    <div key={item.id} style={{ background: 'var(--card)', borderRadius: '24px', border: '1px solid var(--border)', padding: '1.2rem', position: 'relative' }}>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800 }}>{item.name}</div>
                      <div style={{ fontSize: '0.6rem', opacity: 0.4, marginBottom: '1rem' }}>HUB STOCK: {store.inventory[store.location][item.id]}</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <PriceTag>${currentPrice.toFixed(2)}</PriceTag>
                        <button 
                          onClick={() => store.addToCart(item, currentPrice)} 
                          disabled={store.inventory[store.location][item.id] <= 0}
                          style={{ background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '10px', padding: '8px', cursor: 'pointer', opacity: store.inventory[store.location][item.id] <= 0 ? 0.2 : 1 }}
                        >
                          <ShoppingCart size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {store.history.length > 0 && (
                <div style={{ marginTop: '2.5rem' }}>
                  <div style={{ fontSize: '0.65rem', fontWeight: 900, opacity: 0.5, marginBottom: '1rem', letterSpacing: '1px' }}>TEMPORAL SNAPSHOTS</div>
                  <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px' }}>
                    {store.history.map(snap => (
                      <button key={snap.id} onClick={() => store.restoreSnapshot(snap)} style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 12px', borderRadius: '12px', fontSize: '0.65rem', whiteSpace: 'nowrap', cursor: 'pointer' }}>
                        <RotateCcw size={12} style={{ marginRight: '4px' }}/> {new Date(snap.id).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'pickup' && (
            <motion.div key="pickup" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ background: '#000', color: '#0f0', padding: '1.5rem', borderRadius: '24px', fontFamily: 'monospace', fontSize: '0.75rem', minHeight: '300px' }}>
                <div style={{ borderBottom: '1px solid #1a1a1a', paddingBottom: '10px', marginBottom: '1rem' }}>[INFRASTRUCTURE_TERMINAL_v25]</div>
                {store.orders.map(order => (
                  <div key={order.id} style={{ marginBottom: '1.5rem', borderLeft: '2px solid #0f0', paddingLeft: '12px' }}>
                    <div style={{ fontWeight: 'bold' }}>> ID: {order.id}</div>
                    <div>> STATUS: {order.status}</div>
                    <div style={{ color: '#555' }}>> HUB: {store.location}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '5px' }}>
                      <div style={{ width: '100px', height: '4px', background: '#111' }}>
                        <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: order.eta }} style={{ height: '100%', background: '#0f0' }} />
                      </div>
                      <span style={{ fontSize: '0.6rem' }}>{order.eta}s</span>
                    </div>
                  </div>
                ))}
                {store.orders.length === 0 && <div style={{ opacity: 0.3 }}>> LISTENING FOR BROADCASTS...</div>}
              </div>
            </motion.div>
          )}

          {activeTab === 'cart' && (
            <motion.div key="cart" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}>
              <h2 style={{ fontWeight: 900 }}>Your Basket</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {store.cart.map(item => (
                  <div key={item.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '16px', padding: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: 800 }}>{item.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: 700 }}>${(item.currentPrice * item.quantity).toFixed(2)}</div>
                    </div>
                    <div style={{ fontWeight: 900 }}>x{item.quantity}</div>
                  </div>
                ))}
              </div>
              {store.cart.length > 0 && (
                <button 
                  onClick={() => { store.processCheckout(); setActiveTab('pickup'); }}
                  style={{ width: '100%', marginTop: '2rem', padding: '1.2rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '20px', fontWeight: 900, cursor: 'pointer', boxShadow: '0 10px 20px rgba(111, 78, 55, 0.2)' }}
                >
                  EXECUTE TRANSACTION
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </MainContent>

      <FooterNav>
        <NavItem $active={activeTab === 'menu'} onClick={() => setActiveTab('menu')}><Coffee size={24} /><span>Menu</span></NavItem>
        <NavItem $active={activeTab === 'pickup'} onClick={() => setActiveTab('pickup')}><Terminal size={24} /><span>Pickup</span></NavItem>
        <NavItem $active={activeTab === 'cart'} onClick={() => setActiveTab('cart')}>
          <div style={{ position: 'relative' }}>
            <ShoppingCart size={24} />
            {store.cart.length > 0 && <span style={{ position: 'absolute', top: -5, right: -10, background: 'var(--primary)', color: 'white', fontSize: '0.5rem', width: 15, height: 15, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{store.cart.length}</span>}
          </div>
          <span>Cart</span>
        </NavItem>
      </FooterNav>
    </div>
  );
}