import { useEffect, useState } from 'react';
import Header from '../components/layout/Header';
import { cancelReservation, getReservations, type Reservation } from '../api/customer.api';

export default function Reservations() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [error, setError] = useState('');
  const refresh = () => getReservations().then(setReservations).catch(() => setError('Unable to load reservations.'));
  useEffect(() => { void refresh(); }, []);
  return <div className="app dashboard-page"><Header /><main className="dashboard-shell"><div className="section-label">RESERVE FOR PICKUP</div><h1>Reservations</h1>{error && <div className="error-message">{error}</div>}{reservations.length ? reservations.map((reservation) => <section className="dashboard-panel" key={reservation.id}><div className="dashboard-list-item"><div><strong>{reservation.product.name}</strong><span>{reservation.product.businessLocation?.business.name ?? 'Business'} · {reservation.quantity} · {reservation.status}</span></div>{(reservation.status === 'PENDING' || reservation.status === 'CONFIRMED') && <button className="nearby-button" type="button" onClick={() => void cancelReservation(reservation.id).then(refresh).catch(() => setError('Unable to cancel reservation.'))}>Cancel</button>}</div></section>) : <section className="dashboard-panel"><h2>No reservations yet</h2><p>Reservations for supported products will appear here.</p></section>}</main></div>;
}
