"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { auth } from "@/lib/api/endpoints";
import { ApiError, getStoredToken, setStoredToken } from "@/lib/api/client";
import type { ApiUser } from "@/lib/api/types";

type AuthState = {
  user: ApiUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<ApiUser>;
  register: (data: { email: string; name: string; password: string }) => Promise<ApiUser>;
  logout: () => void;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { user } = await auth.me();
      setUser(user);
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        setStoredToken(null);
      }
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Standard "fetch on mount" pattern. The setState inside refresh() runs after
  // an await, not synchronously, but the lint rule is conservative.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  const login = useCallback(
    async (email: string, password: string): Promise<ApiUser> => {
      const res = await auth.login({ email, password });
      setStoredToken(res.access_token);
      setUser(res.user);
      return res.user;
    },
    [],
  );

  const register = useCallback(
    async (data: { email: string; name: string; password: string }): Promise<ApiUser> => {
      const res = await auth.register(data);
      setStoredToken(res.access_token);
      setUser(res.user);
      return res.user;
    },
    [],
  );

  const logout = useCallback(() => {
    setStoredToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
