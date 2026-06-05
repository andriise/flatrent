import { DISTRICTS } from "@/types";

export default function CreateListingPage() {
  return (
    <main className="page">
      <section className="container container--narrow">
        <h1 className="page-title" style={{ fontSize: 38 }}>Додати житло</h1>
        <form className="card card--flat auth-form" style={{ padding: 24 }} action="/api/listings" method="post">
          <div className="field">
            <label className="label" htmlFor="title">Заголовок</label>
            <input className="input" id="title" name="title" required />
          </div>
          <div className="field-row">
            <div className="field">
              <label className="label" htmlFor="district">Район</label>
              <select className="select" id="district" name="district" required>
                {DISTRICTS.map((district) => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="label" htmlFor="price">Ціна, грн</label>
              <input className="input" id="price" name="price" type="number" required />
            </div>
          </div>
          <div className="field">
            <label className="label" htmlFor="description">Опис</label>
            <textarea className="textarea" id="description" name="description" required />
          </div>
          <button className="btn btn--primary" type="submit">Опублікувати</button>
        </form>
      </section>
    </main>
  );
}
