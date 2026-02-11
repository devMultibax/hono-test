import { useState, useCallback } from 'react';
import type { UserDrawerState } from '../types';

export function useUserDrawer() {
  const [drawer, setDrawer] = useState<UserDrawerState>({ mode: 'closed' });

  return {
    drawer,
    openCreate: useCallback(() => setDrawer({ mode: 'create' }), []),
    openDetail: useCallback((userId: number) => setDrawer({ mode: 'detail', userId }), []),
    openEdit: useCallback((userId: number) => setDrawer({ mode: 'edit', userId }), []),
    close: useCallback(() => setDrawer({ mode: 'closed' }), []),
    userId: 'userId' in drawer ? drawer.userId : 0,
  };
}
