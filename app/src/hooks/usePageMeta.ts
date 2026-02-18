import { useMemo } from 'react';
import { useMatches, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface RouteHandle {
  title?: string;
  breadcrumb?: string;
}

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export function usePageMeta() {
  const matches = useMatches();
  const location = useLocation();
  const { t } = useTranslation(['navigation', 'users', 'common']);

  return useMemo(() => {
    const isDashboard = location.pathname === '/dashboard';

    // Find the last match that has a title
    let title: string | undefined;
    for (let i = matches.length - 1; i >= 0; i--) {
      const handle = matches[i].handle as RouteHandle | undefined;
      if (handle?.title) {
        title = t(handle.title);
        break;
      }
    }

    // Build breadcrumbs from matched routes
    const breadcrumbs: BreadcrumbItem[] = [];

    if (!isDashboard && title) {
      breadcrumbs.push({ label: t('common:breadcrumb.home'), path: '/dashboard' });

      // Collect breadcrumb segments from each matched route
      const segments: { label: string; pathname: string }[] = [];
      for (const match of matches) {
        const handle = match.handle as RouteHandle | undefined;
        if (handle?.breadcrumb) {
          segments.push({
            label: t(handle.breadcrumb),
            pathname: match.pathname,
          });
        }
      }

      // All segments except the last get a link
      segments.forEach((segment, index) => {
        if (index < segments.length - 1) {
          breadcrumbs.push({ label: segment.label, path: segment.pathname });
        } else {
          breadcrumbs.push({ label: segment.label });
        }
      });
    }

    return { title, breadcrumbs };
  }, [matches, location.pathname, t]);
}
