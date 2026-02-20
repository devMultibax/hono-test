import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { createCrudHooks } from '@/hooks/createCrudHooks';
import { createQueryKeys } from '@/hooks/createQueryKeys';

// ── Mock external side-effects ──────────────────────────────────────────────
vi.mock('@/utils/mantineAlertUtils', () => ({
  Report: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));

vi.mock('@/lib/i18n/helpers', () => ({
  t: (key: string) => key,
}));

// ── Helpers ──────────────────────────────────────────────────────────────────
function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  }
  return { Wrapper, queryClient };
}

function makeMockApi() {
  return {
    create: vi.fn().mockResolvedValue({ data: { id: 1 } }),
    update: vi.fn().mockResolvedValue({ data: { id: 1 } }),
    delete: vi.fn().mockResolvedValue(undefined),
  };
}

const queryKeys = createQueryKeys<{ page?: number }>('test-resource');

// ── Tests ────────────────────────────────────────────────────────────────────
describe('createCrudHooks', () => {
  let mockApi: ReturnType<typeof makeMockApi>;
  let hooks: ReturnType<typeof createCrudHooks>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockApi = makeMockApi();
    hooks = createCrudHooks({
      queryKeys,
      api: mockApi,
      messages: {
        createSuccess: 'msg.createSuccess',
        updateSuccess: 'msg.updateSuccess',
        deleteSuccess: 'msg.deleteSuccess',
        bulkDeleteSuccess: 'msg.bulkDeleteSuccess',
      },
    });
  });

  describe('useCreate', () => {
    it('returns a mutation hook', () => {
      const { Wrapper } = makeWrapper();
      const { result } = renderHook(() => hooks.useCreate(), { wrapper: Wrapper });
      expect(result.current.mutate).toBeDefined();
      expect(result.current.isPending).toBe(false);
    });

    it('calls api.create with provided data', async () => {
      const { Wrapper } = makeWrapper();
      const { result } = renderHook(() => hooks.useCreate(), { wrapper: Wrapper });
      const payload = { name: 'New Item' };

      await act(async () => {
        result.current.mutate(payload as never);
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      // React Query v5 passes (variables, mutationContext) to mutationFn — check first arg only
      expect(mockApi.create.mock.calls[0][0]).toEqual(payload);
    });

    it('shows success notification after create', async () => {
      const { Wrapper } = makeWrapper();
      const { result } = renderHook(() => hooks.useCreate(), { wrapper: Wrapper });

      await act(async () => {
        result.current.mutate({} as never);
      });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      const { Report } = await import('@/utils/mantineAlertUtils');
      expect(Report.success).toHaveBeenCalledWith('msg.createSuccess');
    });

    it('marks mutation as error when api.create rejects', async () => {
      mockApi.create.mockRejectedValueOnce(new Error('Network error'));
      const { Wrapper } = makeWrapper();
      const { result } = renderHook(() => hooks.useCreate(), { wrapper: Wrapper });

      await act(async () => {
        result.current.mutate({} as never);
      });
      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useUpdate', () => {
    it('returns a mutation hook', () => {
      const { Wrapper } = makeWrapper();
      const { result } = renderHook(() => hooks.useUpdate(), { wrapper: Wrapper });
      expect(result.current.mutate).toBeDefined();
    });

    it('calls api.update with id and data', async () => {
      const { Wrapper } = makeWrapper();
      const { result } = renderHook(() => hooks.useUpdate(), { wrapper: Wrapper });
      const updatePayload = { id: 5, data: { name: 'Updated' } };

      await act(async () => {
        result.current.mutate(updatePayload as never);
      });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockApi.update).toHaveBeenCalledWith(5, { name: 'Updated' });
    });

    it('shows success notification after update', async () => {
      const { Wrapper } = makeWrapper();
      const { result } = renderHook(() => hooks.useUpdate(), { wrapper: Wrapper });

      await act(async () => {
        result.current.mutate({ id: 1, data: {} } as never);
      });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      const { Report } = await import('@/utils/mantineAlertUtils');
      expect(Report.success).toHaveBeenCalledWith('msg.updateSuccess');
    });

    it('marks mutation as error when api.update rejects', async () => {
      mockApi.update.mockRejectedValueOnce(new Error('Server error'));
      const { Wrapper } = makeWrapper();
      const { result } = renderHook(() => hooks.useUpdate(), { wrapper: Wrapper });

      await act(async () => {
        result.current.mutate({ id: 1, data: {} } as never);
      });
      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });

  describe('useDelete', () => {
    it('returns a mutation hook', () => {
      const { Wrapper } = makeWrapper();
      const { result } = renderHook(() => hooks.useDelete(), { wrapper: Wrapper });
      expect(result.current.mutate).toBeDefined();
    });

    it('calls api.delete with id', async () => {
      const { Wrapper } = makeWrapper();
      const { result } = renderHook(() => hooks.useDelete(), { wrapper: Wrapper });

      await act(async () => {
        result.current.mutate(7);
      });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // React Query v5 passes (variables, mutationContext) to mutationFn — check first arg only
      expect(mockApi.delete.mock.calls[0][0]).toBe(7);
    });

    it('shows success notification after delete', async () => {
      const { Wrapper } = makeWrapper();
      const { result } = renderHook(() => hooks.useDelete(), { wrapper: Wrapper });

      await act(async () => {
        result.current.mutate(1);
      });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      const { Report } = await import('@/utils/mantineAlertUtils');
      expect(Report.success).toHaveBeenCalledWith('msg.deleteSuccess');
    });
  });

  describe('useBulkDelete', () => {
    it('returns a mutation hook', () => {
      const { Wrapper } = makeWrapper();
      const { result } = renderHook(() => hooks.useBulkDelete(), { wrapper: Wrapper });
      expect(result.current.mutate).toBeDefined();
    });

    it('calls api.delete once for each id', async () => {
      const { Wrapper } = makeWrapper();
      const { result } = renderHook(() => hooks.useBulkDelete(), { wrapper: Wrapper });
      const ids = [1, 2, 3];

      await act(async () => {
        result.current.mutate(ids);
      });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(mockApi.delete).toHaveBeenCalledTimes(3);
      expect(mockApi.delete).toHaveBeenCalledWith(1);
      expect(mockApi.delete).toHaveBeenCalledWith(2);
      expect(mockApi.delete).toHaveBeenCalledWith(3);
    });

    it('shows bulkDeleteSuccess notification when defined', async () => {
      const { Wrapper } = makeWrapper();
      const { result } = renderHook(() => hooks.useBulkDelete(), { wrapper: Wrapper });

      await act(async () => {
        result.current.mutate([4, 5]);
      });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      const { Report } = await import('@/utils/mantineAlertUtils');
      expect(Report.success).toHaveBeenCalledWith('msg.bulkDeleteSuccess');
    });

    it('falls back to deleteSuccess when bulkDeleteSuccess is not defined', async () => {
      vi.clearAllMocks();
      const hooksNoBulkMsg = createCrudHooks({
        queryKeys,
        api: mockApi,
        messages: {
          createSuccess: 'msg.createSuccess',
          updateSuccess: 'msg.updateSuccess',
          deleteSuccess: 'msg.deleteSuccess',
          // bulkDeleteSuccess omitted
        },
      });

      const { Wrapper } = makeWrapper();
      const { result } = renderHook(() => hooksNoBulkMsg.useBulkDelete(), { wrapper: Wrapper });

      await act(async () => {
        result.current.mutate([1]);
      });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      const { Report } = await import('@/utils/mantineAlertUtils');
      expect(Report.success).toHaveBeenCalledWith('msg.deleteSuccess');
    });
  });
});
