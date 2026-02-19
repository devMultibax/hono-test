import { useState } from 'react';
import { Stack, Switch, Textarea, Button, Group, Badge } from '@mantine/core';
import { Construction, Power, MessageSquare } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';
import { useMaintenanceSettings } from '../hooks/useMaintenanceSettings';
import { SettingCard } from './SettingCard';
import { SettingRow } from './SettingRow';
import { AuditInfo } from './AuditInfo';

export function MaintenanceSection() {
  const { t } = useTranslation(['systemSettings', 'common']);
  const { isLoading, isPending, isActive, messageSetting, toggleMaintenance, saveMessage } =
    useMaintenanceSettings();

  const [messageValue, setMessageValue] = useState<string | null>(null);
  const currentMessage = messageValue ?? messageSetting?.value ?? '';

  const handleSaveMessage = () => {
    if (messageValue === null) return;
    saveMessage(messageValue, () => setMessageValue(null));
  };

  return (
    <SettingCard
      icon={Construction}
      iconColor="orange"
      title={t('systemSettings:maintenance.title')}
      description={t('systemSettings:maintenance.description')}
      isLoading={isLoading}
      headerRight={
        <Badge
          color={isActive ? 'red' : 'teal'}
          variant="light"
          size="lg"
          radius="sm"
          styles={{ root: { transition: 'background-color 0.3s ease, color 0.3s ease' } }}
        >
          {isActive
            ? t('systemSettings:maintenance.enabled')
            : t('systemSettings:maintenance.disabled')}
        </Badge>
      }
    >
      <Stack gap="xl">
        {/* Toggle */}
        <SettingRow
          icon={Power}
          label={t('systemSettings:maintenance.status')}
          description={t('systemSettings:maintenance.toggleDescription')}
          control={
            <Switch
              checked={isActive}
              onChange={toggleMaintenance}
              disabled={isPending}
              size="lg"
              color="red"
            />
          }
          showDivider
        />

        {/* Message */}
        <SettingRow
          icon={MessageSquare}
          label={t('systemSettings:maintenance.message')}
          description={t('systemSettings:maintenance.messageDescription')}
        >
          <Stack gap="xs">
            <Textarea
              placeholder={t('systemSettings:maintenance.messagePlaceholder')}
              value={currentMessage}
              onChange={(e) => setMessageValue(e.currentTarget.value)}
              autosize
              minRows={2}
              maxRows={4}
            />
            <Group justify="space-between" align="center">
              <AuditInfo
                updatedByName={messageSetting?.updatedByName}
                updatedBy={messageSetting?.updatedBy}
                updatedAt={messageSetting?.updatedAt}
              />
              <Button
                size="xs"
                onClick={handleSaveMessage}
                loading={isPending}
                disabled={messageValue === null}
              >
                {t('common:button.save')}
              </Button>
            </Group>
          </Stack>
        </SettingRow>
      </Stack>
    </SettingCard>
  );
}
