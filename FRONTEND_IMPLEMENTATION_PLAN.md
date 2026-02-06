# Frontend Implementation Plan

## 📋 Overview

แผนการพัฒนา Frontend สำหรับเชื่อมต่อกับ Backend API (Hono Framework)

### Tech Stack (ตาม package.json ที่มีอยู่)

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.2.0 | UI Library |
| **TypeScript** | 5.9.3 | Type Safety |
| **Vite** | 7.3.1 | Build Tool |
| **Mantine UI** | 8.3.14 | UI Components |
| **@mantine/form** | 8.3.14 | Form Management |
| **@mantine/hooks** | 8.3.14 | Utility Hooks |
| **@mantine/dates** | 8.3.14 | Date Components |
| **@mantine/notifications** | 8.3.14 | Notifications |
| **React Router DOM** | 7.13.0 | Routing |
| **Axios** | 1.13.4 | HTTP Client |
| **TanStack React Table** | 8.21.3 | Data Tables |
| **Tailwind CSS** | 4.1.18 | Utility CSS |
| **dayjs** | 1.11.19 | Date Utility |
| **lucide-react** | 0.563.0 | Icons |
| **notiflix** | 3.2.8 | Toast Notifications |
| **clsx** | 2.1.1 | Classname Utility |

### Dependencies ที่ต้องติดตั้งเพิ่ม

```bash
npm install zustand @tanstack/react-query
```

| Package | Purpose |
|---------|---------|
| **zustand** | Client State Management (auth, UI state) |
| **@tanstack/react-query** | Server State Management (API caching, background refetch) |

### หลักการพัฒนา

- **Clean Code**: ตั้งชื่อ meaningful, แยก concerns ชัดเจน, Single Responsibility
- **Best Practice**: Custom hooks, Error boundaries, Lazy loading, Optimistic updates
- **Good Logic**: แยก business logic ออกจาก UI, Centralized error handling
- **Minimal Comments**: ใช้ code ที่อธิบายตัวเองได้, comment เฉพาะ logic ซับซ้อน

---

## 🗂️ Project Structure

```
src/
├── api/                          # API layer
│   ├── client.ts                 # Axios instance + interceptors
│   ├── endpoints.ts              # API endpoint constants
│   ├── error-handler.ts          # Centralized error handling
│   └── services/                 # API service functions
│       ├── auth.api.ts
│       ├── user.api.ts
│       ├── department.api.ts
│       ├── section.api.ts
│       ├── master-data.api.ts
│       ├── user-log.api.ts
│       ├── system-log.api.ts
│       ├── backup.api.ts
│       └── database.api.ts
│
├── components/                   # Reusable components
│   ├── common/                   # Shared components
│   │   ├── DataTable/
│   │   │   ├── DataTable.tsx     # Main table component
│   │   │   ├── TablePagination.tsx
│   │   │   ├── TableSkeleton.tsx
│   │   │   └── EmptyState.tsx
│   │   ├── PageHeader.tsx
│   │   ├── ConfirmModal.tsx
│   │   ├── StatusBadge.tsx
│   │   ├── RoleBadge.tsx
│   │   ├── ActionMenu.tsx
│   │   ├── ExportMenu.tsx
│   │   ├── ImportButton.tsx
│   │   ├── SearchInput.tsx
│   │   ├── Breadcrumbs.tsx
│   │   └── ErrorFallback.tsx
│   ├── forms/                    # Form components
│   │   ├── DepartmentSelect.tsx
│   │   ├── SectionSelect.tsx
│   │   ├── StatusSelect.tsx
│   │   ├── RoleSelect.tsx
│   │   └── DateRangeFilter.tsx
│   └── layout/                   # Layout components
│       ├── MainLayout.tsx
│       ├── Sidebar.tsx
│       ├── Header.tsx
│       ├── ProtectedRoute.tsx
│       └── AdminRoute.tsx
│
├── features/                     # Feature modules (by domain)
│   ├── auth/
│   │   ├── pages/
│   │   │   ├── LoginPage.tsx
│   │   │   └── ForgotPasswordPage.tsx
│   │   ├── components/
│   │   │   └── LoginForm.tsx
│   │   └── hooks/
│   │       ├── useLogin.ts
│   │       └── useLogout.ts
│   ├── dashboard/
│   │   └── pages/
│   │       └── DashboardPage.tsx
│   ├── users/
│   │   ├── pages/
│   │   │   ├── UserListPage.tsx
│   │   │   ├── UserCreatePage.tsx
│   │   │   ├── UserEditPage.tsx
│   │   │   └── UserDetailPage.tsx
│   │   ├── components/
│   │   │   ├── UserForm.tsx
│   │   │   ├── UserFilters.tsx
│   │   │   ├── UserTable.tsx
│   │   │   └── ResetPasswordModal.tsx
│   │   └── hooks/
│   │       └── useUsers.ts
│   ├── departments/
│   │   ├── pages/
│   │   ├── components/
│   │   └── hooks/
│   ├── sections/
│   │   ├── pages/
│   │   ├── components/
│   │   └── hooks/
│   ├── user-logs/
│   │   ├── pages/
│   │   └── components/
│   ├── system-logs/
│   │   ├── pages/
│   │   └── components/
│   ├── backup/
│   │   ├── pages/
│   │   └── components/
│   ├── database/
│   │   ├── pages/
│   │   └── components/
│   └── profile/
│       ├── pages/
│       │   ├── ProfilePage.tsx
│       │   └── ChangePasswordPage.tsx
│       └── components/
│
├── hooks/                        # Global custom hooks
│   ├── useAuth.ts                # Auth state & actions
│   ├── useQueryParams.ts         # URL query params sync
│   ├── usePagination.ts          # Pagination logic
│   ├── useDebounce.ts            # Debounce values
│   ├── useExport.ts              # Export functionality
│   ├── useImport.ts              # Import functionality
│   └── useConfirm.ts             # Confirmation dialog
│
├── lib/                          # Utilities
│   ├── utils.ts                  # General utilities
│   ├── date.ts                   # Date formatting (Thai locale)
│   ├── file.ts                   # File utilities
│   ├── validation.ts             # Shared validation rules
│   └── constants.ts              # App constants
│
├── providers/                    # Context providers
│   ├── QueryProvider.tsx         # TanStack Query setup
│   └── ThemeProvider.tsx         # Mantine theme
│
├── stores/                       # Zustand stores
│   ├── auth.store.ts             # Auth state
│   └── ui.store.ts               # UI state (sidebar, modals)
│
├── types/                        # TypeScript types
│   ├── index.ts                  # Re-export all
│   ├── api.types.ts              # API response types
│   ├── user.types.ts
│   ├── department.types.ts
│   ├── section.types.ts
│   ├── log.types.ts
│   └── common.types.ts
│
├── routes/                       # Route definitions
│   ├── index.tsx                 # Router setup
│   └── routes.ts                 # Route constants
│
├── App.tsx
├── main.tsx
└── index.css
```

---

## ⚙️ Configuration Files

### Environment Variables (`.env.example`)

```env
# API Configuration
VITE_API_URL=http://localhost:3000
VITE_API_TIMEOUT=30000

# App Configuration
VITE_APP_NAME=Admin System
VITE_DEFAULT_PAGE_SIZE=10

# Feature Flags
VITE_ENABLE_DEVTOOLS=true
```

### Vite Path Aliases (`vite.config.ts`)

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### TypeScript Config (`tsconfig.app.json`)

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

---

## 🎨 Theme Configuration

### Mantine Theme (`providers/ThemeProvider.tsx`)

