export interface SystemSetting {
  id: number;
  key: string;
  value: string;
  description: string | null;
  updatedAt: string | null;
  updatedBy: string | null;
  updatedByName: string | null;
}

export interface MaintenanceStatus {
  maintenance: boolean;
  message: string | null;
}

export interface UpdateSystemSettingRequest {
  value: string;
}

// Setting key constants
export const SETTING_KEYS = {
  MAINTENANCE_MODE: 'maintenance_mode',
  MAINTENANCE_MESSAGE: 'maintenance_message',
} as const
