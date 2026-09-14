import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../providers/useAuth';
import Header from '../components/layout/Header';

const registerSchema = z.object({
  firstName: z.string().min(1, 'Enter your first name.'),
  lastName: z.string().optional(),
  email: z.string().email('Enter a valid email address.'),
  phone: z.string().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  confirmPassword: z.string(),
}).refine((values) => values.password === values.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords must match.',
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const navigate = useNavigate();
  const { register: registerUser, isLoading } = useAuth();
  const [submitError, setSubmitError] = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async ({ confirmPassword: _confirmPassword, ...values }: RegisterForm) => {
    void _confirmPassword;
    setSubmitError('');
    try {
      await registerUser(values);
      navigate('/login');
    } catch {
      setSubmitError('Unable to create your account. Please try again.');
    }
  };

  return (
    <div className="auth-page app">
      <Header />
      <main className="auth-shell">
        <Link to="/" className="back-link">← Back to marketplace</Link>
        <section className="auth-card" aria-labelledby="register-title">
          <div className="section-label">JOIN THE MARKETPLACE</div>
          <h1 id="register-title">Create your account</h1>
          <p>Discover nearby products and keep your local shopping organized.</p>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="auth-form-grid">
              <label>First name<input autoComplete="given-name" {...register('firstName')} />{errors.firstName && <span className="field-error">{errors.firstName.message}</span>}</label>
              <label>Last name<input autoComplete="family-name" {...register('lastName')} /></label>
            </div>
            <label>Email<input type="email" autoComplete="email" {...register('email')} />{errors.email && <span className="field-error">{errors.email.message}</span>}</label>
            <label>Phone <span className="optional-label">optional</span><input type="tel" autoComplete="tel" {...register('phone')} /></label>
            <label>Password<input type="password" autoComplete="new-password" {...register('password')} />{errors.password && <span className="field-error">{errors.password.message}</span>}</label>
            <label>Confirm password<input type="password" autoComplete="new-password" {...register('confirmPassword')} />{errors.confirmPassword && <span className="field-error">{errors.confirmPassword.message}</span>}</label>
            {submitError && <div className="error-message" role="alert">{submitError}</div>}
            <button className="search-button auth-submit" type="submit" disabled={isLoading}>{isLoading ? 'Creating account...' : 'Create account'}</button>
          </form>
          <p className="auth-switch">Already have an account? <Link to="/login">Sign in</Link></p>
        </section>
      </main>
    </div>
  );
}
