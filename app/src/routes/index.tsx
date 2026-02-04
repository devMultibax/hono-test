import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { AdminRoute } from '@/components/layout/AdminRoute';

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
        path: 'dashboard',
        element: <div className="p-8"><h1 className="text-2xl font-bold">Dashboard</h1><p>Welcome to Admin System</p></div>,
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
        element: <div className="p-8"><h1 className="text-2xl font-bold">Users</h1></div>,
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
]);