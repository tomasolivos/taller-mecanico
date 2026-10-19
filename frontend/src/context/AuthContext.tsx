import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, LoginRequest, UserRole } from '../types/auth';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isMecanico: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setToken(null);
  }, []);

  // Inicialización: recuperar sesión si aún es válida
  useEffect(() => {
    const storedToken = authService.getToken();
    const storedUser = authService.getCurrentUser();

    if (storedToken && storedUser && !authService.isTokenExpired(storedToken)) {
      setToken(storedToken);
      setUser(storedUser);
    } else {
      logout();
    }
    setIsLoading(false);
  }, [logout]);

  // Manejo de expiración de token capturada por el interceptor HTTP
  useEffect(() => {
    const handleExpired = () => {
      logout();
    };

    window.addEventListener('auth:expired', handleExpired);
    return () => {
      window.removeEventListener('auth:expired', handleExpired);
    };
  }, [logout]);

  // Chequeo periódico de expiración del token cada 15 segundos
  useEffect(() => {
    if (!token) return;

    const interval = setInterval(() => {
      if (authService.isTokenExpired(token)) {
        logout();
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [token, logout]);

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      setToken(response.token);
      setUser(response.usuario);
    } finally {
      setIsLoading(false);
    }
  };

  const role: UserRole | undefined = user?.rol;
  const isAuthenticated = !!token && !!user && !authService.isTokenExpired(token);
  const isAdmin = role === 'Admin';
  const isMecanico = role === 'Mecanico';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        isMecanico,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};

