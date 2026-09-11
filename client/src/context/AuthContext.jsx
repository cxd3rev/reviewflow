import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, getToken, setToken } from "../lib/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [entitlement, setEntitlement] = useState(null);
  const [billing, setBilling] = useState(null);
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
  }, []);

  async function loginWithPayload(data) {
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
  }

  function logout() {
    setToken(null);
    setUser(null);
    setBusiness(null);
    setEntitlement(null);
    setBilling(null);
  }

  const value = useMemo(
    () => ({ user, business, entitlement, billing, loading, refresh, loginWithPayload, logout, setBusiness }),
    [user, business, entitlement, billing, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
