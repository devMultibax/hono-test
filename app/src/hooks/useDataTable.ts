import { useState, useMemo, useCallback } from 'react';
import type { SortingState, VisibilityState, RowSelectionState } from '@tanstack/react-table';
import type { BaseQueryParams, SortOrder } from '@/types';

interface UseDataTableOptions<TParams extends BaseQueryParams> {
  tableKey: string;
  defaultParams: TParams;
  sortFieldMap?: Record<string, string>;
}

interface UseDataTableReturn<TParams extends BaseQueryParams> {
  params: TParams;
  setParams: React.Dispatch<React.SetStateAction<TParams>>;
  sorting: SortingState;
  columnVisibility: VisibilityState;
  rowSelection: RowSelectionState;
  setColumnVisibility: React.Dispatch<React.SetStateAction<VisibilityState>>;
  setRowSelection: React.Dispatch<React.SetStateAction<RowSelectionState>>;
  handleSortingChange: (sorting: SortingState) => void;
  handlePaginationChange: (page: number, limit: number) => void;
  handleFilterChange: (newParams: TParams) => void;
  resetSelection: () => void;
}

const STORAGE_PREFIX = 'datatable_columns_';

function loadVisibility(key: string): VisibilityState {
  try {
    const stored = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveVisibility(key: string, state: VisibilityState) {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(state));
  } catch {
    // ignore storage errors
  }
}

export function useDataTable<TParams extends BaseQueryParams>({
  tableKey,
  defaultParams,
  sortFieldMap,
}: UseDataTableOptions<TParams>): UseDataTableReturn<TParams> {
  const [params, setParams] = useState<TParams>(defaultParams);
  const [columnVisibility, setColumnVisibilityRaw] = useState<VisibilityState>(() => loadVisibility(tableKey));
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Build reverse map (DB field → column id) once
  const sortFieldReverse = useMemo(() => {
    if (!sortFieldMap) return undefined;
    return Object.fromEntries(Object.entries(sortFieldMap).map(([k, v]) => [v, k]));
  }, [sortFieldMap]);

  const setColumnVisibility: React.Dispatch<React.SetStateAction<VisibilityState>> = useCallback(
    (updater) => {
      setColumnVisibilityRaw((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        saveVisibility(tableKey, next);
        return next;
      });
    },
    [tableKey]
  );

  // Map DB field back to column id for UI sort indicator
  const sorting: SortingState = useMemo(
    () => {
      if (!params.sort) return [];
      const id = sortFieldReverse?.[params.sort] ?? params.sort;
      return [{ id, desc: params.order === 'desc' }];
    },
    [params.sort, params.order, sortFieldReverse]
  );

  const handleSortingChange = useCallback(
    (newSorting: SortingState) => {
      if (newSorting.length > 0) {
        const { id, desc } = newSorting[0];
        // Map column id → DB field
        const dbField = sortFieldMap?.[id] ?? id;
        setParams((p) => ({ ...p, sort: dbField, order: (desc ? 'desc' : 'asc') as SortOrder, page: 1 }));
      } else {
        // Fallback to default sort when cleared
        setParams((p) => ({
          ...p,
          sort: defaultParams.sort,
          order: defaultParams.order,
          page: 1,
        }));
      }
    },
    [sortFieldMap, defaultParams.sort, defaultParams.order]
  );

  const handlePaginationChange = useCallback(
    (page: number, limit: number) => setParams((p) => ({ ...p, page, limit })),
    []
  );

  const handleFilterChange = useCallback(
    (newParams: TParams) => setParams({ ...newParams, page: 1 }),
    []
  );

  const resetSelection = useCallback(() => setRowSelection({}), []);

  return {
    params,
    setParams,
    sorting,
    columnVisibility,
    rowSelection,
    setColumnVisibility,
    setRowSelection,
    handleSortingChange,
    handlePaginationChange,
    handleFilterChange,
    resetSelection,
  };
}
