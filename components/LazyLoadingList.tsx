import React, { useState, useCallback, useMemo } from 'react';
import { FlatList, View, StyleSheet, RefreshControl, ListRenderItem, ListRenderItemInfo } from 'react-native';
import { useTheme } from '@/constants/theme';

interface LazyLoadingListProps<T> {
  data: T[];
  renderItem: ListRenderItem<T>;
  keyExtractor: (item: T, index: number) => string;
  onRefresh?: () => Promise<void>;
  refreshing?: boolean;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null;
  initialNumToRender?: number;
  maxToRenderPerBatch?: number;
  windowSize?: number;
  removeClippedSubviews?: boolean;
  getItemLayout?: (data: ArrayLike<T> | null | undefined, index: number) => { length: number; offset: number; index: number };
}

export function LazyLoadingList<T>({
  data,
  renderItem,
  keyExtractor,
  onRefresh,
  refreshing = false,
  onEndReached,
  onEndReachedThreshold = 0.5,
  ListEmptyComponent,
  ListHeaderComponent,
  ListFooterComponent,
  initialNumToRender = 10,
  maxToRenderPerBatch = 5,
  windowSize = 10,
  removeClippedSubviews = true,
  getItemLayout,
}: LazyLoadingListProps<T>) {
  const { colors } = useTheme();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (onRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
  }, [onRefresh]);

  const refreshControl = useMemo(() => {
    if (!onRefresh) return undefined;
    
    return (
      <RefreshControl
        refreshing={refreshing || isRefreshing}
        onRefresh={handleRefresh}
        colors={[colors.primary]}
        tintColor={colors.primary}
        progressBackgroundColor={colors.card}
      />
    );
  }, [refreshing, isRefreshing, handleRefresh, colors]);

  const memoizedRenderItem = useCallback(
    (info: ListRenderItemInfo<T>) => renderItem(info),
    [renderItem]
  );

  return (
    <FlatList
      data={data}
      renderItem={memoizedRenderItem}
      keyExtractor={keyExtractor}
      refreshControl={refreshControl}
      onEndReached={onEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      ListEmptyComponent={ListEmptyComponent}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={ListFooterComponent}
      initialNumToRender={initialNumToRender}
      maxToRenderPerBatch={maxToRenderPerBatch}
      windowSize={windowSize}
      removeClippedSubviews={removeClippedSubviews}
      getItemLayout={getItemLayout}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
      // Performance optimizations
      updateCellsBatchingPeriod={50}
      legacyImplementation={false}
      disableVirtualization={false}
    />
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    paddingBottom: 120,
  },
});