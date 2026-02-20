import { describe, it, expect, vi } from 'vitest';
import { act, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { mockUser } from '../mocks/fixtures';
import { renderHookWithProviders } from '../utils/renderWithProviders';

// Import hooks directly — integration test covers full pipeline
import { useUsers, useUser, useCreateUser } from '@/features/users/hooks/useUsers';
import { useUpdateUser, useDeleteUser, useBulkDeleteUsers } from '@/features/users/hooks/useUsers';
import type { UserQueryParams } from '@/features/users/types';

// ── Mock side-effects (notifications + i18n) ────────────────────────────────
vi.mock('@/utils/mantineAlertUtils', () => ({
  Report: { success: vi.fn(), error: vi.fn() },
}));
vi.mock('@/lib/i18n/helpers', () => ({ t: (key: string) => key }));

const API_BASE = 'http://localhost:3000';
const DEFAULT_PARAMS: UserQueryParams = { page: 1, limit: 20 };

// ── USER LIST ─────────────────────────────────────────────────────────────────
describe('users integration – useUsers', () => {
  it('fetches the user list and returns paginated data', async () => {
    const { result } = renderHookWithProviders(() => useUsers(DEFAULT_PARAMS));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.data).toHaveLength(1);
    expect(result.current.data?.data[0].username).toBe(mockUser.username);
    expect(result.current.data?.pagination.total).toBe(1);
  });

  it('exposes isLoading as true initially', () => {
    const { result } = renderHookWithProviders(() => useUsers(DEFAULT_PARAMS));
    // On first render, before any response, loading state is true
    expect(result.current.isLoading).toBe(true);
  });

  it('uses different cache keys for different query params', async () => {
    const params1: UserQueryParams = { page: 1, limit: 20 };
    const params2: UserQueryParams = { page: 2, limit: 20 };

    const { result: r1 } = renderHookWithProviders(() => useUsers(params1));
    const { result: r2 } = renderHookWithProviders(() => useUsers(params2));

    await waitFor(() => expect(r1.current.isSuccess).toBe(true));
    await waitFor(() => expect(r2.current.isSuccess).toBe(true));

    // Both succeed with the same mocked data (different cache entries)
    expect(r1.current.data?.data).toBeDefined();
    expect(r2.current.data?.data).toBeDefined();
  });

  it('sets isError when the API returns 500', async () => {
    server.use(
      http.get(`${API_BASE}/users`, () =>
        HttpResponse.json({ message: 'Internal Server Error' }, { status: 500 })
      )
    );

    const { result } = renderHookWithProviders(() => useUsers(DEFAULT_PARAMS));
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

// ── SINGLE USER ───────────────────────────────────────────────────────────────
describe('users integration – useUser', () => {
  it('fetches a single user by id', async () => {
    const { result } = renderHookWithProviders(() => useUser(mockUser.id));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.id).toBe(mockUser.id);
    expect(result.current.data?.username).toBe(mockUser.username);
  });

  it('does not fetch when id is 0', () => {
    const { result } = renderHookWithProviders(() => useUser(0));
    // query is disabled when id <= 0
    expect(result.current.fetchStatus).toBe('idle');
    expect(result.current.isLoading).toBe(false);
  });

  it('sets isError when user is not found (404)', async () => {
    server.use(
      http.get(`${API_BASE}/users/:id`, () =>
        HttpResponse.json({ message: 'Not found' }, { status: 404 })
      )
    );

    const { result } = renderHookWithProviders(() => useUser(9999));
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

// ── CREATE USER ───────────────────────────────────────────────────────────────
describe('users integration – useCreateUser', () => {
  it('successfully creates a user and returns new id', async () => {
    const { result } = renderHookWithProviders(() => useCreateUser());

    await act(async () => {
      result.current.mutate({
        username: 'newuser',
        firstName: 'New',
        lastName: 'User',
        departmentId: 1,
        role: 'USER',
        status: 'active',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // userApi.create returns AxiosResponse — the actual body is in .data.data
    const axiosResp = result.current.data as unknown as { data: { username: string; id: number } };
    expect(axiosResp.data.username).toBe('newuser');
  });

  it('sets isError when server returns 422', async () => {
    server.use(
      http.post(`${API_BASE}/users`, () =>
        HttpResponse.json(
          { message: 'Validation failed', errors: ['username is required'] },
          { status: 422 }
        )
      )
    );

    const { result } = renderHookWithProviders(() => useCreateUser());
    await act(async () => {
      result.current.mutate({
        username: '',
        firstName: '',
        lastName: '',
        departmentId: 0,
        role: 'USER',
        status: 'active',
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

// ── UPDATE USER ───────────────────────────────────────────────────────────────
describe('users integration – useUpdateUser', () => {
  it('calls PUT and resolves successfully', async () => {
    const { result } = renderHookWithProviders(() => useUpdateUser());

    await act(async () => {
      result.current.mutate({ id: mockUser.id, data: { firstName: 'Johnny' } });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const { Report } = await import('@/utils/mantineAlertUtils');
    expect(Report.success).toHaveBeenCalled();
  });

  it('sets isError on 404 response', async () => {
    server.use(
      http.put(`${API_BASE}/users/:id`, () =>
        HttpResponse.json({ message: 'Not found' }, { status: 404 })
      )
    );

    const { result } = renderHookWithProviders(() => useUpdateUser());
    await act(async () => {
      result.current.mutate({ id: 9999, data: { firstName: 'Ghost' } });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

// ── DELETE USER ───────────────────────────────────────────────────────────────
describe('users integration – useDeleteUser', () => {
  it('calls DELETE and resolves successfully', async () => {
    const { result } = renderHookWithProviders(() => useDeleteUser());

    await act(async () => {
      result.current.mutate(mockUser.id);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('sets isError when deleting non-existent user', async () => {
    server.use(
      http.delete(`${API_BASE}/users/:id`, () =>
        HttpResponse.json({ message: 'Not found' }, { status: 404 })
      )
    );

    const { result } = renderHookWithProviders(() => useDeleteUser());
    await act(async () => {
      result.current.mutate(9999);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

// ── BULK DELETE USERS ─────────────────────────────────────────────────────────
describe('users integration – useBulkDeleteUsers', () => {
  it('deletes multiple users and resolves', async () => {
    // Add an extra user to the mock endpoint
    server.use(
      http.delete(`${API_BASE}/users/:id`, () => new HttpResponse(null, { status: 204 }))
    );

    const { result } = renderHookWithProviders(() => useBulkDeleteUsers());
    await act(async () => {
      result.current.mutate([1, 2, 3]);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('sets isError when any delete in bulk fails', async () => {
    let callCount = 0;
    server.use(
      http.delete(`${API_BASE}/users/:id`, () => {
        callCount++;
        // Fail on third call
        if (callCount === 3) {
          return HttpResponse.json({ message: 'Forbidden' }, { status: 403 });
        }
        return new HttpResponse(null, { status: 204 });
      })
    );

    const { result } = renderHookWithProviders(() => useBulkDeleteUsers());
    await act(async () => {
      result.current.mutate([1, 2, 3]);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

// ── NETWORK ERROR SCENARIOS ───────────────────────────────────────────────────
describe('users integration – network error scenarios', () => {
  it('useUsers sets isError on network failure', async () => {
    server.use(
      http.get(`${API_BASE}/users`, () => HttpResponse.error())
    );

    const { result } = renderHookWithProviders(() => useUsers(DEFAULT_PARAMS));
    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('useUser sets isError on network failure', async () => {
    server.use(
      http.get(`${API_BASE}/users/:id`, () => HttpResponse.error())
    );

    const { result } = renderHookWithProviders(() => useUser(1));
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
