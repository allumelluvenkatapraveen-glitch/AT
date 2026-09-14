import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../providers/useAuth';
import Header from '../components/layout/Header';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const [submitError, setSubmitError] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginForm) => {
    setSubmitError('');
    try {
      await login(values);
      navigate('/');
    } catch {
      setSubmitError('Unable to sign in. Check your details and try again.');
    }
  };

  return (
    <div className="auth-page app">
      <Header />
      <main className="auth-shell">
        <Link to="/" className="back-link">← Back to marketplace</Link>
        <section className="auth-card" aria-labelledby="login-title">
          <div className="section-label">WELCOME BACK</div>
          <h1 id="login-title">Sign in to Local Shoppyy</h1>
          <p>Keep your local finds, businesses, and future orders in one place.</p>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" autoComplete="email" {...register('email')} />
            {errors.email && <span className="field-error">{errors.email.message}</span>}
            <label htmlFor="password">Password</label>
            <input id="password" type="password" autoComplete="current-password" {...register('password')} />
            {errors.password && <span className="field-error">{errors.password.message}</span>}
            {submitError && <div className="error-message" role="alert">{submitError}</div>}
            <button className="search-button auth-submit" type="submit" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <p className="auth-switch">New to Local Shoppyy? <Link to="/register">Create an account</Link></p>
        </section>
      </main>
    </div>
  );
}
