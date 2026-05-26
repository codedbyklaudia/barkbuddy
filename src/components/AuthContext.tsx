import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface DogProfile {
  id?: string;
  name?: string;
  breed?: string;
  avatar?: string;
  [key: string]: any;
}

interface User {
  id?: string;
  name?: string;
  email?: string;
  avatar?: string;
  [key: string]: any;
}

interface AuthContextType {
  user:            User | null;
  dog:             DogProfile | null;
  token:           string | null;
  isAuthenticated: boolean;
  login:           (token: string, user: User, dog?: DogProfile) => void;
  logout:          () => void;
  updateUser:      (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'barkbuddy_token';
const USER_KEY  = 'barkbuddy_user';
const DOG_KEY   = 'barkbuddy_dog';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialise from localStorage so state survives refresh
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [user,  setUser]  = useState<User | null>(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY) || 'null'); } catch { return null; }
  });
  const [dog,   setDog]   = useState<DogProfile | null>(() => {
    try { return JSON.parse(localStorage.getItem(DOG_KEY) || 'null'); } catch { return null; }
  });

  // Sync to localStorage whenever state changes
  useEffect(() => {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else        localStorage.removeItem(TOKEN_KEY);
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else       localStorage.removeItem(USER_KEY);
  }, [user]);

  useEffect(() => {
    if (dog) localStorage.setItem(DOG_KEY, JSON.stringify(dog));
    else      localStorage.removeItem(DOG_KEY);
  }, [dog]);

  const login = (newToken: string, newUser: User, newDog?: DogProfile) => {
    setToken(newToken);
    setUser(newUser);
    setDog(newDog ?? null);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setDog(null);
  };

  const updateUser = (updates: Partial<User>) => {
    setUser((prev) => prev ? { ...prev, ...updates } : null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      dog,
      token,
      isAuthenticated: !!token,
      login,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
};

export default AuthContext;