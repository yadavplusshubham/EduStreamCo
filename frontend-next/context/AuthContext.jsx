'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, restore admin session from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('edustream_admin');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      localStorage.removeItem('edustream_admin');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Called by AdminPage after a successful POST /api/auth/admin/login
  const loginAdmin = useCallback((userData) => {
    setUser(userData);
    localStorage.setItem('edustream_admin', JSON.stringify(userData));
  }, []);

  const logout = useCallback(async () => {
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
    try {
      await fetch(`${BACKEND_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // ignore network errors on logout
    } finally {
      setUser(null);
      localStorage.removeItem('edustream_admin');
    }
  }, []);

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    loginAdmin,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
