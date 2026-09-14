import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../providers/useAuth';
import Header from '../components/layout/Header';

export default function CustomerLogin() {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState('');
  const submit = async (event: React.FormEvent) => { event.preventDefault(); setError(''); try { await login({ email, password }); navigate('/customer'); } catch { setError('Unable to sign in. Check your email and password.'); } };
  return <div className="auth-page app"><Header /><main className="auth-shell"><Link to="/" className="back-link">← Back to marketplace</Link><section className="auth-card"><div className="section-label">CUSTOMER ACCESS</div><h1>Customer Sign In</h1><p>Find products, businesses, and local services near you.</p><form onSubmit={submit}><label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label><label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} /></label>{error && <div className="error-message">{error}</div>}<button className="search-button auth-submit" disabled={isLoading}>{isLoading ? 'Signing in...' : 'Sign in'}</button></form><p className="auth-switch"><Link to="/customer/register">Create a customer account</Link> · <Link to="/business/login">Business owner sign in</Link></p></section></main></div>;
}
