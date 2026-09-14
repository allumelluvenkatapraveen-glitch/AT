import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../providers/useAuth';
import Header from '../components/layout/Header';

export default function BusinessLogin() {
  const { login, isLoading } = useAuth(); const navigate = useNavigate(); const [error, setError] = useState('');
  const submit = async (event: React.FormEvent<HTMLFormElement>) => { event.preventDefault(); const form = new FormData(event.currentTarget); try { await login({ email: String(form.get('email')), password: String(form.get('password')) }); navigate('/business/dashboard'); } catch { setError('Unable to sign in. Your account may be inactive or pending.'); } };
  return <div className="auth-page app"><Header /><main className="auth-shell"><section className="auth-card"><div className="section-label">BUSINESS ACCESS</div><h1>Business Owner Sign In</h1><form onSubmit={submit}><label>Email<input name="email" type="email" required /></label><label>Password<input name="password" type="password" minLength={8} required /></label>{error && <div className="error-message">{error}</div>}<button className="search-button auth-submit" disabled={isLoading}>{isLoading ? 'Signing in...' : 'Sign in'}</button></form><p className="auth-switch"><Link to="/business/register">Register your business</Link> · <Link to="/customer/register">Create a customer account</Link></p></section></main></div>;
}
