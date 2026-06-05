import { NextRequest } from "next/server";
import { SubscriptionPlan } from "@prisma/client";
import { z } from "zod";
import { err, getActiveSubscription, handleError, ok } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const schema = z.object({
  plan: z.enum(["MONTHLY", "PREMIUM"]).default("MONTHLY"),
});

async function readPlan(request: Request) {
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    return schema.parse(await request.json());
  }
  const form = await request.formData();
  return schema.parse({ plan: String(form.get("plan") ?? "MONTHLY") });
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const subscription = await getActiveSubscription(auth.user.id);
    return ok({ subscription });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return err("Не авторизовано", 401);
    return handleError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAuth(request);
    const input = await readPlan(request);
    await prisma.subscription.updateMany({
      where: { userId: auth.user.id, active: true },
      data: { active: false },
    });
    const subscription = await prisma.subscription.create({
      data: {
        userId: auth.user.id,
        plan: input.plan === "PREMIUM" ? SubscriptionPlan.PREMIUM : SubscriptionPlan.MONTHLY,
        active: true,
        endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    return ok({ subscription });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return err("Не авторизовано", 401);
    return handleError(error);
  }
}
