# Testing Batch Approval Feature

This guide explains how to test the batch approval management feature for PR #181.

## Screenshots

### Selection Mode

![Selection Mode](docs/screenshots/01-selection-mode.png)

### Items Selected with Vertical Action Buttons

![Items Selected](docs/screenshots/02-items-selected.png)

### Select All

![Select All](docs/screenshots/03-select-all.png)

### Batch Reject Modal

![Batch Reject Modal](docs/screenshots/04-batch-reject-modal.png)

### Undo Toast (After Approve)

![Undo Toast Approve](docs/screenshots/04-undo-toast-approve.png)

### Undo Toast (After Reject)

![Undo Toast Reject](docs/screenshots/05-undo-toast-reject.png)

### After Undo - Items Restored

![Undo Success](docs/screenshots/06-undo-success.png)

## Prerequisites

- Node.js installed
- VS Code installed (for extension testing)
- Project dependencies installed (`npm install`)

## Quick Start

### 1. Generate Test Data

Run the test data generation script:

```bash
# Generate 7 test approvals (default)
npm run test:generate-approvals

# Generate a custom number of approvals
node scripts/generate-test-approvals.js 10

# Clean and regenerate
npm run test:generate-approvals -- --clean
node scripts/generate-test-approvals.js 10 --clean
```

This will create test approval files in `.spec-workflow/approvals/spec/` and corresponding documents in `.spec-workflow/docs/`.

### 2. Testing in Web Dashboard

**Start the dashboard:**
```bash
npm run dev:dashboard
```

**Test the feature:**
1. Open http://localhost:5173/ in your browser
2. Navigate to **Approvals** page
3. You should see the generated test approvals

### 3. Testing in VS Code Extension

**Option A: Launch Extension Development Host**

1. Open the `vscode-extension` folder in VS Code:
   ```bash
   cd vscode-extension
   code .
   ```

2. Press **F5** (or Run > Start Debugging)

3. In the new **Extension Development Host** window:
   - Open the project root folder: `/Applications/Development/Projects/spec-workflow-mcp`
   - Open the Spec Workflow sidebar (click icon in Activity Bar)
   - Navigate to Approvals section

**Option B: Test with installed extension**

If you have the extension installed from marketplace:
1. Open this project folder in VS Code
2. Open Spec Workflow sidebar
3. Navigate to Approvals

**Important:** The extension needs to be opened with a workspace that contains the `.spec-workflow` directory with the test approvals.

## Test Scenarios

### ✅ Enter Selection Mode
- [x] Click the "Select" or batch selection button
- [x] Verify checkboxes appear next to each approval item
- [x] Verify "Select All" checkbox appears in toolbar
- [x] Verify batch action buttons appear

### ✅ Select Multiple Items
- [x] Click individual checkboxes to select 2-3 items
- [x] Verify selection count updates ("3 selected")
- [x] Verify batch action buttons are enabled
- [x] Verify individual action buttons are disabled when >1 item selected

### ✅ Select All Functionality
- [x] Click "Select All" checkbox
- [x] Verify all items are selected
- [x] Click again to deselect all
- [x] Partially select items and verify indeterminate state

### ✅ Batch Approve (≤5 items)
- [x] Select 3-5 approval items
- [x] Click "Approve Selected" button
- [x] Verify NO confirmation modal appears
- [x] Verify items are approved immediately
- [x] Verify success notification appears
- [x] Verify selection mode exits automatically

### ✅ Batch Approve (>5 items)
- [x] Select 6 or more approval items
- [x] Click "Approve Selected" button
- [x] Verify confirmation modal appears with item count
- [x] Click "Confirm" button
- [x] Verify items are approved after confirmation
- [x] Verify success notification

### ✅ Batch Reject
- [x] Select 2-3 approval items
- [x] Click "Reject All (X)" button (VS Code) or "Reject Selected" (Dashboard)
- [x] Verify feedback modal ALWAYS appears (regardless of count)
- [x] Verify modal shows item count in title ("Reject 2 Items")
- [x] Enter rejection reason/feedback in textarea
- [x] Verify "Reject All" button is disabled until feedback is entered
- [x] Submit and verify items are rejected
- [x] Verify success notification

### ✅ Batch Request Revision
- [x] Select 2-3 approval items
- [x] Click "Revise All (X)" button
- [x] Verify items are marked for revision
- [x] Verify success notification appears
- [x] Verify selection mode exits automatically

### ✅ Undo Operation (Batch Approve)

- [x] Select 2-3 pending approval items
- [x] Click "Approve All (X)" button
- [x] Verify undo toast appears at bottom of sidebar
- [x] Verify toast shows message: "Approved X items"
- [x] Verify progress bar animation (depleting over 30 seconds)
- [x] Verify checkmark icon appears in toast (green)
- [x] Click "Undo" button
- [x] Verify items return to pending status
- [x] Verify toast disappears immediately after undo
- [x] Verify success notification: "Undone X requests"

