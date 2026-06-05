import Link from "next/link";

const stats = [
  ["1 248", "активних оголошень"],
  ["92%", "перевірених контактів"],
  ["24 год", "середній час модерації"],
];

const steps = [
  ["Обери район", "Фільтруй квартири у Вінниці за бюджетом, кімнатами та умовами."],
  ["Перевір власника", "Дивись статус верифікації, рейтинг довіри та історію оголошень."],
  ["Домовляйся напряму", "Отримуй контакт власника без комісії та зайвих дзвінків."],
];

const values = [
  ["Без агентів", "Ми прибираємо посередників і комісії з пошуку житла."],
  ["Перевірені власники", "Документи та контакти проходять ручну модерацію."],
  ["Антифрод", "Система підсвічує дублікати, підозрілі ціни та скарги."],
  ["Преміум доступ", "Більше контактів, збережені пошуки та ранній доступ."],
];

export default function HomePage() {
  return (
    <main className="page">
      <section className="container hero">
        <div>
          <div className="eyebrow">ВІННИЦЯ • БЕЗ РІЕЛТОРІВ</div>
          <h1>Оренда напряму від власників</h1>
          <p>
            FlatRent допомагає знайти квартиру у Вінниці без комісій: перевірені власники,
            прозорі оголошення, фото, райони та швидкий контакт.
          </p>
          <div className="hero-actions">
            <Link className="btn btn--primary btn--lg" href="/listings">
              Переглянути оголошення
            </Link>
            <Link className="btn btn--outline btn--lg" href="/create-listing">
              Додати житло
            </Link>
          </div>
        </div>
        <div className="card card--flat search-panel">
          <form action="/listings" className="auth-form">
            <div className="field">
              <label className="label" htmlFor="home-query">Що шукаєте?</label>
              <input className="input" id="home-query" name="query" placeholder="Наприклад: Вишенька, 2 кімнати" />
            </div>
            <div className="field-row">
              <div className="field">
                <label className="label" htmlFor="home-min">Бюджет від</label>
                <input className="input" id="home-min" name="minPrice" type="number" placeholder="8000" />
              </div>
              <div className="field">
                <label className="label" htmlFor="home-max">До</label>
                <input className="input" id="home-max" name="maxPrice" type="number" placeholder="20000" />
              </div>
            </div>
            <button className="btn btn--primary btn--full" type="submit">
              Підібрати житло
            </button>
          </form>
        </div>
      </section>

      <section className="container stats-grid">
        {stats.map(([value, label]) => (
          <div className="card stat-card" key={label}>
            <strong>{value}</strong>
            <span className="text-muted">{label}</span>
          </div>
        ))}
      </section>

      <section className="container section">
        <h2>Як це працює</h2>
        <div className="steps-grid">
          {steps.map(([title, text], index) => (
            <div className="card info-card" key={title}>
              <div className="step-number">{index + 1}</div>
              <h3>{title}</h3>
              <p className="text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container section">
        <h2>Чому FlatRent</h2>
        <div className="value-grid">
          {values.map(([title, text]) => (
            <div className="card info-card" key={title}>
              <h3>{title}</h3>
              <p className="text-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
