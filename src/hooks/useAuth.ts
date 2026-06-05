"use client";

import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { Subscription, User } from "@/types";

type AuthContextValue = {
  user: User | null;
  subscription: Subscription | null;
  isPaid: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type MeResponse =
  | {
      success: true;
      data: {
        user: User;
        subscription: Subscription | null;
        isPaid: boolean;
      };
    }
  | {
      success: false;
      error: string;
    };

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      const payload = (await response.json()) as MeResponse;
      if (payload.success) {
        setUser(payload.data.user);
        setSubscription(payload.data.subscription);
        setIsPaid(payload.data.isPaid);
      } else {
        setUser(null);
        setSubscription(null);
        setIsPaid(false);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    setSubscription(null);
    setIsPaid(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({ user, subscription, isPaid, loading, refresh, logout }),
    [user, subscription, isPaid, loading, refresh, logout],
  );

  return createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
