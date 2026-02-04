import { Group, Burger, Title, Menu, Avatar, Text, UnstyledButton } from '@mantine/core';
import { IconUser, IconLock, IconLogout, IconChevronDown } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface Props {
  opened: boolean;
  onToggle: () => void;
}

export function Header({ opened, onToggle }: Props) {
  const navigate = useNavigate();
  const { user, logout, isLoggingOut } = useAuth();

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
                  {user?.role === 'ADMIN' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้งาน'}
                </Text>
              </div>
              <IconChevronDown size={14} />
            </Group>
          </UnstyledButton>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>บัญชีผู้ใช้</Menu.Label>
          <Menu.Item
            leftSection={<IconUser size={14} />}
            onClick={() => navigate('/profile')}
          >
            โปรไฟล์
          </Menu.Item>
          <Menu.Item
            leftSection={<IconLock size={14} />}
            onClick={() => navigate('/profile/password')}
          >
            เปลี่ยนรหัสผ่าน
          </Menu.Item>

          <Menu.Divider />

          <Menu.Item
            color="red"
            leftSection={<IconLogout size={14} />}
            onClick={() => logout()}
            disabled={isLoggingOut}
          >
            ออกจากระบบ
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
}
