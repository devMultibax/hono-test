import { ScrollArea, Stack, NavLink, Divider, Text, ThemeIcon } from '@mantine/core';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  IconHome,
  IconUsers,
  IconBuilding,
  IconFolders,
  IconClipboardList,
  IconTerminal,
  IconDatabase,
  IconServer,
} from '@tabler/icons-react';
import { useIsAdmin } from '@/stores/auth.store';

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
}

const mainMenuItems: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: IconHome },
  { path: '/users', label: 'ผู้ใช้งาน', icon: IconUsers },
  { path: '/departments', label: 'แผนก', icon: IconBuilding },
  { path: '/sections', label: 'หน่วยงาน', icon: IconFolders },
];

const adminMenuItems: NavItem[] = [
  { path: '/admin/user-logs', label: 'ประวัติการใช้งาน', icon: IconClipboardList },
  { path: '/admin/system-logs', label: 'System Logs', icon: IconTerminal },
  { path: '/admin/backups', label: 'Backup', icon: IconDatabase },
  { path: '/admin/database', label: 'Database', icon: IconServer },
];

interface Props {
  onNavigate?: () => void;
}

export function Sidebar({ onNavigate }: Props) {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = useIsAdmin();

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
              ผู้ดูแลระบบ
            </Text>
            {adminMenuItems.map(renderNavItem)}
          </>
        )}
      </Stack>
    </ScrollArea>
  );
}
