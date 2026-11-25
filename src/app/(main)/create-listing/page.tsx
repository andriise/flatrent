"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DISTRICTS } from "@/types";

type SubmitState = "idle" | "success" | "error";

type FormState = {
  propertyType: string;
  district: string;
  street: string;
  houseNumber: string;
  rooms: string;
  area: string;
  livingArea: string;
  kitchenArea: string;
  floor: string;
  totalFloors: string;
  buildingType: string;
  condition: string;
  furniture: string;
  title: string;
  description: string;
  price: string;
  negotiable: boolean;
  petsAllowed: boolean;
  childrenAllowed: boolean;
  minRentPeriod: string;
  contactMethods: string[];
};

const initialForm: FormState = {
  propertyType: "apartment",
  district: "Центр",
  street: "",
  houseNumber: "",
  rooms: "2",
  area: "58",
  livingArea: "",
  kitchenArea: "",
  floor: "4",
  totalFloors: "9",
  buildingType: "brick",
  condition: "euro",
  furniture: "yes",
  title: "",
  description: "",
  price: "",
  negotiable: false,
  petsAllowed: false,
  childrenAllowed: true,
  minRentPeriod: "any",
  contactMethods: ["phone"],
};

const appliances = [
  "Холодильник",
  "Пральна машина",
  "Посудомийна машина",
  "Мікрохвильовка",
  "Кондиціонер",
  "Телевізор",
];
const comforts = [
  "WiFi",
  "Балкон",
  "Паркінг",
  "Охорона",
  "Домофон",
  "Ліфт",
  "Комора",
  "Спортзал",
];

