import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  });

  const { data: user, isLoading, error, refetch } = trpc.auth.me.useQuery(undefined, {
    enabled: !!token,
  });

  const isAuthenticated = !!user && !!token;

  const login = (newToken: string) => {
    localStorage.setItem('auth_token', newToken);
    setToken(newToken);
    refetch();
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setToken(null);
    window.location.href = '/';
  };

  return {
    user,
    loading: isLoading,
    error,
    isAuthenticated,
    token,
    login,
    logout,
  };
}
