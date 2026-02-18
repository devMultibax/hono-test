import { createContext, useContext, useState, type ReactNode } from 'react';

interface PageHeaderContextValue {
  actions: ReactNode;
  setActions: (actions: ReactNode) => void;
}

const PageHeaderContext = createContext<PageHeaderContextValue>({
  actions: null,
  setActions: () => {},
});

export function PageHeaderProvider({ children }: { children: ReactNode }) {
  const [actions, setActions] = useState<ReactNode>(null);
  return (
    <PageHeaderContext.Provider value={{ actions, setActions }}>
      {children}
    </PageHeaderContext.Provider>
  );
}

export function usePageActions() {
  return useContext(PageHeaderContext);
}
