export default function DashboardPage() {
  return (
    <main className="page">
      <section className="container">
        <h1 className="page-title" style={{ fontSize: 38 }}>Мій кабінет</h1>
        <div className="stats-grid">
          {["Збережені квартири", "Мої контакти", "Підписка"].map((title) => (
            <div className="card info-card" key={title}>
              <h3>{title}</h3>
              <p className="text-muted">Дані оновляться після першої дії в кабінеті.</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
