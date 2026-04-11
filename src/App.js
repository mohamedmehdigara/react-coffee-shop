import React, { useState, useEffect, useCallback } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import styled, { createGlobalStyle, keyframes, css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, Coffee, Radio, Zap, MapPin, ShoppingBag, 
  Activity, Info, BookOpen, Briefcase, Truck, Heart, ChevronRight,
  ExternalLink, AlertCircle, Package, History
} from 'lucide-react';

// --- STORE ENGINE (V29.3) ---
const useStore = create(
  persist(
    (set, get) => ({
      location: 'LAC 2',
      power: 100,
      transitStatus: 'IDLE',
      cart: [],
      inventory: { 
        'LAC 2': { 1: 15, 2: 10, 3: 25, 4: 12, 5: 20, 6: 15, 7: 8 }, 
        'TUNIS MARINE': { 1: 5, 2: 3, 3: 40, 4: 5, 5: 15, 6: 2, 7: 0 } 
      },
      setHub: (loc) => {
        if (get().location === loc || get().transitStatus !== 'IDLE') return;
        const transitCost = 20 + (get().cart.length * 2); // Cargo weight logic
        set({ transitStatus: 'SWITCHING', power: Math.max(0, get().power - transitCost) });
        setTimeout(() => set({ location: loc, transitStatus: 'IDLE' }), 2500);
      },
      addToCart: (item) => {
        const { location, inventory, cart, power } = get();
        if (inventory[location][item.id] <= 0 || power < 5) return;
        const existing = cart.find(i => i.id === item.id);
        set({
          power: Math.max(0, power - 5),
          inventory: { ...inventory, [location]: { ...inventory[location], [item.id]: inventory[location][item.id] - 1 } },
          cart: existing ? cart.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i) : [...cart, { ...item, qty: 1 }]
        });
      },
      recharge: () => set({ power: 100 })
    }),
    { name: 'noir-bean-v29-3' }
  )
);

// --- ANIMATIONS & STYLES ---
const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-2px); }
  75% { transform: translateX(2px); }
