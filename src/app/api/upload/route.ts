import { NextRequest } from "next/server";
import { err, handleError, ok } from "@/lib/api";
import { requireAuth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    await requireAuth(request);
    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return err("Файл не передано", 400);
    }

    const seed = encodeURIComponent(file.name.replace(/\W+/g, "-"));
    return ok({
      url: `https://picsum.photos/seed/${seed}/800/600`,
      name: file.name,
      size: file.size,
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") return err("Не авторизовано", 401);
    return handleError(error);
  }
}
