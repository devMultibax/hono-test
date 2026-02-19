import { useTranslation } from '@/lib/i18n';
import { Report, Confirm } from '@/utils/mantineAlertUtils';
import { useSystemSettings, useUpdateSystemSetting } from './useSystemSettings';
import { SETTING_KEYS } from '../types';

export function useMaintenanceSettings() {
  const { t } = useTranslation(['systemSettings']);
  const { data: settings, isLoading } = useSystemSettings();
  const { mutate: updateSetting, isPending } = useUpdateSystemSetting();

  const maintenanceSetting = settings?.find((s) => s.key === SETTING_KEYS.MAINTENANCE_MODE);
  const messageSetting = settings?.find((s) => s.key === SETTING_KEYS.MAINTENANCE_MESSAGE);
  const isActive = maintenanceSetting?.value === 'true';

  const update = (key: string, value: string, onSuccess?: () => void) => {
    updateSetting(
      { key, value },
      {
        onSuccess: () => {
          Report.success(t('systemSettings:message.updateSuccess'));
          onSuccess?.();
        },
        onError: () => Report.error(t('systemSettings:message.updateFailed')),
      },
    );
  };

  const toggleMaintenance = async () => {
    const nextValue = !isActive;
    const confirmed = await Confirm.show({
      title: t('systemSettings:maintenance.warning.title'),
      message: nextValue
        ? t('systemSettings:maintenance.warning.enableMessage')
        : t('systemSettings:maintenance.warning.disableMessage'),
    });

    if (!confirmed) return;
    update(SETTING_KEYS.MAINTENANCE_MODE, String(nextValue));
  };

  const saveMessage = (message: string, onSuccess?: () => void) => {
    update(SETTING_KEYS.MAINTENANCE_MESSAGE, message, onSuccess);
  };

  return { isLoading, isPending, isActive, messageSetting, toggleMaintenance, saveMessage };
}
