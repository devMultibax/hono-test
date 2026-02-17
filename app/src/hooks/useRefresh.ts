import { useState, useCallback } from 'react';

interface UseRefreshOptions {
    /** The refetch function from react-query */
    refetch: () => Promise<unknown>;
    /** Whether react-query is currently refetching */
    isRefetching: boolean;
    /** Minimum loading time in ms (default: 500) */
    minLoadingTime?: number;
}

interface UseRefreshReturn {
    /** Call this to trigger a refresh */
    handleRefresh: () => Promise<void>;
    /** Whether the refresh is currently in progress */
    isRefreshLoading: boolean;
}

export function useRefresh({
    refetch,
    isRefetching,
    minLoadingTime = 500,
}: UseRefreshOptions): UseRefreshReturn {
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await Promise.all([
                refetch(),
                new Promise((resolve) => setTimeout(resolve, minLoadingTime)),
            ]);
        } finally {
            setIsRefreshing(false);
        }
    }, [refetch, minLoadingTime]);

    return {
        handleRefresh,
        isRefreshLoading: isRefetching || isRefreshing,
    };
}
