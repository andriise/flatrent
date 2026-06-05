import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { z } from "zod";
import { ok, err, handleError } from "@/lib/api";
import { authCookieName, signToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["USER", "OWNER"]).default("USER"),
});

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const exists = await prisma.user.findUnique({ where: { email: input.email } });
    if (exists) {
      return err("Користувач із таким email вже існує", 409);
    }

    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash: await bcrypt.hash(input.password, 10),
        role: input.role === "OWNER" ? Role.OWNER : Role.USER,
        trustScore: input.role === "OWNER" ? 70 : 60,
      },
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

    const response = ok({ user });
    response.cookies.set(authCookieName, signToken({ userId: user.id, role: user.role }), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (error: unknown) {
    return handleError(error);
  }
}
