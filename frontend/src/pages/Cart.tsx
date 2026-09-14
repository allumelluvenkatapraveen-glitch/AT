import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import { clearCart, getCart, removeCartItem, updateCartItem, type Cart, type CartItem } from '../api/customer.api';

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null);
  const [error, setError] = useState('');

  const refresh = () => getCart().then(setCart).catch(() => setError('Unable to load your cart.'));
  useEffect(() => { void refresh(); }, []);

  const groupedItems = useMemo(() => {
    const groups = new Map<string, CartItem[]>();
    for (const item of cart?.items ?? []) {
      const business = item.product.businessLocation?.business;
      const key = business?.id ?? 'unknown-business';
      groups.set(key, [...(groups.get(key) ?? []), item]);
    }
    return [...groups.entries()];
  }, [cart]);

  const mutate = async (operation: () => Promise<unknown>) => {
    setError('');
    try { await operation(); await refresh(); } catch { setError('Unable to update your cart.'); }
  };

  return (
    <div className="app dashboard-page">
      <Header />
      <main className="dashboard-shell">
        <div className="section-label">YOUR SHOPPING CART</div>
        <h1>Cart</h1>
        {error && <div className="error-message" role="alert">{error}</div>}
        {!cart?.items.length ? (
          <section className="dashboard-panel"><h2>Your cart is empty</h2><p>Browse local products and add items from one or more businesses.</p><Link className="nearby-button" to="/">Discover products</Link></section>
        ) : (
          <>
            {groupedItems.map(([businessId, items]) => (
              <section className="dashboard-panel" key={businessId}>
                <h2>{items[0].product.businessLocation?.business.name ?? 'Business'}</h2>
                {items.map((item) => (
                  <div className="dashboard-list-item" key={item.id}>
                    <div><strong>{item.product.name}</strong><span>{item.product.currencyCode} {item.product.price} each</span></div>
                    <div className="cart-item-actions"><button type="button" onClick={() => void mutate(() => updateCartItem(item.id, Math.max(1, item.quantity - 1)))}>-</button><span>{item.quantity}</span><button type="button" onClick={() => void mutate(() => updateCartItem(item.id, item.quantity + 1))}>+</button><button type="button" onClick={() => void mutate(() => removeCartItem(item.id))}>Remove</button></div>
                  </div>
                ))}
              </section>
            ))}
            <button className="nearby-button" type="button" onClick={() => void mutate(clearCart)}>Clear cart</button>
          </>
        )}
      </main>
    </div>
  );
}
