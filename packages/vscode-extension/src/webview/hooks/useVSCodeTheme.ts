import { useState, useEffect } from 'react';

type VSCodeTheme = 'light' | 'dark' | 'high-contrast';

/**
 * Custom hook to detect and track VS Code theme changes
 * VS Code automatically adds theme classes to the body element:
 * - 'vscode-light' for light themes
 * - 'vscode-dark' for dark themes  
 * - 'vscode-high-contrast' for high contrast themes
 */
export function useVSCodeTheme(): VSCodeTheme {
  const [theme, setTheme] = useState<VSCodeTheme>(() => {
    // Initial theme detection
    const body = document.body;
    if (body.classList.contains('vscode-high-contrast')) {
      return 'high-contrast';
    }
    if (body.classList.contains('vscode-dark')) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    const detectTheme = (): VSCodeTheme => {
      const body = document.body;
      if (body.classList.contains('vscode-high-contrast')) {
        return 'high-contrast';
      }
      if (body.classList.contains('vscode-dark')) {
        return 'dark';
      }
      return 'light';
    };

    // Update theme on initial mount
    setTheme(detectTheme());

    // Create observer to watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          const newTheme = detectTheme();
          setTheme(newTheme);
        }
      });
    });

    // Start observing body class changes
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });

    // Cleanup observer on unmount
    return () => {
      observer.disconnect();
    };
  }, []);

  return theme;
}