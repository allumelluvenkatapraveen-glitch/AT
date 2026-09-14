import { useEffect, useState } from 'react';
import Header from '../components/layout/Header';
import { getFavorites, type FavoritesResponse } from '../api/customer.api';

export default function Favorites() {
  const [favorites, setFavorites] = useState<FavoritesResponse | null>(null);
  const [error, setError] = useState('');
  useEffect(() => { void getFavorites().then(setFavorites).catch(() => setError('Unable to load favorites.')); }, []);

  return <div className="app dashboard-page"><Header /><main className="dashboard-shell"><div className="section-label">SAVED FOR LATER</div><h1>Favorites</h1>{error && <div className="error-message">{error}</div>}<section className="dashboard-panel"><h2>Products</h2>{favorites?.products.length ? favorites.products.map(({ product }) => <div className="dashboard-list-item" key={product.id}><strong>{product.name}</strong><span>{product.currencyCode} {product.price}</span></div>) : <p>No favorite products yet.</p>}</section><section className="dashboard-panel"><h2>Businesses</h2>{favorites?.businesses.length ? favorites.businesses.map(({ business }) => <div className="dashboard-list-item" key={business.id}><strong>{business.name}</strong><span>{business.description ?? ''}</span></div>) : <p>No favorite businesses yet.</p>}</section></main></div>;
}
