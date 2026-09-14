import { useEffect, useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import ProductDetails from './ProductDetails';
import CustomerLogin from './pages/CustomerLogin';
import CustomerRegister from './pages/CustomerRegister';
import BusinessLogin from './pages/BusinessLogin';
import BusinessRegister from './pages/BusinessRegister';
import {
  getCategories,
  searchProducts as searchProductsApi,
} from './api/catalog.api';
import { searchExternalBusinesses } from './api/external-businesses.api';
import type { Category, ProductSummary } from './types/catalog';
import type { ExternalBusiness } from './types/external-business';
import Header from './components/layout/Header';
import Profile from './pages/Profile';
import BusinessDashboard from './pages/BusinessDashboard';
import CartPage from './pages/Cart';
import Favorites from './pages/Favorites';
import Addresses from './pages/Addresses';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Reservations from './pages/Reservations';
import BusinessProducts from './pages/BusinessProducts';
import BusinessOrders from './pages/BusinessOrders';
import AdminOverview from './pages/AdminOverview';
import { ProtectedRoute, RoleRoute } from './routes/RouteGuards';
import './App.css';

function MarketplaceHome() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [city, setCity] = useState('');
  const [radius, setRadius] = useState('10');

  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [locationStatus, setLocationStatus] = useState('');
  const [externalBusinesses, setExternalBusinesses] = useState<ExternalBusiness[]>([]);
  const [externalLoading, setExternalLoading] = useState(false);
  const [externalError, setExternalError] = useState('');

  const searchExternal = async (latitude: number, longitude: number) => {
    setExternalLoading(true);
    setExternalError('');

    try {
      setExternalBusinesses(await searchExternalBusinesses({
        q: search.trim() || undefined,
        latitude,
        longitude,
        radiusKm: Number(radius),
        limit: 10,
      }));
    } catch {
      setExternalBusinesses([]);
      setExternalError('Nearby business search is temporarily unavailable.');
    } finally {
      setExternalLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      setCategories(await getCategories());
    } catch {
      setError('Unable to load categories.');
    }
  };

  const requestLocationForExternalSearch = () => {
    if (!('geolocation' in navigator)) {
      setLocationStatus('Location is unavailable. Enter a city to search local listings.');
      return;
    }

    setLocationStatus('Allow location access to find nearby external businesses...');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserLocation({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
        setLocationStatus('Using your device location for nearby businesses.');
        void searchExternal(coords.latitude, coords.longitude);
      },
      () => {
        setLocationStatus('Location permission was unavailable. Enter a city to search local listings.');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 },
    );
  };

  const searchProducts = async (
    categoryIdOverride?: string,
    allowExternalLocation = true,
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

      const localProducts = await searchProductsApi(params);
      setProducts(localProducts);
      setExternalBusinesses([]);

      if (localProducts.length === 0) {
        if (userLocation) {
          void searchExternal(userLocation.latitude, userLocation.longitude);
        } else if (allowExternalLocation) {
          requestLocationForExternalSearch();
        }
      }
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

      const localProducts = await searchProductsApi(params);
      setProducts(localProducts);

      if (localProducts.length === 0) {
        void searchExternal(latitude, longitude);
      } else {
        setExternalBusinesses([]);
      }
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
          setLocationStatus(
            'Location permission was unavailable. Enter a city to search instead.',
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

    setLocationStatus(
      'This browser does not support location. Enter a city to search instead.',
    );
  };

  useEffect(() => {
    /* The initial catalog load synchronizes this screen with the API. */
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadCategories();
    void searchProducts(undefined, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <Header />

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

        {(externalLoading || externalError || externalBusinesses.length > 0) && (
          <section className="external-businesses-section">
            <div className="section-container">
              <div className="section-heading">
                <div>
                  <div className="section-label">EXTERNAL DISCOVERY</div>
                  <h2>Nearby Businesses</h2>
                </div>
              </div>

              <p className="external-disclaimer">
                These businesses are provided by an external places provider and are not registered on Local Shoppyy.
              </p>

              {externalLoading && (
                <div className="empty-state">
                  <div className="loading-spinner" />
                  <p>Looking for nearby businesses...</p>
                </div>
              )}

              {externalError && <div className="error-message">{externalError}</div>}

              {!externalLoading && externalBusinesses.length > 0 && (
                <div className="external-business-grid">
                  {externalBusinesses.map((business) => (
                    <article className="external-business-card" key={`${business.provider}-${business.externalId}`}>
                      <div className="external-business-card-header">
                        <span className="external-business-badge">External business</span>
                        <span>{business.distanceKm} km away</span>
                      </div>
                      <h3>{business.name}</h3>
                      {business.category && <p className="external-category">{business.category}</p>}
                      {business.address && <p>{business.address}</p>}
                      <p className="external-disclaimer">Not registered on Local Shoppyy</p>
                      <div className="external-business-actions">
                        {business.mapsUrl && (
                          <a href={business.mapsUrl} target="_blank" rel="noreferrer">View on Map</a>
                        )}
                        {business.directionsUrl && (
                          <a href={business.directionsUrl} target="_blank" rel="noreferrer">Get Directions</a>
                        )}
                      </div>
                      <small>
                        Data provided by <a href={business.attribution.url} target="_blank" rel="noreferrer">{business.attribution.name}</a>.
                      </small>
                    </article>
                  ))}
                </div>
              )}

              {!externalLoading && !externalError && externalBusinesses.length === 0 && (
                <div className="empty-state">
                  <p>No nearby external businesses were found in this radius.</p>
                </div>
              )}
            </div>
          </section>
        )}
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
      <Route path="/search" element={<MarketplaceHome />} />
      <Route path="/categories" element={<MarketplaceHome />} />
      <Route path="/login" element={<CustomerLogin />} />
      <Route path="/register" element={<CustomerRegister />} />
      <Route path="/customer/login" element={<CustomerLogin />} />
      <Route path="/customer/register" element={<CustomerRegister />} />
      <Route path="/business/login" element={<BusinessLogin />} />
      <Route path="/business/register" element={<BusinessRegister />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<Profile />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/favorites" element={<Favorites />} />
        <Route path="/profile/addresses" element={<Addresses />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/reservations" element={<Reservations />} />
        <Route element={<RoleRoute allowedRoles={['BUSINESS_OWNER', 'ADMIN']} />}>
          <Route path="/business/dashboard" element={<BusinessDashboard />} />
          <Route path="/business/products" element={<BusinessProducts />} />
          <Route path="/business/orders" element={<BusinessOrders />} />
        </Route>
        <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
          <Route path="/control-panel" element={<AdminOverview />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;