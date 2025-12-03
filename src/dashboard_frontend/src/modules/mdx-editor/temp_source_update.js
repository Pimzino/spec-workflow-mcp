const fs = require('fs');
let content = fs.readFileSync('MDXEditorWrapper.tsx', 'utf8');

// Update source mode className to include isDarkMode
content = content.replace(
  'mdx-editor-wrapper source-mode ${className}',
  "mdx-editor-wrapper source-mode ${isDarkMode ? 'dark-theme' : ''} ${className}"
);

// Update source content div
content = content.replace(
  '<div className="bg-gray-50 dark:bg-gray-900 p-3 sm:p-4 rounded-lg text-xs sm:text-sm overflow-auto h-full">',
  '<div className="source-content">'
);

// Update pre element
content = content.replace(
  '<pre className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed overflow-x-auto font-mono">',
  '<pre className="source-pre"><code>'
);

// Add closing code tag
content = content.replace(
  '{content}\n          </pre>',
  '{content}</code>\n          </pre>'
);

fs.writeFileSync('MDXEditorWrapper.tsx', content);
console.log('Done');
