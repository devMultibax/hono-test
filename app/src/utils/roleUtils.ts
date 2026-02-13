import type { RoleId } from '@/constants/roleConstants';

interface ItemWithRole {
  allowedRoles?: readonly RoleId[];
}

export function hasRole(allowedRoles: readonly RoleId[], currentRole: RoleId): boolean {
  return allowedRoles.includes(currentRole);
}

export function filterItemsByRole<T extends ItemWithRole>(items: T[], userRole: RoleId): T[] {
  if (!Array.isArray(items)) return [];

  return items.filter((item) => {
    if (!item.allowedRoles?.length) return true;
    return item.allowedRoles.includes(userRole);
  });
}
