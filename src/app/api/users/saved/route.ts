import { NextRequest } from "next/server";
import { z } from "zod";
import { err, handleError, ok } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const schema = z.object({
  listingId: z.string().min(1),
});

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const saved = await prisma.savedListing.findMany({
      where: { userId: auth.user.id },
      include: {
        listing: {
          include: {
            owner: { select: { id: true, name: true, email: true, role: true, phone: true, avatarUrl: true, isVerified: true, trustScore: true } },
            photos: { orderBy: { order: "asc" } },
            amenities: { include: { amenity: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return ok({ saved });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return err("Не авторизовано", 401);
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const input = schema.parse(await request.json());
    const existing = await prisma.savedListing.findUnique({
      where: { userId_listingId: { userId: auth.user.id, listingId: input.listingId } },
    });
    if (existing) {
      await prisma.savedListing.delete({
        where: { userId_listingId: { userId: auth.user.id, listingId: input.listingId } },
      });
      return ok({ saved: false });
    }

    await prisma.savedListing.create({
      data: { userId: auth.user.id, listingId: input.listingId },
    });
    return ok({ saved: true });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return err("Не авторизовано", 401);
    return handleError(error);
  }
}
