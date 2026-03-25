import { ROLE_ID } from '@/constants/roleConstants';
import { hasRole } from '@/utils/roleUtils';
import { useUserRole } from '@/stores/auth.store';

export function useChangelogPermissions() {
  const role = useUserRole();
  return {
    // Action menu
    canView:   hasRole([ROLE_ID.ADMIN], role),
    canEdit:   hasRole([ROLE_ID.ADMIN], role),
    canDelete: hasRole([ROLE_ID.ADMIN], role),
    // Header buttons
    canCreate: hasRole([ROLE_ID.ADMIN], role),
  } as const;
}