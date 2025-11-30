'use client';

import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return <>{children}</>;
}


