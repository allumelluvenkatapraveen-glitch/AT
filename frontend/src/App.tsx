import { useEffect, useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import ProductDetails from './ProductDetails';
import './App.css';

const API_URL = 'http://localhost:3000/api';

const HYDERABAD_LOCATION = {
  latitude: 17.385,
  longitude: 78.4867,
};

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  currencyCode: string;
  category: Category | null;
  inventory: {
    quantity: number;
    isInStock: boolean;
  };
  business: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
  };
  location: {
    id: string;
    name: string | null;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string | null;
    postalCode: string | null;
    countryCode: string;
    latitude: number;
    longitude: number;
  };
  distanceKm?: number;
}

function MarketplaceHome() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [city, setCity] = useState('Hyderabad');
  const [radius, setRadius] = useState('10');

  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [locationStatus, setLocationStatus] = useState('');

  const loadCategories = async () => {
    try {
      const response = await axios.get<Category[]>(
        `${API_URL}/categories`,
      );

      setCategories(response.data);
    } catch {
      setError('Unable to load categories.');
    }
  };

  const searchProducts = async (
    categoryIdOverride?: string,
  ) => {
    try {
      setLoading(true);
      setError('');
      setLocationStatus('');

      const params: Record<string, string> = {
        limit: '20',
      };

      if (search.trim()) {
        params.q = search.trim();
      }

      const categoryId =
        categoryIdOverride !== undefined
          ? categoryIdOverride
          : selectedCategory;

      if (categoryId) {
        params.categoryId = categoryId;
      }

      if (city.trim()) {
        params.city = city.trim();
      }

      const response = await axios.get<Product[]>(
        `${API_URL}/products/search`,
        {
          params,
        },
      );

      setProducts(response.data);
    } catch {
      setError(
        'Unable to load products. Please try again.',
      );
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const searchNearbyWithCoordinates = async (
    latitude: number,
    longitude: number,
  ) => {
    try {
      setLoading(true);
      setError('');

      const params: Record<string, string> = {
        limit: '20',
        latitude: String(latitude),
        longitude: String(longitude),
        radiusKm: radius,
      };

      if (search.trim()) {
        params.q = search.trim();
      }

      if (selectedCategory) {
        params.categoryId = selectedCategory;
      }

      const response = await axios.get<Product[]>(
        `${API_URL}/products/search`,
        {
          params,
        },
      );

      setProducts(response.data);
    } catch {
      setError(
        'Unable to search nearby products.',
      );
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const searchNearby = () => {
    setError('');
    setLocationStatus('');

    if ('geolocation' in navigator) {
      setLocationStatus('Getting your location...');

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;

          setUserLocation({
            latitude,
            longitude,
          });

          setLocationStatus(
            'Using your current location.',
          );

          void searchNearbyWithCoordinates(
            latitude,
            longitude,
          );
        },
        () => {
          setUserLocation(HYDERABAD_LOCATION);

          setLocationStatus(
            'Location permission unavailable. Using Hyderabad.',
          );

          void searchNearbyWithCoordinates(
            HYDERABAD_LOCATION.latitude,
            HYDERABAD_LOCATION.longitude,
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        },
      );

      return;
    }

    setUserLocation(HYDERABAD_LOCATION);

    setLocationStatus(
      'Browser location unavailable. Using Hyderabad.',
    );

    void searchNearbyWithCoordinates(
      HYDERABAD_LOCATION.latitude,
      HYDERABAD_LOCATION.longitude,
    );
  };

  useEffect(() => {
    void loadCategories();
    void searchProducts();
  }, []);

  const formatPrice = (
    price: number,
    currencyCode: string,
  ) => {
    try {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: currencyCode,
        maximumFractionDigits: 2,
      }).format(price);
    } catch {
      return `${currencyCode} ${price}`;
    }
  };

  const getResultTitle = () => {
    if (search.trim()) {
      return `Results for "${search.trim()}"`;
    }

    if (selectedCategory) {
      const selected = categories.find(
        (category) =>
          category.id === selectedCategory,
      );

      if (selected) {
        return `${selected.name} near you`;
      }
    }

    if (userLocation) {
      return 'Local products near you';
    }

    return 'Local products';
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <Link
            to="/"
            className="brand"
            style={{
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <div className="brand-icon">L</div>

            <div>
              <div className="brand-name">
                Local Shoppyy
              </div>

              <div className="brand-tagline">
                Shop local. Find nearby.
              </div>
            </div>
          </Link>

          <nav className="nav">
            <Link
              to="/"
              style={{
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              Discover
            </Link>

            <button type="button">
              Businesses
            </button>

            <button type="button">
              About
            </button>
          </nav>

          <button
            className="sign-in"
            type="button"
          >
            Sign in
          </button>
        </div>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-content">
            <div className="eyebrow">
              YOUR LOCAL MARKETPLACE
            </div>

            <h1>
              Find what you need,
              <br />
              <span>right around you.</span>
            </h1>

            <p className="hero-description">
              Discover products from local businesses near
              you. Compare prices, check availability and shop
              locally.
            </p>

            <div className="search-panel">
              <div className="search-row">
                <div className="search-input-wrapper">
                  <span className="search-icon">
                    ⌕
                  </span>

                  <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        void searchProducts();
                      }
                    }}
                    placeholder="What are you looking for?"
                    autoComplete="off"
                  />
                </div>

                <div className="location-input">
                  <span>⌖</span>

                  <input
                    type="text"
                    value={city}
                    onChange={(event) =>
                      setCity(event.target.value)
                    }
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        void searchProducts();
                      }
                    }}
                    placeholder="City"
                    autoComplete="address-level2"
                  />
                </div>

                <button
                  className="search-button"
                  type="button"
                  onClick={() =>
                    void searchProducts()
                  }
                >
                  Search
                </button>
              </div>

              <div className="radius-row">
                <span>Search radius</span>

                <select
                  value={radius}
                  onChange={(event) =>
                    setRadius(event.target.value)
                  }
                >
                  <option value="2">2 km</option>
                  <option value="5">5 km</option>
                  <option value="10">10 km</option>
                  <option value="25">25 km</option>
                  <option value="50">50 km</option>
                </select>

                <button
                  className="nearby-button"
                  type="button"
                  onClick={searchNearby}
                >
                  Find nearby
                </button>

                {locationStatus && (
                  <span className="location-status">
                    {locationStatus}
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="categories-section">
          <div className="section-container">
            <div className="section-heading">
              <div>
                <div className="section-label">
                  EXPLORE
                </div>

                <h2>
                  Shop by category
                </h2>
              </div>

              <button
                className="view-all"
                type="button"
                onClick={() => {
                  setSelectedCategory('');
                  void searchProducts('');
                }}
              >
                View all →
              </button>
            </div>

            <div className="category-list">
              {categories.map((category) => (
                <button
                  type="button"
                  key={category.id}
                  className={`category-chip ${
                    selectedCategory === category.id
                      ? 'selected'
                      : ''
                  }`}
                  onClick={() => {
                    setSelectedCategory(category.id);
                  }}
                >
                  {category.name}
                </button>
              ))}
            </div>

            {selectedCategory && (
              <button
                className="apply-category"
                type="button"
                onClick={() =>
                  void searchProducts()
                }
              >
                Search this category
              </button>
            )}
          </div>
        </section>

        <section className="products-section">
          <div className="section-container">
            <div className="section-heading">
              <div>
                <div className="section-label">
                  LOCAL RESULTS
                </div>

                <h2>
                  {getResultTitle()}
                </h2>
              </div>

              <div className="result-count">
                {products.length} result
                {products.length !== 1
                  ? 's'
                  : ''}
              </div>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {loading ? (
              <div className="empty-state">
                <div className="loading-spinner" />

                <p>
                  Finding local products...
                </p>
              </div>
            ) : products.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">
                  ⌕
                </div>

                <h3>
                  No products found
                </h3>

                <p>
                  Try another product, category or
                  search area.
                </p>
              </div>
            ) : (
              <div className="product-grid">
                {products.map((product) => (
                  <Link
                    to={`/products/${product.id}`}
                    className="product-card"
                    key={product.id}
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                    }}
                  >
                    <div className="product-image">
                      <div className="product-placeholder">
                        {product.category?.name
                          ?.charAt(0)
                          .toUpperCase() || 'P'}
                      </div>

                      {product.inventory.isInStock && (
                        <span className="stock-badge">
                          In stock
                        </span>
                      )}
                    </div>

                    <div className="product-content">
                      {product.category && (
                        <div className="product-category">
                          {product.category.name}
                        </div>
                      )}

                      <h3>
                        {product.name}
                      </h3>

                      {product.description && (
                        <p className="product-description">
                          {product.description}
                        </p>
                      )}

                      <div className="product-price">
                        {formatPrice(
                          product.price,
                          product.currencyCode,
                        )}
                      </div>

                      <div className="shop-info">
                        <div className="shop-icon">
                          ⌂
                        </div>

                        <div>
                          <strong>
                            {product.business.name}
                          </strong>

                          <span>
                            {product.location.city}

                            {product.location.state
                              ? `, ${product.location.state}`
                              : ''}
                          </span>
                        </div>
                      </div>

                      <div className="product-footer">
                        <span>
                          {product.inventory.isInStock
                            ? `${product.inventory.quantity} available`
                            : 'Out of stock'}
                        </span>

                        {product.distanceKm !==
                          undefined && (
                          <span>
                            {product.distanceKm} km away
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <strong>
            Local Shoppyy
          </strong>

          <span>
            Connecting customers with local businesses
            worldwide.
          </span>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<MarketplaceHome />}
      />

      <Route
        path="/products/:id"
        element={<ProductDetails />}
      />
    </Routes>
  );
}

export default App;