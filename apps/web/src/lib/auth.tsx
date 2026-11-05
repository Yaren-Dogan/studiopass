import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, hasToken, setToken, setUnauthorizedHandler, type Role, type User } from "./api";
import { navigate } from "./router";

interface AuthState {
  user: User | null;
  loading: boolean;
  sessionExpired: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => void;
  can: (...roles: Role[]) => boolean;
}

const AuthContext = createContext<AuthState | null>(null);

export const ROLE_LABEL: Record<Role, string> = { owner: "Stüdyo sahibi", manager: "Yönetici", instructor: "Eğitmen" };
export const homeFor = (role: Role) => (role === "instructor" ? "/classes" : "/");

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(hasToken());
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    setUnauthorizedHandler(() => { setUser(null); setSessionExpired(true); navigate("/login", { replace: true }); });
    if (!hasToken()) return;
    api.me().then((r) => setUser(r.user)).catch(() => setToken(null)).finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const r = await api.login(email, password);
    setToken(r.token);
    setUser(r.user);
    setSessionExpired(false);
    return r.user;
  }, []);

  const logout = useCallback(() => { setToken(null); setUser(null); navigate("/login", { replace: true }); }, []);
  const can = useCallback((...roles: Role[]) => !!user && roles.includes(user.role), [user]);

  const value = useMemo(() => ({ user, loading, sessionExpired, login, logout, can }), [user, loading, sessionExpired, login, logout, can]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth, AuthProvider içinde kullanılmalı");
  return ctx;
}
