# Interfaces Guide

This guide covers the two primary interfaces for Spec Workflow MCP: the Web Dashboard and the VSCode Extension.

## Overview

Spec Workflow MCP provides two interfaces:

1. **Web Dashboard** - Browser-based interface for CLI users
2. **VSCode Extension** - Integrated IDE experience for VSCode users

Both interfaces provide the same core functionality with platform-specific optimizations.

## Web Dashboard

### Overview

The web dashboard is a real-time web application that provides visual access to your specs, tasks, and approval workflows.

### Starting the Dashboard

#### Standalone Dashboard
```bash
# Uses ephemeral port
npx -y @pimzino/spec-workflow-mcp@latest /path/to/project --dashboard

# Custom port
npx -y @pimzino/spec-workflow-mcp@latest /path/to/project --dashboard --port 3000
```

#### With MCP Server
```bash
# Run MCP server and dashboard separately (recommended)
# Terminal 1: Start dashboard
npx -y @pimzino/spec-workflow-mcp@latest --dashboard

# Terminal 2: Start MCP server
npx -y @pimzino/spec-workflow-mcp@latest /path/to/project
```

### Dashboard Features

#### Main View

The dashboard home displays:

- **Project Overview**
  - Active specs count
  - Total tasks
  - Completion percentage
  - Recent activity

- **Spec Cards**
  - Spec name and status
  - Progress bar
  - Document indicators
  - Quick actions

#### Spec Details View

Clicking on a spec shows:

- **Document Tabs**
  - Requirements
  - Design
  - Tasks

- **Document Content**
  - Rendered markdown
  - Syntax highlighting
  - Table of contents

- **Approval Actions**
  - Approve button
  - Request changes
  - Rejection option
  - Comment field

#### Task Management

The tasks view provides:

- **Hierarchical Task List**
  - Numbered tasks (1.0, 1.1, 1.1.1)
  - Status indicators
  - Progress tracking

- **Task Actions**
  - Copy prompt button
  - Mark complete
  - Add notes
  - View dependencies

- **Progress Visualization**
  - Overall progress bar
  - Section progress
  - Time estimates

#### Steering Documents

Access project guidance:

- **Product Steering**
  - Vision and goals
  - User personas
  - Success metrics

- **Technical Steering**
  - Architecture decisions
  - Technology choices
  - Performance goals

- **Structure Steering**
  - File organization
  - Naming conventions
  - Module boundaries

### Dashboard Navigation

#### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Alt + S` | Focus spec list |
| `Alt + T` | View tasks |
| `Alt + R` | View requirements |
| `Alt + D` | View design |
| `Alt + A` | Open approval dialog |
| `Esc` | Close dialog |

#### URL Structure

Direct links to specific views:
- `/` - Home dashboard
- `/spec/{name}` - Specific spec
- `/spec/{name}/requirements` - Requirements doc
- `/spec/{name}/design` - Design doc
- `/spec/{name}/tasks` - Task list
- `/steering/{type}` - Steering documents

### Real-Time Updates

The dashboard uses WebSockets for live updates:

- **Automatic Refresh**
  - New specs appear instantly
  - Task status updates
  - Progress changes
  - Approval notifications

- **Connection Status**
  - Green: Connected
  - Yellow: Reconnecting
  - Red: Disconnected

- **Notification System**
  - Approval requests
  - Task completions
  - Error alerts
  - Success messages

### Dashboard Customization

#### Theme Settings

Toggle between light and dark modes:
- Click theme icon in header
- Persists across sessions
- Respects system preference

#### Language Selection

Change interface language:
1. Click settings icon
2. Select language from dropdown
3. Interface updates immediately

Supported languages:
- English (en)
- Japanese (ja)
- Chinese (zh)
- Spanish (es)
- Portuguese (pt)
- German (de)
- French (fr)
- Russian (ru)
- Italian (it)
- Korean (ko)
- Arabic (ar)

#### Display Options

