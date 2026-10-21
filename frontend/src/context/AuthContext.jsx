import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('apm_token') || null);
  const [loading, setLoading] = useState(true);

  // Load user on mount if token exists
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('apm_token');
      if (storedToken) {
        try {
          const res = await apiService.getMe();
          if (res.user) {
            setUser(res.user);
          } else {
            logout();
          }
        } catch (err) {
          console.error('Session verification failed:', err);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password, portalRole) => {
    const res = await apiService.login(email, password, portalRole);
    if (res.token && res.user) {
      localStorage.setItem('apm_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
  };

  const register = async (name, email, password, role) => {
    const res = await apiService.register(name, email, password, role);
    if (res.token && res.user) {
      localStorage.setItem('apm_token', res.token);
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
  };

  const logout = () => {
    localStorage.removeItem('apm_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isDeveloper: user?.role === 'developer',
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
