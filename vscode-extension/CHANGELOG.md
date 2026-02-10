# Change Log

All notable changes to the "spec-workflow-mcp" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [1.1.7] - 2026-01-28

### Added
- **Configurable Workflow Root** (Issue #193) - Support for custom `.spec-workflow` folder location:
  - New VSCode setting `specWorkflow.workflowRoot` for specifying custom path
  - **Workflow Location** card in Overview tab with current path display
  - **Browse** button to select folder via native file picker
  - **Reset** button to restore default workspace root behavior
  - Ideal for multi-root workspaces where `.spec-workflow` needs to be at a higher directory level
  - Full i18n support for all 11 locales

## [1.1.6] - 2026-01-24

### Added
- **Bulk Approval Management** (PR #181) - New batch selection and action system for managing multiple approval requests:
  - **Selection Mode** - Toggle to enable multi-select with visual checkboxes on approval items
  - **Select All / Deselect All** - Quick controls to select or clear all visible approval items
  - **Batch Actions** - Approve All or Reject All selected items in a single operation
  - **Undo Operations** - 30-second undo window with visual progress bar countdown after batch actions
  - **Continue-on-Error** - Batch operations process all items and report individual failures without stopping
  - **Full i18n Support** - Translations for all 11 supported locales

## [1.1.5] - 2026-01-24

### Added
- **Custom Typography System** - Added locally-bundled fonts for improved readability and visual consistency:
  - **Inter** (400, 500, 600, 700 weights) - Modern sans-serif for UI text
  - **JetBrains Mono** (400, 500, 700 weights) - Developer-focused monospace for code
  - Fonts are bundled locally in the extension (no CDN dependency)
  - Updated Content Security Policy to allow font loading
  - Updated Vite config to copy font assets during build

## [1.1.4] - 2026-01-23

### Security
- **Dependency Updates** - Fixed 6 vulnerabilities (3 high, 2 moderate, 1 low) via `npm audit fix`:
  - `diff` - DoS vulnerability in parsePatch/applyPatch (GHSA-73rr-hh4g-fpgx)
  - `glob` - Command injection via -c/--cmd (GHSA-5j98-mcp5-4vw2)
  - `js-yaml` - Prototype pollution in merge (GHSA-mh29-5h37-fv8m)
  - `preact` - JSON VNode Injection (GHSA-36hm-qxxp-pg3m)
  - `tar` - Arbitrary file overwrite and symlink poisoning (GHSA-8qq5-rm4j-mr97, GHSA-r6q2-hw4h-h46w)
  - `vite` - Multiple server.fs bypass vulnerabilities (GHSA-g4jq-h2w9-997c, GHSA-jqfw-vq24-v9c3, GHSA-93m4-6634-74q7)

## [1.1.3] - 2025-12-10

### Fixed
- **Task Parser Alignment** - Aligned VSCode extension task parser with dashboard parser for consistent task parsing behavior

## [1.1.2] - 2025-11-10

### Fixed
- **Task Status Update Bug** (PR #139) - Fixed task status updates failing in VSCode extension:
  - Removed race condition from redundant `sendTasks()` call that competed with file watcher auto-refresh
  - Synced extension's taskParser regex with core parser (removed `$` anchor, fixed capture groups)
  - Changed validation to allow no-op updates instead of throwing errors
  - Added debug logging for better diagnostics
  - Result: Task status updates now work reliably in VSCode extension sidebar

### Changed
- **Implementation Logs Format** - Updated to support new markdown-based implementation logs (migrated from JSON format)

## [1.1.0]

### Added
- Added Integration Log page to the extension. This aligns the extension with the new MCP Server functionality.

## [1.0.0]

### Updated
- Updated task parser to support the new structured prompt format.

**NOTE: Extension version is now in sync with MCP server version and out of beta.**

## [0.0.11]

### Fixed
- Fixed "ReferenceError: t is not defined" errors in multiple components:
  - `CommentModal` in VSCode extension (Comment editing interface)
  - `comment-modal.tsx` wrapper (Modal context provider)

## [0.0.10]

### Added
- **Multi-Language Support Expansion** - Added comprehensive translations for 8 new languages
  - Spanish (es) 🇪🇸 translations for all components
  - Portuguese (pt) 🇧🇷 translations for all components
  - German (de) 🇩🇪 translations for all components
  - French (fr) 🇫🇷 translations for all components
  - Russian (ru) 🇷🇺 translations for all components
  - Italian (it) 🇮🇹 translations for all components
  - Korean (ko) 🇰🇷 translations for all components
  - Arabic (ar) 🇸🇦 translations for all components
  - Total of 24 new translation files across MCP server, dashboard, and VSCode extension
  - Updated language selectors in both dashboard and VSCode extension to include all new languages

## [0.0.9]

### Added
- **AI Prompt Generation for Tasks** - Enhanced task management with intelligent prompt generation
  - Copy task button now uses custom AI prompts when available in tasks.md
  - Added support for parsing `_Prompt:` metadata fields from task definitions
  - Structured prompts follow Role | Task | Restrictions | Success format for better AI guidance
  - Graceful fallback to default prompts for backward compatibility with existing workflows
  - New localization keys for prompt-related UI elements in English, Chinese, and Japanese
  - Added Prompt to UI for previewing the prompt for the task in a collapsible section

### Enhanced
- **Task Parsing** - Extended task parser to extract and utilize custom AI prompts
- **User Experience** - Context-aware prompts provide more specific guidance to AI agents
- **Multi-language Support** - Added prompt-related translations for all supported languages

### Added
- **Manual Language Selector** - Added dropdown for manual language selection in VSCode extension webview
  - Implemented Radix UI dropdown menu component with proper styling
  - Added language selector to extension header with support for English, Japanese, and Chinese
  - Integrated with existing i18n framework for dynamic language switching
  - Includes message handling between webview and extension for language preference persistence

## [0.0.8]

### Added
- **Chinese (zh) Language Support** - Comprehensive Chinese translations for the VSCode extension webview
  - Complete Chinese translations for all UI elements in the webview interface
  - Integration with react-i18next for dynamic language switching
  - Consistent terminology and UI text aligned with the main MCP server translations

## [0.0.6]

### Added
- **Copy Instructions for Steering Documents** - Added "Copy Instructions" button to steering documents section
  - Single button in steering documents card header provides comprehensive instructions for all three steering documents
  - Covers product.md, tech.md, and structure.md with clear guidance for each document type
  - Includes visual feedback ("Copied!" state) and robust clipboard handling with fallback support
  - Follows existing UI patterns and integrates seamlessly with current extension functionality

## [0.0.5]

### Fixed
- Improved text contrast in task card leverage sections for better readability in both light and dark themes
- Fixed navigation bar visibility in light mode by adding subtle border and shadow

## [0.0.4]

### Changed
- Branding update.

**No functional changes.**

## [0.0.3]

### Changed
- Updated Approval View to support steering documents properly.
- Updated Specification dropdown to "Document" instead.

## [0.0.2]

### Fixed
- Long file paths in task cards now display with horizontal scrollbars instead of being cut off

## [0.0.1]

### Initial Release

- Feature parity with web based dashboard!