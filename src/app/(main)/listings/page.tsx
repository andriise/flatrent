import { ListingStatus, Prisma } from "@prisma/client";
import { ListingCard } from "@/components/listings/ListingCard";
import { SearchFilters } from "@/components/listings/SearchFilters";
import { prisma } from "@/lib/prisma";
import type { Listing } from "@/types";

const listingInclude = {
  owner: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      avatarUrl: true,
      isVerified: true,
      trustScore: true,
    },
  },
  photos: { orderBy: { order: "asc" as const } },
  amenities: { include: { amenity: true } },
};

type ListingsPageProps = {
  searchParams?: {
    query?: string;
    district?: string;
    minPrice?: string;
    maxPrice?: string;
    rooms?: string;
    sort?: string;
    page?: string;
  };
};

type ListingWithRelations = Prisma.ListingGetPayload<{ include: typeof listingInclude }>;

function toListing(listing: ListingWithRelations): Listing {
  return {
    ...listing,
    area: Number(listing.area),
    createdAt: listing.createdAt.toISOString(),
    amenities: listing.amenities.map((item) => item.amenity),
  };
}

export default async function ListingsPage({ searchParams }: ListingsPageProps) {
  const page = Number(searchParams?.page ?? 1);
  const take = 6;
  const skip = (page - 1) * take;
  const where: Prisma.ListingWhereInput = {
    status: ListingStatus.ACTIVE,
    district: searchParams?.district || undefined,
    rooms: searchParams?.rooms ? Number(searchParams.rooms) : undefined,
    price: {
      gte: searchParams?.minPrice ? Number(searchParams.minPrice) : undefined,
      lte: searchParams?.maxPrice ? Number(searchParams.maxPrice) : undefined,
    },
    OR: searchParams?.query
      ? [
          { title: { contains: searchParams.query, mode: "insensitive" } },
          { description: { contains: searchParams.query, mode: "insensitive" } },
          { address: { contains: searchParams.query, mode: "insensitive" } },
        ]
      : undefined,
  };

  const orderBy: Prisma.ListingOrderByWithRelationInput =
    searchParams?.sort === "price-asc"
      ? { price: "asc" }
      : searchParams?.sort === "price-desc"
        ? { price: "desc" }
        : { createdAt: "desc" };

  const [items, total] = await Promise.all([
    prisma.listing.findMany({ where, include: listingInclude, orderBy, take, skip }),
    prisma.listing.count({ where }),
  ]);
  const listings = items.map(toListing);
  const totalPages = Math.max(1, Math.ceil(total / take));

  return (
    <main className="page">
      <div className="container listings-layout">
        <SearchFilters />
        <section>
          <div className="flex-between" style={{ marginBottom: 18 }}>
            <div>
              <h1 className="page-title" style={{ fontSize: 34 }}>Оголошення</h1>
              <p className="text-muted">Знайдено {total} оголошень</p>
            </div>
            <form>
              <select className="select" name="sort" defaultValue={searchParams?.sort ?? "new"}>
                <option value="new">Найновіші</option>
                <option value="price-asc">Дешевші спочатку</option>
                <option value="price-desc">Дорожчі спочатку</option>
              </select>
            </form>
          </div>
          {listings.length > 0 ? (
            <div className="listings-grid">
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="card empty-state">
              <strong>Оголошень не знайдено</strong>
              <span>Спробуйте змінити район або бюджет.</span>
            </div>
          )}
          <div className="pagination">
            {Array.from({ length: totalPages }, (_, index) => (
              <a className="btn btn--outline btn--sm" href={`/listings?page=${index + 1}`} key={index + 1}>
                {index + 1}
              </a>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
