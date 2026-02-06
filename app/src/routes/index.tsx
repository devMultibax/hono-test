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
import {
  DashboardPage,
  ProfilePage,
  ChangePasswordPage,
  DepartmentsPage,
  SectionsPage,
  UserLogsPage,
  SystemLogsPage,
  BackupsPage,
  DatabasePage,
} from './pages';

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
            element: <DashboardPage />,
          },
          {
            path: 'profile',
            element: <ProfilePage />,
          },
          {
            path: 'profile/password',
            element: <ChangePasswordPage />,
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
            element: <DepartmentsPage />,
          },
          {
            path: 'sections',
            element: <SectionsPage />,
          },
          {
            path: 'admin',
            element: <AdminRoute />,
            children: [
              {
                path: 'user-logs',
                element: <UserLogsPage />,
              },
              {
                path: 'system-logs',
                element: <SystemLogsPage />,
              },
              {
                path: 'backups',
                element: <BackupsPage />,
              },
              {
                path: 'database',
                element: <DatabasePage />,
              },
            ],
          },
        ],
      },
    ],
  },
]);
