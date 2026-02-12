import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { MainLayout } from '@/components/layout/MainLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { AdminRoute } from '@/components/layout/AdminRoute';
import { UserListPage } from '@/features/users';
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
            handle: { title: 'navigation:page.dashboard.title' },
          },
          {
            path: 'profile',
            element: <Outlet />,
            handle: { breadcrumb: 'navigation:page.profile' },
            children: [
              {
                index: true,
                element: <ProfilePage />,
                handle: { title: 'navigation:page.profile' },
              },
              {
                path: 'password',
                element: <ChangePasswordPage />,
                handle: {
                  title: 'navigation:page.changePassword',
                  breadcrumb: 'navigation:page.changePassword',
                },
              },
            ],
          },
          {
            path: 'users',
            element: <UserListPage />,
            handle: { title: 'users:page.title', breadcrumb: 'navigation:menu.users' },
          },
          {
            path: 'departments',
            element: <DepartmentsPage />,
            handle: { title: 'navigation:page.departments', breadcrumb: 'navigation:menu.departments' },
          },
          {
            path: 'sections',
            element: <SectionsPage />,
            handle: { title: 'navigation:page.sections', breadcrumb: 'navigation:menu.sections' },
          },
          {
            path: 'admin',
            element: <AdminRoute />,
            handle: { breadcrumb: 'navigation:menu.admin.title' },
            children: [
              {
                path: 'user-logs',
                element: <UserLogsPage />,
                handle: { title: 'navigation:page.userLogs', breadcrumb: 'navigation:menu.admin.userLogs' },
              },
              {
                path: 'system-logs',
                element: <SystemLogsPage />,
                handle: { title: 'navigation:page.systemLogs', breadcrumb: 'navigation:menu.admin.systemLogs' },
              },
              {
                path: 'backups',
                element: <BackupsPage />,
                handle: { title: 'navigation:page.backups', breadcrumb: 'navigation:menu.admin.backups' },
              },
              {
                path: 'database',
                element: <DatabasePage />,
                handle: { title: 'navigation:page.database', breadcrumb: 'navigation:menu.admin.database' },
              },
            ],
          },
        ],
      },
    ],
  },
]);
