import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Session } from '@supabase/supabase-js';

interface AuthState {
  session: Session | null;
  signIn: (session: Session) => void;
  signOut: () => void;
  isAdmin: () => boolean;
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      session: null,
      signIn: (session) => set({ session }),
      signOut: () => set({ session: null }),
      isAdmin: () => {
        const session = get().session;
        return session?.user?.user_metadata?.role === 'admin';
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);