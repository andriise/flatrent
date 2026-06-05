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
  rooms: z.coerce.number().int().min(1).default(1),
  area: z.coerce.number().positive().default(40),
  floor: z.coerce.number().int().min(1).default(1),
  totalFloors: z.coerce.number().int().min(1).default(9),
  isFurnished: z.coerce.boolean().default(false),
  petsAllowed: z.coerce.boolean().default(false),
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
    const where: Prisma.ListingWhereInput = {
      status: ListingStatus.ACTIVE,
      district: searchParams.get("district") || undefined,
      rooms: searchParams.get("rooms") ? Number(searchParams.get("rooms")) : undefined,
      price: {
        gte: searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined,
        lte: searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined,
      },
    };

    const listings = await prisma.listing.findMany({
      where,
      include: {
        owner: { select: { id: true, name: true, email: true, role: true, phone: true, avatarUrl: true, isVerified: true, trustScore: true } },
        photos: { orderBy: { order: "asc" } },
        amenities: { include: { amenity: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return ok({ listings });
  } catch (error: unknown) {
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    if (!(await canCreateListing(auth.user.id, auth.user.role))) {
      return err("Ваш тариф або роль не дозволяє створити нове оголошення", 403);
    }

    const input = createSchema.parse(await readInput(request));
    const listing = await prisma.listing.create({
      data: {
        ...input,
        ownerId: auth.user.id,
        status: ListingStatus.ACTIVE,
        trustScore: auth.user.isVerified ? 86 : 68,
        photos: {
          create: [
            {
              url: `https://picsum.photos/seed/${encodeURIComponent(input.title)}/800/600`,
              alt: input.title,
            },
          ],
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
