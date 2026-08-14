import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('grm_access_token');
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/auth/me/');
      setUser(data);
    } catch {
      localStorage.removeItem('grm_access_token');
      localStorage.removeItem('grm_refresh_token');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (username, password) => {
    const { data } = await api.post('/auth/login/', { username, password });
    localStorage.setItem('grm_access_token', data.access);
    localStorage.setItem('grm_refresh_token', data.refresh);
    await loadUser();
  };

  const register = async (payload) => {
    await api.post('/auth/register/', payload);
    await login(payload.username, payload.password);
  };

  const logout = () => {
    localStorage.removeItem('grm_access_token');
    localStorage.removeItem('grm_refresh_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
