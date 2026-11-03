import React, { createContext, useContext, useState } from 'react';
import { DEFAULT_USER } from '../services/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Always authenticated - login requirement removed
  const [user, setUser] = useState(DEFAULT_USER);
  const [token] = useState('active-session');
  const [loading] = useState(false);

  const login = async (email) => {
    const updated = { ...DEFAULT_USER, email: email || DEFAULT_USER.email };
    setUser(updated);
    return updated;
  };

  const register = async (name, email) => {
    const updated = {
      ...DEFAULT_USER,
      name: name || DEFAULT_USER.name,
      email: email || DEFAULT_USER.email,
    };
    setUser(updated);
    return updated;
  };

  const logout = () => {
    // Keep user state accessible with clean guest identity
    setUser(DEFAULT_USER);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: true, // Always true to bypass auth barrier
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
