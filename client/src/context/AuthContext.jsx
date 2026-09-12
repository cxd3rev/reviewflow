import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, getToken, setToken } from "../lib/api.js";
import {
  ensureSupabaseSession,
  getSupabaseUser,
  pingSupabase,
  signOutSupabase,
  supabase,
} from "../lib/supabase.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [entitlement, setEntitlement] = useState(null);
  const [billing, setBilling] = useState(null);
  const [supabaseUser, setSupabaseUser] = useState(null);
  const [supabaseAuthError, setSupabaseAuthError] = useState("");
  const [loading, setLoading] = useState(true);

  async function refresh() {
    if (!getToken()) {
      setUser(null);
      setBusiness(null);
      setEntitlement(null);
      setBilling(null);
      setLoading(false);
      return;
    }
    try {
      const data = await api("/api/auth/me");
      setUser(data.user);
      setBusiness(data.business);
      setEntitlement(data.entitlement);
      setBilling(data.billing || null);
    } catch {
      setToken(null);
      setUser(null);
      setBusiness(null);
      setEntitlement(null);
      setBilling(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    getSupabaseUser().then((next) => setSupabaseUser(next));
    pingSupabase().then((result) => {
      if (result.configured && !result.ok) {
        console.error("Supabase:", result.error);
      }
    });
    if (!supabase) return undefined;
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function loginWithPayload(data, credentials) {
    setToken(data.token);
    setUser(data.user);
    setBusiness(data.business);
    try {
      const me = await api("/api/auth/me");
      setUser(me.user);
      setBusiness(me.business);
      setEntitlement(me.entitlement);
      setBilling(me.billing || null);
    } catch {
      setEntitlement(null);
    }

    if (credentials?.email && credentials?.password) {
      const result = await ensureSupabaseSession(credentials.email, credentials.password);
      if (result.ok) {
        setSupabaseUser(result.user);
        setSupabaseAuthError("");
      } else {
        setSupabaseUser(null);
        setSupabaseAuthError(result.error);
      }
    }
  }

  async function logout() {
    setToken(null);
    setUser(null);
    setBusiness(null);
    setEntitlement(null);
    setBilling(null);
    setSupabaseUser(null);
    setSupabaseAuthError("");
    await signOutSupabase();
  }

  const value = useMemo(
    () => ({
      user,
      business,
      entitlement,
      billing,
      supabaseUser,
      supabaseAuthError,
      loading,
      refresh,
      loginWithPayload,
      logout,
      setBusiness,
    }),
    [user, business, entitlement, billing, supabaseUser, supabaseAuthError, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
