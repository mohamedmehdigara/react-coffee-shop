import React, { useState, useMemo } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import styled, { createGlobalStyle } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, Coffee, X, Plus, Minus, Trash2, 
  CheckCircle2, Leaf, Zap, Flame, Star, Award 
} from 'lucide-react';

// --- STORE ---
const useStore = create(
  persist(
    (set) => ({
      cart: [],
      isCartOpen: false,
      isPurchased: false,
      toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen, isPurchased: false })),
      addToCart: (product) => set((state) => {
        const existing = state.cart.find((item) => item.id === product.id);
        if (existing) {
          return {
            cart: state.cart.map((item) =>
              item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
            ),
          };
        }
        return { cart: [...state.cart, { ...product, quantity: 1 }] };
      }),
      removeFromCart: (id) => set((state) => ({
        cart: state.cart.filter((item) => item.id !== id),
      })),
      updateQuantity: (id, delta) => set((state) => ({
        cart: state.cart.map((item) =>
          item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
        ),
      })),
      confirmPurchase: () => set({ isPurchased: true, cart: [] }),
    }),
    { name: 'noir-bean-v3' }
  )
);

// --- EXPANDED MENU DATA ---
const MENU_ITEMS = [
  { id: 1, name: 'Midnight Espresso', price: 4.5, category: 'Hot', image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400' },
  { id: 2, name: 'Velvet Latte', price: 5.2, category: 'Hot', image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=400' },
  { id: 3, name: 'Tunisian Mint Tea', price: 3.5, category: 'Hot', image: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400' },
  { id: 4, name: 'Nitro Cold Brew', price: 6.5, category: 'Cold', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400' },
  { id: 5, name: 'Matcha Cloud', price: 5.8, category: 'Cold', image: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400' },
  { id: 6, name: 'Pistachio Baklawa', price: 4.0, category: 'Bakery', image: 'https://images.unsplash.com/photo-1519676867240-f03562e64548?w=400' },
  { id: 7, name: 'Honey Bambalouni', price: 3.0, category: 'Bakery', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400' },
  { id: 8, name: 'Date Muffin', price: 3.8, category: 'Bakery', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400' },
  { id: 9, name: 'Iced Citronnade', price: 4.5, category: 'Cold', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=400' },
  { id: 10, name: 'Flat White', price: 4.8, category: 'Hot', image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?w=400' },
  { id: 11, name: 'Affogato Dream', price: 7.0, category: 'Cold', image: 'https://images.unsplash.com/photo-1594631252845-29fc4586c55c?w=400' },
  { id: 12, name: 'Turkish Sand Brew', price: 4.5, category: 'Hot', image: 'https://images.unsplash.com/photo-1595914352220-333e387c336b?w=400' },
  { id: 13, name: 'Almond Croissant', price: 4.5, category: 'Bakery', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400' },
  { id: 14, name: 'Chai Spiced Latte', price: 5.0, category: 'Hot', image: 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=400' },
  { id: 15, name: 'Dirty Matcha', price: 6.2, category: 'Cold', image: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400' },
  { id: 16, name: 'Saffron Tea', price: 4.2, category: 'Hot', image: 'https://images.unsplash.com/photo-1544787210-2211d7c928c7?w=400' },
  { id: 17, name: 'Lemon Drizzle', price: 3.5, category: 'Bakery', image: 'https://images.unsplash.com/photo-1519869325930-281384150729?w=400' },
  { id: 18, name: 'Caramel Macchiato', price: 5.5, category: 'Hot', image: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=400' },
  { id: 19, name: 'Hibiscus Iced Tea', price: 4.0, category: 'Cold', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400' },
  { id: 20, name: 'Pain au Chocolat', price: 4.2, category: 'Bakery', image: 'https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=400' },
];

// --- STYLES ---
const GlobalStyle = createGlobalStyle`
  body { margin: 0; font-family: 'Inter', sans-serif; background-color: #faf9f6; color: #2d241e; overflow-x: hidden; }
  * { box-sizing: border-box; }
`;

const Nav = styled.nav`
  position: sticky; top: 0; z-index: 100; display: flex; justify-content: space-between; align-items: center;
  padding: 1rem 5%; background: rgba(250, 249, 246, 0.95); backdrop-filter: blur(12px); border-bottom: 1px solid #eee;
`;

const CartButton = styled(motion.button)`
  background: #6f4e37; color: white; border: none; padding: 0.7rem 1.4rem; border-radius: 50px; 
  cursor: pointer; display: flex; align-items: center; gap: 0.6rem; font-weight: 700;
`;

const Hero = styled.section`
  height: 40vh; min-height: 300px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center;
  padding: 0 5%; background: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&q=80&w=1200');
  background-size: cover; background-position: center; color: white;
`;

const FilterBar = styled.div`
  display: flex; gap: 1rem; margin: 2rem 0; overflow-x: auto; padding-bottom: 10px; scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;

const FilterBtn = styled.button`
  padding: 0.6rem 1.6rem; border-radius: 25px; border: 2px solid #6f4e37; font-weight: 700; cursor: pointer;
  background: ${props => props.active ? '#6f4e37' : 'white'};
  color: ${props => props.active ? 'white' : '#6f4e37'};
  white-space: nowrap; transition: 0.2s;
`;

const Grid = styled(motion.div)`
  display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 2rem; margin-bottom: 5rem;
`;

const Card = styled(motion.div)`
  background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05);
  display: flex; flex-direction: column; height: 100%;
`;

const Sidebar = styled(motion.div)`
  position: fixed; right: 0; top: 0; height: 100dvh; width: 100%; max-width: 420px; 
  background: white; z-index: 1000; display: flex; flex-direction: column;
  box-shadow: -10px 0 50px rgba(0,0,0,0.15);
`;

const CartHeader = styled.div`
  padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee;
`;

const CartContent = styled.div`
  flex: 1; overflow-y: auto; padding: 1.5rem;
`;

const CartFooter = styled.div`
  padding: 1.5rem; border-top: 2px solid #f3eee8; background: white;
  /* Ensuring visibility on mobile */
  padding-bottom: max(1.5rem, env(safe-area-inset-bottom));
`;

const ActionBtn = styled(motion.button)`
  width: 100%; padding: 1rem; border-radius: 12px; border: none; font-weight: 800; cursor: pointer;
  background: ${props => props.primary ? '#6f4e37' : '#f3eee8'};
  color: ${props => props.primary ? 'white' : '#6f4e37'};
  font-size: 1rem;
`;

const Overlay = styled(motion.div)`
  position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 999; backdrop-filter: blur(4px);
`;

// --- MAIN APP ---
export default function CoffeeApp() {
  const { cart, toggleCart, addToCart, isCartOpen, updateQuantity, removeFromCart, isPurchased, confirmPurchase } = useStore();
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredItems = useMemo(() => {
    return activeCategory === 'All' ? MENU_ITEMS : MENU_ITEMS.filter(item => item.category === activeCategory);
  }, [activeCategory]);

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cart.reduce((a, b) => a + b.quantity, 0);

  return (
    <>
      <GlobalStyle />
      
      {/* Sidebar with Persistence and Fixed Footer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <Overlay initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={toggleCart} />
            <Sidebar 
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <CartHeader>
                <h2 style={{ margin: 0 }}>{isPurchased ? 'Success' : 'Order Summary'}</h2>
                <X onClick={toggleCart} style={{ cursor: 'pointer' }} size={28} />
              </CartHeader>

              <CartContent>
                {isPurchased ? (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center', marginTop: '3rem' }}>
                    <CheckCircle2 size={80} color="#27ae60" style={{ marginBottom: '1.5rem' }} />
                    <h3>Roasted & Ready!</h3>
                    <p>Your order #{Math.floor(Math.random()*9000)+1000} is being prepped in Tunis.</p>
                  </motion.div>
                ) : cart.length === 0 ? (
                  <div style={{ textAlign: 'center', marginTop: '4rem', opacity: 0.5 }}>
                    <Coffee size={48} style={{ marginBottom: '1rem' }} />
                    <p>Your bag is looking empty.</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <motion.div layout key={item.id} style={{ display: 'flex', gap: '1rem', padding: '1.2rem 0', borderBottom: '1px solid #f9f6f3' }}>
                      <img src={item.image} alt="" style={{ width: '64px', height: '64px', borderRadius: '12px', objectFit: 'cover' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700 }}>{item.name}</div>
                        <div style={{ color: '#6f4e37', fontWeight: 800 }}>${item.price.toFixed(2)}</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.6rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', background: '#f3eee8', padding: '4px 10px', borderRadius: '6px' }}>
                            <Minus size={14} onClick={() => updateQuantity(item.id, -1)} style={{ cursor: 'pointer' }} />
                            <span style={{ fontWeight: 700 }}>{item.quantity}</span>
                            <Plus size={14} onClick={() => updateQuantity(item.id, 1)} style={{ cursor: 'pointer' }} />
                          </div>
                          <Trash2 size={16} color="#e74c3c" onClick={() => removeFromCart(item.id)} style={{ cursor: 'pointer', marginLeft: 'auto' }} />
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </CartContent>

              {cart.length > 0 && !isPurchased && (
                <CartFooter>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.3rem', fontWeight: 900, marginBottom: '1.2rem' }}>
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <ActionBtn 
                    primary 
                    onClick={confirmPurchase} 
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.98 }}
                  >
                    Confirm Purchase
                  </ActionBtn>
                </CartFooter>
              )}
              {isPurchased && (
                <CartFooter>
                  <ActionBtn onClick={toggleCart}>Back to Menu</ActionBtn>
                </CartFooter>
              )}
            </Sidebar>
          </>
        )}
      </AnimatePresence>

      <Nav>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 900, fontSize: '1.4rem', color: '#6f4e37' }}>
          <Coffee size={32} fill="#6f4e37" /> NOIR BEAN
        </div>
        <CartButton 
          onClick={toggleCart}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ShoppingCart size={20} />
          <span>{cartCount} Items</span>
        </CartButton>
      </Nav>

      <Hero>
        <motion.h1 
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', margin: 0 }}
        >
          The Daily Commit
        </motion.h1>
        <p style={{ fontSize: '1.2rem', opacity: 0.9, marginTop: '1rem' }}>Expertly roasted for the digital architect.</p>
      </Hero>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 5%' }}>
        <FilterBar>
          {['All', 'Hot', 'Cold', 'Bakery'].map(cat => (
            <FilterBtn key={cat} active={activeCategory === cat} onClick={() => setActiveCategory(cat)}>
              {cat}
            </FilterBtn>
          ))}
        </FilterBar>

        <Grid layout>
          <AnimatePresence mode="popLayout">
            {filteredItems.map(item => (
              <Card 
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <div style={{ position: 'relative', height: '200px' }}>
                  <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {item.id % 5 === 0 && (
                    <div style={{ position: 'absolute', top: '12px', left: '12px', background: '#6f4e37', color: 'white', padding: '5px 12px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800 }}>
                      BEST SELLER
                    </div>
                  )}
                </div>
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                    <h4 style={{ margin: 0, fontSize: '1.1rem' }}>{item.name}</h4>
                    <span style={{ fontWeight: 900, color: '#6f4e37', fontSize: '1.1rem' }}>${item.price.toFixed(2)}</span>
                  </div>
                  <ActionBtn 
                    primary
                    onClick={() => addToCart(item)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    Add to Order
                  </ActionBtn>
                </div>
              </Card>
            ))}
          </AnimatePresence>
        </Grid>
      </div>

      <footer style={{ background: '#2d241e', color: 'white', padding: '5rem 5%' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '4rem', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ color: '#6f4e37', marginBottom: '1rem' }}>NOIR BEAN COLLECTIVE</h2>
            <p style={{ opacity: 0.6, maxWidth: '400px', lineHeight: '1.8' }}>
              Located in the heart of Tunis. We believe every great line of code starts with a perfect extraction.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '3rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <span style={{ fontWeight: 800, fontSize: '0.8rem', letterSpacing: '1px' }}>VIBE</span>
              <span style={{ opacity: 0.7, display: 'flex', alignItems: 'center', gap: '8px' }}><Leaf size={16} /> Organic</span>
              <span style={{ opacity: 0.7, display: 'flex', alignItems: 'center', gap: '8px' }}><Zap size={16} /> High-Octane</span>
              <span style={{ opacity: 0.7, display: 'flex', alignItems: 'center', gap: '8px' }}><Award size={16} /> Artisan</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <span style={{ fontWeight: 800, fontSize: '0.8rem', letterSpacing: '1px' }}>SOCIAL</span>
              <span style={{ opacity: 0.7 }}>Instagram</span>
              <span style={{ opacity: 0.7 }}>GitHub</span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}