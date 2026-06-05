import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = ["/dashboard", "/create-listing", "/admin"];

type MiddlewarePayload = {
  userId?: string;
  role?: string;
  exp?: number;
};

function base64UrlToBytes(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(base64);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function decodePayload(token: string): MiddlewarePayload | null {
  const [, payload] = token.split(".");
  if (!payload) {
    return null;
  }

  try {
    return JSON.parse(new TextDecoder().decode(base64UrlToBytes(payload))) as MiddlewarePayload;
  } catch {
    return null;
  }
}

async function verifyJwt(token: string) {
  const [header, payload, signature] = token.split(".");
  if (!header || !payload || !signature || !process.env.JWT_SECRET) {
    return null;
  }

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(process.env.JWT_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const valid = await crypto.subtle.verify(
    "HMAC",
    key,
    base64UrlToBytes(signature),
    new TextEncoder().encode(`${header}.${payload}`),
  );

  if (!valid) {
    return null;
  }

  const decoded = decodePayload(token);
  if (!decoded?.userId || !decoded.role) {
    return null;
  }

  if (decoded.exp && decoded.exp * 1000 < Date.now()) {
    return null;
  }

  return decoded;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  if (!isProtected) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;
  const payload = token ? await verifyJwt(token) : null;

  if (!payload) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/admin") && payload.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/create-listing/:path*", "/admin/:path*"],
};
