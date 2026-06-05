import type { Metadata } from "next";
import { AuthProvider } from "@/hooks/useAuth";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "FlatRent — Оренда квартир без посередників у Вінниці",
  description: "Знайди квартиру напряму від власника. Без ріелторів, без комісій.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uk">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
