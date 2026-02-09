import { useState, useMemo, useCallback } from 'react';
import type { SortingState, VisibilityState, RowSelectionState } from '@tanstack/react-table';
import type { BaseQueryParams, SortOrder } from '@/types';

interface UseDataTableOptions<TParams extends BaseQueryParams> {
  tableKey: string;
  defaultParams: TParams;
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
}: UseDataTableOptions<TParams>): UseDataTableReturn<TParams> {
  const [params, setParams] = useState<TParams>(defaultParams);
  const [columnVisibility, setColumnVisibilityRaw] = useState<VisibilityState>(() => loadVisibility(tableKey));
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

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

  const sorting: SortingState = useMemo(
    () => (params.sort ? [{ id: params.sort, desc: params.order === 'desc' }] : []),
    [params.sort, params.order]
  );

  const handleSortingChange = useCallback(
    (newSorting: SortingState) => {
      if (newSorting.length > 0) {
        const { id, desc } = newSorting[0];
        setParams((p) => ({ ...p, sort: id, order: (desc ? 'desc' : 'asc') as SortOrder, page: 1 }));
      } else {
        setParams((p) => ({ ...p, sort: undefined, order: undefined, page: 1 }));
      }
    },
    []
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
