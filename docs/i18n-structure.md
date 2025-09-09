# Internationalization (i18n) Structure

## Overview

The spec-workflow-mcp project implements internationalization across three distinct components, each with its own translation file structure to meet specific UI and functional requirements.

## Supported Languages

The project supports 11 languages:
- English (en) 🇺🇸
- Japanese (ja) 🇯🇵
- Chinese (zh) 🇨🇳
- Spanish (es) 🇪🇸
- Portuguese (pt) 🇧🇷
- German (de) 🇩🇪
- French (fr) 🇫🇷
- Russian (ru) 🇷🇺
- Italian (it) 🇮🇹
- Korean (ko) 🇰🇷
- Arabic (ar) 🇸🇦

## Translation File Locations

### 1. Backend MCP Server (`src/locales/`)
- **Purpose**: Translations for MCP tool responses and server messages
- **Structure**: Starts with keys like `tools`, `specStatus`, `errors`
- **Usage**: Used by the MCP server when responding to tool calls
- **Example keys**:
  ```json
  {
    "tools": {
      "steeringGuide": { ... },
      "specStatus": { ... }
    }
  }
  ```

### 2. VSCode Extension Webview (`vscode-extension/src/webview/locales/`)
- **Purpose**: Translations for the VSCode extension's webview UI
- **Structure**: Starts with keys like `header`, `tabs`, `overview`
- **Usage**: Used in the VSCode extension's React-based webview
- **Example keys**:
  ```json
  {
    "header": { "title": "...", "support": "..." },
    "tabs": { "overview": "...", "steering": "..." },
    "overview": { ... }
  }
  ```

### 3. Dashboard Frontend (`src/dashboard_frontend/src/locales/`)
- **Purpose**: Translations for the web dashboard UI
- **Structure**: Similar to VSCode but with dashboard-specific sections
- **Usage**: Used in the standalone web dashboard
- **Example keys**:
  ```json
  {
    "nav": { ... },
    "dashboard": { ... },
    "settings": { ... }
  }
  ```

## Why Different Structures?

Each component serves a different purpose and has unique translation needs:

1. **Backend MCP Server**: Focuses on tool descriptions, error messages, and workflow guidance
2. **VSCode Extension**: Provides a simplified project management interface within VSCode
3. **Dashboard Frontend**: Offers a comprehensive web-based project dashboard

The different structures are **intentional and correct** - they are not inconsistencies but rather tailored translation sets for each component's specific requirements.

## Validation

All translation files are validated during the build process:

```bash
npm run validate:i18n
```

This script checks:
- JSON syntax validity
- Mustache template variable consistency across languages
- File presence for all supported languages

## Adding New Languages

To add a new language:

1. Add the language code to `SUPPORTED_LANGUAGES` in:
   - `src/core/i18n.ts`
   - `scripts/validate-i18n.js`

2. Create translation files in all three locations:
   - `src/locales/{lang}.json`
   - `vscode-extension/src/webview/locales/{lang}.json`
   - `src/dashboard_frontend/src/locales/{lang}.json`

3. Update language selectors:
   - VSCode: `vscode-extension/src/webview/App.tsx`
   - Dashboard: `src/dashboard_frontend/src/components/LanguageSelector.tsx`

4. Import and register translations in i18n configurations:
   - `vscode-extension/src/webview/i18n.ts`
   - `src/dashboard_frontend/src/i18n.ts`

## Bundle Size Considerations

With 11 languages, bundle size impact should be monitored. For production deployments with large user bases, consider:

- Implementing lazy loading of language packs
- Setting `REACT_APP_I18N_DYNAMIC=true` for dynamic imports
- Loading only the user's selected language initially

Current implementation uses eager loading for better user experience during language switching.