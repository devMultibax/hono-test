import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';

const isAnalyze = process.env.ANALYZE === 'true';

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    // Bundle size visualizer — generates dist/stats.html when ANALYZE=true
    ...(isAnalyze
      ? [visualizer({ open: true, filename: 'dist/stats.html', gzipSize: true, brotliSize: true })]
      : []),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Raise warning limit; Mantine + icons are intentionally large vendor chunks
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime — cached aggressively
          'vendor-react': ['react', 'react-dom'],
          // Routing
          'vendor-router': ['react-router-dom'],
          // Server-state / caching
          'vendor-query': ['@tanstack/react-query'],
          // Table engine
          'vendor-table': ['@tanstack/react-table'],
          // Mantine UI components (core + addons)
          'vendor-mantine': [
            '@mantine/core',
            '@mantine/hooks',
            '@mantine/form',
            '@mantine/modals',
            '@mantine/notifications',
            '@mantine/dates',
          ],
          // Icon libraries — large SVG bundles, isolate for cache
          'vendor-icons': ['@tabler/icons-react', 'lucide-react'],
          // Internationalisation
          'vendor-i18n': ['i18next', 'react-i18next'],
          // Small utilities
          'vendor-utils': ['axios', 'dayjs', 'zustand', 'clsx', 'class-variance-authority'],
        },
      },
    },
  },
});