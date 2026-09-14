import { useEffect, useState } from 'react';
import Header from '../components/layout/Header';
import { cancelOrder, getOrders, type Order } from '../api/customer.api';

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState('');
  const refresh = () => getOrders().then(setOrders).catch(() => setError('Unable to load orders.'));
  useEffect(() => { void refresh(); }, []);
  return <div className="app dashboard-page"><Header /><main className="dashboard-shell"><div className="section-label">YOUR SHOPPING HISTORY</div><h1>Orders</h1>{error && <div className="error-message">{error}</div>}{orders.length ? orders.map((order) => <section className="dashboard-panel" key={order.id}><div className="dashboard-list-item"><div><strong>Order {order.id.slice(0, 8)}</strong><span>{order.fulfillment} · {order.status} · {order.currencyCode} {order.total}</span></div>{(order.status === 'PENDING' || order.status === 'CONFIRMED') && <button className="nearby-button" type="button" onClick={() => void cancelOrder(order.id).then(refresh).catch(() => setError('Unable to cancel order.'))}>Cancel</button>}</div><p>{order.items.map((item) => `${item.quantity} × ${item.productName} (${item.businessName})`).join(', ')}</p></section>) : <section className="dashboard-panel"><h2>No orders yet</h2><p>Orders created from checkout will appear here.</p></section>}</main></div>;
}
