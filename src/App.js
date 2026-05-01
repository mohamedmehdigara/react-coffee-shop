import React, { useState, useEffect, useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import styled, { createGlobalStyle, keyframes, css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, Coffee, Radio, Zap, MapPin, ShoppingBag, 
  Activity, Info, BookOpen, Briefcase, Truck, Heart, ChevronRight,
  ExternalLink, AlertCircle, Package, History,
  Compass, Globe, ShieldCheck
} from 'lucide-react';

// --- STORE ENGINE (V29.4) ---
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
        set({ transitStatus: 'SWITCHING' });
        // Simulating power drop during heavy logistics shift
        setTimeout(() => {
            set((state) => ({ 
                location: loc, 
                transitStatus: 'IDLE', 
                power: Math.max(0, state.power - 15) 
            }));
        }, 2000);
      },
      addToCart: (item) => {
        const { location, inventory, cart, power } = get();
        if (inventory[location][item.id] <= 0 || power < 5) return;
        const existing = cart.find(i => i.id === item.id);
        set({
          power: Math.max(0, power - 3),
          inventory: { ...inventory, [location]: { ...inventory[location], [item.id]: inventory[location][item.id] - 1 } },
          cart: existing ? cart.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i) : [...cart, { ...item, qty: 1 }]
        });
      },
      recharge: () => set({ power: 100 })
    }),
    { name: 'noir-bean-v29-4' }
  )
);

// --- STYLES & ANIMATIONS ---
const pulse = keyframes`
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.7; }
  100% { transform: scale(1); opacity: 1; }
`;

const scan = keyframes`
  from { top: -100%; }
  to { top: 200%; }
`;

const GlobalStyle = createGlobalStyle`
  :root { --primary: #6f4e37; --accent: #d4a373; --noir: #1a1512; --cream: #fdfcfb; --border: #f1f3f5; }
  body { 
    margin: 0; padding: 0; font-family: 'Inter', sans-serif;
    background: var(--cream); color: var(--noir);
    transition: background 0.5s ease;
  }
`;

const RadarContainer = styled.div`
  width: 100%; height: 150px; background: #0a0a0a; border-radius: 20px;
  position: relative; overflow: hidden; border: 1px solid #333;
  &::after {
    content: ''; position: absolute; width: 100%; height: 50%;
    background: linear-gradient(0deg, transparent, rgba(0, 255, 0, 0.2), transparent);
    animation: ${scan} 3s linear infinite;
  }
`;

