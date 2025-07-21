import { useQuery, UseQueryOptions, UseQueryResult } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import NetInfo from '@react-native-community/netinfo';
import React from "react";

interface OptimizedQueryOptions<T> extends Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'> {
  queryKey: string[];
  queryFn: () => Promise<T>;
  enableOfflineSupport?: boolean;
  backgroundRefetch?: boolean;
  optimisticUpdates?: boolean;
}

export function useOptimizedQuery<T>({
  queryKey,
  queryFn,
  enableOfflineSupport = true,
  backgroundRefetch = true,
  optimisticUpdates = false,
  staleTime = 1000 * 60 * 5, // 5 minutes
  gcTime = 1000 * 60 * 30, // 30 minutes (formerly cacheTime)
  retry = 3,
  retryDelay = (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  refetchOnWindowFocus = false,
  refetchOnReconnect = true,
  ...options
}: OptimizedQueryOptions<T>): UseQueryResult<T> & {
  isOffline: boolean;
  refetchIfStale: () => void;
} {
  
  // Network-aware query function
  const optimizedQueryFn = useCallback(async () => {
    if (enableOfflineSupport) {
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        throw new Error('No internet connection');
      }
    }
    return queryFn();
  }, [queryFn, enableOfflineSupport]);

  // Enhanced query options
  const queryOptions: UseQueryOptions<T> = useMemo(() => ({
    queryKey,
    queryFn: optimizedQueryFn,
    staleTime,
    gcTime,
    retry: enableOfflineSupport ? (failureCount, error) => {
      // Don't retry on network errors
      if (error.message === 'No internet connection') {
        return false;
      }
      return failureCount < (typeof retry === 'number' ? retry : 3);
    } : retry,
    retryDelay,
    refetchOnWindowFocus: backgroundRefetch ? refetchOnWindowFocus : false,
    refetchOnReconnect,
    // Performance optimizations
    notifyOnChangeProps: ['data', 'error', 'isLoading', 'isError'],
    ...options,
  }), [
    queryKey,
    optimizedQueryFn,
    staleTime,
    gcTime,
    retry,
    retryDelay,
    refetchOnWindowFocus,
    refetchOnReconnect,
    backgroundRefetch,
    enableOfflineSupport,
    options,
  ]);

  const queryResult = useQuery(queryOptions);

  // Network status
  const [isOffline, setIsOffline] = React.useState(false);

  React.useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOffline(!state.isConnected);
    });

    return unsubscribe;
  }, []);

  // Utility function to refetch if data is stale
  const refetchIfStale = useCallback(() => {
    if (queryResult.isStale && !queryResult.isFetching) {
      queryResult.refetch();
    }
  }, [queryResult]);

  return {
    ...queryResult,
    isOffline,
    refetchIfStale,
  };
}

// Hook for batch queries with optimized loading states
export function useBatchOptimizedQueries<T extends Record<string, any>>(
  queries: Array<{
    key: string;
    queryKey: string[];
    queryFn: () => Promise<any>;
    options?: Partial<OptimizedQueryOptions<any>>;
  }>
): {
  data: T;
  isLoading: boolean;
  isError: boolean;
  errors: Record<string, Error | null>;
  refetchAll: () => void;
} {
  const results = queries.map(({ key, queryKey, queryFn, options = {} }) =>
    useOptimizedQuery({
      queryKey,
      queryFn,
      ...options,
    })
  );

  const data = useMemo(() => {
    const result = {} as T;
    queries.forEach(({ key }, index) => {
      result[key as keyof T] = results[index].data;
    });
    return result;
  }, [results, queries]);

  const isLoading = results.some(result => result.isLoading);
  const isError = results.some(result => result.isError);
  
  const errors = useMemo(() => {
    const result: Record<string, Error | null> = {};
    queries.forEach(({ key }, index) => {
      result[key] = results[index].error;
    });
    return result;
  }, [results, queries]);

  const refetchAll = useCallback(() => {
    results.forEach(result => result.refetch());
  }, [results]);

  return {
    data,
    isLoading,
    isError,
    errors,
    refetchAll,
  };
}