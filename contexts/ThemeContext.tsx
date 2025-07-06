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
  
  // New modern colors
  glass: string;
  accent: string;
  surfaceElevated: string;
  surfaceHighest: string;
}

interface ThemeContextType {
  theme: ThemeMode;
  colors: ThemeColors;
  isDark: boolean;
  setTheme: (theme: ThemeMode) => void;
}

const lightColors: ThemeColors = {
  background: '#FAFAFA',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  
  text: '#0A0A0A',
  textSecondary: '#525252',
  textTertiary: '#A3A3A3',
  
  border: '#E5E5E5',
  borderLight: '#F5F5F5',
  
  primary: '#0A0A0A',
  primaryLight: '#F5F5F5',
  
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.4)',
  
  glass: 'rgba(255, 255, 255, 0.8)',
  accent: '#6366F1',
  surfaceElevated: '#FFFFFF',
  surfaceHighest: '#F9FAFB',
};

const darkColors: ThemeColors = {
  background: '#0A0A0A',
  surface: '#1A1A1A',
  card: '#262626',
  
  text: '#FAFAFA',
  textSecondary: '#D4D4D4',
  textTertiary: '#737373',
  
  border: '#404040',
  borderLight: '#2A2A2A',
  
  primary: '#FAFAFA',
  primaryLight: '#262626',
  
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.8)',
  
  glass: 'rgba(26, 26, 26, 0.8)',
  accent: '#6366F1',
  surfaceElevated: '#262626',
  surfaceHighest: '#404040',
};

const pinkColors: ThemeColors = {
  background: '#0A0A0A',
  surface: '#1A1A1A',
  card: '#262626',
  
  text: '#FAFAFA',
  textSecondary: '#D4D4D4',
  textTertiary: '#737373',
  
  border: '#404040',
  borderLight: '#2A2A2A',
  
  primary: '#EC4899',
  primaryLight: '#2D1B2E',
  
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.8)',
  
  glass: 'rgba(26, 26, 26, 0.8)',
  accent: '#EC4899',
  surfaceElevated: '#262626',
  surfaceHighest: '#404040',
};

const blueColors: ThemeColors = {
  background: '#0A0A0A',
  surface: '#1A1A1A',
  card: '#262626',
  
  text: '#FAFAFA',
  textSecondary: '#D4D4D4',
  textTertiary: '#737373',
  
  border: '#404040',
  borderLight: '#2A2A2A',
  
  primary: '#0EA5E9',
  primaryLight: '#1E2A3A',
  
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.8)',
  
  glass: 'rgba(26, 26, 26, 0.8)',
  accent: '#0EA5E9',
  surfaceElevated: '#262626',
  surfaceHighest: '#404040',
};

const greenColors: ThemeColors = {
  background: '#0A0A0A',
  surface: '#1A1A1A',
  card: '#262626',
  
  text: '#FAFAFA',
  textSecondary: '#D4D4D4',
  textTertiary: '#737373',
  
  border: '#404040',
  borderLight: '#2A2A2A',
  
  primary: '#22C55E',
  primaryLight: '#1E2A1E',
  
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.8)',
  
  glass: 'rgba(26, 26, 26, 0.8)',
  accent: '#22C55E',
  surfaceElevated: '#262626',
  surfaceHighest: '#404040',
};

const orangeColors: ThemeColors = {
  background: '#0A0A0A',
  surface: '#1A1A1A',
  card: '#262626',
  
  text: '#FAFAFA',
  textSecondary: '#D4D4D4',
  textTertiary: '#737373',
  
  border: '#404040',
  borderLight: '#2A2A2A',
  
  primary: '#F59E0B',
  primaryLight: '#2A1E0B',
  
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.8)',
  
  glass: 'rgba(26, 26, 26, 0.8)',
  accent: '#F59E0B',
  surfaceElevated: '#262626',
  surfaceHighest: '#404040',
};

const purpleColors: ThemeColors = {
  background: '#0A0A0A',
  surface: '#1A1A1A',
  card: '#262626',
  
  text: '#FAFAFA',
  textSecondary: '#D4D4D4',
  textTertiary: '#737373',
  
  border: '#404040',
  borderLight: '#2A2A2A',
  
  primary: '#A855F7',
  primaryLight: '#2A1A3A',
  
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.8)',
  
  glass: 'rgba(26, 26, 26, 0.8)',
  accent: '#A855F7',
  surfaceElevated: '#262626',
  surfaceHighest: '#404040',
};

const redColors: ThemeColors = {
  background: '#0A0A0A',
  surface: '#1A1A1A',
  card: '#262626',
  
  text: '#FAFAFA',
  textSecondary: '#D4D4D4',
  textTertiary: '#737373',
  
  border: '#404040',
  borderLight: '#2A2A2A',
  
  primary: '#EF4444',
  primaryLight: '#2A1A1A',
  
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.8)',
  
  glass: 'rgba(26, 26, 26, 0.8)',
  accent: '#EF4444',
  surfaceElevated: '#262626',
  surfaceHighest: '#404040',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'app_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('dark');
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
  const isDark = theme === 'dark' || (theme === 'system' && systemColorScheme === 'dark') || 
                 ['pink', 'blue', 'green', 'orange', 'purple', 'red'].includes(theme);
  
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
      case 'light':
        return lightColors;
      case 'system':
        return isDark ? darkColors : lightColors;
      default:
        return darkColors;
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