Customize view preferences:
- Compact/expanded spec cards
- Show/hide completed tasks
- Document font size
- Code syntax theme

## VSCode Extension

### Installation

Install from VSCode Marketplace:

1. Open VSCode Extensions (Ctrl+Shift+X)
2. Search "Spec Workflow MCP"
3. Click Install
4. Reload VSCode

Or via command line:
```bash
code --install-extension Pimzino.spec-workflow-mcp
```

### Extension Features

#### Sidebar Panel

Access via Activity Bar icon:

- **Spec Explorer**
  - Tree view of all specs
  - Expand to see documents
  - Status indicators
  - Context menu actions

- **Task List**
  - Filterable task view
  - Progress tracking
  - Quick actions
  - Search functionality

- **Archive View**
  - Completed specs
  - Historical data
  - Restore option
  - Bulk operations

#### Document Viewer

Open documents in editor:

- **Syntax Highlighting**
  - Markdown rendering
  - Code blocks
  - Task checkboxes
  - Links and references

- **Document Actions**
  - Edit in place
  - Preview mode
  - Split view
  - Export options

#### Integrated Approvals

Native VSCode dialogs for:

- **Approval Requests**
  - Pop-up notifications
  - Inline comments
  - Quick approve/reject
  - Detailed feedback

- **Revision Workflow**
  - Track changes
  - Comment threads
  - Version comparison
  - Approval history

#### Context Menu Actions

Right-click actions in editor:

- **On Spec Files**
  - Approve document
  - Request changes
  - View in dashboard
  - Copy spec path

- **On Task Items**
  - Mark complete
  - Copy prompt
  - Add subtask
  - View details

### Extension Settings

Configure in VSCode settings:

```json
{
  "specWorkflow.language": "en",
  "specWorkflow.notifications.enabled": true,
  "specWorkflow.notifications.sound": true,
  "specWorkflow.notifications.volume": 0.5,
  "specWorkflow.archive.showInExplorer": true,
  "specWorkflow.tasks.autoRefresh": true,
  "specWorkflow.tasks.refreshInterval": 5000,
  "specWorkflow.theme.followVSCode": true
}
```

#### Setting Descriptions

| Setting | Description | Default |
|---------|-------------|---------|
| `language` | Interface language | "en" |
| `notifications.enabled` | Show notifications | true |
| `notifications.sound` | Play sound alerts | true |
| `notifications.volume` | Sound volume (0-1) | 0.5 |
| `archive.showInExplorer` | Show archived specs | true |
| `tasks.autoRefresh` | Auto-refresh tasks | true |
| `tasks.refreshInterval` | Refresh interval (ms) | 5000 |
| `theme.followVSCode` | Match VSCode theme | true |

### Extension Commands

Available in Command Palette (Ctrl+Shift+P):

| Command | Description |
|---------|-------------|
| `Spec Workflow: Create Spec` | Start new spec |
| `Spec Workflow: List Specs` | Show all specs |
| `Spec Workflow: View Dashboard` | Open web dashboard |
| `Spec Workflow: Archive Spec` | Move to archive |
| `Spec Workflow: Restore Spec` | Restore from archive |
| `Spec Workflow: Refresh` | Reload spec data |
| `Spec Workflow: Show Steering` | View steering docs |
| `Spec Workflow: Export Spec` | Export to markdown |

### Sound Notifications

The extension includes audio alerts for:

- **Approval Requests** - Gentle chime
- **Task Completion** - Success sound
- **Errors** - Alert tone
- **Updates** - Soft notification

Configure in settings:
```json
{
  "specWorkflow.notifications.sound": true,
  "specWorkflow.notifications.volume": 0.3
}
```

## Feature Comparison

