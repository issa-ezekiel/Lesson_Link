import { useState, useEffect } from 'react';
import { AuthService } from '@/lib/auth';
import type { User, LoginRequest } from '@shared/schema';

interface AuthState {
  user: Omit<User, 'password'> | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const user = await AuthService.getCurrentUser();
      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: !!user,
      });
    } catch (error) {
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
    }
  };

  const login = async (credentials: LoginRequest) => {
    const { user } = await AuthService.login(credentials);
    setAuthState({
      user,
      isLoading: false,
      isAuthenticated: true,
    });
    return user;
  };

  const logout = async () => {
    await AuthService.logout();
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
    });
  };

  return {
    ...authState,
    login,
    logout,
    checkAuth,
  };
}
