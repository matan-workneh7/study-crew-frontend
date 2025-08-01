import React, { createContext, useContext, useState, useEffect } from "react";

export type UserRole = "assistant" | "user" | null;

interface AuthContextType {
  user: any | null;
  role: UserRole;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Optionally restore session from localStorage or cookie
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedRole = localStorage.getItem("role");
    if (storedUser && storedRole) {
      setUser(JSON.parse(storedUser));
      setRole(storedRole as UserRole);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // for session cookie
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Login failed");
      }
      const data = await res.json();
      setUser(data.user);
      setRole(data.user.role); // expects user.role in response
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("role", data.user.role);
      setLoading(false);
      return true;
    } catch (err: any) {
      setError(err.message || "Login failed");
      setLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    // Optionally: call /logout endpoint
  };

  return (
    <AuthContext.Provider value={{ user, role, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
