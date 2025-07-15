import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface StorageOptions {
  encrypt?: boolean;
  compress?: boolean;
  ttl?: number; // Time to live in milliseconds
}

export interface StorageItem<T = any> {
  data: T;
  timestamp: number;
  ttl?: number;
}

class StorageManager {
  private prefix: string;

  constructor(prefix: string = 'app_') {
    this.prefix = prefix;
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  private isExpired(item: StorageItem): boolean {
    if (!item.ttl) return false;
    return Date.now() - item.timestamp > item.ttl;
  }

  async setItem<T>(key: string, value: T, options: StorageOptions = {}): Promise<void> {
    try {
      const storageItem: StorageItem<T> = {
        data: value,
        timestamp: Date.now(),
        ttl: options.ttl,
      };

      const serializedValue = JSON.stringify(storageItem);
      await AsyncStorage.setItem(this.getKey(key), serializedValue);
    } catch (error) {
      console.error(`Error setting storage item ${key}:`, error);
      throw error;
    }
  }

  async getItem<T>(key: string): Promise<T | null> {
    try {
      const serializedValue = await AsyncStorage.getItem(this.getKey(key));
      
      if (!serializedValue) {
        return null;
      }

      const storageItem: StorageItem<T> = JSON.parse(serializedValue);

      // Check if item has expired
      if (this.isExpired(storageItem)) {
        await this.removeItem(key);
        return null;
      }

      return storageItem.data;
    } catch (error) {
      console.error(`Error getting storage item ${key}:`, error);
      return null;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.getKey(key));
    } catch (error) {
      console.error(`Error removing storage item ${key}:`, error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const prefixedKeys = keys.filter(key => key.startsWith(this.prefix));
      await AsyncStorage.multiRemove(prefixedKeys);
    } catch (error) {
      console.error('Error clearing storage:', error);
      throw error;
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return keys
        .filter(key => key.startsWith(this.prefix))
        .map(key => key.replace(this.prefix, ''));
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  }

  async getMultiple<T>(keys: string[]): Promise<Record<string, T | null>> {
    try {
      const prefixedKeys = keys.map(key => this.getKey(key));
      const keyValuePairs = await AsyncStorage.multiGet(prefixedKeys);
      
      const result: Record<string, T | null> = {};
      
      for (const [prefixedKey, serializedValue] of keyValuePairs) {
        const originalKey = prefixedKey.replace(this.prefix, '');
        
        if (serializedValue) {
          try {
            const storageItem: StorageItem<T> = JSON.parse(serializedValue);
            
            if (this.isExpired(storageItem)) {
              await this.removeItem(originalKey);
              result[originalKey] = null;
            } else {
              result[originalKey] = storageItem.data;
            }
          } catch (parseError) {
            console.error(`Error parsing storage item ${originalKey}:`, parseError);
            result[originalKey] = null;
          }
        } else {
          result[originalKey] = null;
        }
      }
      
      return result;
    } catch (error) {
      console.error('Error getting multiple items:', error);
      return {};
    }
  }

  async setMultiple<T>(items: Record<string, T>, options: StorageOptions = {}): Promise<void> {
    try {
      const keyValuePairs: [string, string][] = [];
      
      for (const [key, value] of Object.entries(items)) {
        const storageItem: StorageItem<T> = {
          data: value,
          timestamp: Date.now(),
          ttl: options.ttl,
        };
        
        keyValuePairs.push([this.getKey(key), JSON.stringify(storageItem)]);
      }
      
      await AsyncStorage.multiSet(keyValuePairs);
    } catch (error) {
      console.error('Error setting multiple items:', error);
      throw error;
    }
  }

  async getSize(): Promise<number> {
    try {
      const keys = await this.getAllKeys();
      let totalSize = 0;
      
      for (const key of keys) {
        const value = await AsyncStorage.getItem(this.getKey(key));
        if (value) {
          totalSize += value.length;
        }
      }
      
      return totalSize;
    } catch (error) {
      console.error('Error calculating storage size:', error);
      return 0;
    }
  }

  async cleanupExpired(): Promise<number> {
    try {
      const keys = await this.getAllKeys();
      let cleanedCount = 0;
      
      for (const key of keys) {
        const item = await this.getItem(key);
        if (item === null) {
          cleanedCount++;
        }
      }
      
      return cleanedCount;
    } catch (error) {
      console.error('Error cleaning up expired items:', error);
      return 0;
    }
  }
}

// Create default storage instances
export const storage = new StorageManager('app_');
export const userStorage = new StorageManager('user_');
export const cacheStorage = new StorageManager('cache_');

// Utility functions for common operations
export const storeUserData = async (userId: string, data: any): Promise<void> => {
  await userStorage.setItem(userId, data);
};

export const getUserData = async <T>(userId: string): Promise<T | null> => {
  return await userStorage.getItem<T>(userId);
};

export const clearUserData = async (userId: string): Promise<void> => {
  await userStorage.removeItem(userId);
};

export const storeCache = async (key: string, data: any, ttl: number = 3600000): Promise<void> => {
  await cacheStorage.setItem(key, data, { ttl });
};

export const getCache = async <T>(key: string): Promise<T | null> => {
  return await cacheStorage.getItem<T>(key);
};

export const clearCache = async (): Promise<void> => {
  await cacheStorage.clear();
};

// Settings storage
export const storeSettings = async (settings: Record<string, any>): Promise<void> => {
  await storage.setItem('settings', settings);
};

export const getSettings = async (): Promise<Record<string, any> | null> => {
  return await storage.getItem('settings');
};

export const updateSetting = async (key: string, value: any): Promise<void> => {
  const currentSettings = await getSettings() || {};
  currentSettings[key] = value;
  await storeSettings(currentSettings);
};

export const getSetting = async (key: string, defaultValue: any = null): Promise<any> => {
  const settings = await getSettings();
  return settings?.[key] ?? defaultValue;
};

// Draft storage for forms
export const storeDraft = async (formId: string, data: any): Promise<void> => {
  await storage.setItem(`draft_${formId}`, data, { ttl: 24 * 60 * 60 * 1000 }); // 24 hours
};

export const getDraft = async <T>(formId: string): Promise<T | null> => {
  return await storage.getItem<T>(`draft_${formId}`);
};

export const clearDraft = async (formId: string): Promise<void> => {
  await storage.removeItem(`draft_${formId}`);
};

// Search history
export const addToSearchHistory = async (query: string, category: string = 'general'): Promise<void> => {
  const historyKey = `search_history_${category}`;
  const history = await storage.getItem<string[]>(historyKey) || [];
  
  // Remove if already exists
  const filteredHistory = history.filter(item => item !== query);
  
  // Add to beginning
  filteredHistory.unshift(query);
  
  // Keep only last 10 searches
  const limitedHistory = filteredHistory.slice(0, 10);
  
  await storage.setItem(historyKey, limitedHistory);
};

export const getSearchHistory = async (category: string = 'general'): Promise<string[]> => {
  return await storage.getItem<string[]>(`search_history_${category}`) || [];
};

export const clearSearchHistory = async (category: string = 'general'): Promise<void> => {
  await storage.removeItem(`search_history_${category}`);
};

// Recent items
export const addToRecentItems = async (itemId: string, itemType: string): Promise<void> => {
  const recentKey = `recent_${itemType}`;
  const recent = await storage.getItem<string[]>(recentKey) || [];
  
  // Remove if already exists
  const filteredRecent = recent.filter(id => id !== itemId);
  
  // Add to beginning
  filteredRecent.unshift(itemId);
  
  // Keep only last 20 items
  const limitedRecent = filteredRecent.slice(0, 20);
  
  await storage.setItem(recentKey, limitedRecent);
};

export const getRecentItems = async (itemType: string): Promise<string[]> => {
  return await storage.getItem<string[]>(`recent_${itemType}`) || [];
};

export const clearRecentItems = async (itemType: string): Promise<void> => {
  await storage.removeItem(`recent_${itemType}`);
};

// Storage info
export const getStorageInfo = async () => {
  const totalSize = await storage.getSize();
  const userSize = await userStorage.getSize();
  const cacheSize = await cacheStorage.getSize();
  
  return {
    totalSize,
    userSize,
    cacheSize,
    totalSizeFormatted: formatBytes(totalSize),
    userSizeFormatted: formatBytes(userSize),
    cacheSizeFormatted: formatBytes(cacheSize),
  };
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Cleanup utilities
export const performStorageCleanup = async (): Promise<{
  expiredItemsRemoved: number;
  cacheSizeReduced: number;
}> => {
  const expiredItemsRemoved = await storage.cleanupExpired() + 
                             await userStorage.cleanupExpired() + 
                             await cacheStorage.cleanupExpired();
  
  const initialCacheSize = await cacheStorage.getSize();
  await cacheStorage.clear();
  const cacheSizeReduced = initialCacheSize;
  
  return {
    expiredItemsRemoved,
    cacheSizeReduced,
  };
};