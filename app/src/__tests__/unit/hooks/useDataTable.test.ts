import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDataTable } from '@/hooks/useDataTable';
import type { BaseQueryParams } from '@/types';

interface TestParams extends BaseQueryParams {
  status?: string;
}

const DEFAULT_PARAMS: TestParams = {
  page: 1,
  limit: 20,
  sort: 'createdAt',
  order: 'desc',
  search: '',
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function renderDataTable(overrides: Partial<{
  tableKey: string;
  defaultParams: TestParams;
  sortFieldMap: Record<string, string>;
}> = {}) {
  return renderHook(() =>
    useDataTable<TestParams>({
      tableKey: overrides.tableKey ?? 'test-table',
      defaultParams: overrides.defaultParams ?? DEFAULT_PARAMS,
      sortFieldMap: overrides.sortFieldMap,
    })
  );
}

describe('useDataTable', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((k) => localStorage[k] ?? null);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((k, v) => { localStorage[k] = v; });
  });

  // ── Initial state ──────────────────────────────────────────────────────────
  describe('initial state', () => {
    it('initialises params from defaultParams', () => {
      const { result } = renderDataTable();
      expect(result.current.params).toEqual(DEFAULT_PARAMS);
    });

    it('initialises rowSelection as empty object', () => {
      const { result } = renderDataTable();
      expect(result.current.rowSelection).toEqual({});
    });

    it('initialises columnVisibility as empty object when nothing in localStorage', () => {
      const { result } = renderDataTable();
      expect(result.current.columnVisibility).toEqual({});
    });

    it('restores columnVisibility from localStorage', () => {
      const stored = JSON.stringify({ name: false, email: false });
      localStorage['datatable_columns_test-table'] = stored;

      const { result } = renderDataTable();
      expect(result.current.columnVisibility).toEqual({ name: false, email: false });
    });
  });

  // ── sorting derived state ──────────────────────────────────────────────────
  describe('sorting (derived from params)', () => {
    it('returns empty array when params.sort is undefined', () => {
      const { result } = renderDataTable({
        defaultParams: { page: 1, limit: 20 },
      });
      expect(result.current.sorting).toEqual([]);
    });

    it('maps sort + order to SortingState', () => {
      const { result } = renderDataTable({
        defaultParams: { ...DEFAULT_PARAMS, sort: 'name', order: 'asc' },
      });
      expect(result.current.sorting).toEqual([{ id: 'name', desc: false }]);
    });

    it('reflects desc when order is "desc"', () => {
      const { result } = renderDataTable({
        defaultParams: { ...DEFAULT_PARAMS, sort: 'createdAt', order: 'desc' },
      });
      expect(result.current.sorting[0].desc).toBe(true);
    });

    it('uses sortFieldMap to map DB field → column id', () => {
      const { result } = renderDataTable({
        defaultParams: { ...DEFAULT_PARAMS, sort: 'created_at', order: 'asc' },
        sortFieldMap: { createdAt: 'created_at' },
      });
      expect(result.current.sorting[0].id).toBe('createdAt');
    });

    it('falls back to DB field when no mapping exists', () => {
      const { result } = renderDataTable({
        defaultParams: { ...DEFAULT_PARAMS, sort: 'unknownField', order: 'asc' },
        sortFieldMap: { createdAt: 'created_at' },
      });
      expect(result.current.sorting[0].id).toBe('unknownField');
    });
  });

  // ── handleSortingChange ────────────────────────────────────────────────────
  describe('handleSortingChange', () => {
    it('updates sort and order from SortingState', () => {
      const { result } = renderDataTable();
      act(() => {
        result.current.handleSortingChange([{ id: 'name', desc: false }]);
      });
      expect(result.current.params.sort).toBe('name');
      expect(result.current.params.order).toBe('asc');
    });

    it('maps column id → DB field via sortFieldMap', () => {
      const { result } = renderDataTable({
        sortFieldMap: { firstName: 'first_name' },
      });
      act(() => {
        result.current.handleSortingChange([{ id: 'firstName', desc: true }]);
      });
      expect(result.current.params.sort).toBe('first_name');
      expect(result.current.params.order).toBe('desc');
    });

    it('resets page to 1 on sort change', () => {
      const { result } = renderDataTable({
        defaultParams: { ...DEFAULT_PARAMS, page: 3 },
      });
      act(() => {
        result.current.handleSortingChange([{ id: 'name', desc: false }]);
      });
      expect(result.current.params.page).toBe(1);
    });

    it('restores default sort when sorting is cleared (empty array)', () => {
      const { result } = renderDataTable();
      // First sort by name
      act(() => {
        result.current.handleSortingChange([{ id: 'name', desc: true }]);
      });
      // Then clear sorting
      act(() => {
        result.current.handleSortingChange([]);
      });
      expect(result.current.params.sort).toBe(DEFAULT_PARAMS.sort);
      expect(result.current.params.order).toBe(DEFAULT_PARAMS.order);
    });
  });

  // ── handlePaginationChange ────────────────────────────────────────────────
  describe('handlePaginationChange', () => {
    it('updates page and limit', () => {
      const { result } = renderDataTable();
      act(() => {
        result.current.handlePaginationChange(2, 50);
      });
      expect(result.current.params.page).toBe(2);
      expect(result.current.params.limit).toBe(50);
    });

    it('preserves other params when changing pagination', () => {
      const { result } = renderDataTable({
        defaultParams: { ...DEFAULT_PARAMS, search: 'hello', status: 'active' },
      });
      act(() => {
        result.current.handlePaginationChange(3, 10);
      });
      expect(result.current.params.search).toBe('hello');
      expect(result.current.params.status).toBe('active');
    });
  });

  // ── handleFilterChange ────────────────────────────────────────────────────
  describe('handleFilterChange', () => {
    it('replaces params and resets page to 1', () => {
      const { result } = renderDataTable({
        defaultParams: { ...DEFAULT_PARAMS, page: 5 },
      });
      const newParams: TestParams = { page: 5, limit: 20, status: 'active' };
      act(() => {
        result.current.handleFilterChange(newParams);
      });
      expect(result.current.params.status).toBe('active');
      expect(result.current.params.page).toBe(1);
    });
  });

  // ── resetSelection ────────────────────────────────────────────────────────
  describe('resetSelection', () => {
    it('clears all selected rows', () => {
      const { result } = renderDataTable();

      // Manually set some selection via setRowSelection
      act(() => {
        result.current.setRowSelection({ 0: true, 1: true });
      });
      expect(result.current.rowSelection).toEqual({ 0: true, 1: true });

      act(() => {
        result.current.resetSelection();
      });
      expect(result.current.rowSelection).toEqual({});
    });
  });

  // ── setColumnVisibility (persists to localStorage) ────────────────────────
  describe('setColumnVisibility', () => {
    it('updates columnVisibility state', () => {
      const { result } = renderDataTable();
      act(() => {
        result.current.setColumnVisibility({ email: false });
      });
      expect(result.current.columnVisibility).toEqual({ email: false });
    });

    it('saves visibility to localStorage', () => {
      const { result } = renderDataTable({ tableKey: 'persist-test' });
      act(() => {
        result.current.setColumnVisibility({ tel: false });
      });
      const stored = localStorage['datatable_columns_persist-test'];
      expect(JSON.parse(stored)).toEqual({ tel: false });
    });

    it('accepts an updater function', () => {
      const { result } = renderDataTable();
      act(() => {
        result.current.setColumnVisibility({ col1: false });
      });
      act(() => {
        result.current.setColumnVisibility((prev) => ({ ...prev, col2: false }));
      });
      expect(result.current.columnVisibility).toEqual({ col1: false, col2: false });
    });
  });

  // ── setParams ─────────────────────────────────────────────────────────────
  describe('setParams', () => {
    it('allows direct param mutation', () => {
      const { result } = renderDataTable();
      act(() => {
        result.current.setParams((p) => ({ ...p, search: 'direct-set' }));
      });
      expect(result.current.params.search).toBe('direct-set');
    });
  });
});