`;

const GlobalStyle = createGlobalStyle`
  :root { --primary: #6f4e37; --accent: #d4a373; --noir: #1a1512; --cream: #fdfcfb; --border: #f1f3f5; }
  body { 
    margin: 0; padding: 0; font-family: 'Inter', system-ui, sans-serif;
    background: var(--cream); color: var(--noir); overflow-x: hidden;
    ${props => props.$lowPower && css`animation: ${shake} 0.5s infinite; opacity: 0.9;`}
  }
`;

const NavItem = styled.div`
  display: flex; flex-direction: column; align-items: center; cursor: pointer;
  color: ${props => props.$active ? 'var(--primary)' : '#adb5bd'};
  transition: all 0.2s;
  span { font-size: 0.6rem; font-weight: 800; margin-top: 4px; }
`;

const CategoryButton = styled.button`
  padding: 8px 20px; border-radius: 100px; border: 1px solid var(--border);
  background: ${props => props.$active ? 'var(--noir)' : 'white'};
  color: ${props => props.$active ? 'white' : 'var(--noir)'};
  white-space: nowrap; font-weight: 700; font-size: 0.7rem; cursor: pointer;
`;

// --- MAIN APPLICATION ---
export default function App() {
  const store = useStore();
  const [activeTab, setActiveTab] = useState('menu');
  const [category, setCategory] = useState('all');
  const [selectedInfo, setSelectedInfo] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => setIsHydrated(true), []);

  const fullMenu = [
    { id: 1, name: 'Sand Coffee', price: 4.5, cat: 'coffee', note: 'Sidi Bou Said Style', origin: 'Slow-brewed in fine Carthage sand.' },
    { id: 2, name: 'Zgougou Latte', price: 7.2, cat: 'coffee', note: 'Aleppo Pine Cream', origin: 'Northern Tunisian pine nut extract.' },
    { id: 3, name: 'Bambalouni', price: 3.5, cat: 'pastry', note: 'Traditional Fry-bread', origin: 'Sugar-coated citrus zest dough.' },
    { id: 4, name: 'Kaak Warka', price: 2.8, cat: 'pastry', note: 'Marzipan Ring', origin: 'Hand-shaped almond paste from Zaghouan.' },
    { id: 5, name: 'Citronnade', price: 4.0, cat: 'drinks', note: 'Fresh Mint & Lemon', origin: 'Cold-pressed Sfaxien lemons.' },
    { id: 6, name: 'Tunisian Tea', price: 3.0, cat: 'drinks', note: 'With Pine Nuts', origin: 'Minted green tea with floating nuts.' },
    { id: 7, name: 'Baklawa', price: 5.5, cat: 'pastry', note: 'Honey & Pistachio', origin: '48 layers of handmade phyllo.' },
  ];

  const filteredMenu = category === 'all' ? fullMenu : fullMenu.filter(m => m.cat === category);

  if (!isHydrated) return null;

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <GlobalStyle $lowPower={store.power < 10} />

      {/* DETECTIVE MODAL */}
      <AnimatePresence>
        {selectedInfo && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zcallIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
            onClick={() => setSelectedInfo(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              style={{ background: 'white', padding: '2rem', borderRadius: '30px', maxWidth: '300px' }}
              onClick={e => e.stopPropagation()}
            >
              <h3 style={{ margin: 0 }}>{selectedInfo.name}</h3>
              <p style={{ fontSize: '0.8rem', color: '#666', lineHeight: 1.6 }}>{selectedInfo.origin}</p>
              <button onClick={() => setSelectedInfo(null)} style={{ width: '100%', background: 'var(--noir)', color: 'white', border: 'none', padding: '10px', borderRadius: '10px', fontWeight: 700 }}>Close Signal</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header style={{ padding: '1.5rem', background: 'white', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
              <div style={{ background: '#f8f9fa', padding: '4px 8px', borderRadius: '100px', fontSize: '0.55rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <MapPin size={10} /> {store.location}
              </div>
              <div style={{ background: store.power < 20 ? '#fff5f5' : '#f8f9fa', padding: '4px 8px', borderRadius: '100px', fontSize: '0.55rem', fontWeight: 900, color: store.power < 20 ? '#ff6b6b' : '#228be6' }}>
                <Zap size={10} /> {store.power}% PWR
              </div>
            </div>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900 }}>Noir Bean</h1>
          </div>
          <button onClick={() => store.setHub(store.location === 'LAC 2' ? 'TUNIS MARINE' : 'LAC 2')} style={{ background: 'var(--noir)', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Radio size={18} />
          </button>
        </div>
      </header>

      <main style={{ padding: '1.5rem', flex: 1, paddingBottom: '100px' }}>
        <AnimatePresence mode="wait">
          {store.transitStatus === 'SWITCHING' ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', marginTop: '4rem' }}>
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}><Package size={40} color="var(--primary)" /></motion.div>
              <p style={{ fontWeight: 800, fontSize: '0.8rem', color: '#868e96', marginTop: '1rem' }}>SNTRI Logistics in Transit...</p>
            </motion.div>
          ) : activeTab === 'menu' ? (
            <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '1.5rem', scrollbarWidth: 'none' }}>
                {['all', 'coffee', 'pastry', 'drinks'].map(c => (
                  <CategoryButton key={c} $active={category === c} onClick={() => setCategory(c)}>{c.toUpperCase()}</CategoryButton>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {filteredMenu.map(item => (
                  <motion.div key={item.id} style={{ background: 'white', padding: '1rem', borderRadius: '20px', border: '1px solid var(--border)' }}>
                    <div onClick={() => setSelectedInfo(item)} style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--accent)', cursor: 'help', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {item.note} <Info size={10} />
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '0.85rem', margin: '4px 0' }}>{item.name}</div>
                    <div style={{ fontWeight: 900, fontSize: '1rem', marginBottom: '1rem' }}>${item.price.toFixed(2)}</div>
                    <button onClick={() => store.addToCart(item)} style={{ width: '100%', padding: '10px', background: 'var(--noir)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '0.65rem', fontWeight: 800 }}>ADD TO BAG</button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ) : activeTab === 'status' ? (
            <motion.div key="status" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div style={{ background: 'var(--noir)', color: '#00ff00', padding: '1.5rem', borderRadius: '24px', fontFamily: 'monospace', fontSize: '0.7rem' }}>
                <div>> GARE_LOG_V29_3</div>
                <div style={{ margin: '10px 0', borderLeft: '2px solid #00ff00', paddingLeft: '10px' }}>
                  NODE: {store.location}<br />
                  GRID_RESERVE: {store.power}%<br />
                  CARGO_MASS: {store.cart.length} UNITS
                </div>
                {store.power < 50 && <button onClick={store.recharge} style={{ width: '100%', background: '#222', color: '#00ff00', border: '1px solid #00ff00', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}>INITIATE_RECHARGE</button>}
              </div>
            </motion.div>
          ) : (
            <motion.div key="corporate" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 style={{ fontWeight: 900 }}>Corporate Hub</h2>
              {['About', 'Careers', 'SNTRI Fleet', 'Terms'].map(link => (
                <div key={link} onClick={() => setActiveTab('menu')} style={{ padding: '1.2rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{link}</span>
                  <ChevronRight size={18} />
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        <footer style={{ marginTop: '3rem', padding: '2rem 0', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 900, marginBottom: '0.5rem' }}>LEGAL</div>
              <div onClick={() => setActiveTab('corporate')} style={{ fontSize: '0.7rem', color: '#868e96', cursor: 'pointer', marginBottom: '4px' }}>Privacy Policy</div>
              <div onClick={() => setActiveTab('corporate')} style={{ fontSize: '0.7rem', color: '#868e96', cursor: 'pointer' }}>SNTRI Terms</div>
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 900, marginBottom: '0.5rem' }}>FOLLOW</div>
              <div style={{ display: 'flex', gap: '10px' }}><Activity size={14} /></div>
            </div>
          </div>
          <p style={{ fontSize: '0.55rem', color: '#adb5bd', textAlign: 'center' }}>© 2026 NOIR BEAN TUNISIA • EXPERT SYSTEM v29.3</p>
        </footer>
      </main>

      <nav style={{ position: 'fixed', bottom: 0, width: '100%', maxWidth: '480px', height: '75px', background: 'white', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
        <NavItem $active={activeTab === 'menu'} onClick={() => setActiveTab('menu')}><Coffee size={24} /><span>HUB</span></NavItem>
        <NavItem $active={activeTab === 'cart'} onClick={() => setActiveTab('cart')} style={{ position: 'relative' }}>
          <ShoppingBag size={24} />
          {store.cart.length > 0 && <span style={{ position: 'absolute', top: -4, right: -10, background: 'var(--primary)', color: 'white', width: 14, height: 14, borderRadius: '50%', fontSize: '0.55rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{store.cart.length}</span>}
          <span>BAG</span>
        </NavItem>
        <NavItem $active={activeTab === 'status'} onClick={() => setActiveTab('status')}><History size={24} /><span>LOGS</span></NavItem>
      </nav>
    </div>
  );
}