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
  background: '#0F172A',
  surface: '#1E293B',
  card: '#334155',
  
  text: '#F8FAFC',
  textSecondary: '#E2E8F0',
  textTertiary: '#CBD5E1',
  
  border: '#475569',
  borderLight: '#374151',
  
  primary: '#6366F1',
  primaryLight: '#312E81',
  
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.8)',
};

const pinkColors: ThemeColors = {
  background: '#FEFCFE',
  surface: '#FFFFFF',
  card: '#FDF2F8',
  
  text: '#1F2937',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  
  primary: '#EC4899',
  primaryLight: '#FCE7F3',
  
  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',
  
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

const blueColors: ThemeColors = {
  background: '#FEFEFE',
  surface: '#FFFFFF',
  card: '#F0F9FF',
  
  text: '#1F2937',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  
  primary: '#0EA5E9',
  primaryLight: '#F0F9FF',
  
  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',
  
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

const greenColors: ThemeColors = {
  background: '#FEFEFE',
  surface: '#FFFFFF',
  card: '#F0FDF4',
  
  text: '#1F2937',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  
  primary: '#16A34A',
  primaryLight: '#F0FDF4',
  
  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',
  
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

const orangeColors: ThemeColors = {
  background: '#FEFEFE',
  surface: '#FFFFFF',
  card: '#FFFBEB',
  
  text: '#1F2937',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  
  primary: '#F59E0B',
  primaryLight: '#FFFBEB',
  
  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',
  
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

const purpleColors: ThemeColors = {
  background: '#FEFEFE',
  surface: '#FFFFFF',
  card: '#FAF5FF',
  
  text: '#1F2937',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  
  primary: '#A855F7',
  primaryLight: '#FAF5FF',
  
  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',
  
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

const redColors: ThemeColors = {
  background: '#FEFEFE',
  surface: '#FFFFFF',
  card: '#FEF2F2',
  
  text: '#1F2937',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  
  primary: '#EF4444',
  primaryLight: '#FEF2F2',
  
  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',
  
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
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