### ✅ Undo Operation (Batch Reject)

- [x] Select 2-3 pending approval items
- [x] Click "Reject All (X)" button
- [x] Enter rejection reason and confirm
- [x] Verify undo toast appears
- [x] Verify toast shows message: "Rejected X items"
- [x] Click "Undo" button within 30 seconds
- [x] Verify items return to pending status
- [x] Verify rejection reason is cleared from items

### ✅ Undo Operation (Batch Revision)

- [x] Select 2-3 pending approval items
- [x] Click "Revise All (X)" button
- [x] Verify undo toast appears
- [x] Verify toast shows: "Requested revision for X items"
- [x] Click "Undo" button
- [x] Verify items return to pending status

### ✅ Undo Toast UI

- [x] Verify toast appears above scroll-to-top FAB (not overlapping)
- [x] Verify dismiss button (X) closes toast without undo
- [x] Verify toast auto-dismisses after 30 seconds
- [x] Verify toast width fits within narrow sidebar
- [x] Verify undo button is clearly clickable (has border/styling)

### ✅ Undo Window Expiry

- [x] Perform a batch approve operation
- [x] Wait 30 seconds without clicking undo
- [x] Verify toast automatically disappears
- [x] Verify undo is no longer possible after dismissal

### ✅ Error Handling
- [x] Verify error notifications use string-based format (not object)
- [x] Check browser console for any errors during operations
- [x] Verify graceful handling of failed operations

### ✅ i18n Processing Text
- [x] During any batch operation loading state
- [x] Verify "Processing..." text is translated (not hardcoded English)
- [x] Test in different languages if possible

### ✅ Exit Selection Mode
- [x] Enter selection mode and select some items
- [x] Click "Cancel" or "Exit Selection Mode" button
- [x] Verify checkboxes disappear
- [x] Verify selections are cleared
- [x] Verify batch action toolbar disappears

### ✅ VS Code Extension: Vertical Button Layout
- [x] Enter selection mode in VS Code extension sidebar
- [x] Verify batch action buttons stack vertically (not horizontally)
- [x] Verify all button text is fully visible at any sidebar width
- [x] Verify buttons show count in label: "Approve All (2)", "Revise All (2)", "Reject All (2)"
- [x] Verify "Reject All" uses Trash icon (not X icon)
- [x] Verify "Clear" link appears next to selection count
- [x] Click "Clear" and verify all items are deselected

### ✅ VS Code Extension: No False "New Approval" Notifications

- [x] Perform any batch operation (approve, reject, or revise)
- [x] Verify NO "New approval request" notification appears in VS Code
- [x] Only genuinely NEW approvals should trigger notifications
- [x] Status changes (pending → approved/rejected) should NOT trigger notifications

## Expected Behavior

### Batch Approve Threshold

- **≤5 items:** Immediate approval without confirmation
- **>5 items:** Confirmation modal required before approval

### Batch Reject

- **Always requires feedback modal** regardless of item count
- User must provide a reason for batch rejection
- Submit button disabled until feedback text is entered

### Batch Request Revision

- Immediate processing without confirmation modal
- Items marked for revision with default feedback message

### Undo Window

- 30-second window to undo batch operations
- Toast notification with "Undo" button
- After timeout or undo, toast disappears

### Individual Actions

- Individual approve/reject buttons should be **disabled** when multiple items are selected
- Tooltip should indicate "Use batch actions" when disabled

### VS Code Extension Button Layout

- Buttons stack **vertically** in sticky footer for reliable display at any width
- Each button shows selection count: "Approve All (2)"
- "Reject All" uses **Trash icon** (not X) for clarity
- "Clear" link allows quick deselection without exiting selection mode

## Cleaning Up Test Data

To remove test approvals and start fresh:

```bash
# Clean and regenerate
node scripts/generate-test-approvals.js --clean

# Or manually delete
rm -rf .spec-workflow/approvals/spec/test-approval-*
rm -rf .spec-workflow/docs/*.md
```

## Troubleshooting

### Approvals not showing in VS Code extension

1. Make sure you opened the correct workspace folder
2. Check that `.spec-workflow/approvals/spec/` contains JSON files
3. Reload the Extension Development Host window (Cmd+R / Ctrl+R)
4. Check VS Code Developer Tools console for errors

### Approvals not showing in web dashboard

1. Verify dashboard is running (`npm run dev:dashboard`)
2. Check browser console for errors
3. Verify `.spec-workflow/approvals/spec/` directory exists and contains files
4. Refresh the browser page

### File watcher not picking up changes

1. Restart the development server
2. Check file permissions on `.spec-workflow/` directory
3. Try manually creating an approval and check if it appears

## Reporting Issues

When reporting issues, please include:

- Environment (web dashboard vs VS Code extension)
- Steps to reproduce
- Expected vs actual behavior
- Browser/VS Code version
- Console errors (if any)
- Screenshots (if applicable)
