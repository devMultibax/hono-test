import { ROLE_ID } from '@/constants/roleConstants';
import { hasRole } from '@/utils/roleUtils';
import { useUserRole } from '@/stores/auth.store';

export function useUserPermissions() {
  const role = useUserRole();
  return {
    isAdmin:          role === ROLE_ID.ADMIN,
    // Action menu
    canView:          hasRole([ROLE_ID.ADMIN, ROLE_ID.USER], role),
    canEdit:          hasRole([ROLE_ID.ADMIN], role),
    canDelete:        hasRole([ROLE_ID.ADMIN], role),
    canViewLogs:      hasRole([ROLE_ID.ADMIN], role),
    canResetPassword: hasRole([ROLE_ID.ADMIN], role),
    // Header buttons
    canCreate:        hasRole([ROLE_ID.ADMIN], role),
    canImport:        hasRole([ROLE_ID.ADMIN], role),
    canExport:        hasRole([ROLE_ID.ADMIN, ROLE_ID.USER], role),
    // Toolbar
    canBulkDelete:    hasRole([ROLE_ID.ADMIN], role),
    // Filters
    canFilterByRole:        hasRole([ROLE_ID.ADMIN], role),
    canViewAllDepartments:  hasRole([ROLE_ID.ADMIN], role),
  } as const;
}
