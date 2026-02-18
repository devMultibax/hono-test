import { Group, Burger, Menu, Avatar, Text, UnstyledButton, Breadcrumbs, Anchor, ActionIcon } from '@mantine/core';
import { Settings, LogOut, ChevronDown, ChevronRight, Menu as MenuIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/lib/i18n';
import type { BreadcrumbItem } from '@/hooks/usePageMeta';

interface Props {
  mobileOpened: boolean;
  onMobileToggle: () => void;
  desktopOpened: boolean;
  onDesktopToggle: () => void;
  breadcrumbs?: BreadcrumbItem[];
}

export function Header({ mobileOpened, onMobileToggle, desktopOpened, onDesktopToggle, breadcrumbs }: Props) {
  const navigate = useNavigate();
  const { user, logout, isLoggingOut } = useAuth();
  const { t } = useTranslation(['auth', 'common']);

  return (
    <Group h="100%" px="md" justify="space-between">
      <Group gap="sm">
        <Burger
          opened={mobileOpened}
          onClick={onMobileToggle}
          hiddenFrom="sm"
          size="sm"
        />
        {!desktopOpened && (
          <ActionIcon
            variant="subtle"
            color="gray"
            visibleFrom="sm"
            onClick={onDesktopToggle}
            aria-label="Expand sidebar"
          >
            <MenuIcon size={18} />
          </ActionIcon>
        )}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs
            separator={<ChevronRight size={14} style={{ color: 'var(--mantine-color-gray-6)' }} />}
            separatorMargin={8}
            visibleFrom="sm"
          >
            {breadcrumbs.map((item, index) =>
              index === 0 && item.path ? (
                <Anchor key={index} component={Link} to={item.path} size="sm" c="blue.6" fw={500}>
                  {item.label}
                </Anchor>
              ) : (
                <Text key={index} size="sm" c="dark.7" fw={600}>
                  {item.label}
                </Text>
              )
            )}
          </Breadcrumbs>
        )}
      </Group>

      <Menu position="bottom-end" width={200} shadow="md" radius="md">
        <Menu.Target>
          <UnstyledButton className="hover:bg-gray-100 rounded-lg px-2 py-1">
            <Group gap="xs">
              <Avatar color="primary" variant="light" radius="md" size="md">
                {user?.department?.name}
              </Avatar>
              <div>
                <Text size="sm" fw={500}>
                  {user?.firstName} {user?.lastName}
                </Text>
                <Text size="xs" c="dimmed">
                  {t(`common:role.${user?.role?.toLowerCase()}`)}
                </Text>
              </div>
              <ChevronDown size={14} color="var(--mantine-color-dimmed)" />
            </Group>
          </UnstyledButton>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Item
            leftSection={<Settings size={16} />}
            onClick={() => navigate('/profile')}
          >
            {t('auth:menu.profileSettings')}
          </Menu.Item>
          <Menu.Item
            color="red"
            leftSection={<LogOut size={16} />}
            onClick={() => logout()}
            disabled={isLoggingOut}
          >
            {t('auth:menu.logout')}
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
}
