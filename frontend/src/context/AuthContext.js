import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';

const AuthContext = createContext(null);

const TOKEN_STORAGE_KEY = 'tldr_auth_token';
const USER_STORAGE_KEY = 'tldr_auth_user';

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem(USER_STORAGE_KEY);
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      if (token && !user) {
        try {
          const response = await authService.getCurrentUser(token);
          setUser(response.data);
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.data));
        } catch (error) {
          clearSession();
        }
      }
      setLoading(false);
    };

    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clearSession = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    setToken(null);
    setUser(null);
  };

  const handleAuthSuccess = (data) => {
    const { token: newToken, user: userInfo } = data;
    localStorage.setItem(TOKEN_STORAGE_KEY, newToken);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userInfo));
    setToken(newToken);
    setUser(userInfo);
    setAuthError(null);
  };

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      handleAuthSuccess(response.data);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Unable to sign in with provided credentials.';
      setAuthError(message);
      throw error;
    }
  };

  const signup = async (payload) => {
    try {
      const response = await authService.signup(payload);
      handleAuthSuccess(response.data);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Unable to create account. Please try again.';
      setAuthError(message);
      throw error;
    }
  };

  const logout = () => {
    clearSession();
    navigate('/', { replace: true });
  };

  const requestPasswordReset = async (payload) => {
    try {
      await authService.requestPasswordReset(payload);
      setAuthError(null);
    } catch (error) {
      const message = error.response?.data?.message || 'Unable to process password reset request.';
      setAuthError(message);
      throw error;
    }
  };

  const resetPassword = async (payload) => {
    try {
      await authService.resetPassword(payload);
      setAuthError(null);
    } catch (error) {
      const message = error.response?.data?.message || 'Unable to reset password. Please try again.';
      setAuthError(message);
      throw error;
    }
  };

  const value = useMemo(() => ({
    token,
    user,
    loading,
    authError,
    login,
    signup,
    logout,
    requestPasswordReset,
    resetPassword,
    clearSession
  }), [token, user, loading, authError]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


