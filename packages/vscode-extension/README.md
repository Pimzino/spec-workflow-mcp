# Spec Workflow MCP Extension

A VSCode extension that provides an integrated dashboard for managing Spec-Workflow MCP projects directly in your workspace.

## Features

- **Integrated Sidebar Dashboard**: Access all your spec workflow data without leaving VSCode
- **Real-time Updates**: File system watchers automatically update the dashboard when .spec-workflow files change
- **Project Overview**: Comprehensive statistics showing active vs archived specs, tasks, and approvals
- **Spec Management**: Browse active and archived specifications with easy archiving/unarchiving
- **Task Management**: View and update task statuses directly from the sidebar
- **Approval Workflow**: Complete approval process with approve, reject, and revision requests
- **Steering Documents**: Manage product, tech, and structure steering documents
- **Sound Notifications**: Configurable audio alerts for approvals and task completions
- **Editor Integration**: Context menu actions for approvals and comments directly in code
- **React + Tailwind UI**: Modern, responsive interface built with React 19 and Tailwind CSS v4

## Requirements

- VSCode 1.99.0 or higher
- A workspace containing a `.spec-workflow` directory structure

## Usage

1. Open a workspace that contains a `.spec-workflow` directory
2. The Spec Workflow MCP icon will appear in the Activity Bar
3. Click the icon to open the dashboard sidebar
4. Use the tabbed interface to navigate between:
   - **Overview**: Project statistics showing active/archived specs breakdown and recent activity
   - **Steering**: Manage steering documents (product, tech, structure)
   - **Specs**: Browse active and archived specifications with archive management
   - **Tasks**: View and manage task progress for selected specifications
   - **Approvals**: Handle pending approval requests with full workflow support

## Archive Management

Specifications can be archived to keep dropdown menus clean and organized:
- Switch between **Active** and **Archived** views in the Specs tab
- Archive completed specifications to remove them from active dropdowns
- Unarchive specifications when needed
- Archive operations are blocked if pending approvals exist for the specification

## Commands

- `Spec Workflow: Open Dashboard` - Opens the sidebar dashboard
- `Spec Workflow: Refresh Data` - Manually refresh all data
- `Spec Workflow: Open Spec` - Quick pick to open specific specifications
- `Spec Workflow: Approve` - Approve current document (editor context)
- `Spec Workflow: Reject` - Reject current document (editor context)
- `Spec Workflow: Request Revision` - Request revision for current document
- `Spec Workflow: Add Comment` - Add comment to selected text
- `Spec Workflow: Approval Actions` - Show approval action menu

## Extension Settings

- `specWorkflow.notifications.sounds.enabled` - Enable sound notifications (default: true)
- `specWorkflow.notifications.sounds.volume` - Sound volume level 0.0-1.0 (default: 0.3)
- `specWorkflow.notifications.sounds.approvalSound` - Play sound for approval requests (default: true)
- `specWorkflow.notifications.sounds.taskCompletionSound` - Play sound for task completions (default: true)

## Development

This extension is built with:
- React 19 with TypeScript
- Vite for webview bundling
- Tailwind CSS v4 for styling
- ShadCN UI components
- VSCode Extension API

## Release Notes

### 0.0.1

Initial release of Spec Workflow MCP Extension:
- **Dashboard Integration**: Complete sidebar dashboard with real-time updates
- **Specification Management**: Active/archived spec organization with archive workflow
- **Task Tracking**: Interactive task management with status updates
- **Approval System**: Full approval workflow with approve/reject/revision capabilities
- **Steering Documents**: Product, tech, and structure document management
- **Sound Notifications**: Configurable audio alerts for key events
- **Editor Integration**: Context menu actions and comment system
- **Modern UI**: React 19 + Tailwind CSS v4 with responsive design

## Support

If you find this extension helpful, consider supporting the development:

[☕ Buy Me a Coffee](https://buymeacoffee.com/pimzino)

## License

This project is licensed under the GPL-3.0 License.