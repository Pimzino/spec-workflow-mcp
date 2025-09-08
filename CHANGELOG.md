# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.28] - 2025-09-08

### Added
- **AI Prompt Generation for Tasks** - Enhanced task management with structured AI prompts
  - Added `prompt` field to ParsedTask interface for custom AI guidance
  - Task parser now extracts `_Prompt:` metadata from tasks.md files
  - Updated tasks template with LLM guidance for generating structured prompts
  - Copy functionality in both VSCode extension and dashboard now uses AI prompts when available
  - Graceful fallback to default "work on this task" prompts for backward compatibility
  - Comprehensive localization support (English, Chinese, Japanese) for new prompt features
  - MCP server tools automatically include prompt field in all task responses
  - Added Prompt to UI for previewing the prompt for the task in a collapsible section

### Enhanced
- **Task Template** - Added AI instructions for generating structured prompts with Role | Task | Restrictions | Success format
- **Multi-language Support** - Extended localization with prompt-related keys for better user experience
- **UI/UX Improvements** - Copy buttons now provide context-aware prompts for improved AI agent guidance

### Fixed
- **Volume Slider Alignment** - Fixed misaligned volume slider dot in web dashboard
  - Corrected CSS styling to properly center the 16px slider thumb on the track
  - Reduced track height from 8px to 4px for better visual proportion
  - Added `margin-top: -6px` to webkit slider thumb for proper vertical centering
  - Fixed duplicate border property in Firefox slider styles
  - Ensures consistent alignment across all browsers (Chrome, Safari, Edge, Firefox)
- **Language Selector** - Added missing Chinese language option to web dashboard dropdown
  - Chinese translations were already present but not exposed in the language selector UI
  - Added Chinese option with appropriate flag emoji to SUPPORTED_LANGUAGES array

## [0.0.27] - 2025-09-08

### Added
- **Chinese (zh) Language Support** - Comprehensive Chinese translations for multi-language support
  - Complete Chinese translations for all MCP server tools and messages
  - Chinese translations for dashboard frontend interface
  - Chinese translations for VSCode extension webview components
  - Integration with existing i18n framework supporting dynamic language switching
  - Validation script updates to ensure Chinese translation consistency

## [0.0.26] - 2025-09-08

### Fixed
- **MCP Server Mode** - Prevent stdout contamination that caused JSON parsing errors in MCP clients
  - Replaced console.log with console.error for diagnostic messages
  - Ensures stdout is reserved exclusively for JSON-RPC protocol communication
  - Fixes issue #71 where MCP clients couldn't parse server responses

