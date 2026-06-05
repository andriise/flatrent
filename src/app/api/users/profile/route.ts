import { NextRequest } from "next/server";
import { z } from "zod";
import { err, handleError, ok } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(7).optional(),
  avatarUrl: z.string().url().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    return ok({ user: auth.user });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return err("Не авторизовано", 401);
    return handleError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const input = schema.parse(await request.json());
    const user = await prisma.user.update({
      where: { id: auth.user.id },
      data: input,
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
    });
    return ok({ user });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return err("Не авторизовано", 401);
    return handleError(error);
  }
}
