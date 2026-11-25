"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/useToast";
import type { Listing } from "@/types";

function formatPrice(price: number) {
  return new Intl.NumberFormat("uk-UA").format(price);
}

export function ListingCard({ listing }: { listing: Listing }) {
  const toast = useToast();
  const [saved, setSaved] = useState(false);
  const photo = listing.photos[0];
  const ownerInitial = listing.owner.name.slice(0, 1).toUpperCase();

  useEffect(() => {
    async function loadSavedState() {
      try {
        const response = await fetch("/api/users/saved", { cache: "no-store" });
        if (!response.ok) return;
        const payload = (await response.json()) as {
          success: boolean;
          data?: { saved: Array<{ listingId: string }> };
        };
        if (payload.success) {
          setSaved(
            payload.data?.saved?.some(
              (item) => item.listingId === listing.id,
            ) ?? false,
          );
        }
      } catch {
        // Залишаємо невтягнений стан без показу помилки.
      }
    }
    void loadSavedState();
  }, [listing.id]);

  async function toggleSave() {
    try {
      const response = await fetch("/api/users/saved", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: listing.id }),
      });
      const payload = (await response.json()) as {
        success: boolean;
        data?: { saved: boolean };
        error?: string;
      };
      if (!payload.success) {
        toast.show(payload.error ?? "Не вдалося зберегти", "error");
        return;
      }
      setSaved(Boolean(payload.data?.saved));
      toast.show(
        payload.data?.saved
          ? "Оголошення збережено"
          : "Оголошення прибрано зі збережених",
        "success",
      );
    } catch {
      toast.show("Помилка мережі", "error");
    }
  }

  return (
    <article className="card listing-card listing-card-mobile">
      <div className="listing-card__photo card-photo">
        <img
          src={
            photo?.url ?? "https://picsum.photos/seed/flatrent-empty/800/600"
          }
          alt={photo?.alt ?? listing.title}
        />
        {listing.owner.isVerified ? (
          <span className="badge badge--green listing-card__badge">
            ✓ Перевірений власник
          </span>
        ) : null}
        <button
          className="listing-card__save"
          type="button"
          aria-label="Зберегти оголошення"
          onClick={toggleSave}
        >
          {saved ? "♥" : "♡"}
        </button>
      </div>
      <div className="listing-card__body card-body">
        <div className="listing-card__price">
          ₴ {formatPrice(listing.price)} / міс
        </div>
        <Link className="listing-card__title" href={`/listings/${listing.id}`}>
          {listing.title}
        </Link>
        <div className="listing-meta">
          <span>📍 {listing.district}</span>
          <span>📐 {listing.area} м²</span>
          <span>
            🏢 {listing.floor}/{listing.totalFloors} пов.
          </span>
        </div>
        <div className="listing-tags">
          <span className="badge badge--blue">{listing.rooms} кімн.</span>
          {listing.isFurnished ? (
            <span className="badge badge--gray">З меблями</span>
          ) : null}
          {listing.petsAllowed ? (
            <span className="badge badge--amber">Можна з тваринами</span>
          ) : null}
        </div>
        <div className="owner-row">
          <div className="owner-row__person">
            <span className="avatar">{ownerInitial}</span>
            <div>
              <strong>{listing.owner.name}</strong>
              <div className="text-muted">
                {listing.owner.trustScore}% довіри
              </div>
            </div>
          </div>
          <Link
            className="btn btn--secondary btn--sm"
            href={`/listings/${listing.id}`}
          >
            Детальніше
          </Link>
        </div>
      </div>
    </article>
  );
}
