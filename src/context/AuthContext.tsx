import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { AuthUser, AuthDog } from "../api/auth";
import { getMe } from "../api/auth";

interface AuthContextType {
  user:      AuthUser | null;
  dog:       AuthDog  | null;
  token:     string   | null;
  isLoading: boolean;
  login:     (token: string, user: AuthUser, dog: AuthDog) => void;
  logout:    () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user,      setUser]      = useState<AuthUser | null>(null);
  const [dog,       setDog]       = useState<AuthDog  | null>(null);
  const [token,     setToken]     = useState<string   | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("bb_token");
    if (!stored) { setIsLoading(false); return; }

    getMe(stored)
      .then(({ user, dog }) => {
        setToken(stored);
        setUser(user);
        setDog(dog);
      })
      .catch(() => localStorage.removeItem("bb_token"))
      .finally(() => setIsLoading(false));
  }, []);

  const login = (newToken: string, newUser: AuthUser, newDog: AuthDog) => {
    localStorage.setItem("bb_token", newToken);
    setToken(newToken);
    setUser(newUser);
    setDog(newDog);
  };

  const logout = () => {
    localStorage.removeItem("bb_token");
    setToken(null);
    setUser(null);
    setDog(null);
  };

  return (
    <AuthContext.Provider value={{ user, dog, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};