import { ScrollArea, Stack, NavLink, Divider, Text, ThemeIcon } from '@mantine/core';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Home,
  Users,
  Building2,
  Folders,
  ClipboardList,
  Terminal,
  Database,
  Server,
} from 'lucide-react';
import { ROLE_ID, type RoleId } from '@/constants/roleConstants';
import { hasRole } from '@/utils/roleUtils';
import { useUserRole } from '@/stores/auth.store';
import { useTranslation } from '@/lib/i18n';

interface SubMenuItem {
  path: string;
  label: string;
  icon: React.ElementType;
  allowedRoles: readonly RoleId[];
}

interface MenuItem {
  id: string;
  path?: string;
  label: string;
  icon: React.ElementType;
  allowedRoles: readonly RoleId[];
  hasSubmenu: boolean;
  children?: SubMenuItem[];
}

interface Props {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const userRole = useUserRole();
  const { t } = useTranslation('navigation');

  const MENUS: MenuItem[] = [
    {
      id: 'dashboard',
      path: '/dashboard',
      label: t('menu.dashboard'),
      icon: Home,
      allowedRoles: [ROLE_ID.ADMIN, ROLE_ID.USER],
      hasSubmenu: false,
    },
    {
      id: 'users',
      path: '/users',
      label: t('menu.users'),
      icon: Users,
      allowedRoles: [ROLE_ID.ADMIN, ROLE_ID.USER],
      hasSubmenu: false,
    },
    {
      id: 'departments',
      path: '/departments',
      label: t('menu.departments'),
      icon: Building2,
      allowedRoles: [ROLE_ID.ADMIN],
      hasSubmenu: false,
    },
    {
      id: 'sections',
      path: '/sections',
      label: t('menu.sections'),
      icon: Folders,
      allowedRoles: [ROLE_ID.ADMIN],
      hasSubmenu: false,
    },
    {
      id: 'admin',
      label: t('menu.admin.title'),
      icon: Server,
      allowedRoles: [ROLE_ID.ADMIN],
      hasSubmenu: true,
      children: [
        { path: '/admin/user-logs', label: t('menu.admin.userLogs'), icon: ClipboardList, allowedRoles: [ROLE_ID.ADMIN] },
        { path: '/admin/system-logs', label: t('menu.admin.systemLogs'), icon: Terminal, allowedRoles: [ROLE_ID.ADMIN] },
        { path: '/admin/backups', label: t('menu.admin.backups'), icon: Database, allowedRoles: [ROLE_ID.ADMIN] },
        { path: '/admin/database', label: t('menu.admin.database'), icon: Server, allowedRoles: [ROLE_ID.ADMIN] },
      ],
    },
  ];

  const filteredMenus = filterMenuItemsByRole(MENUS, userRole);

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  const renderNavItem = (item: { path: string; label: string; icon: React.ElementType }) => (
    <NavLink
      key={item.path}
      label={item.label}
      leftSection={
        <ThemeIcon variant="light" size="sm">
          <item.icon size={16} />
        </ThemeIcon>
      }
      active={isActive(item.path)}
      onClick={() => handleNavigate(item.path)}
      styles={{
        root: { borderRadius: 'var(--mantine-radius-md)' },
      }}
    />
  );

  return (
    <ScrollArea className="h-full">
      <Stack p="md" gap="xs">
        {filteredMenus.map((item) => {
          if (!item.hasSubmenu && item.path) {
            return renderNavItem({ path: item.path, label: item.label, icon: item.icon });
          }

          return (
            <div key={item.id}>
              <Divider my="sm" />
              <Text size="xs" c="dimmed" fw={600} px="sm" tt="uppercase">
                {item.label}
              </Text>
              {item.children?.map(renderNavItem)}
            </div>
          );
        })}
      </Stack>
    </ScrollArea>
  );
}

function filterMenuItemsByRole(items: MenuItem[], role: RoleId): MenuItem[] {
  return items
    .map((item) => {
      if (!hasRole(item.allowedRoles, role)) return null;

      if (!item.hasSubmenu) return item;

      const filteredChildren = (item.children ?? []).filter((child) =>
        hasRole(child.allowedRoles, role)
      );

      if (filteredChildren.length === 0) return null;

      return { ...item, children: filteredChildren };
    })
    .filter((item): item is MenuItem => item !== null);
}