```typescript
import { createTheme, MantineProvider, MantineColorsTuple } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';

const primaryColor: MantineColorsTuple = [
  '#e7f5ff', '#d0ebff', '#a5d8ff', '#74c0fc', '#4dabf7',
  '#339af0', '#228be6', '#1c7ed6', '#1971c2', '#1864ab'
];

const theme = createTheme({
  fontFamily: 'K2D, sans-serif',
  primaryColor: 'primary',
  colors: {
    primary: primaryColor,
  },
  defaultRadius: 'md',
  components: {
    Button: {
      defaultProps: {
        size: 'sm',
      },
    },
    TextInput: {
      defaultProps: {
        size: 'sm',
      },
    },
    Select: {
      defaultProps: {
        size: 'sm',
        searchable: true,
        clearable: true,
      },
    },
    Table: {
      defaultProps: {
        striped: true,
        highlightOnHover: true,
        withTableBorder: true,
        withColumnBorders: false,
      },
    },
    Modal: {
      defaultProps: {
        centered: true,
        overlayProps: { backgroundOpacity: 0.55, blur: 3 },
      },
    },
  },
});

interface Props {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: Props) {
  return (
    <MantineProvider theme={theme}>
      <ModalsProvider>
        <Notifications position="top-right" autoClose={4000} />
        {children}
      </ModalsProvider>
    </MantineProvider>
  );
}
```

---

## 🔐 1. Authentication Module

### 1.1 Auth Store (`stores/auth.store.ts`)

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  csrfToken: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;

  setUser: (user: User | null) => void;
  setCsrfToken: (token: string) => void;
  updateUser: (data: Partial<User>) => void;
  logout: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      csrfToken: null,
      isAuthenticated: false,
      isHydrated: false,

      setUser: (user) => set({
        user,
        isAuthenticated: !!user
      }),

      setCsrfToken: (csrfToken) => set({ csrfToken }),

      updateUser: (data) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...data } });
        }
      },

      logout: () => set({
        user: null,
        csrfToken: null,
        isAuthenticated: false
      }),

      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    }
  )
);

// Selectors for better performance
export const useUser = () => useAuthStore((state) => state.user);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useIsAdmin = () => useAuthStore((state) => state.user?.role === 'ADMIN');
```

### 1.2 API Client (`api/client.ts`)

```typescript
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/auth.store';
import { handleApiError } from './error-handler';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 30000;

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: TIMEOUT,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { csrfToken } = useAuthStore.getState();

    // Add CSRF token for mutating requests
    const mutatingMethods = ['post', 'put', 'patch', 'delete'];
    if (csrfToken && mutatingMethods.includes(config.method || '')) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // Handle 401 - Unauthorized
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();

      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    // Handle errors with notification
    handleApiError(error);

    return Promise.reject(error);
  }
);

// Helper for file downloads
export const downloadFile = async (url: string, filename: string) => {
  const response = await apiClient.get(url, { responseType: 'blob' });
  const blob = new Blob([response.data]);
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};
```

### 1.3 Error Handler (`api/error-handler.ts`)

```typescript
import { AxiosError } from 'axios';
import { notifications } from '@mantine/notifications';
import { IconX } from 'lucide-react';

interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

export function handleApiError(error: AxiosError<ApiErrorResponse>): string {
  const status = error.response?.status;
  const data = error.response?.data;
  const message = data?.message || error.message;

  // Don't show notification for 401 (handled separately)
  if (status === 401) return message;

  const errorMessages: Record<number, string> = {
    400: message || 'ข้อมูลไม่ถูกต้อง',
    403: 'คุณไม่มีสิทธิ์ดำเนินการนี้',
    404: 'ไม่พบข้อมูลที่ต้องการ',
    409: message || 'ข้อมูลซ้ำในระบบ',
    422: message || 'ข้อมูลไม่ผ่านการตรวจสอบ',
    429: 'คำขอมากเกินไป กรุณารอสักครู่',
    500: 'เกิดข้อผิดพลาดจากเซิร์ฟเวอร์',
    503: 'ระบบไม่พร้อมให้บริการ',
  };

  const displayMessage = errorMessages[status || 0] || message || 'เกิดข้อผิดพลาด';

  notifications.show({
    title: 'เกิดข้อผิดพลาด',
    message: displayMessage,
    color: 'red',
    icon: <IconX size={16} />,
  });

  return displayMessage;
}

export function showSuccess(message: string, title = 'สำเร็จ') {
  notifications.show({
    title,
    message,
    color: 'green',
  });
}

export function showWarning(message: string, title = 'คำเตือน') {
  notifications.show({
    title,
    message,
    color: 'yellow',
  });
}
```

### 1.4 Auth API Service (`api/services/auth.api.ts`)

```typescript
import { apiClient } from '../client';
import type { User, LoginRequest, UpdateProfileRequest, ChangePasswordRequest } from '@/types';

interface LoginResponse {
  user: User;
}

interface CsrfResponse {
  csrfToken: string;
}

export const authApi = {
  getCsrfToken: () =>
    apiClient.get<CsrfResponse>('/auth/csrf-token'),

  login: (data: LoginRequest) =>
    apiClient.post<LoginResponse>('/auth/login', data),

  logout: () =>
    apiClient.post('/auth/logout'),

  getMe: () =>
    apiClient.get<{ user: User }>('/auth/me'),

  updateMe: (data: UpdateProfileRequest) =>
    apiClient.put<{ user: User }>('/auth/me', data),

  changePassword: (data: ChangePasswordRequest) =>
    apiClient.put('/auth/me/password', data),
};
```

### 1.5 useAuth Hook (`hooks/useAuth.ts`)

```typescript
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { authApi } from '@/api/services/auth.api';
import { showSuccess } from '@/api/error-handler';
import type { LoginRequest } from '@/types';

export function useAuth() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setUser, setCsrfToken, logout: clearAuth, user, isAuthenticated } = useAuthStore();

  // Fetch CSRF token
  const fetchCsrfToken = useCallback(async () => {
    const { data } = await authApi.getCsrfToken();
    setCsrfToken(data.csrfToken);
    return data.csrfToken;
  }, [setCsrfToken]);

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      // Get CSRF token first
      await fetchCsrfToken();
      // Then login
      return authApi.login(credentials);
    },
    onSuccess: ({ data }) => {
      setUser(data.user);
      showSuccess('เข้าสู่ระบบสำเร็จ');
      navigate('/dashboard');
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      clearAuth();
      queryClient.clear();
      showSuccess('ออกจากระบบสำเร็จ');
      navigate('/login');
    },
    onError: () => {
      // Force logout even if API fails
      clearAuth();
      queryClient.clear();
      navigate('/login');
    },
  });

  // Check if user is admin
  const isAdmin = user?.role === 'ADMIN';

  return {
    user,
    isAuthenticated,
    isAdmin,
    login: loginMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
    loginError: loginMutation.error,
    fetchCsrfToken,
  };
}
```

### 1.6 Login Page (`features/auth/pages/LoginPage.tsx`)

```typescript
import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Paper, Title, Stack, Alert, Center, Box } from '@mantine/core';
import { IconAlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { LoginForm } from '../components/LoginForm';

export function LoginPage() {
  const { isAuthenticated, loginError, fetchCsrfToken } = useAuth();

  // Fetch CSRF token on mount
  useEffect(() => {
    fetchCsrfToken();
  }, [fetchCsrfToken]);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Box className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Paper shadow="md" p="xl" radius="md" className="w-full max-w-md">
        <Stack gap="lg">
          <Center>
            <Title order={2}>เข้าสู่ระบบ</Title>
          </Center>

          {loginError && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              variant="light"
            >
              {(loginError as any)?.response?.data?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่'}
            </Alert>
          )}

          <LoginForm />
        </Stack>
      </Paper>
    </Box>
  );
}
```

### 1.7 Login Form (`features/auth/components/LoginForm.tsx`)

```typescript
import { TextInput, PasswordInput, Button, Stack } from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconUser, IconLock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface FormValues {
  username: string;
  password: string;
}