export default function CreateListingPage() {
  const { user, refresh } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initialForm);
  const [selectedAppliances, setSelectedAppliances] = useState<string[]>([]);
  const [selectedComforts, setSelectedComforts] = useState<string[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [createdId, setCreatedId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneSaving, setPhoneSaving] = useState(false);
  const [phoneSaved, setPhoneSaved] = useState(false);

  const suggestedTitle = useMemo(
    () =>
      `${form.rooms}-кімнатна квартира, ${form.area || "58"} м², ${form.district}`,
    [form.rooms, form.area, form.district],
  );

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function toggleArray(
    value: string,
    setter: (value: string[]) => void,
    current: string[],
  ) {
    setter(
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  async function uploadPhotos(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []).slice(
      0,
      15 - photoUrls.length,
    );
    const uploaded: string[] = [];
    for (const file of files) {
      const data = new FormData();
      data.append("file", file);
      const response = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });
      const payload = (await response.json()) as {
        success: boolean;
        data?: { url: string };
      };
      if (payload.success && payload.data) {
        uploaded.push(payload.data.url);
      }
    }
    setPhotoUrls((current) => [...current, ...uploaded]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          title: form.title || suggestedTitle,
          address: `${form.street} ${form.houseNumber}`.trim(),
          rooms: Number(form.rooms),
          area: Number(form.area),
          livingArea: form.livingArea ? Number(form.livingArea) : undefined,
          kitchenArea: form.kitchenArea ? Number(form.kitchenArea) : undefined,
          floor: Number(form.floor),
          totalFloors: Number(form.totalFloors),
          price: Number(form.price),
          isFurnished: form.furniture !== "no",
          photoUrls,
          contactMethods: form.contactMethods,
        }),
      });
      const json = (await res.json()) as {
        success: boolean;
        data?: { listing: { id: string } };
        error?: string;
      };
      if (json.success && json.data) {
        setSubmitState("success");
        setCreatedId(json.data.listing.id);
      } else {
        setSubmitState("error");
        setErrorMessage(json.error ?? "Помилка публікації");
      }
    } catch {
      setSubmitState("error");
      setErrorMessage("Помилка мережі. Спробуйте ще раз.");
    }
    setSubmitting(false);
  }

  useEffect(() => {
    if (user) {
      setForm((current) => ({
        ...current,
        contactMethods: user.phone ? ["phone"] : [],
      }));
    }
  }, [user]);

  useEffect(() => {
    setPhone(user?.phone ?? "");
  }, [user?.phone]);

  async function savePhone() {
    if (phone.trim().length < 7) {
      setErrorMessage("Введіть коректний номер телефону");
      setSubmitState("error");
      return;
    }

    setPhoneSaving(true);
    setPhoneSaved(false);
    try {
      const response = await fetch("/api/users/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim() }),
      });
      const payload = (await response.json()) as {
        success: boolean;
        error?: string;
      };
      if (!payload.success)
        throw new Error(payload.error ?? "Не вдалося зберегти телефон");
      await refresh();
      setPhoneSaved(true);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Не вдалося зберегти телефон",
      );
      setSubmitState("error");
    } finally {
      setPhoneSaving(false);
    }
  }

  if (submitState === "success") {
    return (
      <main className="page">
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 72, marginBottom: 20 }}>✅</div>
          <h2>Оголошення успішно подано!</h2>
          <p style={{ color: "#6B7280", marginBottom: 8 }}>
            Воно з'явиться на сайті після модерації (до 24 годин)
          </p>
          <div
            style={{
              display: "flex",
              gap: 12,
              justifyContent: "center",
              marginTop: 24,
              flexWrap: "wrap",
            }}
          >
            <Link href={`/listings/${createdId}`} className="btn btn--primary">
              Переглянути оголошення
            </Link>
            <Link href="/dashboard" className="btn btn--secondary">
              Мій кабінет
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="container container--narrow">
        <h1 className="page-title" style={{ fontSize: 38 }}>
          Додати житло
        </h1>
        <div className="step-progress">
          {["Основне", "Деталі квартири", "Фото та опис", "Контакти"].map(
            (label, index) => (
              <button
                className={step === index + 1 ? "is-active" : ""}
                key={label}
                type="button"
                onClick={() => setStep(index + 1)}
              >
                <span>{index + 1}</span>
                {label}
              </button>
            ),
          )}
        </div>
        <form className="card card--flat create-form" onSubmit={handleSubmit}>
          {step === 1 ? (
            <section className="form-step">
              <h2>Основне</h2>
              <div className="role-toggle">
                {[
                  ["apartment", "Здаю квартиру"],
                  ["room", "Здаю кімнату"],
                  ["house", "Здаю будинок"],
                ].map(([value, label]) => (
                  <button
                    className={form.propertyType === value ? "is-active" : ""}
                    type="button"
                    key={value}
                    onClick={() => update("propertyType", value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="field-row">
                <div className="field">
                  <label className="label">Місто</label>
                  <input className="input" value="Вінниця" disabled />
                </div>
                <div className="field">
                  <label className="label">Район</label>
                  <select
                    className="select"
                    value={form.district}
                    onChange={(e) => update("district", e.target.value)}
                  >
                    {DISTRICTS.map((district) => (
                      <option key={district}>{district}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label className="label">Вулиця</label>
                  <input
                    className="input"
                    value={form.street}
                    onChange={(e) => update("street", e.target.value)}
                  />
                </div>
                <div className="field">
                  <label className="label">Номер будинку</label>
                  <input
                    className="input"
                    value={form.houseNumber}
                    onChange={(e) => update("houseNumber", e.target.value)}
                  />
                </div>
              </div>
            </section>
          ) : null}

          {step === 2 ? (
            <section className="form-step">
              <h2>Деталі квартири</h2>
              <div className="pill-grid">
                {["1", "2", "3", "4", "5"].map((rooms) => (
                  <label className="radio-pill" key={rooms}>
                    <input
                      checked={form.rooms === rooms}
                      onChange={() => update("rooms", rooms)}
                      type="radio"
                    />{" "}
                    <span>{rooms === "5" ? "5+" : rooms}</span>
                  </label>
                ))}
              </div>
              <div className="field-row">
                <div className="field">
                  <label className="label">Загальна площа, м²</label>
                  <input
                    className="input"
                    type="number"
                    value={form.area}
                    onChange={(e) => update("area", e.target.value)}
                  />
                </div>
                <div className="field">
                  <label className="label">Житлова площа, м²</label>
                  <input
                    className="input"
                    type="number"
                    value={form.livingArea}
                    onChange={(e) => update("livingArea", e.target.value)}
                  />
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label className="label">Площа кухні, м²</label>
                  <input
                    className="input"
                    type="number"
                    value={form.kitchenArea}
                    onChange={(e) => update("kitchenArea", e.target.value)}
                  />
                </div>
                <div className="field">
                  <label className="label">Поверх</label>
                  <input
                    className="input"
                    type="number"
                    value={form.floor}
                    onChange={(e) => update("floor", e.target.value)}
                  />
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label className="label">Поверхів у будинку</label>
                  <input
                    className="input"
                    type="number"
                    value={form.totalFloors}
                    onChange={(e) => update("totalFloors", e.target.value)}
                  />
                </div>
                <div className="field">
                  <label className="label">Тип будинку</label>
                  <select
                    className="select"
                    value={form.buildingType}
                    onChange={(e) => update("buildingType", e.target.value)}
                  >
                    <option value="panel">Панельний</option>
                    <option value="brick">Цегляний</option>
                    <option value="monolith">Монолітний</option>
                    <option value="new">Новобудова</option>
                  </select>
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label className="label">Стан</label>
                  <select
                    className="select"
                    value={form.condition}
                    onChange={(e) => update("condition", e.target.value)}
                  >
                    <option value="needs_renovation">Потребує ремонту</option>
                    <option value="living">Жилий стан</option>
                    <option value="cosmetic">Косметичний ремонт</option>
                    <option value="euro">Євроремонт</option>
                    <option value="author">Авторський дизайн</option>
                  </select>
                </div>
                <div className="field">
                  <label className="label">Меблі</label>
                  <select
                    className="select"
                    value={form.furniture}
                    onChange={(e) => update("furniture", e.target.value)}
                  >
                    <option value="yes">Є</option>
                    <option value="no">Немає</option>
                    <option value="partial">Частково</option>
                  </select>
                </div>
              </div>
              <div className="checkbox-list checkbox-list--grid">
                {appliances.map((item) => (
                  <label key={item}>
                    <input
                      type="checkbox"
                      onChange={() =>
                        toggleArray(
                          item,
                          setSelectedAppliances,
                          selectedAppliances,
                        )
                      }
                    />{" "}
                    {item}
                  </label>
                ))}
              </div>
              <div className="checkbox-list checkbox-list--grid">
                {comforts.map((item) => (
                  <label key={item}>
                    <input
                      type="checkbox"
                      onChange={() =>
                        toggleArray(item, setSelectedComforts, selectedComforts)
                      }
                    />{" "}
                    {item}
                  </label>
                ))}
              </div>
            </section>
          ) : null}

          {step === 3 ? (
            <section className="form-step">
              <h2>Фото та опис</h2>
              <label className="upload-zone">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={uploadPhotos}
                />
                <strong>Перетягніть фото або натисніть для вибору</strong>
                <span className="text-muted">
                  До 15 фото, перше буде обкладинкою
                </span>
              </label>
              <div className="photo-preview-grid">
                {photoUrls.map((url, index) => (
                  <div className="photo-thumb" key={url}>
                    <img src={url} alt={`Фото ${index + 1}`} />
                    {index === 0 ? <span>Обкладинка</span> : null}
                    <button
                      type="button"
                      onClick={() =>
                        setPhotoUrls((current) =>
                          current.filter((item) => item !== url),
                        )
                      }
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <div className="field">
                <label className="label">Заголовок оголошення</label>
                <input
                  className="input"
                  value={form.title || suggestedTitle}
                  onChange={(e) => update("title", e.target.value)}
                />
              </div>
              <div className="field">
                <label className="label">Опис</label>
                <textarea
                  className="textarea"
                  minLength={50}
                  maxLength={3000}
                  value={form.description}
                  onChange={(e) => update("description", e.target.value)}
                />
                <span className="text-muted">
                  {form.description.length}/3000
                </span>
              </div>
              <div className="field-row">
                <div className="field">
                  <label className="label">Ціна оренди, ₴/міс</label>
                  <input
                    className="input"
                    type="number"
                    value={form.price}
                    onChange={(e) => update("price", e.target.value)}
                  />
                </div>
                <div className="checkbox-list">
                  <label>
                    <input
                      checked={form.negotiable}
                      onChange={(e) => update("negotiable", e.target.checked)}
                      type="checkbox"
                    />{" "}
                    Торг можливий
                  </label>
                  <label>
                    <input
                      checked={form.petsAllowed}
                      onChange={(e) => update("petsAllowed", e.target.checked)}
                      type="checkbox"
                    />{" "}
                    Дозволено тварин
                  </label>
                  <label>
                    <input
                      checked={form.childrenAllowed}
                      onChange={(e) =>
                        update("childrenAllowed", e.target.checked)
                      }
                      type="checkbox"
                    />{" "}
                    Можна з дітьми
                  </label>
                </div>
              </div>
              <div className="field">
                <label className="label">Мінімальний термін оренди</label>
                <select
                  className="select"
                  value={form.minRentPeriod}
                  onChange={(e) => update("minRentPeriod", e.target.value)}
                >
                  <option value="any">Будь-який</option>
                  <option value="1m">1 місяць</option>
                  <option value="3m">3 місяці</option>
                  <option value="6m">6 місяців</option>
                  <option value="1y">1 рік</option>
                </select>
              </div>
            </section>
          ) : null}

          {step === 4 ? (
            <section className="form-step">
              <h2>Контактні дані + Перевірка</h2>
              <div className="card card--flat info-card">
                <strong>{user?.name ?? "Власник"}</strong>
                <p className="text-muted">Контактний номер користувача</p>
              </div>
              <div className="field">
                <label className="label" htmlFor="listing-phone">
                  Номер телефону
                </label>
                <div className="phone-save-row">
                  <input
                    id="listing-phone"
                    className="input"
                    type="tel"
                    value={phone}
                    onChange={(event) => {
                      setPhone(event.target.value);
                      setPhoneSaved(false);
                    }}
                    placeholder="+380 67 123 45 67"
                  />
                  <button
                    className="btn btn--outline"
                    type="button"
                    onClick={savePhone}
                    disabled={phoneSaving}
                  >
                    {phoneSaving
                      ? "Збереження..."
                      : phoneSaved
                        ? "Збережено ✓"
                        : "Зберегти"}
                  </button>
                </div>
                {phoneSaved ? (
                  <span className="text-muted">
                    Номер збережено в профілі та буде доступний в оголошенні
                  </span>
                ) : null}
              </div>
              <div className="checkbox-list checkbox-list--grid">
                {["phone", "viber", "telegram", "whatsapp"].map((method) => (
                  <label key={method}>
                    <input
                      checked={form.contactMethods.includes(method)}
                      onChange={() =>
                        toggleArray(
                          method,
                          (value) => update("contactMethods", value),
                          form.contactMethods,
                        )
                      }
                      type="checkbox"
                    />{" "}
                    {method}
                  </label>
                ))}
              </div>
              <div className="card card--flat info-card">
                <h3>{form.title || suggestedTitle}</h3>
                <p className="text-muted">
                  {form.district}, {form.street} {form.houseNumber}
                </p>
                <p>
                  {form.rooms} кімн., {form.area} м², {form.floor}/
                  {form.totalFloors} поверх, ₴ {form.price || "0"} / міс
                </p>
              </div>
              <button
                className="btn btn--primary btn--full btn--lg"
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Публікуємо..." : "Опублікувати оголошення"}
              </button>
            </section>
          ) : null}

          <div className="flex-between">
            <button
              className="btn btn--outline"
              type="button"
              disabled={step === 1}
              onClick={() => setStep((value) => Math.max(1, value - 1))}
            >
              Назад
            </button>
            {step < 4 ? (
              <button
                className="btn btn--primary"
                type="button"
                onClick={() => setStep((value) => Math.min(4, value + 1))}
              >
                Далі
              </button>
            ) : null}
          </div>
        </form>
      </section>

      {submitState === "error" ? (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,.5)",
            zIndex: 500,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 32,
              maxWidth: 400,
              width: "90%",
            }}
          >
            <div
              style={{ fontSize: 48, textAlign: "center", marginBottom: 16 }}
            >
              ❌
            </div>
            <h3 style={{ textAlign: "center", marginBottom: 8 }}>
              Помилка публікації
            </h3>
            <p
              style={{
                color: "#6B7280",
                textAlign: "center",
                marginBottom: 20,
              }}
            >
              {errorMessage}
            </p>
            <button
              className="btn btn--primary btn--full"
              onClick={() => setSubmitState("idle")}
              type="button"
            >
              Спробувати знову
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
