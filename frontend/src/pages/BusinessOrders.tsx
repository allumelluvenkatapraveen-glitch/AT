import { useEffect, useState } from 'react';
import Header from '../components/layout/Header';
import { getBusinessOrders, updateBusinessOrderStatus, type ManagedOrder } from '../api/management.api';

const nextStatuses: Record<string, string[]> = { PENDING: ['CONFIRMED', 'REJECTED', 'CANCELLED'], CONFIRMED: ['PREPARING', 'CANCELLED'], PREPARING: ['READY_FOR_PICKUP', 'OUT_FOR_DELIVERY'], READY_FOR_PICKUP: ['DELIVERED'], OUT_FOR_DELIVERY: ['DELIVERED'] };

export default function BusinessOrders() {
  const [orders, setOrders] = useState<ManagedOrder[]>([]); const [error, setError] = useState('');
  const refresh = () => getBusinessOrders().then(setOrders).catch(() => setError('Unable to load business orders.'));
  useEffect(() => { void refresh(); }, []);
  return <div className="app dashboard-page"><Header /><main className="dashboard-shell"><div className="section-label">BUSINESS OWNER</div><h1>Orders</h1>{error && <div className="error-message">{error}</div>}{orders.length ? orders.map((order) => <section className="dashboard-panel" key={order.id}><div className="dashboard-list-item"><div><strong>Order {order.id.slice(0, 8)}</strong><span>{order.customer.firstName} · {order.status} · {order.currencyCode} {order.total}</span></div><select value="" onChange={(event) => void updateBusinessOrderStatus(order.id, event.target.value).then(refresh).catch(() => setError('Unable to update order status.'))}><option value="">Update status</option>{(nextStatuses[order.status] ?? []).map((status) => <option key={status} value={status}>{status}</option>)}</select></div><p>{order.items.map((item) => `${item.quantity} × ${item.productName}`).join(', ')}</p></section>) : <section className="dashboard-panel"><h2>No business orders</h2><p>Orders for your businesses will appear here.</p></section>}</main></div>;
}
