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
import { useIsAdmin } from '@/stores/auth.store';
import { useTranslation } from '@/lib/i18n';

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
}

interface Props {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = useIsAdmin();
  const { t } = useTranslation('navigation');

  const mainMenuItems: NavItem[] = [
    { path: '/dashboard', label: t('menu.dashboard'), icon: Home },
    { path: '/users', label: t('menu.users'), icon: Users },
    { path: '/departments', label: t('menu.departments'), icon: Building2 },
    { path: '/sections', label: t('menu.sections'), icon: Folders },
  ];

  const adminMenuItems: NavItem[] = [
    { path: '/admin/user-logs', label: t('menu.admin.userLogs'), icon: ClipboardList },
    { path: '/admin/system-logs', label: t('menu.admin.systemLogs'), icon: Terminal },
    { path: '/admin/backups', label: t('menu.admin.backups'), icon: Database },
    { path: '/admin/database', label: t('menu.admin.database'), icon: Server },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    onNavigate?.();
  };

  const renderNavItem = (item: NavItem) => (
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
        {mainMenuItems.map(renderNavItem)}

        {isAdmin && (
          <>
            <Divider my="sm" />
            <Text size="xs" c="dimmed" fw={600} px="sm" tt="uppercase">
              {t('menu.admin.title')}
            </Text>
            {adminMenuItems.map(renderNavItem)}
          </>
        )}
      </Stack>
    </ScrollArea>
  );
}