export function LoginForm() {
  const { login, isLoggingIn } = useAuth();

  const form = useForm<FormValues>({
    initialValues: {
      username: '',
      password: '',
    },
    validate: {
      username: (value) => {
        if (!value) return 'กรุณากรอก Username';
        if (value.length !== 6) return 'Username ต้องมี 6 ตัวอักษร';
        if (!/^[a-zA-Z0-9]+$/.test(value)) return 'ต้องเป็นตัวอักษรหรือตัวเลขเท่านั้น';
        return null;
      },
      password: (value) => {
        if (!value) return 'กรุณากรอกรหัสผ่าน';
        if (value.length < 6) return 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
        return null;
      },
    },
    validateInputOnBlur: true,
  });

  const handleSubmit = form.onSubmit((values) => {
    login(values);
  });

  return (
    <form onSubmit={handleSubmit}>
      <Stack gap="md">
        <TextInput
          label="Username"
          placeholder="กรอก username 6 หลัก"
          leftSection={<IconUser size={16} />}
          maxLength={6}
          {...form.getInputProps('username')}
        />

        <PasswordInput
          label="รหัสผ่าน"
          placeholder="กรอกรหัสผ่าน"
          leftSection={<IconLock size={16} />}
          {...form.getInputProps('password')}
        />

        <Button
          type="submit"
          fullWidth
          loading={isLoggingIn}
          mt="sm"
        >
          เข้าสู่ระบบ
        </Button>
      </Stack>
    </form>
  );
}
```

---

## 🧩 2. Shared Components

### 2.1 DataTable Component (`components/common/DataTable/DataTable.tsx`)

```typescript
import { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { Table, Box } from '@mantine/core';
import { TablePagination } from './TablePagination';
import { TableSkeleton } from './TableSkeleton';
import { EmptyState } from './EmptyState';
import type { Pagination } from '@/types';

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  pagination?: Pagination;
  sorting?: SortingState;
  isLoading?: boolean;
  emptyMessage?: string;
  onPaginationChange?: (page: number, limit: number) => void;
  onSortingChange?: (sorting: SortingState) => void;
}

export function DataTable<T>({
  data,
  columns,
  pagination,
  sorting,
  isLoading,
  emptyMessage = 'ไม่พบข้อมูล',
  onPaginationChange,
  onSortingChange,
}: DataTableProps<T>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    state: {
      sorting,
    },
    onSortingChange: (updater) => {
      const newSorting = typeof updater === 'function' ? updater(sorting || []) : updater;
      onSortingChange?.(newSorting);
    },
    pageCount: pagination?.totalPages || 0,
  });

  if (isLoading) {
    return <TableSkeleton columns={columns.length} rows={5} />;
  }

  if (data.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
    <Box>
      <Table.ScrollContainer minWidth={800}>
        <Table>
          <Table.Thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <Table.Th
                    key={header.id}
                    onClick={header.column.getCanSort() ? header.column.getToggleSortingHandler() : undefined}
                    style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {header.column.getIsSorted() && (
                      <span className="ml-1">
                        {header.column.getIsSorted() === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </Table.Th>
                ))}
              </Table.Tr>
            ))}
          </Table.Thead>
          <Table.Tbody>
            {table.getRowModel().rows.map((row) => (
              <Table.Tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <Table.Td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Table.Td>
                ))}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      {pagination && onPaginationChange && (
        <TablePagination
          pagination={pagination}
          onChange={onPaginationChange}
        />
      )}
    </Box>
  );
}
```

### 2.2 Table Pagination (`components/common/DataTable/TablePagination.tsx`)

```typescript
import { Group, Text, Select, Pagination as MantinePagination } from '@mantine/core';
import type { Pagination } from '@/types';

interface Props {
  pagination: Pagination;
  onChange: (page: number, limit: number) => void;
}

const PAGE_SIZE_OPTIONS = ['10', '25', '50', '100'];

export function TablePagination({ pagination, onChange }: Props) {
  const { page, limit, total, totalPages } = pagination;
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  return (
    <Group justify="space-between" mt="md">
      <Group gap="xs">
        <Text size="sm" c="dimmed">
          แสดง {start} - {end} จาก {total} รายการ
        </Text>
        <Select
          size="xs"
          w={80}
          value={String(limit)}
          data={PAGE_SIZE_OPTIONS}
          onChange={(value) => value && onChange(1, Number(value))}
          allowDeselect={false}
        />
      </Group>

      <MantinePagination
        size="sm"
        total={totalPages}
        value={page}
        onChange={(newPage) => onChange(newPage, limit)}
        withEdges
      />
    </Group>
  );
}
```

### 2.3 Table Skeleton (`components/common/DataTable/TableSkeleton.tsx`)

```typescript
import { Table, Skeleton } from '@mantine/core';

interface Props {
  columns: number;
  rows?: number;
}

export function TableSkeleton({ columns, rows = 5 }: Props) {
  return (
    <Table>
      <Table.Thead>
        <Table.Tr>
          {Array.from({ length: columns }).map((_, i) => (
            <Table.Th key={i}>
              <Skeleton height={20} width="80%" />
            </Table.Th>
          ))}
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <Table.Tr key={rowIndex}>
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Table.Td key={colIndex}>
                <Skeleton height={16} width={`${60 + Math.random() * 30}%`} />
              </Table.Td>
            ))}
          </Table.Tr>
        ))}
      </Table.Tbody>
    </Table>
  );
}
```

### 2.4 Empty State (`components/common/DataTable/EmptyState.tsx`)

```typescript
import { Stack, Text, ThemeIcon } from '@mantine/core';
import { IconInbox } from 'lucide-react';

interface Props {
  message?: string;
  description?: string;
}

export function EmptyState({
  message = 'ไม่พบข้อมูล',
  description = 'ลองเปลี่ยนเงื่อนไขการค้นหา'
}: Props) {
  return (
    <Stack align="center" py="xl" gap="sm">
      <ThemeIcon size={48} variant="light" color="gray">
        <IconInbox size={24} />
      </ThemeIcon>
      <Text fw={500} c="dimmed">{message}</Text>
      <Text size="sm" c="dimmed">{description}</Text>
    </Stack>
  );
}
```

### 2.5 Search Input with Debounce (`components/common/SearchInput.tsx`)

```typescript
import { useState, useEffect } from 'react';
import { TextInput, CloseButton } from '@mantine/core';
import { IconSearch } from 'lucide-react';
import { useDebouncedValue } from '@mantine/hooks';

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounce?: number;
}

export function SearchInput({
  value,
  onChange,
  placeholder = 'ค้นหา...',
  debounce = 400
}: Props) {
  const [localValue, setLocalValue] = useState(value);
  const [debouncedValue] = useDebouncedValue(localValue, debounce);

  // Sync external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Trigger onChange when debounced value changes
  useEffect(() => {
    if (debouncedValue !== value) {
      onChange(debouncedValue);
    }
  }, [debouncedValue, onChange, value]);

  return (
    <TextInput
      placeholder={placeholder}
      leftSection={<IconSearch size={16} />}
      rightSection={
        localValue && (
          <CloseButton
            size="sm"
            onClick={() => {
              setLocalValue('');
              onChange('');
            }}
          />
        )
      }
      value={localValue}
      onChange={(e) => setLocalValue(e.currentTarget.value)}
    />
  );
}
```

### 2.6 Status Badge (`components/common/StatusBadge.tsx`)

```typescript
import { Badge, type MantineColor } from '@mantine/core';
import type { Status } from '@/types';

