import { NextRequest } from "next/server";
import { getActiveSubscription, hasPaidSubscription, ok, err, handleError } from "@/lib/api";
import { getAuthFromRequest } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const auth = await getAuthFromRequest(request);
    if (!auth) {
      return err("Не авторизовано", 401);
    }
    const [subscription, isPaid] = await Promise.all([
      getActiveSubscription(auth.user.id),
      hasPaidSubscription(auth.user.id),
    ]);
    return ok({
      user: auth.user,
      subscription: subscription
        ? {
            ...subscription,
            startedAt: subscription.startedAt.toISOString(),
            endsAt: subscription.endsAt?.toISOString() ?? null,
          }
        : null,
      isPaid,
    });
  } catch (error: unknown) {
    return handleError(error);
  }
}
