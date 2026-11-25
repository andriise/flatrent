"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/useToast";
import type { Listing } from "@/types";

type ListingResponse =
  | { success: true; data: { listing: Listing } }
  | { success: false; error: string };

type ContactResponse =
  | { success: true; data: { phone: string } }
  | { success: false; error: string };

export default function ListingDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const toast = useToast();
  const [listing, setListing] = useState<Listing | null>(null);
  const [activePhoto, setActivePhoto] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [phone, setPhone] = useState("");
  const [contacting, setContacting] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  useEffect(() => {
    async function loadListing() {
      const response = await fetch(`/api/listings/${params.id}`, { cache: "no-store" });
      const payload = (await response.json()) as ListingResponse;
      if (payload.success) {
        setListing(payload.data.listing);
      }
    }

    void loadListing();
  }, [params.id]);

  async function handleContact() {
    if (!user) {
      router.push("/login");
      return;
    }
    setContacting(true);
    try {
      const res = await fetch(`/api/listings/${params.id}/contact`, { method: "POST" });
      const json = (await res.json()) as ContactResponse;
      if (json.success) {
        setPhone(json.data.phone);
        setContactError(null);
        toast.show("Контакт відкрито", "success");
      } else {
        setContactError(json.error);
        toast.show(json.error, "error");
      }
    } catch {
      setContactError("Помилка мережі");
      toast.show("Помилка мережі", "error");
    }
    setContacting(false);
  }

  if (!listing) {
    return (
      <main className="page">
        <div className="container"><div className="card skeleton" /></div>
      </main>
    );
  }

  const photos = listing.photos.length > 0 ? listing.photos : [{ id: "fallback", url: "https://picsum.photos/seed/detail/1200/800", alt: listing.title, order: 0 }];

  return (
    <main className="page">
      <div className="container listing-detail-layout">
        <section>
          <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", background: "#000" }}>
            <div style={{ position: "relative", paddingTop: "60%" }}>
              <img src={photos[activePhoto].url} alt={photos[activePhoto].alt} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
            {photos.length > 1 ? (
              <>
                <button className="carousel-button carousel-button--prev" onClick={() => setActivePhoto((i) => (i - 1 + photos.length) % photos.length)} type="button">‹</button>
                <button className="carousel-button carousel-button--next" onClick={() => setActivePhoto((i) => (i + 1) % photos.length)} type="button">›</button>
              </>
            ) : null}
            <div className="photo-counter">{activePhoto + 1} / {photos.length}</div>
            <button className="fullscreen-button" onClick={() => setIsFullscreen(true)} type="button">⛶ Всі фото ({photos.length})</button>
          </div>
          <div className="thumbnail-strip">
            {photos.map((photo, index) => (
              <button className={index === activePhoto ? "is-active" : ""} key={photo.id} onClick={() => setActivePhoto(index)} type="button">
                <img src={photo.url} alt="" />
              </button>
            ))}
          </div>

          <section className="card card--flat info-card" style={{ marginTop: 20 }}>
            <span className="badge badge--green">✓ Перевірений власник</span>
            <h1 className="page-title" style={{ fontSize: 38 }}>{listing.title}</h1>
            <div className="listing-card__price">₴ {new Intl.NumberFormat("uk-UA").format(listing.price)} / міс</div>
            <p className="text-muted" style={{ fontSize: 17, lineHeight: 1.7 }}>{listing.description}</p>
            <div className="listing-tags">
              <span className="badge badge--blue">{listing.district}</span>
              <span className="badge badge--gray">{listing.rooms} кімн.</span>
              <span className="badge badge--gray">{listing.area} м²</span>
              <span className="badge badge--gray">{listing.floor}/{listing.totalFloors} поверх</span>
            </div>
            <section className="section">
              <h2>Рівень довіри</h2>
              <div className="trust-bar"><span style={{ width: `${listing.trustScore}%` }} /></div>
              <p className="text-muted">{listing.trustScore}% — власник і оголошення пройшли перевірки FlatRent.</p>
            </section>
          </section>
        </section>

        <aside className="card card--flat info-card contact-card">
          <h2>Власник</h2>
          <div className="owner-row" style={{ borderTop: 0, paddingTop: 0 }}>
            <div className="owner-row__person">
              <span className="avatar">{listing.owner.name.slice(0, 1).toUpperCase()}</span>
              <div><strong>{listing.owner.name}</strong><div className="text-muted">{listing.owner.trustScore}% довіри</div></div>
            </div>
          </div>
          {contactError ? (
            <div style={{ background: "#FEE2E2", color: "#DC2626", padding: "10px 14px", borderRadius: 8, fontSize: 14, marginBottom: 10 }}>
              {contactError}
            </div>
          ) : null}
          {phone ? (
            <a href={`tel:${phone}`} className="btn btn--primary btn--full btn--lg">📞 {phone}</a>
          ) : (
            <button className="btn btn--primary btn--full btn--lg" onClick={handleContact} disabled={contacting} type="button">
              {contacting ? "Завантаження..." : "📞 Показати контакт"}
            </button>
          )}
        </aside>
      </div>

      {isFullscreen ? (
        <div className="lightbox" onClick={() => setIsFullscreen(false)}>
          <div className="lightbox__inner" onClick={(event) => event.stopPropagation()}>
            <img src={photos[activePhoto].url} alt="" />
            <button className="lightbox__close" onClick={() => setIsFullscreen(false)} type="button">×</button>
            <button className="lightbox__prev" onClick={() => setActivePhoto((i) => (i - 1 + photos.length) % photos.length)} type="button">‹</button>
            <button className="lightbox__next" onClick={() => setActivePhoto((i) => (i + 1) % photos.length)} type="button">›</button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
