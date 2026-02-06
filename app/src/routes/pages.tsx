import { useTranslation } from '@/lib/i18n';

export function DashboardPage() {
  const { t } = useTranslation(['navigation', 'common']);
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">{t('navigation:page.dashboard.title')}</h1>
      <p>{t('navigation:page.dashboard.welcome')}</p>
      <div className="mt-4 p-4 bg-gray-100 rounded">
        <h2 className="font-semibold mb-2">{t('common:debug.title')}:</h2>
        <pre className="text-xs">{JSON.stringify(
          (() => {
            const authStorage = localStorage.getItem('auth-storage');
            return authStorage ? JSON.parse(authStorage) : null;
          })(),
          null,
          2
        )}</pre>
      </div>
    </div>
  );
}

export function ProfilePage() {
  const { t } = useTranslation(['navigation']);
  return <div className="p-8"><h1 className="text-2xl font-bold">{t('navigation:page.profile')}</h1></div>;
}

export function ChangePasswordPage() {
  const { t } = useTranslation(['navigation']);
  return <div className="p-8"><h1 className="text-2xl font-bold">{t('navigation:page.changePassword')}</h1></div>;
}

export function DepartmentsPage() {
  const { t } = useTranslation(['navigation']);
  return <div className="p-8"><h1 className="text-2xl font-bold">{t('navigation:page.departments')}</h1></div>;
}

export function SectionsPage() {
  const { t } = useTranslation(['navigation']);
  return <div className="p-8"><h1 className="text-2xl font-bold">{t('navigation:page.sections')}</h1></div>;
}

export function UserLogsPage() {
  const { t } = useTranslation(['navigation']);
  return <div className="p-8"><h1 className="text-2xl font-bold">{t('navigation:page.userLogs')}</h1></div>;
}

export function SystemLogsPage() {
  const { t } = useTranslation(['navigation']);
  return <div className="p-8"><h1 className="text-2xl font-bold">{t('navigation:page.systemLogs')}</h1></div>;
}

export function BackupsPage() {
  const { t } = useTranslation(['navigation']);
  return <div className="p-8"><h1 className="text-2xl font-bold">{t('navigation:page.backups')}</h1></div>;
}

export function DatabasePage() {
  const { t } = useTranslation(['navigation']);
  return <div className="p-8"><h1 className="text-2xl font-bold">{t('navigation:page.database')}</h1></div>;
}
