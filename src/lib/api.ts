import { NextResponse } from "next/server";
import { ListingStatus, Role, SubscriptionPlan } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type ApiSuccess<T> = {
  success: true;
  data: T;
};

export type ApiError = {
  success: false;
  error: string;
};

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<ApiSuccess<T>>({ success: true, data }, init);
}

export function err(error: string, status = 400) {
  return NextResponse.json<ApiError>({ success: false, error }, { status });
}

export function handleError(error: unknown) {
  console.error(error);
  return err("Сталася помилка сервера", 500);
}

export async function getActiveSubscription(userId: string) {
  const now = new Date();
  return prisma.subscription.findFirst({
    where: {
      userId,
      active: true,
      OR: [{ endsAt: null }, { endsAt: { gt: now } }],
    },
    orderBy: { startedAt: "desc" },
  });
}

export async function hasPaidSubscription(userId: string) {
  const subscription = await getActiveSubscription(userId);
  return subscription?.plan === SubscriptionPlan.MONTHLY || subscription?.plan === SubscriptionPlan.PREMIUM;
}

export async function checkContactLimit(userId: string) {
  if (await hasPaidSubscription(userId)) {
    return true;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const limit = Number(process.env.FREE_CONTACT_LIMIT ?? 3);
  const count = await prisma.contactRequest.count({
    where: {
      userId,
      createdAt: { gte: today },
    },
  });

  return count < limit;
}

export async function canCreateListing(userId: string, role: Role) {
  if (role === Role.ADMIN) {
    return true;
  }

  if (role !== Role.OWNER) {
    return false;
  }

  if (await hasPaidSubscription(userId)) {
    return true;
  }

  const limit = Number(process.env.MAX_LISTINGS_FREE ?? 3);
  const count = await prisma.listing.count({
    where: {
      ownerId: userId,
      status: { in: [ListingStatus.ACTIVE, ListingStatus.PENDING] },
    },
  });

  return count < limit;
}

export async function recalculateTrustScore(ownerId: string) {
  const [activeListings, reports] = await Promise.all([
    prisma.listing.count({ where: { ownerId, status: ListingStatus.ACTIVE } }),
    prisma.report.count({ where: { listing: { ownerId } } }),
  ]);

  const score = Math.max(40, Math.min(100, 70 + activeListings * 4 - reports * 8));
  await prisma.user.update({ where: { id: ownerId }, data: { trustScore: score } });
  return score;
}
