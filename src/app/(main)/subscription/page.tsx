export default function SubscriptionPage() {
  return (
    <main className="page">
      <section className="container">
        <h1 className="page-title" style={{ fontSize: 38 }}>Преміум доступ</h1>
        <div className="stats-grid">
          {[
            ["Безкоштовний", "0 грн", "3 контакти на день"],
            ["Місячний", "199 грн", "100 контактів і збережені пошуки"],
            ["Преміум", "399 грн", "Пріоритетні оголошення для власників"],
          ].map(([name, price, text]) => (
            <div className="card info-card" key={name}>
              <h3>{name}</h3>
              <strong style={{ fontSize: 30 }}>{price}</strong>
              <p className="text-muted">{text}</p>
              <form action="/api/subscriptions" method="post">
                <input type="hidden" name="plan" value={name === "Преміум" ? "PREMIUM" : "MONTHLY"} />
                <button className="btn btn--primary btn--full" type="submit">Обрати</button>
              </form>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
