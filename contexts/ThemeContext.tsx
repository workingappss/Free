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
  background: '#FAFAFA',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  
  text: '#0A0A0A',
  textSecondary: '#525252',
  textTertiary: '#A3A3A3',
  
  border: '#E5E5E5',
  borderLight: '#F5F5F5',
  
  primary: '#4F46E5',
  primaryLight: '#EEF2FF',
  
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

const darkColors: ThemeColors = {
  background: '#0A0A0A',
  surface: '#1A1A1A',
  card: '#2A2A2A',
  
  text: '#FAFAFA',
  textSecondary: '#E0E0E0',
  textTertiary: '#A0A0A0',
  
  border: '#333333',
  borderLight: '#222222',
  
  primary: '#00E676',
  primaryLight: '#00E67620',
  
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
  
  text: '#0A0A0A',
  textSecondary: '#525252',
  textTertiary: '#A3A3A3',
  
  border: '#E5E5E5',
  borderLight: '#F5F5F5',
  
  primary: '#EC4899',
  primaryLight: '#FCE7F3',
  
  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',
  
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

const blueColors: ThemeColors = {
  background: '#FAFAFA',
  surface: '#FFFFFF',
  card: '#F0F9FF',
  
  text: '#0A0A0A',
  textSecondary: '#525252',
  textTertiary: '#A3A3A3',
  
  border: '#E5E5E5',
  borderLight: '#F5F5F5',
  
  primary: '#0EA5E9',
  primaryLight: '#F0F9FF',
  
  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',
  
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

const greenColors: ThemeColors = {
  background: '#FAFAFA',
  surface: '#FFFFFF',
  card: '#F0FDF4',
  
  text: '#0A0A0A',
  textSecondary: '#525252',
  textTertiary: '#A3A3A3',
  
  border: '#E5E5E5',
  borderLight: '#F5F5F5',
  
  primary: '#16A34A',
  primaryLight: '#F0FDF4',
  
  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',
  
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

const orangeColors: ThemeColors = {
  background: '#FAFAFA',
  surface: '#FFFFFF',
  card: '#FFFBEB',
  
  text: '#0A0A0A',
  textSecondary: '#525252',
  textTertiary: '#A3A3A3',
  
  border: '#E5E5E5',
  borderLight: '#F5F5F5',
  
  primary: '#F59E0B',
  primaryLight: '#FFFBEB',
  
  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',
  
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

const purpleColors: ThemeColors = {
  background: '#FAFAFA',
  surface: '#FFFFFF',
  card: '#FAF5FF',
  
  text: '#0A0A0A',
  textSecondary: '#525252',
  textTertiary: '#A3A3A3',
  
  border: '#E5E5E5',
  borderLight: '#F5F5F5',
  
  primary: '#A855F7',
  primaryLight: '#FAF5FF',
  
  success: '#059669',
  warning: '#D97706',
  error: '#DC2626',
  
  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

const redColors: ThemeColors = {
  background: '#FAFAFA',
  surface: '#FFFFFF',
  card: '#FEF2F2',
  
  text: '#0A0A0A',
  textSecondary: '#525252',
  textTertiary: '#A3A3A3',
  
  border: '#E5E5E5',
  borderLight: '#F5F5F5',
  
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