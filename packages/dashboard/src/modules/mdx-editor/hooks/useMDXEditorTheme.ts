import { useMemo } from 'react';
import { useTheme } from '../../theme/ThemeProvider';

export interface MDXEditorThemeConfig {
  theme: 'light' | 'dark';
  isDarkMode: boolean;
  mermaidTheme: 'dark' | 'default';
  mermaidThemeVariables: Record<string, string>;
}

export function useMDXEditorTheme(): MDXEditorThemeConfig {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  return useMemo(() => ({
    theme,
    isDarkMode,
    mermaidTheme: isDarkMode ? 'dark' : 'default',
    mermaidThemeVariables: isDarkMode ? {
      primaryColor: '#3B82F6',
      primaryTextColor: '#E5E7EB',
      primaryBorderColor: '#6B7280',
      lineColor: '#9CA3AF',
      secondaryColor: '#1F2937',
      tertiaryColor: '#374151',
      background: '#111827',
      mainBkg: '#1F2937',
      secondBkg: '#374151',
      tertiaryBkg: '#4B5563'
    } : {
      primaryColor: '#3B82F6',
      lineColor: '#374151'
    }
  }), [theme, isDarkMode]);
}
