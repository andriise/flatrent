"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export function Navbar() {
  const { user, isPaid, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const canCreate = user?.role === "OWNER" || user?.role === "ADMIN";

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <Link className="logo" href="/">
          <span className="logo__mark">F</span>
          <span>FlatRent</span>
          <span className="city-chip">Вінниця</span>
        </Link>

        <nav className="nav-links">
          <Link href="/listings">Оголошення</Link>
          {canCreate ? <Link href="/create-listing">+ Додати</Link> : null}
          {user?.role === "ADMIN" ? <Link href="/admin">Адмін</Link> : null}
        </nav>

        <div className="nav-actions">
          {user ? (
            <>
              {isPaid ? (
                <span className="badge badge--amber">Premium</span>
              ) : (
                <Link className="btn btn--outline btn--sm hide-mobile" href="/subscription">
                  Преміум
                </Link>
              )}
              <button className="avatar-button" type="button" onClick={() => setOpen((value) => !value)}>
                {user.name.slice(0, 1).toUpperCase()}
              </button>
              {open ? (
                <div className="user-menu">
                  <Link href="/dashboard">Мій кабінет</Link>
                  {canCreate ? <Link href="/create-listing">Додати оголошення</Link> : null}
                  <Link href="/subscription">Підписка</Link>
                  <button
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      void logout();
                    }}
                  >
                    Вийти
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            <>
              <Link className="btn btn--outline btn--sm" href="/login">
                Увійти
              </Link>
              <Link className="btn btn--primary btn--sm hide-mobile" href="/register">
                Реєстрація
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
