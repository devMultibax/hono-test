import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  csrfToken: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;

  setUser: (user: User | null) => void;
  setCsrfToken: (token: string) => void;
  updateUser: (data: Partial<User>) => void;
  logout: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      csrfToken: null,
      isAuthenticated: false,
      isHydrated: false,

      setUser: (user) => set({
        user,
        isAuthenticated: !!user
      }),

      setCsrfToken: (csrfToken) => set({ csrfToken }),

      updateUser: (data) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...data } });
        }
      },

      logout: () => set({
        user: null,
        csrfToken: null,
        isAuthenticated: false
      }),

      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);

export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useIsAdmin = () => useAuthStore((state) => state.user?.role === 'ADMIN');
