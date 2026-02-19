import { apiClient } from '../client';
import type { SystemSetting, MaintenanceStatus } from '@/types';

export const systemSettingsApi = {
  // Public (ไม่ต้อง login)
  getMaintenanceStatus: () =>
    apiClient.get<MaintenanceStatus>('/system-settings/maintenance/status'),

  // Admin only
  getAll: () =>
    apiClient.get<SystemSetting[]>('/system-settings'),

  getByKey: (key: string) =>
    apiClient.get<SystemSetting>(`/system-settings/${key}`),

  update: (key: string, value: string) =>
    apiClient.put<SystemSetting>(`/system-settings/${key}`, { value }),
};
