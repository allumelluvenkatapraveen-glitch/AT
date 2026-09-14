import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getProduct } from './api/catalog.api';
import type { ProductDetailsData } from './types/catalog';
import Header from './components/layout/Header';

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

        setProduct(await getProduct(id));
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
        <Header />
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
        <Header />
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
      <Header />

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
                    Ordering is not available yet
                  </button>

                  <button
                    type="button"
                    className="nearby-button"
                  >
                    Contact details unavailable
                  </button>
                </div>

                <div className="details-note">
                  Pickup, delivery, reservations and checkout are not
                  exposed by the current API yet.
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