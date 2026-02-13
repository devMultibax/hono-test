import { Navigate, Outlet } from 'react-router-dom';
import { useUserRole } from '@/stores/auth.store';
import { ROLE_ID } from '@/constants/roleConstants';
import { hasRole } from '@/utils/roleUtils';

export function AdminRoute() {
  const userRole = useUserRole();

  if (!hasRole([ROLE_ID.ADMIN], userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
