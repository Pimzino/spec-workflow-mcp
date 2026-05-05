import React, { useEffect } from 'react';
import { useTheme } from './ThemeProvider';

const LIGHT_ID = 'hljs-light-theme';
const DARK_ID = 'hljs-dark-theme';
const LIGHT_HREF = 'https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/github.min.css';
const DARK_HREF = 'https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/github-dark.min.css';

function ensureLink(id: string, href: string) {
  let link = document.getElementById(id) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }
  return link;
}

export function HighlightStyles() {
  const { theme } = useTheme();

  useEffect(() => {
    const light = ensureLink(LIGHT_ID, LIGHT_HREF);
    const dark = ensureLink(DARK_ID, DARK_HREF);
    if (theme === 'dark') {
      light.disabled = true;
      dark.disabled = false;
    } else {
      light.disabled = false;
      dark.disabled = true;
    }
  }, [theme]);

  return null;
}


