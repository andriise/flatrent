"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

const items = [
  { href: "/listings", icon: "🏠", label: "Оголошення" },
  { href: "/create-listing", icon: "➕", label: "Додати" },
  { href: "/dashboard", icon: "👤", label: "Кабінет" },
  { href: "/subscription", icon: "⭐", label: "Преміум" },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <nav className="mobile-bottom-nav" aria-label="Мобільна навігація">
      {items.map((item) => (
        <Link className={pathname.startsWith(item.href) ? "is-active" : ""} href={item.href} key={item.href}>
          <span>{item.icon}</span>
          <span>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}
