import { ScrollArea, Stack, NavLink, Divider, Text, ThemeIcon } from '@mantine/core';
import { useLocation, useNavigate } from 'react-router-dom';
import type { RoleId } from '@/constants/roleConstants';
import { hasRole } from '@/utils/roleUtils';
import { useUserRole } from '@/stores/auth.store';
import { useTranslation } from '@/lib/i18n';
import { getMenuItems, type MenuItem } from './sidebarMenu.config';

interface Props {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const userRole = useUserRole();
  const { t } = useTranslation('navigation');

  const menus = getMenuItems(t);
  const filteredMenus = filterMenuItemsByRole(menus, userRole);

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
