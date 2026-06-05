import { NextRequest } from "next/server";
import { err, handleError, ok } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const listings = await prisma.listing.findMany({
      where: { ownerId: auth.user.id },
      include: { photos: { orderBy: { order: "asc" } }, amenities: { include: { amenity: true } } },
      orderBy: { createdAt: "desc" },
    });
    return ok({ listings });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return err("Не авторизовано", 401);
    return handleError(error);
  }
}
