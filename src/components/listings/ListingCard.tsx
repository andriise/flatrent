import Link from "next/link";
import type { Listing } from "@/types";

function formatPrice(price: number) {
  return new Intl.NumberFormat("uk-UA").format(price);
}

export function ListingCard({ listing }: { listing: Listing }) {
  const photo = listing.photos[0];
  const ownerInitial = listing.owner.name.slice(0, 1).toUpperCase();

  return (
    <article className="card listing-card">
      <div className="listing-card__photo">
        <img src={photo?.url ?? "https://picsum.photos/seed/flatrent-empty/800/600"} alt={photo?.alt ?? listing.title} />
        {listing.owner.isVerified ? (
          <span className="badge badge--green listing-card__badge">✓ Перевірений власник</span>
        ) : null}
        <button className="listing-card__save" type="button" aria-label="Зберегти оголошення">
          ♥
        </button>
      </div>
      <div className="listing-card__body">
        <div className="listing-card__price">₴ {formatPrice(listing.price)} / міс</div>
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
          {listing.isFurnished ? <span className="badge badge--gray">З меблями</span> : null}
          {listing.petsAllowed ? <span className="badge badge--amber">Можна з тваринами</span> : null}
        </div>
        <div className="owner-row">
          <div className="owner-row__person">
            <span className="avatar">{ownerInitial}</span>
            <div>
              <strong>{listing.owner.name}</strong>
              <div className="text-muted">{listing.owner.trustScore}% довіри</div>
            </div>
          </div>
          <Link className="btn btn--secondary btn--sm" href={`/listings/${listing.id}`}>
            Детальніше
          </Link>
        </div>
      </div>
    </article>
  );
}
