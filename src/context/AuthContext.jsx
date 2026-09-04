import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);
const STORAGE_KEY = "solespace_auth_v1";

// Frontend-only mock auth. In production this calls POST /api/auth/login etc.
// and stores a JWT access token in memory with a refresh-token cookie.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  const login = (email) => {
    setUser({
      name: email.split("@")[0].replace(/[._]/g, " "),
      email,
      role: email.includes("admin") ? "admin" : "customer",
      addresses: [],
      loyaltyPoints: 240,
    });
    return { ok: true };
  };

  const register = (name, email) => {
    setUser({ name, email, role: "customer", addresses: [], loyaltyPoints: 0 });
    return { ok: true };
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
