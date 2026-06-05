import { NextRequest } from "next/server";
import { z } from "zod";
import { err, handleError, ok } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const schema = z.object({
  reason: z.string().min(3),
  details: z.string().optional(),
});

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await requireAuth(request);
    const input = schema.parse(await request.json());
    const report = await prisma.report.create({
      data: {
        listingId: params.id,
        userId: auth.user.id,
        reason: input.reason,
        details: input.details,
      },
    });
    return ok({ report }, { status: 201 });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return err("Не авторизовано", 401);
    }
    return handleError(error);
  }
}
