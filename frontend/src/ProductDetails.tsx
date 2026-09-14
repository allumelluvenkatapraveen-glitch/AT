import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ProductDetailsData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sku: string | null;
  price: number;
  currencyCode: string;
  status: string;

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
}

function ProductDetails() {
  const { id } = useParams<{ id: string }>();

  const [product, setProduct] =
    useState<ProductDetailsData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProduct = async () => {
      if (!id) {
        setError('Product not found.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError('');

        const response =
          await axios.get<ProductDetailsData>(
            `${API_URL}/products/${id}`,
          );

        setProduct(response.data);
      } catch {
        setError('Unable to load this product.');
      } finally {
        setLoading(false);
      }
    };

    void loadProduct();
  }, [id]);

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

  if (loading) {
    return (
      <div className="app">
        <main>
          <section className="products-section">
            <div className="section-container">
              <div className="empty-state">
                <div className="loading-spinner" />
                <p>Loading product...</p>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="app">
        <main>
          <section className="products-section">
            <div className="section-container">
              <div className="empty-state">
                <div className="empty-icon">⌕</div>

                <h3>
                  {error || 'Product not found.'}
                </h3>

                <p>
                  This product may no longer be
                  available.
                </p>

                <Link
                  to="/"
                  className="nearby-button"
                >
                  ← Back to products
                </Link>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  const address = [
    product.location.addressLine1,
    product.location.addressLine2,
    product.location.city,
    product.location.state,
    product.location.postalCode,
  ]
    .filter(Boolean)
    .join(', ');

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
            <div className="brand-icon">
              L
            </div>

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
            <Link to="/">Discover</Link>
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
        <section className="product-details-section">
          <div className="section-container">
            <Link
              to="/"
              className="back-link"
            >
              ← Back to products
            </Link>

            <div className="product-details-card">
              <div className="product-details-image">
                <div className="product-details-placeholder">
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

              <div className="product-details-content">
                {product.category && (
                  <div className="product-category">
                    {product.category.name}
                  </div>
                )}

                <h1>{product.name}</h1>

                <div className="product-details-price">
                  {formatPrice(
                    product.price,
                    product.currencyCode,
                  )}
                </div>

                <div className="availability">
                  {product.inventory.isInStock ? (
                    <>
                      <strong>
                        ✓ In stock
                      </strong>

                      <span>
                        {product.inventory.quantity}{' '}
                        available
                      </span>
                    </>
                  ) : (
                    <strong>
                      Currently out of stock
                    </strong>
                  )}
                </div>

                {product.description && (
                  <div className="details-block">
                    <h2>
                      Product description
                    </h2>

                    <p>
                      {product.description}
                    </p>
                  </div>
                )}

                <div className="details-block">
                  <h2>
                    Available at
                  </h2>

                  <div className="business-details">
                    <div className="shop-icon">
                      ⌂
                    </div>

                    <div>
                      <strong>
                        {product.business.name}
                      </strong>

                      {product.business
                        .description && (
                        <p>
                          {
                            product.business
                              .description
                          }
                        </p>
                      )}

                      <span>
                        {address}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="details-actions">
                  <button
                    type="button"
                    className="search-button"
                    disabled={
                      !product.inventory.isInStock
                    }
                  >
                    Reserve / Order
                  </button>

                  <button
                    type="button"
                    className="nearby-button"
                  >
                    Contact Shop
                  </button>
                </div>

                <div className="details-note">
                  Pickup and delivery options will
                  be available during ordering.
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-inner">
          <strong>
            Local Shoppyy
          </strong>

          <span>
            Connecting customers with local
            businesses worldwide.
          </span>
        </div>
      </footer>
    </div>
  );
}

export default ProductDetails;