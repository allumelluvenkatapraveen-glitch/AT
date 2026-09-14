import { useEffect, useState } from 'react';
import Header from '../components/layout/Header';
import { deleteAddress, getAddresses, type CustomerAddress } from '../api/customer.api';

export default function Addresses() {
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [error, setError] = useState('');
  const refresh = () => getAddresses().then(setAddresses).catch(() => setError('Unable to load addresses.'));
  useEffect(() => { void refresh(); }, []);
  return <div className="app dashboard-page"><Header /><main className="dashboard-shell"><div className="section-label">CHECKOUT DESTINATIONS</div><h1>Addresses</h1>{error && <div className="error-message">{error}</div>}{addresses.length ? addresses.map((address) => <section className="dashboard-panel" key={address.id}><div className="dashboard-list-item"><div><strong>{address.label || 'Address'}</strong><span>{[address.addressLine1, address.addressLine2, address.city, address.state, address.postalCode, address.countryCode].filter(Boolean).join(', ')}</span></div><button className="nearby-button" type="button" onClick={() => void deleteAddress(address.id).then(refresh).catch(() => setError('Unable to delete address.'))}>Delete</button></div></section>) : <section className="dashboard-panel"><p>No saved addresses yet. Address creation form will be enabled with the checkout flow.</p></section>}</main></div>;
}
