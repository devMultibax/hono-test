import { Navigate, Outlet } from 'react-router-dom';
import { useIsAdmin } from '@/stores/auth.store';

export function AdminRoute() {
  const isAdmin = useIsAdmin();

  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}