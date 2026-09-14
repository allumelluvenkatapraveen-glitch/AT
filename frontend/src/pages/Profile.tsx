import Header from '../components/layout/Header';
import { useAuth } from '../providers/useAuth';

export default function Profile() {
  const { user } = useAuth();

  return (
    <div className="app dashboard-page">
      <Header />
      <main className="dashboard-shell">
        <div className="section-label">YOUR ACCOUNT</div>
        <h1>Profile</h1>
        <section className="dashboard-panel">
          <h2>Personal information</h2>
          <dl className="profile-details">
            <div><dt>Name</dt><dd>{user?.firstName} {user?.lastName ?? ''}</dd></div>
            <div><dt>Email</dt><dd>{user?.email}</dd></div>
            <div><dt>Phone</dt><dd>{user?.phone || 'Not provided'}</dd></div>
            <div><dt>Role</dt><dd>{user?.role}</dd></div>
          </dl>
        </section>
        <section className="dashboard-panel muted-panel">
          <h2>More account settings</h2>
          <p>Addresses, notification preferences, and password changes require backend account APIs that are not available yet.</p>
        </section>
      </main>
    </div>
  );
}
