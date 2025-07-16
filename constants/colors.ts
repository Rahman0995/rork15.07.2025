// Light theme colors
const lightColors = {
  // Primary colors - Elegant blue inspired by Linear/Notion
  primary: "#2563EB",
  primaryLight: "#3B82F6",
  primaryDark: "#1D4ED8",
  primarySoft: "#EFF6FF",
  
  // Secondary colors - Soft coral accent
  secondary: "#F97316",
  secondaryLight: "#FB923C",
  secondaryDark: "#EA580C",
  secondarySoft: "#FFF7ED",
  
  // Accent color
  accent: "#8B5CF6",
  
  // Background colors - Ultra clean and minimal
  background: "#FFFFFF",
  backgroundSecondary: "#F8FAFC",
  backgroundTertiary: "#F1F5F9",
  card: "#FFFFFF",
  cardSecondary: "#FAFBFC",
  
  // Text colors - Perfect contrast hierarchy
  text: "#0F172A",
  textSecondary: "#475569",
  textTertiary: "#64748B",
  textQuaternary: "#94A3B8",
  
  // Border and divider colors - Subtle and clean
  border: "#E2E8F0",
  borderLight: "#F1F5F9",
  borderSoft: "#F8FAFC",
  divider: "#E5E7EB",
  
  // Status colors - Modern and accessible
  success: "#059669",
  successLight: "#D1FAE5",
  successSoft: "#F0FDF4",
  error: "#DC2626",
  errorLight: "#FEE2E2",
  errorSoft: "#FEF2F2",
  warning: "#D97706",
  warningLight: "#FEF3C7",
  warningSoft: "#FFFBEB",
  info: "#0284C7",
  infoLight: "#DBEAFE",
  infoSoft: "#F0F9FF",
  
  // Interactive states
  inactive: "#9CA3AF",
  hover: "#F8FAFC",
  pressed: "#F1F5F9",
  focus: "#EFF6FF",
  
  // Utility colors
  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
  overlay: "rgba(0, 0, 0, 0.5)",
  
  // Shadows - Soft and modern
  shadow: "rgba(0, 0, 0, 0.08)",
  shadowLight: "rgba(0, 0, 0, 0.04)",
  shadowMedium: "rgba(0, 0, 0, 0.12)",
  shadowStrong: "rgba(0, 0, 0, 0.16)",
};

// Dark theme colors - Modern and elegant
const darkColors = {
  // Primary colors - Slightly brighter for dark theme
  primary: "#3B82F6",
  primaryLight: "#60A5FA",
  primaryDark: "#2563EB",
  primarySoft: "#1E293B",
  
  // Secondary colors - Warmer orange for dark theme
  secondary: "#FB923C",
  secondaryLight: "#FDBA74",
  secondaryDark: "#F97316",
  secondarySoft: "#292524",
  
  // Accent color - Slightly lighter purple
  accent: "#A78BFA",
  
  // Background colors - Rich dark grays
  background: "#0F172A",
  backgroundSecondary: "#1E293B",
  backgroundTertiary: "#334155",
  card: "#1E293B",
  cardSecondary: "#334155",
  
  // Text colors - High contrast for readability
  text: "#F8FAFC",
  textSecondary: "#CBD5E1",
  textTertiary: "#94A3B8",
  textQuaternary: "#64748B",
  
  // Border and divider colors - Subtle dark borders
  border: "#334155",
  borderLight: "#475569",
  borderSoft: "#1E293B",
  divider: "#475569",
  
  // Status colors - Adjusted for dark theme
  success: "#10B981",
  successLight: "#064E3B",
  successSoft: "#022C22",
  error: "#EF4444",
  errorLight: "#7F1D1D",
  errorSoft: "#450A0A",
  warning: "#F59E0B",
  warningLight: "#78350F",
  warningSoft: "#451A03",
  info: "#06B6D4",
  infoLight: "#164E63",
  infoSoft: "#0C2A36",
  
  // Interactive states
  inactive: "#64748B",
  hover: "#334155",
  pressed: "#475569",
  focus: "#1E293B",
  
  // Utility colors
  white: "#FFFFFF",
  black: "#000000",
  transparent: "transparent",
  overlay: "rgba(0, 0, 0, 0.7)",
  
  // Shadows - Darker shadows for dark theme
  shadow: "rgba(0, 0, 0, 0.3)",
  shadowLight: "rgba(0, 0, 0, 0.2)",
  shadowMedium: "rgba(0, 0, 0, 0.4)",
  shadowStrong: "rgba(0, 0, 0, 0.5)",
};

export type ColorScheme = typeof lightColors;

export { lightColors, darkColors };

// Default export for backward compatibility
export const colors = lightColors;