import { ListingStatus } from "@prisma/client";
import { ok, err, handleError } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  try {
    const listing = await prisma.listing.findFirst({
      where: { id: params.id, status: ListingStatus.ACTIVE },
      include: {
        owner: { select: { id: true, name: true, email: true, role: true, phone: true, avatarUrl: true, isVerified: true, trustScore: true } },
        photos: { orderBy: { order: "asc" } },
        amenities: { include: { amenity: true } },
      },
    });
    return listing ? ok({ listing }) : err("Оголошення не знайдено", 404);
  } catch (error: unknown) {
    return handleError(error);
  }
}
