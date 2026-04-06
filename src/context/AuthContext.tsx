import { createContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { User, UserRole } from '../types/User';
import type { LoginRequest } from '../types/Auth';
import { login as loginRequest, getMyProfile } from '../services/authService';
import {
  clearAuthSession,
  getAuthSession,
  saveAuthSession,
} from '../utils/storage';

interface AuthContextType {
  user: User | null;
  token: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  role: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  logout: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const savedSession = getAuthSession();

      if (!savedSession) {
        setIsLoading(false);
        return;
      }

      try {
        const profile = await getMyProfile(savedSession.token);

        setToken(savedSession.token);
        setRole(savedSession.role);
        setUser(profile);
      } catch (error) {
        clearAuthSession();
        setToken(null);
        setRole(null);
        setUser(null);
        console.error('Error restoring auth session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    restoreSession();
  }, []);

  const login = async (credentials: LoginRequest) => {
    const authResponse = await loginRequest(credentials);
    const profile = await getMyProfile(authResponse.token);

    saveAuthSession({
      token: authResponse.token,
      role: authResponse.role,
    });

    setToken(authResponse.token);
    setRole(authResponse.role);
    setUser(profile);
  };

  const logout = () => {
    clearAuthSession();
    setToken(null);
    setRole(null);
    setUser(null);
  };

  const contextValue = useMemo(
    () => ({
      user,
      token,
      role,
      isAuthenticated: !!token,
      isLoading,
      login,
      logout,
    }),
    [user, token, role, isLoading]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}