import React, { useEffect, useMemo, useRef, useState } from 'react';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js/lib/common';
import mermaid from 'mermaid';

type Props = {
  content: string;
};

function createMd(): MarkdownIt {
  const md = new MarkdownIt({
    html: false,
    linkify: true,
    typographer: true,
    highlight(str, lang) {
      if (lang === 'mermaid') {
        const key = `mermaid-${Date.now()}-${Math.random()}`;
        // Render as mermaid container; actual rendering happens in useEffect
        return `<div class="mermaid" key="${key}">${str}</div>`;
      }
      if (lang && hljs.getLanguage(lang)) {
        try {
          return `<pre class="hljs"><code>${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`;
        } catch {
          // fallthrough
        }
      }
      const escaped = md.utils.escapeHtml(str);
      return `<pre class="hljs"><code>${escaped}</code></pre>`;
    },
  });

  // Transform inline mermaid code fences too if needed
  const fence = md.renderer.rules.fence;
  md.renderer.rules.fence = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const langInfo = token.info ? token.info.trim() : '';
    if (langInfo === 'mermaid') {
      const key = `mermaid-fence-${Date.now()}-${Math.random()}`;
      return `<div class="mermaid" key="${key}">${token.content}</div>`;
    }
    return fence ? fence(tokens, idx, options, env, self) : self.renderToken(tokens, idx, options);
  };

  return md;
}

export function Markdown({ content }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [themeState, setThemeState] = useState(0); // Force re-render on theme change
  const md = useMemo(createMd, []);
  const html = useMemo(() => md.render(typeof content === 'string' ? content : String(content ?? '')),
    [md, content]);

  // Listen for theme changes
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          setThemeState(prev => prev + 1); // Trigger re-render
        }
      });
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    // Also listen for media query changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => setThemeState(prev => prev + 1);
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  useEffect(() => {
    // Initialize mermaid diagrams when content or theme changes
    try {
      // Detect current theme from document class or system preference
      const isDarkMode = document.documentElement.classList.contains('dark') || 
                        (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
      
      const mermaidTheme = isDarkMode ? 'dark' : 'default';
      
      mermaid.initialize({ 
        startOnLoad: false, 
        theme: mermaidTheme,
        themeVariables: isDarkMode ? {
          // Dark mode color overrides
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
          // Light mode color overrides (optional, defaults are usually fine)
          primaryColor: '#3B82F6',
          lineColor: '#374151'
        }
      });
      
      if (containerRef.current) {
        // Only process elements with the 'mermaid' class
        const mermaidElements = containerRef.current.querySelectorAll('.mermaid');
        if (mermaidElements.length > 0) {
          mermaid.run({ nodes: Array.from(mermaidElements) });
        }
      }
    } catch (error) {
      // ignore mermaid errors - they shouldn't break the entire component
      console.debug('Mermaid rendering error:', error);
    }
  }, [html, themeState]);

  return <div ref={containerRef} className="markdown-content" dangerouslySetInnerHTML={{ __html: html }} />;
}


