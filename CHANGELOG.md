# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.7] - 2025-11-10

### BREAKING CHANGES
- **Removed `get-implementation-logs` tool** - This tool is no longer available. AI agents should use native tools (grep/ripgrep) and Read to search implementation logs instead.

### Fixed
- **Volume Control Regression** (PR #141) - Fixed critical volume control regression from NotificationProvider context split through 6 progressive commits:
  1. Fixed volume icon always showing as muted by updating VolumeControl component to use both `useNotifications()` (actions) and `useNotificationState()` (state)
  2. Fixed stale closure bug where `handleTaskUpdate` callback had stale reference to `playNotificationSound`, and changed volume/sound settings storage from sessionStorage to localStorage for persistence
  3. Made audio fade-out proportional to volume level instead of fixed value
  4. Fixed Web Audio API gain timing issues with direct value assignment and linear ramping
  5. **Replaced Web Audio API with Howler.js** - After 4 failed attempts to fix volume control with raw Web Audio API, switched to industry-standard Howler.js library (546k weekly downloads, MDN-recommended) for reliable, simple audio playback with real MP3 files
  6. **Fixed sound not playing at all** - Integrated `playNotificationSound()` into `showNotification()` function so all notifications (task completion, status changes, approvals) automatically play sound at user-configured volume level
- **Dashboard Task Status Refresh** (PR #140) - Fixed critical "page reload" issue when updating task status:
  - Removed redundant `reloadAll()` call causing unnecessary full page refreshes
  - **Split ApiProvider context** into ApiDataContext (data) and ApiActionsContext (stable functions) to prevent unnecessary re-renders when data updates
  - Added deep equality checks in websocket handlers before updating state
  - Improved task list comparison from index-based to Map-based for robustness
  - Result: Task status updates are now smooth and instant without scroll position loss or page disruption
- **Docker Implementation** (PR #135) - Fixed Docker build failure and updated configuration:
  - Removed invalid `COPY --from=builder /app/src/locales` command (locales are bundled in dashboard build)
  - Updated Dockerfile to build from local source instead of git clone
  - Fixed docker-compose.yml build context and port mappings (3000 → 5000)
  - Added comprehensive documentation in `containers/README.md` and `containers/DOCKER_USAGE.md`
  - Added `.dockerignore`, `containers/.env.example`, and updated `containers/example.mcp.json`

### Changed
- **Implementation Logs Format Migration** (PRs #136, #137, #138) - Logs are now stored as individual markdown files instead of a single JSON file for improved scalability and direct agent accessibility.
  - Old format: `.spec-workflow/specs/{spec-name}/implementation-log.json`
  - New format: `.spec-workflow/specs/{spec-name}/Implementation Logs/*.md`
- Implementation logs are automatically migrated from JSON to markdown format on server startup.
- Updated all documentation and prompts to guide agents to use grep/ripgrep commands to search implementation logs.
- Updated VSCode extension file watcher to monitor markdown files in Implementation Logs directories.
- Updated dashboard and multi-server API endpoints to work with the new markdown format.
- Added validation for taskId and idValue in markdown log parser to match VSCode extension behavior.

### Added
- **Automatic Migration System** - New `ImplementationLogMigrator` utility class handles automatic conversion of existing JSON logs to markdown format.
- **Migration Logging** - Migration process is logged to `~/.spec-workflow-mcp/migration.log` for debugging and transparency.
- **Howler.js Audio Library** - Added howler@2.2.4 dependency for reliable, cross-browser notification sounds with proper volume control.

### Improved
- **Agent Discovery** - AI agents can now directly grep implementation logs without special tool calls, making discovery faster and more intuitive.
- **Log Readability** - Markdown format is more human-readable and can be directly edited if needed.
- **Scalability** - Individual markdown files prevent performance degradation when dealing with thousands of implementation logs.
- **Dashboard Performance** - Context splitting and deep equality checks prevent unnecessary re-renders, making the dashboard significantly more responsive.
- **Audio Quality** - Notification sounds now use real MP3 files (via Howler.js) instead of synthetic oscillator beeps for better user experience.

## [2.0.6] - 2025-11-08

### Changed
- Removed creation of `config.example.toml` file during workspace initialization as it is no longer needed or used.

## [2.0.5] - 2025-11-08

### Fixed
- Fixed tools not respecting the project directory specified at server startup. Tools now use the server context's `projectPath` by default instead of requiring it as a mandatory argument.
- AI agents no longer need to pass `projectPath` to tools, preventing files from being created in the wrong directory (e.g., current working directory instead of the configured project directory).
- Updated `spec-status`, `get-implementation-logs`, `log-implementation`, and `approvals` tools to use context fallback pattern.
- Made `projectPath` optional in all tool input schemas while maintaining backward compatibility for explicit overrides.

## [2.0.4] - 2025-11-08

### Fixed
- Fixed dashboard startup failure with "Unexpected end of JSON input" error on macOS/Linux when configuration files were empty or corrupted.
- Added proper JSON parsing error handling to catch `SyntaxError` in addition to `ENOENT` errors.
- Implemented automatic initialization of JSON files with valid default content on first use.
- Added automatic backup of corrupted configuration files before overwriting.
- Improved error logging to identify which file is causing parse errors and where backups are stored.

## [2.0.3]

### Changed
- Updated all MCP tool responses to respond in TOON format instead of JSON for token savings and effeciency. (More Info: https://github.com/toon-format/toon)

## [2.0.2] - 2025-11-06

### Changed
- Improved the get-implementation-logs tool description and instructions to help agents understand how to use the tool.
- Removed deprecated --AutoStartDashboard flag
- Removed config.toml support as it is no longer needed.
- Removed some legacy code related to the single project dashboard implementation. (not required anymore)
- Removed Ephemeral port support as it is no longer needed. Dashboard starts on port 5000 by default if a --port is not specified.

## [2.0.1] - 2025-11-06

### Fixed
- Fixed a Critical bug where approval records were not being saved correctly on approval and blocking the full process.
- Fixed a bug with dropdowns in the dashboard causing unecassary horizontal scrollbars.
- Fixed a bug where diff viewer for approvals was not working.

## [2.0.0] - 2025-11-03

### Added
- Added NEW Unified Multi-Project Dashboard Implementation!
- 'ESC' key now closes all dialogs and modals in the dashboard.
- Implementation Log functionality added to the dashboard for each spec, AI Agents will now log detailed information about the implementation of each task. This information is then used by future AI agents to discover existing code and avoid duplication / mistakes when implementing new tasks especially when each task is dependant on the previous task.

### Changed
- Re-designed the dashboard to be more user friendly and intuitive.
  - Added a new sidebar menu for the dashboard instead of header navigation.


### Announcement
- Deprecated the `--AutoStartDashboard` flag as it is no longer needed.

## [1.0.1] - 2025-09-24

### Changed
- Removed references to a headless mode that would confuse confusion for the agent in rare instances where the user would only start the dashboard after beginning the spec workflow.
- Some UI / UX improvements to the dashboard.

### Fixed
- Fixed a bug where users couldnt start multiple instances of the Dashboard within the same project.
- Some UI / UX fixes to the dashboard, mainly around locale and missing translations.

### Added
- Added NEW Diff Viewer to the dashboard for approvals!
- Added NEW Kanban View to the dashboard for tasks!

## [1.0.0] - 2025-09-13

**NOTE: This version brings major architectural changes to the project. However they are non breaking changes.**

### Changes
- Replaced various filesystem binded tools with elaborate instructions and changes to the workflow to allow AI agents to create documents and manage the project without the need for filesystem tools.
  **Its worth noting this change should improve the accuracy of AI agents following the workflow. Its important to also note this has only been tested with Claude Sonnet 4, Claude Opus 4.1 and GPT 5**
- I have added the ability to use custom spec / steering document templates which is aimed at allowing users to customize the documents to their own needs. This is aimed at Power Users but everyone is welcome to use it.
- Added dynamic year to the spec-workflow-guide tool to ensure the agent is using the current year for web search for more up to date information.

**There are no plans to revert back to the previous architecture. We have made this decision to improve the accuracy of AI agents following the workflow as well as improve the maintainability of the project. If you wish to use the old architecture, you can still do so by running an older version of the MCP server however please note that in the event of a change to the MCP working directory structure, the dashboard or VSCode extension will not work as expected.**


## [0.0.33] - 2025-09-10

### Added
- **TOML Configuration File Support** - The MCP server now supports configuration via TOML files
  - Default config location: `<project-dir>/.spec-workflow/config.toml`
  - All command-line parameters can now be configured in the TOML file
  - Supports `projectDir`, `port`, `autoStartDashboard`, `dashboardOnly`, and `lang` settings
  - Example configuration file provided at `.spec-workflow/config.example.toml`
  - Tilde (`~`) expansion for home directory paths in config files

- **Custom Config File Path** - New `--config` CLI flag for specifying custom config file locations
  - Supports both `--config path` and `--config=path` formats
  - Works with both relative and absolute paths
  - Useful for maintaining different configs for different environments (dev, staging, production)
  - Custom config files must exist or server will exit with error

  NOTE: For more information on the configuration file, please refer to the [README.md](README.md) file.

## [0.0.32] - 2025-09-10

### Fixed
- Removed localizations for MCP server tools as I have reason to believe they were causing confusion and issues with agents understanding the tools and their purposes as well as responses.
- Improved get-template-context tool description to include a note about the template structure must be adhered to at all times and the next step to use the template for the specific document.

## [0.0.31] - 2025-09-09

### Fixed
- Fixed "ReferenceError: t is not defined" errors in multiple components:
  - `SearchableSpecDropdown` in TasksPage (Task management dropdown)
  - `CommentModal` in VSCode extension (Comment editing interface)
  - `comment-modal.tsx` wrapper (Modal context provider)
  - `VolumeControl` in Dashboard (Notification volume controls)
  - `AlertModal` in Dashboard (Alert dialog component)
- Added missing translation keys across all 11 supported languages for:
  - Comment modal UI elements (`commentModal.*` keys)
  - Volume control tooltips (`volumeControl.*` keys)
  - Common modal buttons (`common.ok` key)
- Enhanced i18n documentation with comprehensive troubleshooting guide
- Improved error prevention with component template and validation steps

## [0.0.30] - 2025-09-09

### Fixed
- Fixed a bug where some translations were not being loaded correctly (Specifically for Approval / Annotations).
- Fixed a bug where some languages didnt have the correct translation keys.

## [0.0.29] - 2025-09-08

### Improved
- Improved localization support for all components.

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

### Enhanced
- **i18n Infrastructure** - Updated validation and build processes to support 11 total languages
  - Enhanced validation script to check all supported languages for consistency
  - Updated all i18n configurations to register new language resources
  - Added comprehensive i18n structure documentation explaining the three translation contexts

### Technical Changes
- Updated SUPPORTED_LANGUAGES arrays across all three components
- Added flag emoji representations for improved language selection UX
- Maintained backward compatibility with existing English, Japanese, and Chinese translations
- All Mustache template variables validated for consistency across all 11 languages

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

### Added
- **Initial Multi-Language Framework** - Established foundational support for internationalization
  - Set up i18n infrastructure to support future language translations
  - Implemented framework for dynamic language switching across components
  - Laid groundwork for comprehensive multi-language support later expanded in v0.0.26-0.0.29

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