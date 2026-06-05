"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useAuth } from "@/hooks/useAuth";

type AuthResponse =
  | { success: true; data: { user: { id: string } } }
  | { success: false; error: string };

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
      }),
    });
    const payload = (await response.json()) as AuthResponse;
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
      <h1>Вхід до кабінету</h1>
      <form className="auth-form" onSubmit={onSubmit}>
        <div className="field">
          <label className="label" htmlFor="email">Email</label>
          <input className="input" id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <div className="field">
          <label className="label" htmlFor="password">Пароль</label>
          <input className="input" id="password" name="password" type="password" autoComplete="current-password" required />
        </div>
        {error ? <span className="badge badge--red">{error}</span> : null}
        <button className="btn btn--primary btn--full" type="submit" disabled={loading}>
          {loading ? "Входимо..." : "Увійти"}
        </button>
      </form>
      <div className="demo-box">
        <strong>Демо доступ:</strong>
        <br />
        admin@flatrent.ua / password123
        <br />
        mykola@example.com / password123
        <br />
        ivan@example.com / password123
      </div>
      <p className="text-muted">
        Немає акаунта? <Link href="/register">Зареєструватися</Link>
      </p>
    </main>
  );
}
