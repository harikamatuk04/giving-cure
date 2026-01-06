import React, { createContext, useState, useContext, useEffect } from "react";
import api, { deleteAccount as deleteAccountAPI } from "../api/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Set token in axios headers
  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      // Fetch user info
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await api.get("/auth/me");
      setUser(response.data.user);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      // Token might be invalid, clear it
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email, password) => {
    try {
      const response = await api.post("/auth/signin", { email, password });
      const { token: newToken, user: userData } = response.data;
      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser(userData);
      api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Sign in failed",
      };
    }
  };

  const signOut = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    delete api.defaults.headers.common["Authorization"];
  };

  const deleteAccount = async () => {
    try {
      await deleteAccountAPI();
      signOut(); // Sign out after deleting account
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || "Failed to delete account",
      };
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signOut,
    deleteAccount,
    isAuthenticated: !!user,
    isRUSH: user?.hospital === "RUSH",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

