export const API_ENDPOINTS = {
  AUTH: {
    CSRF_TOKEN: '/auth/csrf-token',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    UPDATE_PROFILE: '/auth/me',
    CHANGE_PASSWORD: '/auth/me/password',
  },
  USERS: {
    BASE: '/users',
    BY_ID: (id: number) => `/users/${id}`,
    VERIFY_PASSWORD: '/users/password/verify',
    RESET_PASSWORD: (id: number) => `/users/${id}/password/reset`,
    EXPORT_EXCEL: '/users/export/excel',
    IMPORT: '/users/import',
  },
  DEPARTMENTS: {
    BASE: '/departments',
    BY_ID: (id: number) => `/departments/${id}`,
    EXPORT_EXCEL: '/departments/export/excel',
    IMPORT: '/departments/import',
  },
  SECTIONS: {
    BASE: '/sections',
    BY_ID: (id: number) => `/sections/${id}`,
    EXPORT_EXCEL: '/sections/export/excel',
    IMPORT: '/sections/import',
  },
  MASTER_DATA: {
    DEPARTMENTS: '/master-data/departments',
    SECTIONS_BY_DEPARTMENT: (id: number) => `/master-data/departments/${id}/sections`,
    SEARCH_SECTIONS: '/master-data/departments/sections/search',
    USERS: '/master-data/users',
    USERS_FROM_LOGS: '/master-data/users/from-logs',
  },
  USER_LOGS: {
    BASE: '/user-logs',
    BY_ID: (id: number) => `/user-logs/${id}`,
  },
  SYSTEM_LOGS: {
    BASE: '/system-log',
    FILES: '/system-log/files',
    CLEANUP: '/system-log/cleanup',
  },
  BACKUP: {
    BASE: '/backup',
    BY_FILENAME: (filename: string) => `/backup/${filename}`,
    RESTORE: (filename: string) => `/backup/${filename}/restore`,
  },
  DATABASE: {
    STATISTICS: '/database/statistics',
    ANALYZE: '/database/analyze',
  },
  HEALTH: {
    BASE: '/health',
    DB: '/health/db',
  },
} as const;
