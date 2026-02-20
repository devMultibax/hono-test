import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      reportsDirectory: './coverage',
      include: [
        'src/hooks/createQueryKeys.ts',
        'src/hooks/createCrudHooks.ts',
        'src/hooks/useDataTable.ts',
      ],
      thresholds: {
        'src/hooks/createQueryKeys.ts': { lines: 100, functions: 100, branches: 100, statements: 100 },
        'src/hooks/createCrudHooks.ts': { lines: 80, functions: 80, branches: 70, statements: 80 },
        'src/hooks/useDataTable.ts': { lines: 80, functions: 80, branches: 70, statements: 80 },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
