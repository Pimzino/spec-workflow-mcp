# Testing Batch Approval Feature

This guide explains how to test the batch approval management feature for PR #181.

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
- [ ] Click the "Select" or batch selection button
- [ ] Verify checkboxes appear next to each approval item
- [ ] Verify "Select All" checkbox appears in toolbar
- [ ] Verify batch action buttons appear

### ✅ Select Multiple Items
- [ ] Click individual checkboxes to select 2-3 items
- [ ] Verify selection count updates ("3 selected")
- [ ] Verify batch action buttons are enabled
- [ ] Verify individual action buttons are disabled when >1 item selected

### ✅ Select All Functionality
- [ ] Click "Select All" checkbox
- [ ] Verify all items are selected
- [ ] Click again to deselect all
- [ ] Partially select items and verify indeterminate state

### ✅ Batch Approve (≤5 items)
- [ ] Select 3-5 approval items
- [ ] Click "Approve Selected" button
- [ ] Verify NO confirmation modal appears
- [ ] Verify items are approved immediately
- [ ] Verify success notification appears
- [ ] Verify selection mode exits automatically

### ✅ Batch Approve (>5 items)
- [ ] Select 6 or more approval items
- [ ] Click "Approve Selected" button
- [ ] Verify confirmation modal appears with item count
- [ ] Click "Confirm" button
- [ ] Verify items are approved after confirmation
- [ ] Verify success notification

### ✅ Batch Reject
- [ ] Select 2-3 approval items
- [ ] Click "Reject All (X)" button (VS Code) or "Reject Selected" (Dashboard)
- [ ] Verify feedback modal ALWAYS appears (regardless of count)
- [ ] Verify modal shows item count in title ("Reject 2 Items")
- [ ] Enter rejection reason/feedback in textarea
- [ ] Verify "Reject All" button is disabled until feedback is entered
- [ ] Submit and verify items are rejected
- [ ] Verify success notification

### ✅ Batch Request Revision
- [ ] Select 2-3 approval items
- [ ] Click "Revise All (X)" button
- [ ] Verify items are marked for revision
- [ ] Verify success notification appears
- [ ] Verify selection mode exits automatically

### ✅ Undo Operation (Batch Approve)

- [ ] Select 2-3 pending approval items
- [ ] Click "Approve All (X)" button
- [ ] Verify undo toast appears at bottom of sidebar
- [ ] Verify toast shows message: "Approved X items"
- [ ] Verify progress bar animation (depleting over 30 seconds)
- [ ] Verify checkmark icon appears in toast (green)
- [ ] Click "Undo" button
- [ ] Verify items return to pending status
- [ ] Verify toast disappears immediately after undo
- [ ] Verify success notification: "Undone X requests"

### ✅ Undo Operation (Batch Reject)

- [ ] Select 2-3 pending approval items
- [ ] Click "Reject All (X)" button
- [ ] Enter rejection reason and confirm
- [ ] Verify undo toast appears
- [ ] Verify toast shows message: "Rejected X items"
- [ ] Click "Undo" button within 30 seconds
- [ ] Verify items return to pending status
- [ ] Verify rejection reason is cleared from items

### ✅ Undo Operation (Batch Revision)

- [ ] Select 2-3 pending approval items
- [ ] Click "Revise All (X)" button
- [ ] Verify undo toast appears
- [ ] Verify toast shows: "Requested revision for X items"
- [ ] Click "Undo" button
- [ ] Verify items return to pending status

### ✅ Undo Toast UI

- [ ] Verify toast appears above scroll-to-top FAB (not overlapping)
- [ ] Verify dismiss button (X) closes toast without undo
- [ ] Verify toast auto-dismisses after 30 seconds
- [ ] Verify toast width fits within narrow sidebar
- [ ] Verify undo button is clearly clickable (has border/styling)

### ✅ Undo Window Expiry

- [ ] Perform a batch approve operation
- [ ] Wait 30 seconds without clicking undo
- [ ] Verify toast automatically disappears
- [ ] Verify undo is no longer possible after dismissal

### ✅ Error Handling
- [ ] Verify error notifications use string-based format (not object)
- [ ] Check browser console for any errors during operations
- [ ] Verify graceful handling of failed operations

### ✅ i18n Processing Text
- [ ] During any batch operation loading state
- [ ] Verify "Processing..." text is translated (not hardcoded English)
- [ ] Test in different languages if possible

### ✅ Exit Selection Mode
- [ ] Enter selection mode and select some items
- [ ] Click "Cancel" or "Exit Selection Mode" button
- [ ] Verify checkboxes disappear
- [ ] Verify selections are cleared
- [ ] Verify batch action toolbar disappears

### ✅ VS Code Extension: Vertical Button Layout
- [ ] Enter selection mode in VS Code extension sidebar
- [ ] Verify batch action buttons stack vertically (not horizontally)
- [ ] Verify all button text is fully visible at any sidebar width
- [ ] Verify buttons show count in label: "Approve All (2)", "Revise All (2)", "Reject All (2)"
- [ ] Verify "Reject All" uses Trash icon (not X icon)
- [ ] Verify "Clear" link appears next to selection count
- [ ] Click "Clear" and verify all items are deselected

### ✅ VS Code Extension: No False "New Approval" Notifications

- [ ] Perform any batch operation (approve, reject, or revise)
- [ ] Verify NO "New approval request" notification appears in VS Code
- [ ] Only genuinely NEW approvals should trigger notifications
- [ ] Status changes (pending → approved/rejected) should NOT trigger notifications

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
