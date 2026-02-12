import { useTranslation } from '@/lib/i18n';

export function DashboardPage() {
  const { t } = useTranslation(['navigation', 'common']);
  return (
    <div>
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
  return <div />;
}

export function ChangePasswordPage() {
  return <div />;
}

export function DepartmentsPage() {
  return <div />;
}

export function SectionsPage() {
  return <div />;
}

export function UserLogsPage() {
  return <div />;
}

export function SystemLogsPage() {
  return <div />;
}

export function BackupsPage() {
  return <div />;
}

export function DatabasePage() {
  return <div />;
}
