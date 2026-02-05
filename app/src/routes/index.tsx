import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { AdminRoute } from '@/components/layout/AdminRoute';
import {
  UserListPage,
  UserCreatePage,
  UserEditPage,
  UserDetailPage,
} from '@/features/users';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <MainLayout />,
        children: [
          {
            path: 'dashboard',
            element: (
              <div className="p-8">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p>Welcome to Admin System</p>
                <div className="mt-4 p-4 bg-gray-100 rounded">
                  <h2 className="font-semibold mb-2">Debug Info:</h2>
                  <pre className="text-xs">{JSON.stringify(
                    (() => {
                      const authStorage = localStorage.getItem('auth-storage');
                      return authStorage ? JSON.parse(authStorage) : null;
                    })(),
                    null,
                    2
                  )}</pre>
                </div>
              </div>
            ),
          },
          {
            path: 'profile',
            element: <div className="p-8"><h1 className="text-2xl font-bold">Profile</h1></div>,
          },
          {
            path: 'profile/password',
            element: <div className="p-8"><h1 className="text-2xl font-bold">Change Password</h1></div>,
          },
          {
            path: 'users',
            element: <UserListPage />,
          },
          {
            path: 'users/create',
            element: <UserCreatePage />,
          },
          {
            path: 'users/:id/edit',
            element: <UserEditPage />,
          },
          {
            path: 'users/:id',
            element: <UserDetailPage />,
          },
          {
            path: 'departments',
            element: <div className="p-8"><h1 className="text-2xl font-bold">Departments</h1></div>,
          },
          {
            path: 'sections',
            element: <div className="p-8"><h1 className="text-2xl font-bold">Sections</h1></div>,
          },
          {
            path: 'admin',
            element: <AdminRoute />,
            children: [
              {
                path: 'user-logs',
                element: <div className="p-8"><h1 className="text-2xl font-bold">User Logs</h1></div>,
              },
              {
                path: 'system-logs',
                element: <div className="p-8"><h1 className="text-2xl font-bold">System Logs</h1></div>,
              },
              {
                path: 'backups',
                element: <div className="p-8"><h1 className="text-2xl font-bold">Backups</h1></div>,
              },
              {
                path: 'database',
                element: <div className="p-8"><h1 className="text-2xl font-bold">Database</h1></div>,
              },
            ],
          },
        ],
      },
    ],
  },
]);