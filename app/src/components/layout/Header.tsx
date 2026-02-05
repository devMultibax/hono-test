import { Group, Burger, Title, Menu, Avatar, Text, UnstyledButton } from '@mantine/core';
import { User, Lock, LogOut, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/lib/i18n';

interface Props {
  opened: boolean;
  onToggle: () => void;
}

export function Header({ opened, onToggle }: Props) {
  const navigate = useNavigate();
  const { user, logout, isLoggingOut } = useAuth();
  const { t } = useTranslation(['auth', 'common']);

  const initials = user
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : '';

  return (
    <Group h="100%" px="md" justify="space-between">
      <Group>
        <Burger
          opened={opened}
          onClick={onToggle}
          hiddenFrom="sm"
          size="sm"
        />
        <Title order={3} visibleFrom="sm">Admin System</Title>
      </Group>

      <Menu position="bottom-end" width={200}>
        <Menu.Target>
          <UnstyledButton className="hover:bg-gray-100 rounded-lg px-2 py-1">
            <Group gap="xs">
              <Avatar color="primary" radius="xl" size="sm">
                {initials}
              </Avatar>
              <div className="hidden sm:block">
                <Text size="sm" fw={500}>
                  {user?.firstName} {user?.lastName}
                </Text>
                <Text size="xs" c="dimmed">
                  {t(`common:role.${user?.role.toLowerCase()}`)}
                </Text>
              </div>
              <ChevronDown size={14} />
            </Group>
          </UnstyledButton>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>{t('auth:menu.account')}</Menu.Label>
          <Menu.Item
            leftSection={<User size={14} />}
            onClick={() => navigate('/profile')}
          >
            {t('auth:menu.profile')}
          </Menu.Item>
          <Menu.Item
            leftSection={<Lock size={14} />}
            onClick={() => navigate('/profile/password')}
          >
            {t('auth:menu.changePassword')}
          </Menu.Item>

          <Menu.Divider />

          <Menu.Item
            color="red"
            leftSection={<LogOut size={14} />}
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
