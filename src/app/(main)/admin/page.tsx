import { prisma } from "@/lib/prisma";

export default async function AdminPage() {
  const [users, listings, reports] = await Promise.all([
    prisma.user.count(),
    prisma.listing.count(),
    prisma.report.count(),
  ]);

  return (
    <main className="page">
      <section className="container">
        <h1 className="page-title" style={{ fontSize: 38 }}>Адмін-панель</h1>
        <div className="stats-grid">
          <div className="card stat-card"><strong>{users}</strong><span className="text-muted">користувачів</span></div>
          <div className="card stat-card"><strong>{listings}</strong><span className="text-muted">оголошень</span></div>
          <div className="card stat-card"><strong>{reports}</strong><span className="text-muted">скарг</span></div>
        </div>
      </section>
    </main>
  );
}
