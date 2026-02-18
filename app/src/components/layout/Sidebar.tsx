import { ScrollArea, Stack, NavLink, ThemeIcon, Group, Title, ActionIcon } from '@mantine/core';
import { Menu, X, Circle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { RoleId } from '@/constants/roleConstants';
import { hasRole } from '@/utils/roleUtils';
import { useUserRole } from '@/stores/auth.store';
import { useTranslation } from '@/lib/i18n';
import { getMenuItems, type MenuItem } from './sidebarMenu.config';

interface Props {
  desktopOpened?: boolean;
  onDesktopToggle?: () => void;
  onNavigate?: () => void;
  onMobileClose?: () => void;
}

export function Sidebar({ desktopOpened, onDesktopToggle, onNavigate, onMobileClose }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const userRole = useUserRole();
  const { t } = useTranslation(['navigation', 'auth']);

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
    <Stack h="100%" gap={0}>
      <Group
        h={60}
        px="md"
        justify="space-between"
        style={{ borderBottom: '1px solid var(--mantine-color-gray-2)', flexShrink: 0 }}
      >
        <Title order={3}>{t('auth:app.appName')}</Title>
        <ActionIcon
          variant="subtle"
          color="gray"
          visibleFrom="sm"
          onClick={onDesktopToggle}
          aria-label="Toggle sidebar"
        >
          {desktopOpened ? <X size={18} /> : <Menu size={18} />}
        </ActionIcon>
        <ActionIcon
          variant="subtle"
          color="gray"
          hiddenFrom="sm"
          onClick={onMobileClose}
          aria-label="Close sidebar"
        >
          <X size={18} />
        </ActionIcon>
      </Group>

      <ScrollArea flex={1}>
        <Stack p="md" gap="xs">
          {filteredMenus.map((item) => {
            if (!item.hasSubmenu && item.path) {
              return renderNavItem({ path: item.path, label: item.label, icon: item.icon });
            }

            const hasActiveChild = item.children?.some((child) => isActive(child.path)) ?? false;

            return (
              <NavLink
                key={item.id}
                label={item.label}
                leftSection={
                  <ThemeIcon variant="light" size="sm">
                    <item.icon size={16} />
                  </ThemeIcon>
                }
                childrenOffset={28}
                defaultOpened={hasActiveChild}
                styles={{ root: { borderRadius: 'var(--mantine-radius-md)' } }}
              >
                {item.children?.map((child) => (
                  <NavLink
                    key={child.path}
                    label={child.label}
                    leftSection={<Circle size={6} fill="currentColor" />}
                    active={isActive(child.path)}
                    onClick={() => handleNavigate(child.path)}
                    styles={{ root: { borderRadius: 'var(--mantine-radius-md)' } }}
                  />
                ))}
              </NavLink>
            );
          })}
        </Stack>
      </ScrollArea>
    </Stack>
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
