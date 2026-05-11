import React, { createContext, useContext, useState, useEffect } from "react";
import { authApi } from "../api/api.js";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authApi.getCurrentUser();
        setUser(response.data.data);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const onSessionExpired = () => {
      // Only clear user if they were actually logged in
      setUser((prev) => (prev ? null : prev));
    };
    window.addEventListener('auth:sessionExpired', onSessionExpired);
    return () => window.removeEventListener('auth:sessionExpired', onSessionExpired);
  }, []);

  const login = async (credentials) => {
    const response = await authApi.login(credentials);
    setUser(response.data?.data?.loggedInUser ?? null);
    return response.data;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  };

  const updateUser = async () => {
    try {
      const response = await authApi.getCurrentUser();
      setUser(response.data.data);
      return response.data.data;
    } catch (err) {
      console.error('Failed to refresh user data:', err);
      throw err;
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
