import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { AppShell, LoadingOverlay } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from '@/components/common/ErrorFallback';
import { PageHeader } from '@/components/common/PageHeader';
import { usePageMeta } from '@/hooks/usePageMeta';

export function MainLayout() {
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure(false);
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const { title, breadcrumbs } = usePageMeta();

  return (
    <AppShell
      layout="alt"
      header={{ height: 60 }}
      navbar={{
        width: 260,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding="md"
      styles={{
        main: {
          backgroundColor: 'var(--mantine-color-gray-0)',
        },
      }}
    >
      <AppShell.Header>
        <Header
          mobileOpened={mobileOpened}
          onMobileToggle={toggleMobile}
          desktopOpened={desktopOpened}
          onDesktopToggle={toggleDesktop}
          breadcrumbs={breadcrumbs}
        />
      </AppShell.Header>

      <AppShell.Navbar>
        <Sidebar
          desktopOpened={desktopOpened}
          onDesktopToggle={toggleDesktop}
          onNavigate={closeMobile}
          onMobileClose={closeMobile}
        />
      </AppShell.Navbar>

      <AppShell.Main>
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<LoadingOverlay visible />}>
            {title && <PageHeader title={title} />}
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </AppShell.Main>
    </AppShell>
  );
}