// --- MAIN APPLICATION ---
export default function App() {
  const store = useStore();
  const [activeTab, setActiveTab] = useState('menu');
  const [category, setCategory] = useState('all');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => setIsHydrated(true), []);

  const menu = [
    { id: 1, name: 'Sand Coffee', price: 4.5, cat: 'coffee', note: 'Sidi Bou Said Style' },
    { id: 2, name: 'Zgougou Latte', price: 7.2, cat: 'coffee', note: 'Aleppo Pine Cream' },
    { id: 3, name: 'Bambalouni', price: 3.5, cat: 'pastry', note: 'Hot & Sugary' },
    { id: 4, name: 'Kaak Warka', price: 2.8, cat: 'pastry', note: 'Zaghouan Almond' },
    { id: 5, name: 'Citronnade', price: 4.0, cat: 'drinks', note: 'Sfaxien Lemon' },
    { id: 6, name: 'Tunisian Tea', price: 3.0, cat: 'drinks', note: 'Pine Nut Garnish' },
  ];

  const filteredMenu = category === 'all' ? menu : menu.filter(m => m.cat === category);

  if (!isHydrated) return null;

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', minHeight: '100vh', display: 'flex', flexDirection: 'column', background: store.transitStatus === 'SWITCHING' ? '#000' : 'var(--cream)' }}>
      <GlobalStyle />

      {/* HEADER */}
      <header style={{ padding: '1.5rem', background: store.transitStatus === 'SWITCHING' ? '#000' : 'white', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '4px' }}>
              <div style={{ background: '#f8f9fa', padding: '4px 8px', borderRadius: '100px', fontSize: '0.55rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Globe size={10} color="var(--primary)" /> {store.location}
              </div>
              <div style={{ background: '#f8f9fa', padding: '4px 8px', borderRadius: '100px', fontSize: '0.55rem', fontWeight: 900, color: '#228be6' }}>
                GRID_{store.power}%
              </div>
            </div>
            <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 900, color: store.transitStatus === 'SWITCHING' ? 'white' : 'var(--noir)' }}>Noir Bean</h1>
          </div>
          <button 
            onClick={() => store.setHub(store.location === 'LAC 2' ? 'TUNIS MARINE' : 'LAC 2')}
            style={{ background: 'var(--noir)', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Compass size={20} />
          </button>
        </div>
      </header>

      {/* CONTENT */}
      <main style={{ padding: '1.5rem', flex: 1, paddingBottom: '120px' }}>
        <AnimatePresence mode="wait">
          {store.transitStatus === 'SWITCHING' ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', marginTop: '6rem' }}>
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1 }}>
                    <Truck size={48} color="white" />
                </motion.div>
                <p style={{ color: 'white', fontWeight: 900, fontSize: '0.7rem', letterSpacing: '2px', marginTop: '1rem' }}>RE-ROUTING CARGO...</p>
            </motion.div>
          ) : activeTab === 'menu' ? (
            <motion.div key="menu" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                {/* Category Bar */}
                <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '1.5rem', scrollbarWidth: 'none' }}>
                    {['all', 'coffee', 'pastry', 'drinks'].map(c => (
                        <button key={c} onClick={() => setCategory(c)} style={{ padding: '8px 16px', borderRadius: '100px', border: '1px solid var(--border)', background: category === c ? 'var(--noir)' : 'white', color: category === c ? 'white' : 'var(--noir)', fontWeight: 800, fontSize: '0.65rem', textTransform: 'uppercase' }}>{c}</button>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    {filteredMenu.map(item => {
                        const stock = store.inventory[store.location][item.id];
                        return (
                            <motion.div key={item.id} style={{ background: 'white', padding: '1.2rem', borderRadius: '24px', border: '1px solid var(--border)', position: 'relative' }}>
                                {stock < 5 && <div style={{ position: 'absolute', top: 10, right: 10, width: 6, height: 6, background: 'red', borderRadius: '50%', animation: `${pulse} 1s infinite` }} />}
                                <div style={{ fontSize: '0.55rem', fontWeight: 900, color: 'var(--accent)' }}>{item.note}</div>
                                <div style={{ fontWeight: 800, fontSize: '0.9rem', margin: '4px 0' }}>{item.name}</div>
                                <div style={{ fontWeight: 900, fontSize: '1rem', marginBottom: '1rem' }}>${item.price.toFixed(2)}</div>
                                <button 
                                    onClick={() => store.addToCart(item)}
                                    disabled={stock === 0}
                                    style={{ width: '100%', padding: '10px', background: stock === 0 ? '#eee' : 'var(--noir)', color: stock === 0 ? '#999' : 'white', border: 'none', borderRadius: '12px', fontSize: '0.65rem', fontWeight: 800 }}
                                >
                                    {stock === 0 ? 'DEPLETED' : 'ADD TO BAG'}
                                </button>
                            </motion.div>
                        );
                    })}
                </div>
            </motion.div>
          ) : activeTab === 'logs' ? (
            <motion.div key="logs" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 style={{ fontWeight: 900, fontSize: '1.2rem', marginBottom: '1.5rem' }}>Network Surveillance</h2>
                <RadarContainer>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#00ff00', fontSize: '0.6rem', textAlign: 'center', opacity: 0.5 }}>
                        <Activity size={24} style={{ marginBottom: '8px' }} /><br />
                        SCANNING_TUNIS_SUBSECTOR...
                    </div>
                </RadarContainer>
                <div style={{ marginTop: '1.5rem', background: '#f8f9fa', padding: '1rem', borderRadius: '15px', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                        <ShieldCheck size={16} color="green" />
                        <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>Node Security Level: Alpha</span>
                    </div>
                    <p style={{ fontSize: '0.7rem', color: '#666', margin: 0 }}>All transactions are routed through the secure SNTRI relay. Grid power is currently optimized for {store.location} brewing operations.</p>
                </div>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {/* CLICKABLE FOOTER LINKS */}
        <footer style={{ marginTop: '4rem', padding: '2rem 0', borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                <div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 900, marginBottom: '1rem', color: '#adb5bd' }}>EXPLORE</div>
                    <div onClick={() => setActiveTab('menu')} style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '8px', cursor: 'pointer' }}>Our Menu</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, marginBottom: '8px', cursor: 'pointer' }}>Carthage Roastery</div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Gare Tunis Marine</div>
                </div>
                <div>
                    <div style={{ fontSize: '0.65rem', fontWeight: 900, marginBottom: '1rem', color: '#adb5bd' }}>SOCIAL</div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                       
                        <ExternalLink size={18} />
                    </div>
                </div>
            </div>
            <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                <p style={{ fontSize: '0.55rem', color: '#adb5bd' }}>© 2026 NOIR BEAN • REGIONAL LOGISTICS v29.4</p>
                <p style={{ fontSize: '0.5rem', color: '#eee' }}>DESIGNED FOR HIGH-LATENCY ENVIRONMENTS</p>
            </div>
        </footer>
      </main>

      {/* DOCK NAV */}
      <nav style={{ position: 'fixed', bottom: 0, width: '100%', maxWidth: '480px', height: '80px', background: 'white', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-around', alignItems: 'center', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div onClick={() => setActiveTab('menu')} style={{ opacity: activeTab === 'menu' ? 1 : 0.3, textAlign: 'center', cursor: 'pointer' }}>
            <Coffee size={24} /><div style={{ fontSize: '0.5rem', fontWeight: 900 }}>MENU</div>
        </div>
        <div onClick={() => setActiveTab('cart')} style={{ opacity: activeTab === 'cart' ? 1 : 0.3, textAlign: 'center', cursor: 'pointer', position: 'relative' }}>
            <ShoppingBag size={24} />
            {store.cart.length > 0 && <span style={{ position: 'absolute', top: -5, right: -10, background: 'var(--primary)', color: 'white', fontSize: '0.55rem', width: 16, height: 16, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{store.cart.length}</span>}
            <div style={{ fontSize: '0.5rem', fontWeight: 900 }}>BAG</div>
        </div>
        <div onClick={() => setActiveTab('logs')} style={{ opacity: activeTab === 'logs' ? 1 : 0.3, textAlign: 'center', cursor: 'pointer' }}>
            <Activity size={24} /><div style={{ fontSize: '0.5rem', fontWeight: 900 }}>RADAR</div>
        </div>
      </nav>
    </div>
  );
}