interface Props {
  status: Status;
}

const statusConfig: Record<Status, { label: string; color: MantineColor }> = {
  active: { label: 'ใช้งาน', color: 'green' },
  inactive: { label: 'ไม่ใช้งาน', color: 'gray' },
};

export function StatusBadge({ status }: Props) {
  const config = statusConfig[status];
  return (
    <Badge color={config.color} variant="light">
      {config.label}
    </Badge>
  );
}
```

### 2.7 Role Badge (`components/common/RoleBadge.tsx`)

```typescript
import { Badge, type MantineColor } from '@mantine/core';
import type { Role } from '@/types';

interface Props {
  role: Role;
}

const roleConfig: Record<Role, { label: string; color: MantineColor }> = {
  ADMIN: { label: 'Admin', color: 'red' },
  USER: { label: 'User', color: 'blue' },
};

export function RoleBadge({ role }: Props) {
  const config = roleConfig[role];
  return (
    <Badge color={config.color} variant="light">
      {config.label}
    </Badge>
  );
}
```

### 2.8 Confirm Modal Hook (`hooks/useConfirm.ts`)

```typescript
import { modals } from '@mantine/modals';
import { Text } from '@mantine/core';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmColor?: string;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
}

export function useConfirm() {
  const confirm = ({
    title = 'ยืนยันการดำเนินการ',
    message,
    confirmLabel = 'ยืนยัน',
    cancelLabel = 'ยกเลิก',
    confirmColor = 'red',
    onConfirm,
    onCancel,
  }: ConfirmOptions) => {
    modals.openConfirmModal({
      title,
      children: <Text size="sm">{message}</Text>,
      labels: { confirm: confirmLabel, cancel: cancelLabel },
      confirmProps: { color: confirmColor },
      onConfirm,
      onCancel,
    });
  };

  const confirmDelete = (itemName: string, onConfirm: () => void | Promise<void>) => {
    confirm({
      title: 'ยืนยันการลบ',
      message: `คุณต้องการลบ "${itemName}" หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้`,
      confirmLabel: 'ลบ',
      onConfirm,
    });
  };

  return { confirm, confirmDelete };
}
```

### 2.9 Page Header (`components/common/PageHeader.tsx`)

```typescript
import { Group, Title, Breadcrumbs, Anchor, Stack } from '@mantine/core';
import { Link } from 'react-router-dom';
import { IconChevronRight } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface Props {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  children?: React.ReactNode;
}

export function PageHeader({ title, breadcrumbs, children }: Props) {
  return (
    <Stack gap="xs" mb="lg">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs separator={<IconChevronRight size={14} />}>
          {breadcrumbs.map((item, index) => (
            item.path ? (
              <Anchor key={index} component={Link} to={item.path} size="sm">
                {item.label}
              </Anchor>
            ) : (
              <span key={index}>{item.label}</span>
            )
          ))}
        </Breadcrumbs>
      )}

      <Group justify="space-between" align="center">
        <Title order={2}>{title}</Title>
        {children && <Group gap="sm">{children}</Group>}
      </Group>
    </Stack>
  );
}
```

### 2.10 Export Menu (`components/common/ExportMenu.tsx`)

```typescript
import { useState } from 'react';
import { Menu, Button, Loader } from '@mantine/core';
import { IconDownload, IconFileSpreadsheet, IconFileTypePdf } from 'lucide-react';

interface Props {
  onExportExcel: () => Promise<void>;
  onExportPdf: () => Promise<void>;
  disabled?: boolean;
}

