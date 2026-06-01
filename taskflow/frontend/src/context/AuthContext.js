// src/context/AuthContext.js
// React Context: Global state management karne ka tarika
// Authentication state (user, token) ko poori app mein share karte hain
// Context use karo taki har component ko props se data pass na karna pade

import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

// Context banao - ye ek "global store" jaisa hai
const AuthContext = createContext(null);

// ─────────────────────────────────────────
//  AuthProvider Component
// ─────────────────────────────────────────
// Ye component poori app ko wrap karta hai
// Iske andar sab components ko user state access milti hai

export function AuthProvider({ children }) {
  // user state: null = logged out, object = logged in user
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // initial check ke liye

  // App start hone par check karo ki user pehle se logged in tha ya nahi
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Backend se current user ki info lao (token verify bhi ho jayega)
          const response = await authAPI.getMe();
          setUser(response.data);
        } catch (error) {
          // Token invalid hai - clear karo
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      
      setLoading(false); // check ho gaya
    };
    
    checkAuth();
  }, []);

  // ─── Login Function ───
  const login = async (email, password) => {
    const response = await authAPI.login({ email, password });
    const { access_token, user: userData } = response.data;
    
    // Token aur user data localStorage mein save karo
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(userData));
    
    setUser(userData); // global state update karo
    return userData;
  };

  // ─── Register Function ───
  const register = async (name, email, password) => {
    const response = await authAPI.register({ name, email, password });
    return response.data;
  };

  // ─── Logout Function ───
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null); // global state clear karo
  };

  // ye value saare child components ko milegi
  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isLoggedIn: !!user,       // true/false
    isAdmin: user?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ─────────────────────────────────────────
//  Custom Hook - useAuth
// ─────────────────────────────────────────
// Har component mein AuthContext access karne ka easy tarika
// Usage: const { user, login, logout } = useAuth();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
