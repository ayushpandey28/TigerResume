'use client';
import { createContext, useState, useEffect } from 'react';
import { getToken, setToken, removeToken } from '../lib/auth';
import { getUserProfile, loginUser, signupUser } from '../lib/api';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await getUserProfile();
      setUser(res.data.user);
    } catch {
      removeToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await loginUser(email, password);
    setToken(res.data.token);
    setUser(res.data.user);
    return res;
  };

  const signup = async (name, email, password) => {
    const res = await signupUser(name, email, password);
    setToken(res.data.token);
    setUser(res.data.user);
    return res;
  };

  const logout = () => {
    removeToken();
    setUser(null);
    if (typeof window !== 'undefined') {
      window.location.href = '/sign-in';
    }
  };

  const updateUser = (updatedUserData) => {
    setUser(updatedUserData);
  };

  return (
    <AuthContext.Provider value={{ user, setUser: updateUser, loading, login, signup, logout, checkAuth, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}


