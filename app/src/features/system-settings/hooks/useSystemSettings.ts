import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { systemSettingsApi } from '@/api/services/system-settings.api';

export const systemSettingsKeys = {
  all: ['system-settings'] as const,
  maintenanceStatus: ['system-settings', 'maintenance-status'] as const,
};

// ตรวจสอบ maintenance status (ใช้ทั่วทั้ง app)
export const useMaintenanceStatus = ({ enabled = true }: { enabled?: boolean } = {}) =>
  useQuery({
    queryKey: systemSettingsKeys.maintenanceStatus,
    queryFn: () =>
      systemSettingsApi.getMaintenanceStatus().then((r) => r.data.data),
    staleTime: 30_000,        // 30 วินาที
    refetchInterval: 60_000,  // refetch ทุก 1 นาที
    enabled,
  });

// ดึง settings ทั้งหมด (Admin page)
export const useSystemSettings = () =>
  useQuery({
    queryKey: systemSettingsKeys.all,
    queryFn: () => systemSettingsApi.getAll().then((r) => r.data.data),
  });

// อัปเดต setting
export const useUpdateSystemSetting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) =>
      systemSettingsApi.update(key, value).then((r) => r.data.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: systemSettingsKeys.all });
      queryClient.invalidateQueries({ queryKey: systemSettingsKeys.maintenanceStatus });
    },
  });
};
