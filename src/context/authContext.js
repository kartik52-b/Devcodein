import { createContext, useContext } from 'react';

/**
 * Shared auth context. Both providers (Supabase and the legacy Express API)
 * publish the same shape here, so every `useAuth()` consumer keeps working
 * regardless of which backend is configured.
 */
export const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return context;
}
