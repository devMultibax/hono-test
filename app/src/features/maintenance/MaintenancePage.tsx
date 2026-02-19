import { Center, Stack, ThemeIcon, Title, Text, Button, Paper } from '@mantine/core';
import { Construction } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/lib/i18n';
import { useMaintenanceStatus } from '@/features/system-settings/hooks/useSystemSettings';

export function MaintenancePage() {
  const { t } = useTranslation(['systemSettings']);
  const navigate = useNavigate();
  const { data, refetch, isFetching } = useMaintenanceStatus();

  const handleRetry = async () => {
    const result = await refetch();
    // ถ้า maintenance ปิดแล้ว → กลับหน้าหลัก
    if (!result.data?.maintenance) {
      navigate('/', { replace: true });
    }
  };

  return (
    <Center h="100vh" bg="gray.0">
      <Paper p="xl" radius="md" withBorder shadow="sm" maw={480} w="100%">
        <Stack align="center" gap="lg">
          <ThemeIcon size={80} variant="light" color="orange" radius="xl">
            <Construction size={44} />
          </ThemeIcon>
          <Stack align="center" gap="xs">
            <Title order={2} ta="center">
              {t('systemSettings:maintenancePage.title')}
            </Title>
            <Text c="dimmed" ta="center" size="sm">
              {data?.message ?? t('systemSettings:maintenancePage.title')}
            </Text>
          </Stack>
          <Button
            variant="light"
            color="orange"
            onClick={handleRetry}
            loading={isFetching}
          >
            {t('systemSettings:maintenancePage.retry')}
          </Button>
        </Stack>
      </Paper>
    </Center>
  );
}
