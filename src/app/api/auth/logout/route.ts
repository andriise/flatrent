import { ok } from "@/lib/api";
import { authCookieName } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST() {
  const response = ok({ message: "Ви вийшли з акаунта" });
  response.cookies.set(authCookieName, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
