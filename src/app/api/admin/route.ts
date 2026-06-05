import { NextRequest } from "next/server";
import { err, handleError, ok } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin(request);
    const [users, listings, reports, activeSubscriptions] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count(),
      prisma.report.count(),
      prisma.subscription.count({ where: { active: true } }),
    ]);
    return ok({ users, listings, reports, activeSubscriptions });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return err("Не авторизовано", 401);
    if (error instanceof Error && error.message === "FORBIDDEN") return err("Недостатньо прав", 403);
    return handleError(error);
  }
}
