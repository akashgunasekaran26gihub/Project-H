import React, { createContext, useContext, useState } from 'react';
import { DEFAULT_USER } from '../services/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user] = useState(DEFAULT_USER);

  return (
    <AuthContext.Provider
      value={{
        user,
        token: 'active',
        loading: false,
        isAuthenticated: true,
        login: async () => DEFAULT_USER,
        register: async () => DEFAULT_USER,
        logout: () => {},
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  return (
    context || {
      user: DEFAULT_USER,
      token: 'active',
      loading: false,
      isAuthenticated: true,
      login: async () => DEFAULT_USER,
      register: async () => DEFAULT_USER,
      logout: () => {},
    }
  );
};

export default AuthContext;
