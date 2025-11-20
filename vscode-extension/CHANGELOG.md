# Change Log

All notable changes to the "spec-workflow-mcp" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

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