import { useEffect, useState } from 'react';
import Header from '../components/layout/Header';
import { getMyBusinesses, type OwnedBusiness } from '../api/business.api';
import { getMyProducts } from '../api/management.api';
import type { ProductSummary } from '../types/catalog';

export default function BusinessDashboard() {
  const [businesses, setBusinesses] = useState<OwnedBusiness[]>([]);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    void Promise.all([getMyBusinesses(), getMyProducts()])
      .then(([ownedBusinesses, ownedProducts]) => {
        setBusinesses(ownedBusinesses);
        setProducts(ownedProducts);
      })
      .catch(() => setError('Unable to load your business workspace.'));
  }, []);

  return (
    <div className="app dashboard-page">
      <Header />
      <main className="dashboard-shell">
        <div className="section-label">BUSINESS OWNER</div>
        <h1>Business dashboard</h1>
        <p className="dashboard-intro">Manage the businesses and products you own through the existing catalog APIs.</p>
        {error && <div className="error-message" role="alert">{error}</div>}
        <div className="dashboard-stats">
          <div className="stat-card"><strong>{businesses.length}</strong><span>Businesses</span></div>
          <div className="stat-card"><strong>{products.length}</strong><span>Products</span></div>
          <div className="stat-card"><strong>{products.filter((product) => !product.inventory.isInStock).length}</strong><span>Out of stock</span></div>
        </div>
        <section className="dashboard-panel">
          <h2>Your businesses</h2>
          {businesses.length === 0 ? <p>No businesses found. Business creation UI can be added against the existing `POST /businesses` API.</p> : businesses.map((business) => (
            <div className="dashboard-list-item" key={business.id}>
              <div><strong>{business.name}</strong><span>{business.locations.length} location(s)</span></div>
              <span className={`status-badge status-${business.status.toLowerCase()}`}>{business.status}</span>
            </div>
          ))}
        </section>
        <section className="dashboard-panel muted-panel">
          <h2>Orders, reservations, analytics, and subscriptions</h2>
          <p>These sections remain unavailable until their backend APIs and persistence models are implemented. No fake metrics or actions are shown.</p>
        </section>
      </main>
    </div>
  );
}
