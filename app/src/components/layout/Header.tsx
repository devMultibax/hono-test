import { Group, Burger, Title, Menu, Avatar, Text, UnstyledButton, Box, Stack } from '@mantine/core';
import { Briefcase, Hash, ShieldCheck, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/lib/i18n';

interface Props {
  opened: boolean;
  onToggle: () => void;
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Group gap="sm" wrap="nowrap">
      <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
        <Box c="dimmed" style={{ display: 'flex', flexShrink: 0 }}>{icon}</Box>
        <Text size="sm" c="dimmed" truncate>{label}</Text>
      </Group>
      <Text size="sm" fw={500} ml="auto" truncate>{value}</Text>
    </Group>
  );
}

export function Header({ opened, onToggle }: Props) {
  const navigate = useNavigate();
  const { user, logout, isLoggingOut } = useAuth();
  const { t } = useTranslation(['auth', 'common']);

  return (
    <Group h="100%" px="md" justify="space-between">
      <Group>
        <Burger
          opened={opened}
          onClick={onToggle}
          hiddenFrom="sm"
          size="sm"
        />
        <Title order={3} visibleFrom="sm">{t('auth:app.appName')}</Title>
      </Group>

      <Menu position="bottom-end" width={280} shadow="lg" radius="md">
        <Menu.Target>
          <UnstyledButton className="hover:bg-gray-100 rounded-lg px-2 py-1">
            <Group gap="xs">
              <Avatar color="primary" variant="light" radius="md" size="md">
                {user?.department?.name}
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
          <Box px="md" pt="sm" pb="xs">
            <Text fw={600} size="md">
              {user?.firstName} {user?.lastName}
            </Text>
          </Box>

          <Box px="md" pb="sm">
            <Stack gap={8}>
              <InfoRow
                icon={<Briefcase size={16} />}
                label={t('auth:menu.department')}
                value={user?.department?.name ?? '-'}
              />
              <InfoRow
                icon={<Hash size={16} />}
                label={t('auth:menu.employeeId')}
                value={user?.username ?? '-'}
              />
              <InfoRow
                icon={<ShieldCheck size={16} />}
                label={t('auth:menu.role')}
                value={t(`common:role.${user?.role.toLowerCase()}`) ?? '-'}
              />
            </Stack>
          </Box>

          <Menu.Divider />

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
