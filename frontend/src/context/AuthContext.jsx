import { createContext, useContext, useEffect, useState } from "react";
import { authApi, setAuthToken } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("eb_token");
    if (!token) {
      setReady(true);
      return;
    }
    setAuthToken(token);
    authApi
      .me()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem("eb_token");
        setAuthToken(null);
      })
      .finally(() => setReady(true));
  }, []);

  async function login(email, password) {
    const { user, token } = await authApi.login({ email, password });
    localStorage.setItem("eb_token", token);
    setAuthToken(token);
    setUser(user);
    return user;
  }

  async function register(payload) {
    const { user, token } = await authApi.register(payload);
    localStorage.setItem("eb_token", token);
    setAuthToken(token);
    setUser(user);
    return user;
  }

  async function logout() {
    try {
      await authApi.logout();
    } catch {
      // ignore network errors on logout
    }
    localStorage.removeItem("eb_token");
    setAuthToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, ready, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
