import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import { createOrder } from '../api/customer.api';

export default function Checkout() {
  const navigate = useNavigate();
  const [fulfillment, setFulfillment] = useState<'PICKUP' | 'DELIVERY'>('PICKUP');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    setError('');
    try {
      await createOrder(fulfillment);
      navigate('/orders');
    } catch {
      setError(fulfillment === 'DELIVERY' ? 'Delivery requires a saved address. Choose pickup or add an address first.' : 'Unable to create the order. Please check your cart and try again.');
    } finally {
      setLoading(false);
    }
  };

  return <div className="app dashboard-page"><Header /><main className="dashboard-shell"><div className="section-label">CHECKOUT</div><h1>Complete your order</h1><section className="dashboard-panel"><h2>Fulfillment</h2><label className="choice-row"><input type="radio" checked={fulfillment === 'PICKUP'} onChange={() => setFulfillment('PICKUP')} /> Pickup</label><label className="choice-row"><input type="radio" checked={fulfillment === 'DELIVERY'} onChange={() => setFulfillment('DELIVERY')} /> Delivery <span className="optional-label">requires an address</span></label><p>Payment processing and delivery provider quotes are not enabled yet. The backend will validate stock, prices, currency, and fulfillment.</p>{error && <div className="error-message" role="alert">{error}</div>}<button className="search-button" type="button" disabled={loading} onClick={() => void submit()}>{loading ? 'Creating order...' : 'Place order'}</button><Link className="back-link" to="/cart">Back to cart</Link></section></main></div>;
}
