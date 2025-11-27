'use client';

import { useSession } from '@gemfolio/auth/client';
import { useRouter } from 'next/navigation';
import { createContext, type ReactNode, useContext, useEffect } from 'react';

interface AuthContextValue {
  user: ReturnType<typeof useSession>['data'];
  isLoading: boolean;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
  requireAuth?: boolean;
}

export function AuthProvider({ children, requireAuth = false }: AuthProviderProps) {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const isAuthenticated = !!session?.user;

  useEffect(() => {
    if (requireAuth && !isPending && !isAuthenticated) {
      router.push('/login');
    }
  }, [requireAuth, isPending, isAuthenticated, router]);

  if (requireAuth && isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (requireAuth && !isAuthenticated) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user: session, isLoading: isPending, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
