import { useEffect } from 'react';
import { nprogress } from '@mantine/nprogress';

export function useNavigationProgress(isFetching: boolean) {
  useEffect(() => {
    if (isFetching) {
      nprogress.start();
    } else {
      nprogress.complete();
    }
  }, [isFetching]);
}
