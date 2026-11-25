"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { PLAN_INFO, type SubscriptionPlan } from "@/types";

const paidPlans: SubscriptionPlan[] = ["MONTHLY", "PREMIUM"];

export default function SubscriptionPage() {
  const { subscription, refresh } = useAuth();
  const [selected, setSelected] = useState<SubscriptionPlan | null>(null);
  const [step, setStep] = useState<"plans" | "payment" | "success">("plans");
  const [loading, setLoading] = useState(false);
  const [payError, setPayError] = useState("");

  async function handlePay() {
    if (!selected) return;
    setLoading(true);
    setPayError("");
    const res = await fetch("/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: selected }),
    });
    const json = (await res.json()) as { success: boolean; error?: string };
    setLoading(false);
    if (json.success) {
      await refresh();
      setStep("success");
    } else {
      setPayError(json.error ?? "Оплату не виконано");
    }
  }

  if (step === "success") {
    return (
      <main className="page">
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 72, marginBottom: 20 }}>🎉</div>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 12 }}>Підписку активовано!</h2>
          <p style={{ color: "#6B7280", marginBottom: 6 }}>Тариф: <strong>{selected && PLAN_INFO[selected].label}</strong></p>
          <p style={{ color: "#6B7280", marginBottom: 28 }}>
            Дійсна до: <strong>{subscription?.endsAt ? new Date(subscription.endsAt).toLocaleDateString("uk-UA") : "30 днів"}</strong>
          </p>
          <Link href="/listings" className="btn btn--primary btn--lg">Шукати квартиру →</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="container">
        <h1 className="page-title" style={{ fontSize: 38 }}>Преміум доступ</h1>
        {step === "plans" ? (
          <>
            <div className="stats-grid">
              {paidPlans.map((plan) => (
                <button
                  className={selected === plan ? "card plan-card is-selected" : "card plan-card"}
                  type="button"
                  key={plan}
                  onClick={() => setSelected(plan)}
                >
                  <h3>{PLAN_INFO[plan].label}</h3>
                  <strong>{PLAN_INFO[plan].price} грн</strong>
                  <p className="text-muted">{PLAN_INFO[plan].contactLimit} контактів, {PLAN_INFO[plan].listingLimit} оголошень</p>
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                if (selected) setStep("payment");
              }}
              disabled={!selected}
              className="btn btn--primary btn--full btn--lg"
              style={{ marginTop: 24 }}
              type="button"
            >
              Продовжити до оплати →
            </button>
          </>
        ) : (
          <div className="card card--flat auth-card" style={{ margin: "24px auto" }}>
            <h2>Оплата тарифу {selected && PLAN_INFO[selected].label}</h2>
            <p className="text-muted">Це mock payment для демо. Підписка активується тільки після кнопки нижче.</p>
            <div className="field"><label className="label">Номер картки</label><input className="input" placeholder="4242 4242 4242 4242" /></div>
            <div className="field-row">
              <div className="field"><label className="label">Термін</label><input className="input" placeholder="12/28" /></div>
              <div className="field"><label className="label">CVV</label><input className="input" placeholder="123" /></div>
            </div>
            {payError ? <span className="badge badge--red">{payError}</span> : null}
            <button className="btn btn--primary btn--full" onClick={handlePay} disabled={loading} type="button">
              {loading ? "Оплачуємо..." : "Оплатити"}
            </button>
            <button className="btn btn--outline btn--full" onClick={() => setStep("plans")} type="button">Назад до тарифів</button>
          </div>
        )}
      </section>
    </main>
  );
}
