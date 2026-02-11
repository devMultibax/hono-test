import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@/providers/ThemeProvider'
import { QueryProvider } from '@/providers/QueryProvider'
import App from './App.tsx'
import './index.css'

import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'

import '@/lib/i18n'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </QueryProvider>
  </StrictMode>,
)