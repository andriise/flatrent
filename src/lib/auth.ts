import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type TokenPayload = {
  userId: string;
  role: Role;
};

const TOKEN_COOKIE = "token";

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }
  return secret;
}

export function signToken(payload: TokenPayload) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret());
    if (typeof decoded === "string") {
      return null;
    }
    const userId = decoded.userId;
    const role = decoded.role;
    if (typeof userId !== "string" || !Object.values(Role).includes(role as Role)) {
      return null;
    }
    return { userId, role: role as Role };
  } catch {
    return null;
  }
}

export async function getAuthFromRequest(request: NextRequest) {
  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
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

  if (!user) {
    return null;
  }

  return { token, payload, user };
}

export async function requireAuth(request: NextRequest) {
  const auth = await getAuthFromRequest(request);
  if (!auth) {
    throw new Error("UNAUTHORIZED");
  }
  return auth;
}

export async function requireAdmin(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth.user.role !== Role.ADMIN) {
    throw new Error("FORBIDDEN");
  }
  return auth;
}

export const authCookieName = TOKEN_COOKIE;
