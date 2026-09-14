import Header from '../components/layout/Header';

export default function AdminDashboard() {
  return (
    <div className="app dashboard-page">
      <Header />
      <main className="dashboard-shell">
        <div className="section-label">ADMINISTRATION</div>
        <h1>Admin dashboard</h1>
        <section className="dashboard-panel">
          <h2>Platform administration</h2>
          <p>This route is role-protected. User, business, product, order, review, payment, delivery, subscription, reporting, and audit APIs must be implemented before these controls can be enabled.</p>
        </section>
      </main>
    </div>
  );
}
