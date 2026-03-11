import { Center, Stack, Title, Text, Paper } from '@mantine/core';
import { Navigate } from 'react-router-dom';
import { useTranslation } from '@/lib/i18n';
import { useAuthStore } from '@/stores/auth.store';
import { ChangePasswordForm } from '../components/ChangePasswordForm';

export function ForceChangePasswordPage() {
    const { t } = useTranslation(['profile']);
    const user = useAuthStore((s) => s.user);

    if (!user) return <Navigate to="/login" replace />;
    if (!user.isDefaultPassword) return <Navigate to="/dashboard" replace />;

    return (
        <Center mih="100vh" bg="gray.0" p="md">
            <Stack align="center" gap="lg" maw={480} w="100%">
                <Stack align="center" gap="xs">
                    <Title order={3} ta="center">
                        {t('profile:forceChangePassword.title')}
                    </Title>
                    <Text c="dimmed" ta="center" size="sm">
                        {t('profile:forceChangePassword.description')}
                    </Text>
                </Stack>
                <Paper w="100%">
                    <ChangePasswordForm />
                </Paper>
            </Stack>
        </Center>
    );
}