| Feature | Web Dashboard | VSCode Extension |
|---------|--------------|------------------|
| View specs | ✅ | ✅ |
| Manage tasks | ✅ | ✅ |
| Approvals | ✅ | ✅ |
| Real-time updates | ✅ | ✅ |
| Archive system | ❌ | ✅ |
| Sound notifications | ❌ | ✅ |
| Editor integration | ❌ | ✅ |
| Context menus | ❌ | ✅ |
| Keyboard shortcuts | Limited | Full |
| Multi-project | Manual | Automatic |
| Offline access | ❌ | ✅ |
| Export options | Basic | Advanced |

## Choosing the Right Interface

### Use Web Dashboard When:

- Using CLI-based AI tools
- Working across multiple IDEs
- Need browser-based access
- Sharing with team members
- Quick project overview needed

### Use VSCode Extension When:

- Primary IDE is VSCode
- Want integrated experience
- Need editor features
- Prefer native dialogs
- Want sound notifications

## Interface Synchronization

Both interfaces share the same data:

- **Real-Time Sync**
  - Changes in one reflect in other
  - Shared approval state
  - Consistent task status
  - Unified progress tracking

- **Data Storage**
  - Single source of truth
  - File-based storage
  - No synchronization needed
  - Instant updates

## Mobile and Tablet Access

### Web Dashboard on Mobile

The dashboard is responsive:

- **Phone View**
  - Stacked spec cards
  - Collapsible navigation
  - Touch-optimized buttons
  - Swipe gestures

- **Tablet View**
  - Side-by-side layout
  - Touch interactions
  - Optimized spacing
  - Landscape support

### Limitations on Mobile

- No VSCode extension
- Limited keyboard shortcuts
- Reduced multi-tasking
- Simplified interactions

## Accessibility Features

### Web Dashboard

- **Keyboard Navigation**
  - Tab through elements
  - Enter to activate
  - Escape to cancel
  - Arrow keys for lists

- **Screen Reader Support**
  - ARIA labels
  - Role attributes
  - Status announcements
  - Focus management

- **Visual Accessibility**
  - High contrast mode
  - Adjustable font size
  - Color blind friendly
  - Focus indicators

### VSCode Extension

Inherits VSCode accessibility:
- Screen reader support
- Keyboard navigation
- High contrast themes
- Zoom functionality

## Performance Optimization

### Dashboard Performance

- **Lazy Loading**
  - Documents load on demand
  - Pagination for long lists
  - Progressive rendering
  - Image optimization

- **Caching Strategy**
  - Browser caching
  - Service worker
  - Offline support (limited)
  - Quick navigation

### Extension Performance

- **Resource Management**
  - Minimal memory usage
  - Efficient file watching
  - Debounced updates
  - Background processing

## Troubleshooting Interface Issues

### Dashboard Issues

| Issue | Solution |
|-------|----------|
| Won't load | Check server is running, verify URL |
| No updates | Check WebSocket connection, refresh page |
| Approval not working | Ensure dashboard and MCP are connected |
| Styling broken | Clear browser cache, check console |

### Extension Issues

| Issue | Solution |
|-------|----------|
| Not showing specs | Check project has .spec-workflow directory |
| Commands not working | Reload VSCode window |
| No notifications | Check extension settings |
| Archive not visible | Enable in settings |

## Advanced Usage

### Custom Dashboard URL

Configure in multiple terminals:
```bash
# Terminal 1: MCP Server
npx -y @pimzino/spec-workflow-mcp@latest /project

# Terminal 2: Dashboard
npx -y @pimzino/spec-workflow-mcp@latest /project --dashboard --port 3000
```

### Extension Multi-Root Workspaces

The extension supports VSCode multi-root workspaces:

1. Add multiple project folders
2. Each shows separate specs
3. Switch between projects
4. Independent configurations

## Related Documentation

- [Configuration Guide](CONFIGURATION.md) - Setup and configuration
- [User Guide](USER-GUIDE.md) - Using the interfaces
- [Workflow Process](WORKFLOW.md) - Development workflow
- [Troubleshooting](TROUBLESHOOTING.md) - Common issues