import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../providers/useAuth';

export default function Header() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const isBusinessOwner = user?.role === 'BUSINESS_OWNER';
  const isAdmin = user?.role === 'ADMIN';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-inner">
        <Link to="/" className="brand" aria-label="Local Shoppyy home">
          <div className="brand-icon">L</div>
          <div>
            <div className="brand-name">Local Shoppyy</div>
            <div className="brand-tagline">Shop local. Find nearby.</div>
          </div>
        </Link>

        <nav className="nav" aria-label="Primary navigation">
          <Link to="/">Discover</Link>
          <Link to="/search">Search</Link>
          <Link to="/categories">Categories</Link>
          {isAuthenticated && <Link to="/profile">Profile</Link>}
          {isAuthenticated && <Link to="/favorites">Favorites</Link>}
          {isAuthenticated && <Link to="/cart">Cart</Link>}
          {isAuthenticated && <Link to="/orders">Orders</Link>}
          {isAuthenticated && <Link to="/reservations">Reservations</Link>}
          {isBusinessOwner && <Link to="/business/dashboard">Business</Link>}
          {isBusinessOwner && <Link to="/business/products">Products</Link>}
          {isBusinessOwner && <Link to="/business/orders">Orders</Link>}
          {isAdmin && <Link to="/control-panel">Dashboard</Link>}
        </nav>

        {isAuthenticated ? (
          <div className="auth-nav">
            <span className="user-summary" title={user?.email}>
              {user?.firstName || user?.email}
            </span>
            <button className="sign-in" type="button" onClick={handleLogout}>
              Sign Out
            </button>
          </div>
        ) : (
          <div className="auth-nav">
            <div className="auth-choice-links">
              <Link className="register-link" to="/customer/register">Customer Register</Link>
              <Link className="register-link" to="/business/register">Business Register</Link>
            </div>
            <div className="auth-choice-links">
              <Link className="sign-in" to="/customer/login">Customer Sign In</Link>
              <Link className="sign-in business-sign-in" to="/business/login">Business Sign In</Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
