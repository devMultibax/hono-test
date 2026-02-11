export function createQueryKeys<TParams = unknown>(scope: string) {
  return {
    all: [scope] as const,
    lists: () => [scope, 'list'] as const,
    list: (params: TParams) => [scope, 'list', params] as const,
    details: () => [scope, 'detail'] as const,
    detail: (id: number) => [scope, 'detail', id] as const,
  };
}
