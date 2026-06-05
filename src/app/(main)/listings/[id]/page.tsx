import { notFound } from "next/navigation";
import { ListingStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type ListingDetailPageProps = {
  params: { id: string };
};

export default async function ListingDetailPage({ params }: ListingDetailPageProps) {
  const listing = await prisma.listing.findFirst({
    where: { id: params.id, status: ListingStatus.ACTIVE },
    include: {
      owner: true,
      photos: { orderBy: { order: "asc" } },
      amenities: { include: { amenity: true } },
    },
  });

  if (!listing) {
    notFound();
  }

  return (
    <main className="page">
      <div className="container">
        <div className="card card--flat" style={{ overflow: "hidden" }}>
          <div className="listing-card__photo" style={{ aspectRatio: "16 / 7" }}>
            <img src={listing.photos[0]?.url ?? "https://picsum.photos/seed/detail/1200/700"} alt={listing.title} />
          </div>
          <div style={{ padding: 24 }}>
            <span className="badge badge--green">✓ Перевірений власник</span>
            <h1 className="page-title" style={{ fontSize: 38 }}>{listing.title}</h1>
            <div className="listing-card__price">₴ {new Intl.NumberFormat("uk-UA").format(listing.price)} / міс</div>
            <p className="text-muted" style={{ fontSize: 17, lineHeight: 1.7 }}>{listing.description}</p>
            <div className="listing-tags">
              <span className="badge badge--blue">{listing.district}</span>
              <span className="badge badge--gray">{listing.rooms} кімн.</span>
              <span className="badge badge--gray">{Number(listing.area)} м²</span>
              <span className="badge badge--gray">{listing.floor}/{listing.totalFloors} поверх</span>
              {listing.amenities.map(({ amenity }) => (
                <span className="badge badge--gray" key={amenity.id}>{amenity.name}</span>
              ))}
            </div>
            <section className="section">
              <h2>Рівень довіри</h2>
              <div className="trust-bar">
                <span style={{ width: `${listing.trustScore}%` }} />
              </div>
              <p className="text-muted">{listing.trustScore}% — власник і оголошення пройшли перевірки FlatRent.</p>
            </section>
            <section className="section card card--flat info-card">
              <h2>Власник</h2>
              <div className="owner-row" style={{ borderTop: 0, paddingTop: 0 }}>
                <div className="owner-row__person">
                  <span className="avatar">{listing.owner.name.slice(0, 1).toUpperCase()}</span>
                  <div>
                    <strong>{listing.owner.name}</strong>
                    <div className="text-muted">{listing.owner.trustScore}% довіри</div>
                  </div>
                </div>
                <form action={`/api/listings/${listing.id}/contact`} method="post">
                  <button className="btn btn--primary" type="submit">Показати контакт</button>
                </form>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