### Added
- **Tasks UI Filtering and Sorting** - Enhanced task management with advanced filtering and sorting capabilities
  - Status filtering options (All, Pending, In Progress, Completed) with real-time task counts
  - Multiple sorting options (Default Order, By Status, By Task ID, By Description)
  - Ascending/Descending sort order toggle for all sort options
  - Persistent user preferences using localStorage (per-specification basis)
  - Full i18n support with English and Japanese translations
  - Maintains compatibility with real-time WebSocket updates
  - Based on contribution from @qdhenry (PR #54, #74)
- **Docker Container Support** - Full containerization for easy deployment
  - Multi-stage Dockerfile for optimized container size
  - Docker Compose configuration for dashboard deployment
  - Support for both MCP server and dashboard modes
  - Volume mounting for `.spec-workflow` directory persistence
  - Comprehensive container documentation and examples
  - Based on contribution from @heavyengineer (PR #57, #73)
- **Internationalization (i18n) Framework** - Comprehensive multi-language support across all components
  - Backend i18n with async loading and LRU caching for MCP tools
  - Frontend i18n using react-i18next for dashboard interface
  - VSCode extension i18n support for webview components
  - Complete Japanese translations for all tools and UI elements
  - Dynamic import support for optimized bundle sizes
  - Environment variable validation for locale formats (supports en, ja, en-US, pt-BR patterns)
  - Build-time validation script ensuring translation consistency

### Technical Changes
- Implemented Mustache templating for safe string interpolation in translations
- Added LRU cache with 10MB memory limit and 1-hour TTL for performance
- Integrated locale file copying into build process for all components
- Added comprehensive i18n documentation guide with performance comparisons
- Created validation script for JSON syntax and template variable consistency
- Enhanced copy-static script to include locale directories
- Added support for VITE_I18N_DYNAMIC environment variable for lazy loading

### Improved
- Reduced initial bundle size with optional dynamic translation loading
- Better error handling with locale-specific fallback mechanisms
- Production-ready error sanitization to prevent information disclosure

## [0.0.25] - 2025-09-07

### Added
- **MCP Prompts Support** - Implemented full Model Context Protocol prompts capability
  - Added 6 interactive prompts for spec-driven development workflows
  - `create-spec` - Interactive spec document creation with guided workflow
  - `create-steering-doc` - Create AI agent guidance documents
  - `manage-tasks` - Task management with list, complete, reset, and status actions
  - `request-approval` - Initiate formal approval workflows
  - `spec-status` - Get comprehensive project status overviews
  - `workflow-guide` - Interactive workflow guidance with best practices
- **Prompt Discovery** - MCP clients can now discover available prompts via `prompts/list`
- **Argument Support** - All prompts accept typed arguments for customization
- **Context Integration** - Prompts include project context, dashboard URLs, and tool recommendations

### Technical Changes
- Added `src/prompts/` module with prompt definitions and handlers
- Updated server capabilities to declare prompts support with `listChanged` flag
- Added `ListPromptsRequestSchema` and `GetPromptRequestSchema` handlers
- Each prompt generates contextual messages to guide AI assistants through workflows

## [0.0.24] - 2025-09-07

### Fixed
- Fixed get-approval-status tool to include comments in response data, enabling AI tools to access approval comments for better context understanding.

## [0.0.23] - 2025-08-27

### Improved
- Added correct tool definitions to the server capabilities.
- Refined spec-workflow-guide tool instructions condensing instructions by 50% whilst guarenteeing the same effectiveness.
- Added workflow mermaid flowcharts to the spec-workflow-guide tool to help agents visualize the workflow.
- Refined all the tool descriptions to remove ambiguity and make them more concise, additionally adding intrustions to each one to give the agent an idea of when to use the tool.

### Fixed
- Fixed Steering Doc workflow where the agent would attempt to provide all 3 documents in a single approval.
- Removed Steering guide from spec-workflow-guide tool and ensured steering-guide tool is called for steering document creation.
- Added direct support for steering documents in the request-approval tool as there wasnt direct support for it and the agents were just working around it.

### Misc
- Removed MCP resource definition as this was part of the initial developement workflow but was not required in the end.

## [0.0.22] - 2025-08-25

### Improved
- Dashboard browser tab now displays the actual project name (e.g., "spec-workflow-mcp Dashboard") instead of generic "Spec Dashboard (React)"
- Tab title dynamically updates based on the resolved project directory name for better identification when multiple dashboards are open

## [0.0.21] - 2025-08-25

### Fixed
- Fixed dashboard displaying "." as project name when using `--project-dir .` by resolving the path to show actual directory name

## [0.0.20] - 2025-08-22

### Added
- Added `--AutoStartDashboard` flag to automatically start and open dashboard when running MCP server
- Added `--port` parameter support for MCP server mode (previously only worked with `--dashboard` mode)
- Added comprehensive `--help` command with usage examples and parameter documentation
- Added validation for unknown command-line flags with helpful error messages

### Improved
- Enhanced shutdown behavior messaging for MCP server mode
- Removed duplicate console logging when using custom ports
- Updated README with AutoStartDashboard configuration examples for all MCP clients
- Clarified that MCP server lifecycle is controlled by the MCP client (not Ctrl+C)

### Fixed
- Fixed issue where browser would attempt to open twice with AutoStartDashboard
- Fixed duplicate "Using custom port" messages in console output

## [0.0.19] - 2025-08-21

### Fixed
- Fixed MCP server shutdown issues where server process would stay running after MCP client disconnects
- Added proper stdio transport onclose handler to detect client disconnection
- Added stdin monitoring for additional disconnect detection safety
- Enhanced stop() method with better error handling and cleanup sequence

## [0.0.18] - 2025-08-17

### Improvements
- Selected spec on tasks page is now persisted across page refreshes and now allows for deeplinking.

## [0.0.17] - 2025-08-17

### Bug Fixes
- Fixed a bug where request approval tool would fail when starting the MCP server without a projectdir. (wasnt really a bug as projectdir was recommended but I have made this more robust).

## [0.0.16] - 2025-08-15

### Bug Fixes
- Fixed a bug where the dashboard would not automatically update task status when the MCP tool was called and a refresh was required to view new status.

## [0.0.15] - 2025-08-15

### Improvements
- Moved to custom alert & prompt modals rather than window.alert and window.prompt. This should fix issues with dashboard showing prompts in VSCode Simple Browser
- Moved highlight color picker to the comment modal rather than having it in the comments list.

### New Features
- Added Notification Volume Slider.

## [0.0.14] - 2025-08-14

### Added
- Added a new 'refresh-tasks' tool to help align the task list with the current requirements and design. This is particularly useful if you make changes to the requirements / design docs mid integration.

### Misc
- Removed some legacy markdown files that were left over from initial development.

## [0.0.13] - 2025-08-13

### Added
- Added support for relative project paths and the use of tilde (~) in project paths. Below path formats are now supported:
    - npx -y @pimzino/spec-workflow-mcp ~/my-project
    - npx -y @pimzino/spec-workflow-mcp ./relative-path
    - npx -y @pimzino/spec-workflow-mcp /absolute/path

## [0.0.12] - 2025-08-11

### Fixed
- Fixed a bug with prose containers which would limit rendered content from fully displaying in the view modals.
- Fixed a bug with package version not showing in the header / mobile menu.

## [0.0.11] - 2025-08-11

### Fixed
- Page refresh on websocket updates. Pages will no longer reset on websocket updates.
- Dashboard accessibility improvements.

### Added
- Optimized dashboard for tablets.
- Users can now specify a custom port for the dashboard web server using the `--port` parameter. If not specified, an ephemeral port will be used.
- Added the ability to change task status directly from the task page in the dashboard.

## [0.0.10] - 2025-08-10

### Fixed
- Fixed bug with spec steering page not displaying correctly on smaller screens (mobile devices).

## [0.0.9] - 2025-08-10

### Fixed
- Clipboard API wasnt working in HTTP contexts over LAN. Added fallback method using `document.execCommand('copy')` for browsers without clipboard API access.

### Changed
- Updated copy prompt to only include task id and spec name.
- Improved copy button feedback with visual success/error states and colored indicators.
- Dashboard --> Updated viewport to 80% screen width in desktop and 90% on mobile devices.

### Added
- Spec document editor directly in the dashboard.
- Spec archiving and unarchiving in the dashboard.
- Steering document page for creating, viewing and editing steering documents directly from the dashboard.


## [0.0.8] - 2025-08-09

### Updated
- Rebuilt the web dashboard with a mobile first responsive design bringing you the following improvements:
    - Responsive Design
    - Improved UI / UX
    - Improved Performance
    - Disconnected from MCP server - must be started manually
    - Can now run multiple MCP server instances for the same project on a single dashboard instance


**NOTE: This is a breaking change. The dashboard will no longer auto start and must be manually run. Please review the README for updated instructions.**

## [0.0.7] - 2025-08-08

### Fixed
- Fixed a bug with the task parser / manage-tasks tool refusing to find tasks.

### Updated
- Improved the task parser and created a task parser utility function to be shared across tools and UI.

## [0.0.6] - 2025-08-08

### Updated
- Refined the spec workflow guide to remove any ambiguity, made it more concise.
- Refined manage-tasks tool description.
- Refined request-approval tool description and next steps output.
- Refined create-spec-doc tool next steps output.

### Added
- Imporoved dashboard task parser and task counter to support Parent/Child task relationships otherwise known as subtasks.
    - Parent tasks if only including a name will be parsed as a Task Section Heading in the dashboard.
    - The parser should now be more flexible to handle tasks in various formats as long as they still follow the same checklist, task name, and status format at the very least.

## [0.0.5] - 2025-08-07

### Updated
- Refined spec workflow to include conditional web search for the design phase to ensure the agent is providing the best possible for all phases.

### Fixed
- Improved task progress cards to display all task information in the card.

## [0.0.4] - 2025-08-07

### Fixed
- Fixed clipboard copying functionality in dashboard for HTTP contexts (non-HTTPS environments)
- Added fallback clipboard method using `document.execCommand('copy')` for browsers without clipboard API access
- Improved copy button feedback with visual success/error states and colored indicators
- Enhanced mobile device compatibility for clipboard operations
- Removed development obsolete bug tracking functionality from dashboard frontend

## [0.0.3] - 2025-08-07

### Updated
- Updated README.md with example natural language prompts that will trigger the various tools.
- task-template.md updated to remove atomic task requirements and format guidelines and moved them to the spec workflow guide tool.
- Refined instructions for the agent to output the dashboard URL to the user.
- Removed the Steering Document Compliance section from tasks-template.md for simplification.

### Added
- I have added a session.json in the .spec-workflow directory that stores the dashboard URL and the process ID of the dashboard server. This allows the agent to retrieve the dashboard URL as well as the user if required. Note: This should help users one headless systems where the dashboard us unable to auto load, you can retrieve the session information from the json file.

### Fixed
- Misc fixes cause HEAP out of memory issues on the server causing the server to crash when running more than one instance.

### Added

## [0.0.2] - 2025-08-07

### Updated
- Updated README.md with showcase videos on youtube.
- Removed testing mcp.json file that was left over from initial development.

## [0.0.1] - 2025-08-07

### Added
- MCP server implementation with 13 tools for spec-driven development
- Sequential workflow enforcement (Requirements → Design → Tasks)
- Real-time web dashboard with WebSocket updates
- Document creation and validation tools
- Human-in-the-loop approval system
- Template system for consistent documentation
- Context optimization tools for efficient AI workflows
- Task management and progress tracking
- Cross-platform support (Windows, macOS, Linux)
- Support for major AI development tools (Claude Desktop, Cursor, etc.)
- Automatic project structure generation
- Dark mode dashboard interface
- GitHub issue templates