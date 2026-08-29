/**
 * AzProjects - useAuth Hook
 * خطاف إدارة حالة المصادقة والصلاحيات
 */
import { useState, useEffect, useCallback } from 'react';
import { AuthService } from '../services/authService';
import { AuthUser, LoginCredentials, RegisterCredentials } from '../types/auth';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const currentUser = await AuthService.getCurrentUser();
      setUser(currentUser);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError(null);
    const { user: loggedInUser, error: loginError } = await AuthService.signIn(credentials);
    if (loginError) {
      setError(loginError);
      setIsLoading(false);
      return false;
    }
    setUser(loggedInUser);
    setIsLoading(false);
    return true;
  };

  const register = async (credentials: RegisterCredentials) => {
    setIsLoading(true);
    setError(null);
    const { user: newUser, error: regError } = await AuthService.signUp(credentials);
    if (regError) {
      setError(regError);
      setIsLoading(false);
      return false;
    }
    setUser(newUser);
    setIsLoading(false);
    return true;
  };

  const logout = async () => {
    setIsLoading(true);
    await AuthService.signOut();
    setUser(null);
    setIsLoading(false);
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    register,
    logout,
    refreshSession: checkSession,
  };
}
