import { useColorScheme } from 'react-native';
import { useSettingsStore } from '@/store/settingsStore';
import { lightColors, darkColors, ColorScheme } from './colors';

export const useTheme = () => {
  const { settings, updateSetting } = useSettingsStore();
  const systemColorScheme = useColorScheme();
  
  // Determine if we should use dark theme
  const isDark = settings.darkMode === true || 
    (settings.darkMode === 'system' && systemColorScheme === 'dark');
  
  const colors: ColorScheme = isDark ? darkColors : lightColors;
  
  const toggleTheme = () => {
    updateSetting('darkMode', !isDark);
  };
  
  return {
    colors,
    isDark,
    theme: isDark ? 'dark' : 'light',
    toggleTheme
  };
};

export type Theme = {
  colors: ColorScheme;
  isDark: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
};