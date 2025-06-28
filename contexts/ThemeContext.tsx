import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'pink' | 'blue' | 'green' | 'orange' | 'purple' | 'red' | 'system';

interface ThemeColors {
  // Background colors
  background: string;
  surface: string;
  card: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  
  // Border colors
  border: string;
  borderLight: string;
  
  // Primary colors
  primary: string;
  primaryLight: string;
  
  // Status colors
  success: string;
  warning: string;
  error: string;
  
  // Special colors
  shadow: string;
  overlay: string;
}

interface ThemeContextType {
  theme: ThemeMode;
  colors: ThemeColors;
  isDark: boolean;
  setTheme: (theme: ThemeMode) => void;
}

const lightColors: ThemeColors = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  
  text: '#1F2937',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  
  primary: '#6366F1',
  primaryLight: '#EEF2FF',
  
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

const darkColors: ThemeColors = {
  background: '#000000',
  surface: '#111111',
  card: '#1A1A1A',
  
  text: '#F1F5F9',
  textSecondary: '#CBD5E1',
  textTertiary: '#94A3B8',
  
  border: '#333333',
  borderLight: '#222222',
  
  primary: '#6366F1',
  primaryLight: '#1A1A2E',
  
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.8)',
};

const pinkColors: ThemeColors = {
  background: '#FDF2F8',
  surface: '#FFFFFF',
  card: '#FCE7F3',
  
  text: '#831843',
  textSecondary: '#BE185D',
  textTertiary: '#EC4899',
  
  border: '#F9A8D4',
  borderLight: '#FBCFE8',
  
  primary: '#EC4899',
  primaryLight: '#FCE7F3',
  
  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',
  
  shadow: '#831843',
  overlay: 'rgba(131, 24, 67, 0.5)',
};

const blueColors: ThemeColors = {
  background: '#F0F9FF',
  surface: '#FFFFFF',
  card: '#E0F2FE',
  
  text: '#0C4A6E',
  textSecondary: '#0369A1',
  textTertiary: '#0284C7',
  
  border: '#7DD3FC',
  borderLight: '#BAE6FD',
  
  primary: '#0EA5E9',
  primaryLight: '#E0F2FE',
  
  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',
  
  shadow: '#0C4A6E',
  overlay: 'rgba(12, 74, 110, 0.5)',
};

const greenColors: ThemeColors = {
  background: '#F0FDF4',
  surface: '#FFFFFF',
  card: '#DCFCE7',
  
  text: '#14532D',
  textSecondary: '#166534',
  textTertiary: '#15803D',
  
  border: '#86EFAC',
  borderLight: '#BBF7D0',
  
  primary: '#16A34A',
  primaryLight: '#DCFCE7',
  
  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',
  
  shadow: '#14532D',
  overlay: 'rgba(20, 83, 45, 0.5)',
};

const orangeColors: ThemeColors = {
  background: '#FFFBEB',
  surface: '#FFFFFF',
  card: '#FEF3C7',
  
  text: '#92400E',
  textSecondary: '#B45309',
  textTertiary: '#D97706',
  
  border: '#FCD34D',
  borderLight: '#FDE68A',
  
  primary: '#F59E0B',
  primaryLight: '#FEF3C7',
  
  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',
  
  shadow: '#92400E',
  overlay: 'rgba(146, 64, 14, 0.5)',
};

const purpleColors: ThemeColors = {
  background: '#FAF5FF',
  surface: '#FFFFFF',
  card: '#F3E8FF',
  
  text: '#581C87',
  textSecondary: '#7C2D92',
  textTertiary: '#A21CAF',
  
  border: '#C084FC',
  borderLight: '#DDD6FE',
  
  primary: '#A855F7',
  primaryLight: '#F3E8FF',
  
  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',
  
  shadow: '#581C87',
  overlay: 'rgba(88, 28, 135, 0.5)',
};

const redColors: ThemeColors = {
  background: '#FEF2F2',
  surface: '#FFFFFF',
  card: '#FEE2E2',
  
  text: '#7F1D1D',
  textSecondary: '#991B1B',
  textTertiary: '#DC2626',
  
  border: '#FCA5A5',
  borderLight: '#FECACA',
  
  primary: '#EF4444',
  primaryLight: '#FEE2E2',
  
  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',
  
  shadow: '#7F1D1D',
  overlay: 'rgba(127, 29, 29, 0.5)',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'app_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('system');
  const [systemColorScheme, setSystemColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );

  // Load saved theme on app start
  useEffect(() => {
    loadSavedTheme();
  }, []);

  // Listen to system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemColorScheme(colorScheme);
    });

    return () => subscription?.remove();
  }, []);

  const loadSavedTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && ['light', 'dark', 'pink', 'blue', 'green', 'orange', 'purple', 'red', 'system'].includes(savedTheme)) {
        setThemeState(savedTheme as ThemeMode);
      }
    } catch (error) {
      console.error('Error loading saved theme:', error);
    }
  };

  const setTheme = async (newTheme: ThemeMode) => {
    try {
      setThemeState(newTheme);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  // Determine if we should use dark mode
  const isDark = theme === 'dark' || (theme === 'system' && systemColorScheme === 'dark');
  
  // Get current colors based on theme
  const getColors = () => {
    switch (theme) {
      case 'pink':
        return pinkColors;
      case 'blue':
        return blueColors;
      case 'green':
        return greenColors;
      case 'orange':
        return orangeColors;
      case 'purple':
        return purpleColors;
      case 'red':
        return redColors;
      case 'dark':
        return darkColors;
      case 'system':
        return isDark ? darkColors : lightColors;
      default:
        return lightColors;
    }
  };
  
  const colors = getColors();

  const value: ThemeContextType = {
    theme,
    colors,
    isDark,
    setTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}