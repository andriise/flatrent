"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { ListingCard } from "@/components/listings/ListingCard";
import type { Listing } from "@/types";

type ListingsResponse =
  | { success: true; data: { listings: Listing[] } }
  | { success: false; error: string };

const stats = [
  ["1 248+", "активних оголошень"],
  ["92%", "власників без ріелторів"],
  ["24 год", "модерація"],
];

const quickFilters = [
  ["1 кімн.", "/listings?rooms=1"],
  ["2 кімн.", "/listings?rooms=2"],
  ["3 кімн.", "/listings?rooms=3"],
  ["До 8 000 ₴", "/listings?maxPrice=8000"],
  ["З тваринами", "/listings?petsAllowed=true"],
  ["Меблі є", "/listings?furnished=true"],
];

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [recentListings, setRecentListings] = useState<Listing[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("visited")) {
      setShowOnboarding(true);
      localStorage.setItem("visited", "1");
    }
  }, []);

  useEffect(() => {
    async function loadRecentListings() {
      const response = await fetch("/api/listings?limit=6", { cache: "no-store" });
      const payload = (await response.json()) as ListingsResponse;
      if (payload.success) {
        setRecentListings(payload.data.listings);
      }
    }

    void loadRecentListings();
  }, []);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(`/listings?q=${encodeURIComponent(query)}`);
  }

  return (
    <main className="page">
      <section className="container hero hero--search">
        <div>
          {showOnboarding ? (
            <div className="onboarding-banner">
              <button type="button" onClick={() => setShowOnboarding(false)} aria-label="Закрити">×</button>
              <strong>👋 Вітаємо! Це платформа оренди без ріелторів.</strong>
              <span>1. Оберіть район  2. Перевірте власника  3. Домовляйтесь напряму</span>
            </div>
          ) : null}
          <div className="eyebrow">ВІННИЦЯ • БЕЗ РІЕЛТОРІВ • БЕЗ КОМІСІЇ</div>
          <h1>Знайди квартиру напряму від власника</h1>
          <p>
            Пошук оренди у Вінниці з перевіреними власниками, прозорими цінами,
            реальними фото та швидким контактом без комісії.
          </p>
          <form className="hero-search" onSubmit={onSubmit}>
            <input
              className="input"
              placeholder="Район, вулиця або ключове слово..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <button className="btn btn--primary" type="submit">Знайти</button>
          </form>
          <div className="quick-filters">
            {quickFilters.map(([label, href]) => (
              <Link className="filter-pill" href={href} key={href}>{label}</Link>
            ))}
          </div>
        </div>
        <div className="floating-preview card">
          <div className="listing-card__photo">
            <img src="https://picsum.photos/seed/flatrent-hero-preview/800/600" alt="Приклад квартири" />
            <span className="badge badge--green listing-card__badge">✓ Перевірений власник</span>
          </div>
          <div className="listing-card__body">
            <div className="listing-card__price">₴ 14 000 / міс</div>
            <div className="listing-card__title">2-кімнатна квартира, 58 м², Центр</div>
            <div className="listing-meta">
              <span>📍 Центр</span>
              <span>📐 58 м²</span>
              <span>🏢 4/9 пов.</span>
            </div>
          </div>
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
          {["Зареєструйся як власник", "Розміщуй оголошення безкоштовно", "Спілкуйся напряму з орендарями"].map((title, index) => (
            <div className="card info-card" key={title}>
              <div className="step-number step-number--large">{index + 1}</div>
              <h3>{title}</h3>
              <p className="text-muted">Проста модерація, зрозумілі дані та жодних прихованих комісій.</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container section">
        <div className="flex-between">
          <h2>Свіжі оголошення у Вінниці</h2>
          <Link className="btn btn--outline btn--sm" href="/listings">Всі оголошення →</Link>
        </div>
        <div className="listings-grid">
          {recentListings.length > 0
            ? recentListings.map((listing) => <ListingCard key={listing.id} listing={listing} />)
            : Array.from({ length: 3 }, (_, index) => <div className="card skeleton" key={index} />)}
        </div>
      </section>
    </main>
  );
}
