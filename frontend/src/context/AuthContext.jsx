import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('elite_gym_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('elite_gym_token') || null);
  const [loading, setLoading] = useState(true);

  // Initialize and verify user session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('elite_gym_token');
      if (storedToken) {
        try {
          const res = await authService.getCurrentUser();
          if (res && res.data) {
            setUser(res.data);
            localStorage.setItem('elite_gym_user', JSON.stringify(res.data));
          }
        } catch (err) {
          console.error('Session expired or invalid:', err);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const handleAuthSuccess = (authResponse) => {
    const { accessToken, user: userData } = authResponse;
    setToken(accessToken);
    setUser(userData);
    localStorage.setItem('elite_gym_token', accessToken);
    localStorage.setItem('elite_gym_user', JSON.stringify(userData));
    return userData;
  };

  const login = async (usernameOrEmail, password) => {
    const res = await authService.login({ usernameOrEmail, password });
    if (res.success && res.data) {
      return handleAuthSuccess(res.data);
    }
    throw new Error(res.message || 'Login failed');
  };

  const registerStudent = async (studentData) => {
    const res = await authService.registerStudent(studentData);
    if (res.success && res.data) {
      return handleAuthSuccess(res.data);
    }
    throw new Error(res.message || 'Registration failed');
  };

  const registerWithPlan = async (purchaseData) => {
    const res = await authService.registerWithPlan(purchaseData);
    if (res.success && res.data) {
      return handleAuthSuccess(res.data);
    }
    throw new Error(res.message || 'Plan enrollment failed');
  };

  const registerTrainer = async (trainerData) => {
    const res = await authService.registerTrainer(trainerData);
    if (res.success && res.data) {
      return handleAuthSuccess(res.data);
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = async () => {
    await authService.logout();
    setToken(null);
    setUser(null);
    localStorage.removeItem('elite_gym_token');
    localStorage.removeItem('elite_gym_user');
  };

  const value = {
    user,
    token,
    role: user?.role || null,
    isAuthenticated: !!token && !!user,
    loading,
    login,
    registerStudent,
    registerWithPlan,
    registerTrainer,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
