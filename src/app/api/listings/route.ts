import { NextRequest } from "next/server";
import { ListingStatus, Prisma } from "@prisma/client";
import { z } from "zod";
import { canCreateListing, err, handleError, ok } from "@/lib/api";
import { getAuthFromRequest, requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  title: z.string().min(5),
  description: z.string().min(10),
  price: z.coerce.number().int().positive(),
  district: z.string().min(2),
  address: z.string().default("Адреса уточнюється"),
  street: z.string().optional(),
  houseNumber: z.string().optional(),
  propertyType: z.string().default("apartment"),
  rooms: z.coerce.number().int().min(1).default(1),
  area: z.coerce.number().positive().default(40),
  livingArea: z.coerce.number().positive().optional(),
  kitchenArea: z.coerce.number().positive().optional(),
  floor: z.coerce.number().int().min(1).default(1),
  totalFloors: z.coerce.number().int().min(1).default(9),
  buildingType: z.string().optional(),
  condition: z.string().optional(),
  furniture: z.string().default("no"),
  isFurnished: z.coerce.boolean().default(false),
  petsAllowed: z.coerce.boolean().default(false),
  childrenAllowed: z.coerce.boolean().default(true),
  minRentPeriod: z.string().optional(),
  contactMethods: z.array(z.string()).default(["phone"]),
  photoUrls: z.array(z.string()).default([]),
});

async function readInput(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return request.json();
  }
  const form = await request.formData();
  return Object.fromEntries(form.entries());
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const q = searchParams.get("q") || searchParams.get("query") || "";
    const minArea = searchParams.get("minArea")
      ? Number(searchParams.get("minArea"))
      : undefined;
    const verifiedOnly = searchParams.get("verifiedOnly") === "true";
    const notFirstFloor = searchParams.get("notFirstFloor") === "true";
    const notLastFloor = searchParams.get("notLastFloor") === "true";
    const sort = searchParams.get("sort") || "new";
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = 6;
    const where: Prisma.ListingWhereInput = {
      status: ListingStatus.ACTIVE,
      district: searchParams.get("district") || undefined,
      rooms: searchParams.get("rooms")
        ? Number(searchParams.get("rooms"))
        : undefined,
      petsAllowed:
        searchParams.get("petsAllowed") === "true" ? true : undefined,
      isFurnished: searchParams.get("furnished") === "true" ? true : undefined,
      area: minArea ? { gte: minArea } : undefined,
      owner: verifiedOnly ? { isVerified: true } : undefined,
      floor: notFirstFloor ? { gt: 1 } : undefined,
      price: {
        gte: searchParams.get("minPrice")
          ? Number(searchParams.get("minPrice"))
          : undefined,
        lte: searchParams.get("maxPrice")
          ? Number(searchParams.get("maxPrice"))
          : undefined,
      },
      OR: q
        ? [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { district: { contains: q, mode: "insensitive" } },
            { address: { contains: q, mode: "insensitive" } },
          ]
        : undefined,
    };

    const orderBy: Prisma.ListingOrderByWithRelationInput =
      sort === "price-asc"
        ? { price: "asc" }
        : sort === "price-desc"
          ? { price: "desc" }
          : { createdAt: "desc" };

    const total = await prisma.listing.count({ where });

    const listings = await prisma.listing.findMany({
      where,
      include: {
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
        photos: { orderBy: { order: "asc" } },
        amenities: { include: { amenity: true } },
      },
      orderBy,
      take: limit,
      skip: (page - 1) * limit,
    });
    const filteredListings = notLastFloor
      ? listings.filter((listing) => listing.floor < listing.totalFloors)
      : listings;
    return ok({
      listings: filteredListings,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!(await canCreateListing(auth.user.id, auth.user.role))) {
      return err(
        "Ваш тариф або роль не дозволяє створити нове оголошення",
        403,
      );
    }

    const input = createSchema.parse(await readInput(request));
    const photoUrls =
      input.photoUrls.length > 0
        ? input.photoUrls
        : [
            `https://picsum.photos/seed/${encodeURIComponent(input.title)}/800/600`,
          ];
    const listing = await prisma.listing.create({
      data: {
        title: input.title,
        description: input.description,
        price: input.price,
        district: input.district,
        address:
          input.address ||
          [input.street, input.houseNumber].filter(Boolean).join(", ") ||
          "Адреса уточнюється",
        street: input.street,
        houseNumber: input.houseNumber,
        propertyType: input.propertyType,
        rooms: input.rooms,
        area: input.area,
        floor: input.floor,
        totalFloors: input.totalFloors,
        buildingType: input.buildingType,
        condition: input.condition,
        furniture: input.furniture,
        isFurnished:
          input.furniture === "yes" ||
          input.furniture === "partial" ||
          input.isFurnished,
        petsAllowed: input.petsAllowed,
        childrenAllowed: input.childrenAllowed,
        minRentPeriod: input.minRentPeriod,
        contactMethods: input.contactMethods,
        ownerId: auth.user.id,
        status: ListingStatus.ACTIVE,
        trustScore: auth.user.isVerified ? 86 : 68,
        photos: {
          create: photoUrls.map((url, order) => ({
            url,
            alt: input.title,
            order,
          })),
        },
      },
    });
    return ok({ listing }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return err("Не авторизовано", 401);
    }
    return handleError(error);
  }
}
