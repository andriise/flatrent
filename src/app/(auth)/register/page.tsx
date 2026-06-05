"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import type { Role } from "@/types";

type RegisterResponse =
  | { success: true; data: { user: { id: string } } }
  | { success: false; error: string };

export default function RegisterPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [role, setRole] = useState<Role>("USER");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
        role,
      }),
    });
    const payload = (await response.json()) as RegisterResponse;
    setLoading(false);
    if (!payload.success) {
      setError(payload.error);
      return;
    }
    await refresh();
    router.push("/dashboard");
  }

  return (
    <main className="card auth-card">
      <Link className="logo" href="/">
        <span className="logo__mark">F</span>
        <span>FlatRent</span>
      </Link>
      <h1>Створити акаунт</h1>
      <form className="auth-form" onSubmit={onSubmit}>
        <div className="role-toggle">
          <button className={role === "USER" ? "is-active" : ""} type="button" onClick={() => setRole("USER")}>
            🔍 Шукаю квартиру
          </button>
          <button className={role === "OWNER" ? "is-active" : ""} type="button" onClick={() => setRole("OWNER")}>
            🏠 Здаю квартиру
          </button>
        </div>
        <div className="field">
          <label className="label" htmlFor="name">Ім'я</label>
          <input className="input" id="name" name="name" autoComplete="name" required />
        </div>
        <div className="field">
          <label className="label" htmlFor="email">Email</label>
          <input className="input" id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="field">
          <label className="label" htmlFor="password">Пароль</label>
          <input className="input" id="password" name="password" type="password" autoComplete="new-password" required />
        </div>
        {error ? <span className="badge badge--red">{error}</span> : null}
        <button className="btn btn--primary btn--full" type="submit" disabled={loading}>
          {loading ? "Створюємо..." : "Зареєструватися"}
        </button>
      </form>
      <p className="text-muted">
        Уже маєте акаунт? <Link href="/login">Увійти</Link>
      </p>
    </main>
  );
}
