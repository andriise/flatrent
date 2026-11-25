"use client";

import { useState } from "react";
import { DISTRICTS } from "@/types";

type SearchFiltersProps = {
  mobile?: boolean;
  onApply?: () => void;
};

function FilterSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="filter-section">
      <button type="button" className="filter-section__header" onClick={() => setOpen((value) => !value)}>
        <span>{title}</span>
        <span>{open ? "▲" : "▼"}</span>
      </button>
      <div className={open ? "filter-section__body is-open" : "filter-section__body"}>{children}</div>
    </section>
  );
}

export function SearchFilters({ mobile = false, onApply }: SearchFiltersProps) {
  const [showAllDistricts, setShowAllDistricts] = useState(false);
  const districts = showAllDistricts ? DISTRICTS : DISTRICTS.slice(0, 5);

  return (
    <aside className={mobile ? "filters filters--drawer" : "card card--flat filters"}>
      <form action="/listings" onSubmit={onApply}>
        <button className="filter-reset" type="button" onClick={() => window.location.assign("/listings")}>
          Скинути всі
        </button>
        <FilterSection title="Ціна">
          <div className="field-row">
            <input className="input" name="minPrice" type="number" min="0" placeholder="Від" />
            <input className="input" name="maxPrice" type="number" min="0" placeholder="До" />
          </div>
        </FilterSection>
        <FilterSection title="Кімнати">
          <div className="pill-grid">
            {["", "1", "2", "3", "4"].map((rooms) => (
              <label className="radio-pill" key={rooms || "any"}>
                <input name="rooms" type="radio" value={rooms} />
                <span>{rooms ? (rooms === "4" ? "4+" : rooms) : "Будь-яка"}</span>
              </label>
            ))}
          </div>
        </FilterSection>
        <FilterSection title="Площа">
          <div className="field">
            <label className="label" htmlFor="minArea">від X м²</label>
            <input className="input" id="minArea" name="minArea" type="number" min="0" placeholder="від 40 м²" />
          </div>
        </FilterSection>
        <FilterSection title="Район">
          <div className="checkbox-list">
            {districts.map((district) => (
              <label key={district}>
                <input name="district" type="radio" value={district} />
                <span>{district}</span>
              </label>
            ))}
          </div>
          <button className="filter-more" type="button" onClick={() => setShowAllDistricts((value) => !value)}>
            {showAllDistricts ? "Менше" : "+ Ще"}
          </button>
        </FilterSection>
        <FilterSection title="Особливості">
          <div className="checkbox-list">
            <label><input name="petsAllowed" type="checkbox" value="true" /> Дозволено тварин</label>
            <label><input name="furnished" type="checkbox" value="true" /> Є меблі</label>
            <label><input name="verifiedOnly" type="checkbox" value="true" /> Тільки перевірені власники</label>
            <label><input name="balcony" type="checkbox" value="true" /> Є балкон</label>
          </div>
        </FilterSection>
        <FilterSection title="Поверх">
          <div className="checkbox-list">
            <label><input name="notFirstFloor" type="checkbox" value="true" /> Не перший</label>
            <label><input name="notLastFloor" type="checkbox" value="true" /> Не останній</label>
          </div>
        </FilterSection>
        <button className="btn btn--primary btn--full" type="submit">
          Застосувати
        </button>
      </form>
    </aside>
  );
}
