"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { Logo } from "@/components/ui/Logo";

function NavLink({ href, children, pill = false }: { href: string; children: React.ReactNode; pill?: boolean }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      className={pill ? "nav-link nav-link--pill" : "nav-link"}
      href={href}
      style={active ? { borderBottom: "2px solid #1A6FD4", color: "#1A6FD4" } : undefined}
    >
      {children}
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const { user, isPaid, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const canCreate = user?.role === "OWNER" || user?.role === "ADMIN";

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="navbar">
      <div className="container navbar__inner">
        <div className="logo-wrap">
          <Logo />
          <span className="city-chip">Вінниця</span>
        </div>

        <nav className="nav-links" aria-label="Основна навігація">
          <NavLink href="/listings">Оголошення</NavLink>
          {canCreate ? (
            <NavLink href="/create-listing" pill>
              + Додати оголошення
            </NavLink>
          ) : null}
          {user?.role === "ADMIN" ? <NavLink href="/admin">Адмін</NavLink> : null}
        </nav>

        <div className="nav-actions">
          <button className="theme-toggle" type="button" onClick={toggle} title="Змінити тему">
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          {user ? (
            <>
              {isPaid ? (
                <span className="badge badge--amber">Premium</span>
              ) : (
                <Link className="btn btn--outline btn--sm hide-mobile" href="/subscription">
                  Преміум
                </Link>
              )}
              <div ref={menuRef} className="avatar-menu-wrap">
                <button className="avatar-button" type="button" onClick={() => setMenuOpen((value) => !value)}>
                  {user.name.slice(0, 1).toUpperCase()}
                </button>
                {menuOpen ? (
                  <div className="user-menu navbar-dropdown">
                    <Link href="/dashboard">Мій кабінет</Link>
                    {canCreate ? <Link href="/create-listing">Додати оголошення</Link> : null}
                    <Link href="/subscription">Підписка</Link>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        void logout();
                      }}
                    >
                      Вийти
                    </button>
                  </div>
                ) : null}
              </div>
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
