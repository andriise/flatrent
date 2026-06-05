import { DISTRICTS } from "@/types";

export function SearchFilters() {
  return (
    <aside className="card card--flat filters">
      <form action="/listings">
        <div className="field">
          <label className="label" htmlFor="query">Пошук</label>
          <input className="input" id="query" name="query" placeholder="Район, адреса, опис" />
        </div>
        <div className="field">
          <label className="label" htmlFor="district">Район</label>
          <select className="select" id="district" name="district" defaultValue="">
            <option value="">Усі райони</option>
            {DISTRICTS.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </div>
        <div className="field-row">
          <div className="field">
            <label className="label" htmlFor="minPrice">Від, грн</label>
            <input className="input" id="minPrice" name="minPrice" type="number" min="0" />
          </div>
          <div className="field">
            <label className="label" htmlFor="maxPrice">До, грн</label>
            <input className="input" id="maxPrice" name="maxPrice" type="number" min="0" />
          </div>
        </div>
        <div className="field">
          <label className="label" htmlFor="rooms">Кімнат</label>
          <select className="select" id="rooms" name="rooms" defaultValue="">
            <option value="">Будь-яка кількість</option>
            <option value="1">1 кімната</option>
            <option value="2">2 кімнати</option>
            <option value="3">3 кімнати</option>
          </select>
        </div>
        <button className="btn btn--primary btn--full" type="submit">
          Знайти квартиру
        </button>
      </form>
    </aside>
  );
}
