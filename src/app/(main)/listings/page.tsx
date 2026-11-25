"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { ListingCard } from "@/components/listings/ListingCard";
import { SearchFilters } from "@/components/listings/SearchFilters";
import type { Listing } from "@/types";

type ListingsResponse =
  | {
      success: true;
      data: {
        listings: Listing[];
        pagination: { page: number; totalPages: number; total: number };
      };
    }
  | { success: false; error: string };

function ListingCardSkeleton() {
  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <div
        style={{
          paddingTop: "62%",
          background:
            "linear-gradient(90deg, #F3F4F6 25%, #E5E7EB 50%, #F3F4F6 75%)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.5s infinite",
        }}
      />
      <div style={{ padding: "14px 16px" }}>
        <div
          style={{
            height: 20,
            background: "#F3F4F6",
            borderRadius: 4,
            marginBottom: 8,
            width: "60%",
          }}
        />
        <div
          style={{
            height: 16,
            background: "#F3F4F6",
            borderRadius: 4,
            marginBottom: 6,
          }}
        />
        <div
          style={{
            height: 16,
            background: "#F3F4F6",
            borderRadius: 4,
            width: "80%",
          }}
        />
      </div>
    </div>
  );
}

function ListingsPageContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });
  const queryString = params.toString();

  const apiUrl = useMemo(() => {
    const apiParams = new URLSearchParams();
    const q = params.get("q") || "";
    if (q) apiParams.set("q", q);
    for (const key of [
      "district",
      "minPrice",
      "maxPrice",
      "rooms",
      "minArea",
      "petsAllowed",
      "furnished",
      "verifiedOnly",
      "balcony",
      "notFirstFloor",
      "notLastFloor",
      "sort",
      "page",
    ]) {
      const value = params.get(key);
      if (value) apiParams.set(key, value);
    }
    return `/api/listings?${apiParams.toString()}`;
  }, [params]);

  useEffect(() => {
    async function loadListings() {
      setLoading(true);
      const response = await fetch(apiUrl, { cache: "no-store" });
      const payload = (await response.json()) as ListingsResponse;
      if (payload.success) {
        setListings(payload.data.listings);
        setPagination(payload.data.pagination);
      } else {
        setListings([]);
      }
      setLoading(false);
    }

    void loadListings();
  }, [apiUrl, queryString]);

  return (
    <main className="page">
      <div className="container">
        <button
          className="btn btn--outline mobile-filter-button"
          type="button"
          onClick={() => setDrawerOpen(true)}
        >
          Фільтри ⚙️
        </button>
        <div
          className={
            drawerOpen
              ? "filters-drawer-overlay open"
              : "filters-drawer-overlay"
          }
          onClick={() => setDrawerOpen(false)}
        />
        <div className={drawerOpen ? "filters-drawer open" : "filters-drawer"}>
          <div className="flex-between" style={{ marginBottom: 12 }}>
            <strong>Фільтри</strong>
            <button
              className="btn btn--outline btn--sm"
              type="button"
              onClick={() => setDrawerOpen(false)}
            >
              Закрити
            </button>
          </div>
          <SearchFilters mobile onApply={() => setDrawerOpen(false)} />
        </div>

        <div className="listings-layout">
          <SearchFilters />
          <section>
            <div className="flex-between" style={{ marginBottom: 18 }}>
              <div>
                <h1 className="page-title" style={{ fontSize: 34 }}>
                  Оголошення
                </h1>
                <p className="text-muted">
                  Знайдено {loading ? "..." : pagination.total} оголошень
                </p>
              </div>
              <select
                className="select"
                value={params.get("sort") || "new"}
                aria-label="Сортування"
                onChange={(event) => {
                  const next = new URLSearchParams(params.toString());
                  next.set("sort", event.target.value);
                  router.push(`/listings?${next.toString()}`);
                }}
              >
                <option value="new">Найновіші</option>
                <option value="price-asc">Дешевші спочатку</option>
                <option value="price-desc">Дорожчі спочатку</option>
              </select>
            </div>
            {loading ? (
              <div className="listings-grid">
                {Array.from({ length: 6 }, (_, index) => (
                  <ListingCardSkeleton key={index} />
                ))}
              </div>
            ) : listings.length > 0 ? (
              <div className="listings-grid">
                {listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            ) : (
              <div className="empty-state card">
                <div style={{ fontSize: 64 }}>🔍</div>
                <h3>Нічого не знайдено</h3>
                <p>Спробуйте змінити або скинути фільтри</p>
                <button
                  className="btn btn--primary"
                  style={{ marginTop: 16 }}
                  onClick={() => window.location.assign("/listings")}
                >
                  Скинути фільтри
                </button>
              </div>
            )}
            <div className="pagination">
              {Array.from(
                { length: pagination.totalPages },
                (_, index) => index + 1,
              ).map((page) => {
                const next = new URLSearchParams(params.toString());
                next.set("page", String(page));
                const active = pagination.page === page;
                return (
                  <a
                    className={`btn btn--sm pagination__page${active ? " is-current" : " btn--outline"}`}
                    href={`/listings?${next.toString()}`}
                    key={page}
                    aria-current={active ? "page" : undefined}
                  >
                    {page}
                  </a>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

export default function ListingsPage() {
  return (
    <Suspense
      fallback={
        <main className="page">
          <div className="container listings-grid">
            {Array.from({ length: 6 }, (_, index) => (
              <ListingCardSkeleton key={index} />
            ))}
          </div>
        </main>
      }
    >
      <ListingsPageContent />
    </Suspense>
  );
}
