import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ROLE_ID, type RoleId } from '@/constants/roleConstants';
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

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setCsrfToken: (csrfToken) => set({ csrfToken }),
      updateUser: (data) => {
        const user = get().user;
        if (user) set({ user: { ...user, ...data } });
      },
      logout: () => set({ user: null, csrfToken: null, isAuthenticated: false }),
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated, csrfToken: s.csrfToken }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    }
  )
);

export const useUser = () => useAuthStore((s) => s.user);
export const useIsAuthenticated = () => useAuthStore((s) => s.isAuthenticated);
export const useUserRole = (): RoleId => useAuthStore((s) => s.user?.role ?? ROLE_ID.USER);
