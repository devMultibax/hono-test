import React from 'react';
import { render, renderHook, type RenderHookOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

interface WrapperOptions {
  initialRoute?: string;
}

export function createWrapper(options: WrapperOptions = {}) {
  const queryClient = createTestQueryClient();
  const { initialRoute = '/' } = options;

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[initialRoute]}>
          {children}
        </MemoryRouter>
      </QueryClientProvider>
    );
  }

  return { Wrapper, queryClient };
}

export function renderWithProviders(
  ui: React.ReactElement,
  options: WrapperOptions = {}
) {
  const { Wrapper, queryClient } = createWrapper(options);
  return { queryClient, ...render(ui, { wrapper: Wrapper }) };
}

export function renderHookWithProviders<TResult, TProps>(
  hook: (props: TProps) => TResult,
  options: RenderHookOptions<TProps> & WrapperOptions = {},
) {
  const { initialRoute, ...hookOptions } = options;
  const { Wrapper, queryClient } = createWrapper({ initialRoute });
  return {
    queryClient,
    ...renderHook(hook, { ...hookOptions, wrapper: Wrapper }),
  };
}
