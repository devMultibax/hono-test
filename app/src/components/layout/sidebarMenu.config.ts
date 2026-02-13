import {
  Home,
  Users,
  Building2,
  Folders,
  ClipboardList,
  Terminal,
  Database,
  Server,
} from 'lucide-react';
import { ROLE_ID, type RoleId } from '@/constants/roleConstants';
import type { TFunction } from 'i18next';

export interface SubMenuItem {
  path: string;
  label: string;
  icon: React.ElementType;
  allowedRoles: readonly RoleId[];
}

export interface MenuItem {
  id: string;
  path?: string;
  label: string;
  icon: React.ElementType;
  allowedRoles: readonly RoleId[];
  hasSubmenu: boolean;
  children?: SubMenuItem[];
}

export const getMenuItems = (t: TFunction): MenuItem[] => [
  {
    id: 'dashboard',
    path: '/dashboard',
    label: t('menu.dashboard'),
    icon: Home,
    allowedRoles: [ROLE_ID.ADMIN, ROLE_ID.USER],
    hasSubmenu: false,
  },
  {
    id: 'users',
    path: '/users',
    label: t('menu.users'),
    icon: Users,
    allowedRoles: [ROLE_ID.ADMIN, ROLE_ID.USER],
    hasSubmenu: false,
  },
  {
    id: 'departments',
    path: '/departments',
    label: t('menu.departments'),
    icon: Building2,
    allowedRoles: [ROLE_ID.ADMIN],
    hasSubmenu: false,
  },
  {
    id: 'sections',
    path: '/sections',
    label: t('menu.sections'),
    icon: Folders,
    allowedRoles: [ROLE_ID.ADMIN],
    hasSubmenu: false,
  },
  {
    id: 'admin',
    label: t('menu.admin.title'),
    icon: Server,
    allowedRoles: [ROLE_ID.ADMIN],
    hasSubmenu: true,
    children: [
      { path: '/admin/user-logs', label: t('menu.admin.userLogs'), icon: ClipboardList, allowedRoles: [ROLE_ID.ADMIN] },
      { path: '/admin/system-logs', label: t('menu.admin.systemLogs'), icon: Terminal, allowedRoles: [ROLE_ID.ADMIN] },
      { path: '/admin/backups', label: t('menu.admin.backups'), icon: Database, allowedRoles: [ROLE_ID.ADMIN] },
      { path: '/admin/database', label: t('menu.admin.database'), icon: Server, allowedRoles: [ROLE_ID.ADMIN] },
    ],
  },
];
