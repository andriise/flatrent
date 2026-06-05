import { NextRequest } from "next/server";
import { checkContactLimit, err, handleError, ok } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth(request);
    if (!(await checkContactLimit(auth.user.id))) {
      return err("Ліміт контактів на сьогодні вичерпано", 429);
    }

    const listing = await prisma.listing.findUnique({ where: { id: params.id }, include: { owner: true } });
    if (!listing) {
      return err("Оголошення не знайдено", 404);
    }

    await prisma.contactRequest.create({
      data: { userId: auth.user.id, listingId: listing.id },
    });

    return ok({ phone: listing.owner.phone ?? "Телефон буде додано власником" });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return err("Не авторизовано", 401);
    }
    return handleError(error);
  }
}
