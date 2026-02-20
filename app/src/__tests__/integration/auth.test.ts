import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { mockAdminUser } from '../mocks/fixtures';
import { renderHookWithProviders } from '../utils/renderWithProviders';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/auth.store';

const API_BASE = 'http://localhost:3000';

// Reset auth store state between tests to prevent leakage
function resetAuthStore() {
  useAuthStore.setState({
    user: null,
    csrfToken: null,
    isAuthenticated: false,
    isHydrated: true,
  });
}

describe('auth integration – useAuth', () => {
  beforeEach(() => {
    resetAuthStore();
    vi.clearAllMocks();
  });

  // ── login (success) ─────────────────────────────────────────────────────────
  describe('login – success', () => {
    it('sets user in auth store after successful login', async () => {
      const { result } = renderHookWithProviders(() => useAuth(), { initialRoute: '/login' });

      await act(async () => {
        await result.current.login({ username: 'admin', password: 'password' });
      });

      const storeUser = useAuthStore.getState().user;
      expect(storeUser?.id).toBe(mockAdminUser.id);
      expect(storeUser?.username).toBe(mockAdminUser.username);
    });

    it('marks isAuthenticated as true after login', async () => {
      const { result } = renderHookWithProviders(() => useAuth(), { initialRoute: '/login' });

      await act(async () => {
        await result.current.login({ username: 'admin', password: 'password' });
      });

      expect(useAuthStore.getState().isAuthenticated).toBe(true);
    });

    it('returns isLoggingIn=false after login resolves', async () => {
      const { result } = renderHookWithProviders(() => useAuth(), { initialRoute: '/login' });

      await act(async () => {
        await result.current.login({ username: 'admin', password: 'password' });
      });

      expect(result.current.isLoggingIn).toBe(false);
    });

    it('exposes user from auth store after login', async () => {
      const { result } = renderHookWithProviders(() => useAuth(), { initialRoute: '/login' });

      await act(async () => {
        await result.current.login({ username: 'admin', password: 'password' });
      });

      expect(result.current.user?.username).toBe(mockAdminUser.username);
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  // ── login (failure) ─────────────────────────────────────────────────────────
  describe('login – failure', () => {
    it('sets loginError on 401 response', async () => {
      const { result } = renderHookWithProviders(() => useAuth(), { initialRoute: '/login' });

      await act(async () => {
        try {
          await result.current.login({ username: 'wrong', password: 'bad' });
        } catch {
          // expected
        }
      });

      expect(result.current.loginError).not.toBeNull();
    });

    it('returns isLoggingIn=false after failed login', async () => {
      const { result } = renderHookWithProviders(() => useAuth(), { initialRoute: '/login' });

      await act(async () => {
        try {
          await result.current.login({ username: 'wrong', password: 'bad' });
        } catch {
          // expected
        }
      });

      expect(result.current.isLoggingIn).toBe(false);
    });

    it('does NOT set user in store after failed login', async () => {
      const { result } = renderHookWithProviders(() => useAuth(), { initialRoute: '/login' });

      await act(async () => {
        try {
          await result.current.login({ username: 'wrong', password: 'bad' });
        } catch {
          // expected
        }
      });

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });

    it('re-throws the error so callers can handle it', async () => {
      const { result } = renderHookWithProviders(() => useAuth(), { initialRoute: '/login' });
      let caughtError: unknown;

      await act(async () => {
        try {
          await result.current.login({ username: 'wrong', password: 'bad' });
        } catch (e) {
          caughtError = e;
        }
      });

      expect(caughtError).toBeDefined();
    });

    it('clears previous loginError at the start of a new login attempt', async () => {
      const { result } = renderHookWithProviders(() => useAuth(), { initialRoute: '/login' });

      // First: fail
      await act(async () => {
        try {
          await result.current.login({ username: 'x', password: 'x' });
        } catch { /* ok */ }
      });
      expect(result.current.loginError).not.toBeNull();

      // Second: succeed
      await act(async () => {
        await result.current.login({ username: 'admin', password: 'password' });
      });
      expect(result.current.loginError).toBeNull();
    });
  });

  // ── logout ──────────────────────────────────────────────────────────────────
  describe('logout', () => {
    it('clears user from auth store after logout', async () => {
      // Pre-set a logged-in state
      useAuthStore.setState({ user: mockAdminUser, isAuthenticated: true, csrfToken: 'tok' });

      const { result } = renderHookWithProviders(() => useAuth(), { initialRoute: '/dashboard' });

      await act(async () => {
        await result.current.logout();
      });

      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
      expect(useAuthStore.getState().csrfToken).toBeNull();
    });

    it('returns isLoggingOut=false after logout completes', async () => {
      useAuthStore.setState({ user: mockAdminUser, isAuthenticated: true });
      const { result } = renderHookWithProviders(() => useAuth(), { initialRoute: '/dashboard' });

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.isLoggingOut).toBe(false);
    });

    it('still logs out even when the API call fails (graceful degradation)', async () => {
      server.use(
        http.post(`${API_BASE}/auth/logout`, () => HttpResponse.error())
      );

      useAuthStore.setState({ user: mockAdminUser, isAuthenticated: true });
      const { result } = renderHookWithProviders(() => useAuth(), { initialRoute: '/dashboard' });

      await act(async () => {
        await result.current.logout();
      });

      // Store should still be cleared even if HTTP call failed
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().isAuthenticated).toBe(false);
    });
  });

  // ── fetchCsrfToken ───────────────────────────────────────────────────────────
  describe('fetchCsrfToken', () => {
    it('stores csrfToken in auth store', async () => {
      const { result } = renderHookWithProviders(() => useAuth(), { initialRoute: '/' });

      await act(async () => {
        await result.current.fetchCsrfToken();
      });

      await waitFor(() => {
        expect(useAuthStore.getState().csrfToken).toBe('test-csrf-token');
      });
    });

    it('does not throw when CSRF endpoint fails', async () => {
      server.use(
        http.get(`${API_BASE}/auth/csrf-token`, () => HttpResponse.error())
      );

      const { result } = renderHookWithProviders(() => useAuth(), { initialRoute: '/' });

      await expect(
        act(async () => { await result.current.fetchCsrfToken(); })
      ).resolves.not.toThrow();
    });
  });

  // ── initial state ────────────────────────────────────────────────────────────
  describe('initial state', () => {
    it('exposes user and isAuthenticated from the store', () => {
      const { result } = renderHookWithProviders(() => useAuth());
      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    it('starts with loginError as null', () => {
      const { result } = renderHookWithProviders(() => useAuth());
      expect(result.current.loginError).toBeNull();
    });

    it('starts with isLoggingIn and isLoggingOut as false', () => {
      const { result } = renderHookWithProviders(() => useAuth());
      expect(result.current.isLoggingIn).toBe(false);
      expect(result.current.isLoggingOut).toBe(false);
    });
  });
});
