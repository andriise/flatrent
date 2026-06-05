import { NextRequest } from "next/server";
import { ListingStatus } from "@prisma/client";
import { z } from "zod";
import { err, handleError, ok, recalculateTrustScore } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const schema = z.object({
  action: z.enum(["approve", "reject", "flag"]),
});

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin(request);
    const input = schema.parse(await request.json());
    const status =
      input.action === "approve"
        ? ListingStatus.ACTIVE
        : input.action === "reject"
          ? ListingStatus.REJECTED
          : ListingStatus.FLAGGED;
    const listing = await prisma.listing.update({
      where: { id: params.id },
      data: { status },
    });
    await recalculateTrustScore(listing.ownerId);
    return ok({ listing });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return err("Не авторизовано", 401);
    if (error instanceof Error && error.message === "FORBIDDEN") return err("Недостатньо прав", 403);
    return handleError(error);
  }
}
