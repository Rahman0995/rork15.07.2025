import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface UserSettings {
  twoFactorEnabled: boolean;
  biometricEnabled: boolean;
  darkMode: boolean;
  notifications: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  language: string;
  autoLock: boolean;
  dataSync: boolean;
}

interface SettingsState {
  settings: UserSettings;
  updateSetting: <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => void;
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  resetSettings: () => void;
}

const defaultSettings: UserSettings = {
  twoFactorEnabled: false,
  biometricEnabled: true,
  darkMode: false,
  notifications: true,
  emailNotifications: true,
  pushNotifications: true,
  language: 'ru',
  autoLock: true,
  dataSync: true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      
      updateSetting: (key, value) => {
        set((state) => ({
          settings: {
            ...state.settings,
            [key]: value,
          },
        }));
      },
      
      updateSettings: (newSettings) => {
        set((state) => ({
          settings: {
            ...state.settings,
            ...newSettings,
          },
        }));
      },
      
      resetSettings: () => {
        set({ settings: defaultSettings });
      },
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);