export function ExportMenu({ onExportExcel, onExportPdf, disabled }: Props) {
  const [loading, setLoading] = useState<'excel' | 'pdf' | null>(null);

  const handleExport = async (type: 'excel' | 'pdf') => {
    setLoading(type);
    try {
      if (type === 'excel') {
        await onExportExcel();
      } else {
        await onExportPdf();
      }
    } finally {
      setLoading(null);
    }
  };

  return (
    <Menu position="bottom-end" disabled={disabled}>
      <Menu.Target>
        <Button
          variant="default"
          leftSection={loading ? <Loader size={14} /> : <IconDownload size={16} />}
          disabled={disabled || !!loading}
        >
          Export
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item
          leftSection={<IconFileSpreadsheet size={14} />}
          onClick={() => handleExport('excel')}
          disabled={loading === 'excel'}
        >
          Excel (.xlsx)
        </Menu.Item>
        <Menu.Item
          leftSection={<IconFileTypePdf size={14} />}
          onClick={() => handleExport('pdf')}
          disabled={loading === 'pdf'}
        >
          PDF
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
```

### 2.11 Import Button (`components/common/ImportButton.tsx`)

```typescript
import { useState, useRef } from 'react';
import { Button, Modal, Text, List, Progress, Stack, Alert } from '@mantine/core';
import { IconUpload, IconCheck, IconX } from 'lucide-react';
import { apiClient } from '@/api/client';
import { showSuccess } from '@/api/error-handler';

interface ImportResult {
  success: number;
  failed: number;
  total: number;
  errors?: string[];
}

interface Props {
  endpoint: string;
  onSuccess?: () => void;
  accept?: string;
  maxSize?: number; // MB
}

export function ImportButton({
  endpoint,
  onSuccess,
  accept = '.xlsx,.xls',
  maxSize = 5
}: Props) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setResult({
        success: 0,
        failed: 1,
        total: 1,
        errors: [`ไฟล์มีขนาดใหญ่เกิน ${maxSize} MB`],
      });
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await apiClient.post<ImportResult>(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResult(response.data);

      if (response.data.success > 0) {
        showSuccess(`นำเข้าข้อมูลสำเร็จ ${response.data.success} รายการ`);
        onSuccess?.();
      }
    } catch (error: any) {
      setResult({
        success: 0,
        failed: 1,
        total: 1,
        errors: [error.response?.data?.message || 'เกิดข้อผิดพลาดในการนำเข้าข้อมูล'],
      });
    } finally {
      setLoading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const successRate = result ? Math.round((result.success / result.total) * 100) : 0;

  return (
    <>
      <Button
        variant="default"
        leftSection={<IconUpload size={16} />}
        onClick={() => fileRef.current?.click()}
        loading={loading}
      >
        นำเข้าจาก Excel
      </Button>

      <input
        ref={fileRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFileChange}
      />

      <Modal
        opened={!!result}
        onClose={() => setResult(null)}
        title="ผลการนำเข้าข้อมูล"
      >
        {result && (
          <Stack>
            <Progress
              value={successRate}
              color={successRate === 100 ? 'green' : successRate > 0 ? 'yellow' : 'red'}
              size="lg"
            />

            <div className="flex gap-4">
              <Alert icon={<IconCheck size={16} />} color="green" className="flex-1">
                <Text fw={500}>สำเร็จ: {result.success} รายการ</Text>
              </Alert>
              {result.failed > 0 && (
                <Alert icon={<IconX size={16} />} color="red" className="flex-1">
                  <Text fw={500}>ล้มเหลว: {result.failed} รายการ</Text>
                </Alert>
              )}
            </div>

            {result.errors && result.errors.length > 0 && (
              <>
                <Text fw={500} size="sm">รายละเอียดข้อผิดพลาด:</Text>
                <List size="sm" className="max-h-48 overflow-auto">
                  {result.errors.map((err, i) => (
                    <List.Item key={i} c="red">{err}</List.Item>
                  ))}
                </List>
              </>
            )}

            <Button onClick={() => setResult(null)}>ปิด</Button>
          </Stack>
        )}
      </Modal>
    </>
  );
}
```

---

## 📱 3. Layout Components

### 3.1 Main Layout (`components/layout/MainLayout.tsx`)

```typescript
import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { AppShell, LoadingOverlay } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '@/components/common/ErrorFallback';

export function MainLayout() {
  const [opened, { toggle, close }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 260,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Header opened={opened} onToggle={toggle} />
      </AppShell.Header>

      <AppShell.Navbar>
        <Sidebar onNavigate={close} />
      </AppShell.Navbar>

      <AppShell.Main>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<LoadingOverlay visible />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </AppShell.Main>
    </AppShell>
  );
}
```

### 3.2 Header (`components/layout/Header.tsx`)

```typescript
import { Group, Burger, Title, Menu, Avatar, Text, UnstyledButton } from '@mantine/core';
import { IconUser, IconLock, IconLogout, IconChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface Props {
  opened: boolean;
  onToggle: () => void;
}

export function Header({ opened, onToggle }: Props) {
  const navigate = useNavigate();
  const { user, logout, isLoggingOut } = useAuth();

  const initials = user
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : '';

  return (
    <Group h="100%" px="md" justify="space-between">
      <Group>
        <Burger
          opened={opened}
          onClick={onToggle}
          hiddenFrom="sm"
          size="sm"
        />
        <Title order={3} visibleFrom="sm">Admin System</Title>
      </Group>

      <Menu position="bottom-end" width={200}>
        <Menu.Target>
          <UnstyledButton className="hover:bg-gray-100 rounded-lg px-2 py-1">
            <Group gap="xs">
              <Avatar color="primary" radius="xl" size="sm">
                {initials}
              </Avatar>
              <div className="hidden sm:block">
                <Text size="sm" fw={500}>
                  {user?.firstName} {user?.lastName}
                </Text>
                <Text size="xs" c="dimmed">
                  {user?.role === 'ADMIN' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้งาน'}
                </Text>
              </div>
              <IconChevronDown size={14} />
            </Group>
          </UnstyledButton>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>บัญชีผู้ใช้</Menu.Label>
          <Menu.Item
            leftSection={<IconUser size={14} />}
            onClick={() => navigate('/profile')}
          >
            โปรไฟล์
          </Menu.Item>
          <Menu.Item
            leftSection={<IconLock size={14} />}
            onClick={() => navigate('/profile/password')}
          >
            เปลี่ยนรหัสผ่าน
          </Menu.Item>

          <Menu.Divider />

          <Menu.Item
            color="red"
            leftSection={<IconLogout size={14} />}
            onClick={() => logout()}
            disabled={isLoggingOut}
          >
            ออกจากระบบ
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
}
```

### 3.3 Sidebar (`components/layout/Sidebar.tsx`)

```typescript
import { ScrollArea, Stack, NavLink, Divider, Text, ThemeIcon } from '@mantine/core';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  IconHome,
  IconUsers,
  IconBuilding,
  IconFolders,
  IconClipboardList,
  IconTerminal,
  IconDatabase,
  IconServer,
} from 'lucide-react';
import { useIsAdmin } from '@/stores/auth.store';

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
}

const mainMenuItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: IconHome },
  { path: '/users', label: 'ผู้ใช้งาน', icon: IconUsers },
  { path: '/departments', label: 'แผนก', icon: IconBuilding },
  { path: '/sections', label: 'หน่วยงาน', icon: IconFolders },
];

const adminMenuItems: NavItem[] = [
  { path: '/admin/user-logs', label: 'ประวัติการใช้งาน', icon: IconClipboardList },
  { path: '/admin/system-logs', label: 'System Logs', icon: IconTerminal },
  { path: '/admin/backups', label: 'Backup', icon: IconDatabase },
  { path: '/admin/database', label: 'Database', icon: IconServer },
];

interface Props {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = useIsAdmin();

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  const renderNavItem = (item: NavItem) => (
    <NavLink
      key={item.path}
      label={item.label}
      leftSection={
        <ThemeIcon variant="light" size="sm">
          <item.icon size={16} />
        </ThemeIcon>
      }
      active={isActive(item.path)}
      onClick={() => handleNavigate(item.path)}
      styles={{
        root: { borderRadius: 'var(--mantine-radius-md)' },
      }}
    />
  );

  return (
    <ScrollArea className="h-full">
      <Stack p="md" gap="xs">
        {mainMenuItems.map(renderNavItem)}

        {isAdmin && (
          <>
            <Divider my="sm" />
            <Text size="xs" c="dimmed" fw={600} px="sm" tt="uppercase">
              ผู้ดูแลระบบ
            </Text>
            {adminMenuItems.map(renderNavItem)}
          </>
        )}
      </Stack>
    </ScrollArea>
  );
}
```

### 3.4 Protected Route (`components/layout/ProtectedRoute.tsx`)

```typescript
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth.store';
import { LoadingOverlay } from '@mantine/core';

export function ProtectedRoute() {
  const location = useLocation();
  const { isAuthenticated, isHydrated } = useAuthStore();

  // Wait for auth state to be hydrated from storage
  if (!isHydrated) {
    return <LoadingOverlay visible />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
```

### 3.5 Admin Route (`components/layout/AdminRoute.tsx`)

```typescript
import { Navigate, Outlet } from 'react-router-dom';
import { useIsAdmin } from '@/stores/auth.store';

export function AdminRoute() {
  const isAdmin = useIsAdmin();

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
```

### 3.6 Error Fallback (`components/common/ErrorFallback.tsx`)

```typescript
import { Stack, Title, Text, Button, Paper } from '@mantine/core';
import { IconAlertTriangle, IconRefresh } from 'lucide-react';
import type { FallbackProps } from 'react-error-boundary';

export function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <Paper p="xl" className="text-center">
      <Stack align="center" gap="md">
        <IconAlertTriangle size={48} className="text-red-500" />
        <Title order={3}>เกิดข้อผิดพลาด</Title>
        <Text c="dimmed" size="sm" className="max-w-md">
          {error.message || 'เกิดข้อผิดพลาดที่ไม่คาดคิด กรุณาลองใหม่อีกครั้ง'}
        </Text>
        <Button
          leftSection={<IconRefresh size={16} />}
          onClick={resetErrorBoundary}
        >
          ลองใหม่
        </Button>
      </Stack>
    </Paper>
  );
}
```

---

## 👥 4. User Management Module

### 4.1 User API Service (`api/services/user.api.ts`)

```typescript
import { apiClient, downloadFile } from '../client';
import type { User, CreateUserRequest, UpdateUserRequest, PaginatedResponse, UserQueryParams } from '@/types';

export const userApi = {
  getAll: (params: UserQueryParams) =>
    apiClient.get<PaginatedResponse<User>>('/users', { params }),

  getById: (id: number) =>
    apiClient.get<{ user: User }>(`/users/${id}`),

  create: (data: CreateUserRequest) =>
    apiClient.post<{ user: User }>('/users', data),

  update: (id: number, data: UpdateUserRequest) =>
    apiClient.put<{ user: User }>(`/users/${id}`, data),

  delete: (id: number) =>
    apiClient.delete(`/users/${id}`),

  verifyPassword: (password: string) =>
    apiClient.post<{ valid: boolean }>('/users/password/verify', { password }),

  resetPassword: (id: number, newPassword: string) =>
    apiClient.patch(`/users/${id}/password/reset`, { newPassword }),

  exportExcel: (params?: UserQueryParams) =>
    downloadFile(`/users/export/excel?${new URLSearchParams(params as any)}`, `users-${Date.now()}.xlsx`),

  exportPdf: (params?: UserQueryParams) =>
    downloadFile(`/users/export/pdf?${new URLSearchParams(params as any)}`, `users-${Date.now()}.pdf`),

  import: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/users/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
```

### 4.2 useUsers Hook (`features/users/hooks/useUsers.ts`)

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/api/services/user.api';
import { showSuccess } from '@/api/error-handler';
import type { UserQueryParams, CreateUserRequest, UpdateUserRequest } from '@/types';

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (params: UserQueryParams) => [...userKeys.lists(), params] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
};

export function useUsers(params: UserQueryParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => userApi.getAll(params).then((res) => res.data),
    placeholderData: (previousData) => previousData,
  });
}

export function useUser(id: number) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userApi.getById(id).then((res) => res.data.user),
    enabled: id > 0,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserRequest) => userApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      showSuccess('สร้างผู้ใช้สำเร็จ');
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserRequest }) =>
      userApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(id) });
      showSuccess('อัปเดตผู้ใช้สำเร็จ');
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => userApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      showSuccess('ลบผู้ใช้สำเร็จ');
    },
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ id, newPassword }: { id: number; newPassword: string }) =>
      userApi.resetPassword(id, newPassword),
    onSuccess: () => {
      showSuccess('รีเซ็ตรหัสผ่านสำเร็จ');
    },
  });
}
```

### 4.3 User List Page (`features/users/pages/UserListPage.tsx`)

```typescript
import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Group } from '@mantine/core';
import { createColumnHelper } from '@tanstack/react-table';
import { IconPlus } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable/DataTable';
import { StatusBadge } from '@/components/common/StatusBadge';
import { RoleBadge } from '@/components/common/RoleBadge';
import { ExportMenu } from '@/components/common/ExportMenu';
import { ImportButton } from '@/components/common/ImportButton';
import { UserFilters } from '../components/UserFilters';
import { UserActionMenu } from '../components/UserActionMenu';
import { useUsers, useDeleteUser, userKeys } from '../hooks/useUsers';
import { useConfirm } from '@/hooks/useConfirm';
import { useIsAdmin } from '@/stores/auth.store';
import { userApi } from '@/api/services/user.api';
import { useQueryClient } from '@tanstack/react-query';
import type { User, UserQueryParams } from '@/types';

const columnHelper = createColumnHelper<User>();

const DEFAULT_PARAMS: UserQueryParams = {
  page: 1,
  limit: 10,
  sort: 'createdAt',
  order: 'desc',
};

export function UserListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isAdmin = useIsAdmin();
  const { confirmDelete } = useConfirm();

  const [params, setParams] = useState<UserQueryParams>(DEFAULT_PARAMS);
  const { data, isLoading } = useUsers(params);
  const deleteUser = useDeleteUser();

  const handleDelete = useCallback((user: User) => {
    confirmDelete(`${user.firstName} ${user.lastName}`, () => {
      deleteUser.mutate(user.id);
    });
  }, [confirmDelete, deleteUser]);

  const columns = useMemo(() => [
    columnHelper.accessor('username', {
      header: 'Username',
      enableSorting: true,
    }),
    columnHelper.accessor((row) => `${row.firstName} ${row.lastName}`, {
      id: 'fullName',
      header: 'ชื่อ-นามสกุล',
    }),
    columnHelper.accessor('department.name', {
      header: 'แผนก',
      cell: (info) => info.getValue() || '-',
    }),
    columnHelper.accessor('section.name', {
      header: 'หน่วยงาน',
      cell: (info) => info.getValue() || '-',
    }),
    columnHelper.accessor('role', {
      header: 'Role',
      cell: (info) => <RoleBadge role={info.getValue()} />,
    }),
    columnHelper.accessor('status', {
      header: 'สถานะ',
      cell: (info) => <StatusBadge status={info.getValue()} />,
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <UserActionMenu
          user={row.original}
          onEdit={() => navigate(`/users/${row.original.id}/edit`)}
          onDelete={() => handleDelete(row.original)}
          canEdit={isAdmin}
          canDelete={isAdmin}
        />
      ),
    }),
  ], [navigate, handleDelete, isAdmin]);

  const handlePaginationChange = (page: number, limit: number) => {
    setParams((prev) => ({ ...prev, page, limit }));
  };

  const handleExportExcel = () => userApi.exportExcel(params);
  const handleExportPdf = () => userApi.exportPdf(params);
  const handleImportSuccess = () => {
    queryClient.invalidateQueries({ queryKey: userKeys.lists() });
  };

  return (
    <div>
      <PageHeader
        title="จัดการผู้ใช้"
        breadcrumbs={[
          { label: 'หน้าหลัก', path: '/dashboard' },
          { label: 'ผู้ใช้งาน' },
        ]}
      >
        <ExportMenu onExportExcel={handleExportExcel} onExportPdf={handleExportPdf} />
        {isAdmin && (
          <>
            <ImportButton endpoint="/users/import" onSuccess={handleImportSuccess} />
            <Button leftSection={<IconPlus size={16} />} onClick={() => navigate('/users/create')}>
              เพิ่มผู้ใช้
            </Button>
          </>
        )}
      </PageHeader>

      <UserFilters
        params={params}
        onChange={(newParams) => setParams({ ...newParams, page: 1 })}
      />

      <DataTable
        data={data?.users || []}
        columns={columns}
        pagination={data?.pagination}
        isLoading={isLoading}
        emptyMessage="ไม่พบผู้ใช้งาน"
        onPaginationChange={handlePaginationChange}
      />
    </div>
  );
}
```

### 4.4 User Filters (`features/users/components/UserFilters.tsx`)

```typescript
import { Paper, Group, Select } from '@mantine/core';
import { SearchInput } from '@/components/common/SearchInput';
import { DepartmentSelect } from '@/components/forms/DepartmentSelect';
import { SectionSelect } from '@/components/forms/SectionSelect';
import type { UserQueryParams } from '@/types';

interface Props {
  params: UserQueryParams;
  onChange: (params: UserQueryParams) => void;
}

export function UserFilters({ params, onChange }: Props) {
  return (
    <Paper p="md" mb="md" withBorder>
      <Group>
        <SearchInput
          value={params.search || ''}
          onChange={(search) => onChange({ ...params, search })}
          placeholder="ค้นหาชื่อ, username..."
        />

        <DepartmentSelect
          value={params.departmentId || null}
          onChange={(departmentId) => onChange({ ...params, departmentId: departmentId || undefined, sectionId: undefined })}
          placeholder="ทุกแผนก"
          clearable
        />

        <SectionSelect
          departmentId={params.departmentId || null}
          value={params.sectionId || null}
          onChange={(sectionId) => onChange({ ...params, sectionId: sectionId || undefined })}
          placeholder="ทุกหน่วยงาน"
          clearable
        />

        <Select
          placeholder="ทุก Role"
          value={params.role || null}
          onChange={(role) => onChange({ ...params, role: role as any })}
          data={[
            { value: 'USER', label: 'User' },
            { value: 'ADMIN', label: 'Admin' },
          ]}
          clearable
        />

        <Select
          placeholder="ทุกสถานะ"
          value={params.status || null}
          onChange={(status) => onChange({ ...params, status: status as any })}
          data={[
            { value: 'active', label: 'ใช้งาน' },
            { value: 'inactive', label: 'ไม่ใช้งาน' },
          ]}
          clearable
        />
      </Group>
    </Paper>
  );
}
```

### 4.5 User Form (`features/users/components/UserForm.tsx`)

```typescript
import { useEffect } from 'react';
import { TextInput, PasswordInput, Select, Button, Grid, Stack, Paper, Divider } from '@mantine/core';
import { useForm } from '@mantine/form';
import { DepartmentSelect } from '@/components/forms/DepartmentSelect';
import { SectionSelect } from '@/components/forms/SectionSelect';
import type { User, CreateUserRequest } from '@/types';

interface Props {
  initialData?: User;
  onSubmit: (data: CreateUserRequest) => void;
  isLoading?: boolean;
}

export function UserForm({ initialData, onSubmit, isLoading }: Props) {
  const isEdit = !!initialData;

  const form = useForm({
    initialValues: {
      username: '',
      password: '',
      firstName: '',
      lastName: '',
      departmentId: null as number | null,
      sectionId: null as number | null,
      email: '',
      tel: '',
      role: 'USER' as const,
      status: 'active' as const,
    },
    validate: {
      username: (value) => {
        if (!value) return 'กรุณากรอก Username';
        if (value.length !== 6) return 'Username ต้องมี 6 ตัวอักษร';
        if (!/^[a-zA-Z0-9]+$/.test(value)) return 'ต้องเป็นตัวอักษรหรือตัวเลขเท่านั้น';
        return null;
      },
      password: (value) => {
        if (!isEdit && !value) return 'กรุณากรอกรหัสผ่าน';
        if (value && value.length < 6) return 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร';
        return null;
      },
      firstName: (value) => !value ? 'กรุณากรอกชื่อ' : null,
      lastName: (value) => !value ? 'กรุณากรอกนามสกุล' : null,
      departmentId: (value) => !value ? 'กรุณาเลือกแผนก' : null,
      email: (value) => {
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'รูปแบบอีเมลไม่ถูกต้อง';
        }
        return null;
      },
      tel: (value) => {
        if (value && !/^\d{10}$/.test(value)) {
          return 'เบอร์โทรต้องเป็นตัวเลข 10 หลัก';
        }
        return null;
      },
    },
    validateInputOnBlur: true,
  });

  // Set initial values when editing
  useEffect(() => {
    if (initialData) {
      form.setValues({
        username: initialData.username,
        password: '',
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        departmentId: initialData.departmentId,
        sectionId: initialData.sectionId,
        email: initialData.email || '',
        tel: initialData.tel || '',
        role: initialData.role,
        status: initialData.status,
      });
    }
  }, [initialData]);

  const handleSubmit = form.onSubmit((values) => {
    const data: any = { ...values };

    // Remove password if empty on edit
    if (isEdit && !data.password) {
      delete data.password;
    }

    // Convert null to undefined
    if (!data.sectionId) data.sectionId = undefined;
    if (!data.email) data.email = undefined;
    if (!data.tel) data.tel = undefined;

    onSubmit(data);
  });

  return (
    <Paper p="lg" withBorder>
      <form onSubmit={handleSubmit}>
        <Stack gap="lg">
          {/* Account Info */}
          <div>
            <h3 className="text-lg font-medium mb-4">ข้อมูลบัญชี</h3>
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="Username"
                  placeholder="กรอก username 6 หลัก"
                  disabled={isEdit}
                  maxLength={6}
                  required
                  {...form.getInputProps('username')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <PasswordInput
                  label="รหัสผ่าน"
                  placeholder={isEdit ? 'เว้นว่างถ้าไม่ต้องการเปลี่ยน' : 'กรอกรหัสผ่าน'}
                  required={!isEdit}
                  {...form.getInputProps('password')}
                />
              </Grid.Col>
            </Grid>
          </div>

          <Divider />

          {/* Personal Info */}
          <div>
            <h3 className="text-lg font-medium mb-4">ข้อมูลส่วนตัว</h3>
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="ชื่อ"
                  placeholder="กรอกชื่อ"
                  required
                  {...form.getInputProps('firstName')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="นามสกุล"
                  placeholder="กรอกนามสกุล"
                  required
                  {...form.getInputProps('lastName')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="อีเมล"
                  placeholder="example@email.com"
                  {...form.getInputProps('email')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <TextInput
                  label="เบอร์โทร"
                  placeholder="0812345678"
                  maxLength={10}
                  {...form.getInputProps('tel')}
                />
              </Grid.Col>
            </Grid>
          </div>

          <Divider />

          {/* Organization Info */}
          <div>
            <h3 className="text-lg font-medium mb-4">สังกัด</h3>
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <DepartmentSelect
                  label="แผนก"
                  required
                  value={form.values.departmentId}
                  onChange={(value) => {
                    form.setFieldValue('departmentId', value);
                    form.setFieldValue('sectionId', null);
                  }}
                  error={form.errors.departmentId as string}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <SectionSelect
                  label="หน่วยงาน"
                  departmentId={form.values.departmentId}
                  value={form.values.sectionId}
                  onChange={(value) => form.setFieldValue('sectionId', value)}
                />
              </Grid.Col>
            </Grid>
          </div>

          <Divider />

          {/* Role & Status */}
          <div>
            <h3 className="text-lg font-medium mb-4">สิทธิ์และสถานะ</h3>
            <Grid>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Select
                  label="Role"
                  data={[
                    { value: 'USER', label: 'User' },
                    { value: 'ADMIN', label: 'Admin' },
                  ]}
                  {...form.getInputProps('role')}
                />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 6 }}>
                <Select
                  label="สถานะ"
                  data={[
                    { value: 'active', label: 'ใช้งาน' },
                    { value: 'inactive', label: 'ไม่ใช้งาน' },
                  ]}
                  {...form.getInputProps('status')}
                />
              </Grid.Col>
            </Grid>
          </div>

          <Button type="submit" loading={isLoading} size="md">
            {isEdit ? 'บันทึกการแก้ไข' : 'สร้างผู้ใช้'}
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
```

---

## 📋 5. TypeScript Types

### Complete Types (`types/index.ts`)

```typescript
// ============ Common Types ============
export type Status = 'active' | 'inactive';
export type Role = 'USER' | 'ADMIN';
export type ActionType = 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT';
export type SortOrder = 'asc' | 'desc';

// ============ Pagination ============
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  users?: T[];
  departments?: T[];
  sections?: T[];
  logs?: T[];
  pagination: Pagination;
}

// ============ Query Params ============
export interface BaseQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: SortOrder;
  search?: string;
}

export interface UserQueryParams extends BaseQueryParams {
  departmentId?: number;
  sectionId?: number;
  role?: Role;
  status?: Status;
}

export interface DepartmentQueryParams extends BaseQueryParams {
  status?: Status;
}

export interface SectionQueryParams extends BaseQueryParams {
  departmentId?: number;
  status?: Status;
}

export interface UserLogQueryParams extends BaseQueryParams {
  username?: string;
  actionType?: ActionType;
  startDate?: string;
  endDate?: string;
}

// ============ User ============
export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  departmentId: number;
  sectionId: number | null;
  email: string | null;
  tel: string | null;
  role: Role;
  status: Status;
  createdAt: string;
  createdBy: string;
  updatedAt: string | null;
  updatedBy: string | null;
  lastLoginAt: string | null;
  isDefaultPassword: boolean;
  department?: Department;
  section?: Section | null;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  departmentId: number;
  sectionId?: number;
  email?: string;
  tel?: string;
  role?: Role;
  status?: Status;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  departmentId?: number;
  sectionId?: number | null;
  email?: string | null;
  tel?: string | null;
  role?: Role;
  status?: Status;
  password?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  tel?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ============ Department ============
export interface Department {
  id: number;
  name: string;
  status: Status;
  createdAt: string;
  createdBy: string;
  updatedAt: string | null;
  updatedBy: string | null;
  sections?: Section[];
  _count?: {
    users: number;
    sections: number;
  };
}

export interface CreateDepartmentRequest {
  name: string;
  status?: Status;
}

// ============ Section ============
export interface Section {
  id: number;
  departmentId: number;
  name: string;
  status: Status;
  createdAt: string;
  createdBy: string;
  updatedAt: string | null;
  updatedBy: string | null;
  department?: Department;
  _count?: {
    users: number;
  };
}

export interface CreateSectionRequest {
  name: string;
  departmentId: number;
  status?: Status;
}

// ============ User Log ============
export interface UserLog {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  department: string;
  section: string;
  email: string | null;
  tel: string | null;
  role: Role;
  status: Status;
  actionType: ActionType;
  actionAt: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string | null;
  updatedBy: string | null;
}

// ============ Backup ============
export interface BackupFile {
  filename: string;
  size: number;
  createdAt: string;
}

// ============ Database ============
export interface DatabaseStats {
  databaseSize: string;
  tables: Array<{
    name: string;
    rowCount: number;
    size: string;
  }>;
}
```

---

## 🛠️ 6. Utility Functions

### Date Utilities (`lib/date.ts`)

```typescript
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import buddhistEra from 'dayjs/plugin/buddhistEra';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(buddhistEra);
dayjs.extend(relativeTime);
dayjs.locale('th');

export const formatDate = (date: string | Date, format = 'DD/MM/BBBB') => {
  return dayjs(date).format(format);
};

export const formatDateTime = (date: string | Date, format = 'DD/MM/BBBB HH:mm') => {
  return dayjs(date).format(format);
};

export const formatTime = (date: string | Date, format = 'HH:mm') => {
  return dayjs(date).format(format);
};

export const formatRelative = (date: string | Date) => {
  return dayjs(date).fromNow();
};

export const formatDateRange = (start: Date | null, end: Date | null) => {
  if (!start) return '';
  if (!end) return formatDate(start);
  return `${formatDate(start)} - ${formatDate(end)}`;
};
```

### File Utilities (`lib/file.ts`)

```typescript
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

export const getFileExtension = (filename: string): string => {
  return filename.slice(((filename.lastIndexOf('.') - 1) >>> 0) + 2);
};

export const isExcelFile = (file: File): boolean => {
  const validTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
  ];
  return validTypes.includes(file.type) || /\.xlsx?$/i.test(file.name);
};
```

### General Utilities (`lib/utils.ts`)

```typescript
import { clsx, type ClassValue } from 'clsx';

export const cn = (...inputs: ClassValue[]) => clsx(inputs);

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const truncate = (str: string, length: number) => {
  if (str.length <= length) return str;
  return `${str.slice(0, length)}...`;
};

export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const getInitials = (firstName: string, lastName: string) => {
  return `${firstName[0]}${lastName[0]}`.toUpperCase();
};
```

---

## 🚀 7. Implementation Checklist

### Phase 1: Foundation (วันที่ 1-2)
- [ ] ติดตั้ง dependencies: `npm install zustand @tanstack/react-query`
- [ ] สร้างโครงสร้าง folders
- [ ] Setup path aliases (vite.config.ts, tsconfig.json)
- [ ] สร้าง TypeScript types ทั้งหมด
- [ ] Setup API client + error handler
- [ ] สร้าง Auth store (Zustand)
- [ ] Setup TanStack Query provider
- [ ] Setup Mantine theme

### Phase 2: Authentication (วันที่ 3)
- [ ] Login page
- [ ] useAuth hook
- [ ] Protected routes
- [ ] Admin routes
- [ ] CSRF token handling
- [ ] Logout functionality

### Phase 3: Layout & Common Components (วันที่ 4-5)
- [ ] MainLayout with AppShell
- [ ] Header component
- [ ] Sidebar navigation
- [ ] DataTable component
- [ ] Pagination component
- [ ] Search input with debounce
- [ ] Status/Role badges
- [ ] Export/Import buttons
- [ ] Confirm modal hook
- [ ] Error boundary

### Phase 4: User Management (วันที่ 6-8)
- [ ] User list page
- [ ] User filters
- [ ] User create page
- [ ] User edit page
- [ ] User form component
- [ ] Reset password modal
- [ ] Import/Export users

### Phase 5: Department & Section (วันที่ 9-10)
- [ ] Department list page
- [ ] Department create/edit
- [ ] Section list page
- [ ] Section create/edit
- [ ] DepartmentSelect component
- [ ] SectionSelect component

### Phase 6: Admin Features (วันที่ 11-13)
- [ ] User activity logs page
- [ ] System logs page
- [ ] Backup management page
- [ ] Database statistics page

### Phase 7: Profile (วันที่ 14)
- [ ] Profile page
- [ ] Change password page

### Phase 8: Polish & Testing (วันที่ 15-16)
- [ ] Loading states ทุกหน้า
- [ ] Error handling ทุกจุด
- [ ] Empty states
- [ ] Responsive design
- [ ] Accessibility improvements
- [ ] Performance optimization
- [ ] Testing

---

## 📚 API Endpoints Reference

| Module | Method | Endpoint | Auth | Role |
|--------|--------|----------|------|------|
| **Auth** | GET | `/auth/csrf-token` | No | - |
| | POST | `/auth/login` | No | - |
| | POST | `/auth/logout` | Yes | Any |
| | GET | `/auth/me` | Yes | Any |
| | PUT | `/auth/me` | Yes | Any |
| | PUT | `/auth/me/password` | Yes | Any |
| **Users** | GET | `/users` | Yes | Any |
| | GET | `/users/:id` | Yes | Any |
| | POST | `/users` | Yes | Admin |
| | PUT | `/users/:id` | Yes | Admin |
| | DELETE | `/users/:id` | Yes | Admin |
| | POST | `/users/password/verify` | Yes | Any |
| | PATCH | `/users/:id/password/reset` | Yes | Admin |
| | GET | `/users/export/excel` | Yes | Any |
| | GET | `/users/export/pdf` | Yes | Any |
| | POST | `/users/import` | Yes | Admin |
| **Departments** | GET | `/departments` | Yes | Any |
| | GET | `/departments/:id` | Yes | Any |
| | POST | `/departments` | Yes | Admin |
| | PUT | `/departments/:id` | Yes | Admin |
| | DELETE | `/departments/:id` | Yes | Admin |
| | GET | `/departments/export/excel` | Yes | Any |
| | GET | `/departments/export/pdf` | Yes | Any |
| | POST | `/departments/import` | Yes | Admin |
| **Sections** | GET | `/sections` | Yes | Any |
| | GET | `/sections/:id` | Yes | Any |
| | POST | `/sections` | Yes | Admin |
| | PUT | `/sections/:id` | Yes | Admin |
| | DELETE | `/sections/:id` | Yes | Admin |
| | GET | `/sections/export/excel` | Yes | Any |
| | GET | `/sections/export/pdf` | Yes | Any |
| | POST | `/sections/import` | Yes | Admin |
| **Master Data** | GET | `/master-data/departments` | Yes | Any |
| | GET | `/master-data/departments/:id/sections` | Yes | Any |
| | POST | `/master-data/departments/sections/search` | Yes | Any |
| | GET | `/master-data/users` | Yes | Any |
| | GET | `/master-data/users/from-logs` | Yes | Any |
| **User Logs** | GET | `/user-logs` | Yes | Admin |
| | GET | `/user-logs/:id` | Yes | Admin |
| **System Logs** | GET | `/system-log` | Yes | Admin |
| | GET | `/system-log/files` | Yes | Admin |
| | DELETE | `/system-log/cleanup` | Yes | Admin |
| **Backup** | GET | `/backup` | Yes | Admin |
| | POST | `/backup` | Yes | Admin |
| | GET | `/backup/:filename` | Yes | Admin |
| | POST | `/backup/:filename/restore` | Yes | Admin |
| | DELETE | `/backup/:filename` | Yes | Admin |
| **Database** | GET | `/database/statistics` | Yes | Admin |
| | POST | `/database/analyze` | Yes | Admin |
| **Health** | GET | `/health` | No | - |
| | GET | `/health/db` | No | - |

---

*Document Version 2.0 - Updated for Mantine UI with improvements*
