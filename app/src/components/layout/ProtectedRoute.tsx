import { useEffect, useRef } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { LoadingOverlay } from '@mantine/core';
import { useAuthStore } from '@/stores/auth.store';
import { apiClient } from '@/api/client';
import { useMaintenanceStatus } from '@/features/system-settings/hooks/useSystemSettings';

export function ProtectedRoute() {
  const location = useLocation();
  const { isAuthenticated, isHydrated, csrfToken, setCsrfToken, user } = useAuthStore();
  const hasFetched = useRef(false);
  const { data: maintenanceStatus } = useMaintenanceStatus({ enabled: isHydrated });

  // Fetch CSRF token if missing
  useEffect(() => {
    if (!isAuthenticated || !isHydrated || csrfToken || hasFetched.current) return;

    hasFetched.current = true;
    apiClient
      .get('/auth/csrf-token')
      .then((res) => setCsrfToken(res.data.csrfToken))
      .catch(() => (hasFetched.current = false));
  }, [isAuthenticated, isHydrated, csrfToken, setCsrfToken]);

  // Reset on logout
  useEffect(() => {
    if (!isAuthenticated) hasFetched.current = false;
  }, [isAuthenticated]);

  if (!isHydrated) return <LoadingOverlay visible />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;

  // Redirect non-admin users to maintenance page when maintenance is active
  if (maintenanceStatus?.maintenance && user?.role !== 'ADMIN') {
    return <Navigate to="/maintenance" replace />;
  }

  return <Outlet />;
}
