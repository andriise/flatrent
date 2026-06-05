import bcrypt from "bcryptjs";
import { z } from "zod";
import { ok, err, handleError } from "@/lib/api";
import { authCookieName, signToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const input = schema.parse(await request.json());
    const userWithPassword = await prisma.user.findUnique({ where: { email: input.email } });
    if (!userWithPassword || !(await bcrypt.compare(input.password, userWithPassword.passwordHash))) {
      return err("Невірний email або пароль", 401);
    }

    const { passwordHash: _passwordHash, ...user } = userWithPassword;
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
