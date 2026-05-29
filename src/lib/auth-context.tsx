"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { auth as authApi, users, getAccessToken, clearTokens, setTokens, type UserData, type UsageData } from "./api";

interface AuthState {
  user: UserData | null;
  usage: UsageData | null;
  loading: boolean;
  login: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  refreshUsage: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  usage: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
  refreshUsage: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setUser(null);
      setUsage(null);
      setLoading(false);
      return;
    }
    try {
      const res = await users.me();
      if (res.success) {
        setUser(res.data);
        const usageRes = await users.usage();
        if (usageRes.success) setUsage(usageRes.data);
      } else {
        clearTokens();
        setUser(null);
      }
    } catch {
      clearTokens();
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = useCallback(async (accessToken: string, refreshToken: string) => {
    setTokens(accessToken, refreshToken);
    await fetchUser();
  }, [fetchUser]);

  const logout = useCallback(async () => {
    const rt = localStorage.getItem("refresh_token");
    if (rt) {
      try { await authApi.logout(rt); } catch {}
    }
    clearTokens();
    setUser(null);
    setUsage(null);
  }, []);

  const refreshUsage = useCallback(async () => {
    try {
      const res = await users.usage();
      if (res.success) setUsage(res.data);
    } catch {}
  }, []);

  return (
    <AuthContext.Provider value={{ user, usage, loading, login, logout, refreshUser: fetchUser, refreshUsage }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
