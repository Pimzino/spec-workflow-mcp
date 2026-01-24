# Batch Approval Feature - Test Plan

## Overview
This document provides a comprehensive test plan for the batch approval management feature in the VS Code extension.

---

## Prerequisites

1. VS Code extension built and installed locally
2. At least 5 pending approvals available for testing
3. Access to multiple approval categories (if available)
4. Dark mode and light mode accessible

---

## Test Execution Checklist

### 1. Selection Mode Entry/Exit

| Test | Steps | Expected Result | Status |
|------|-------|-----------------|--------|
| 1.1 Enter selection mode | Click "Select" button in approvals header | Checkboxes appear on all approval cards | [ ] |
| 1.2 Exit via Cancel button | Click "Cancel" button while in selection mode | Selection mode exits, all selections cleared | [ ] |
| 1.3 Exit via clicking "Select" again | Toggle the select button | Selection mode toggles, selections cleared on exit | [ ] |
| 1.4 Selection mode with 0 approvals | Enter selection mode when no approvals exist | "Select" button should not appear or be disabled | [ ] |

### 2. Individual Selection

| Test | Steps | Expected Result | Status |
|------|-------|-----------------|--------|
| 2.1 Select single item | Click checkbox on one approval card | Card shows selection ring, count shows "1 selected" | [ ] |
| 2.2 Deselect single item | Click checkbox on selected card | Selection ring removed, count decrements | [ ] |
| 2.3 Select multiple items | Click checkboxes on 3 different cards | All show rings, count shows "3 selected" | [ ] |
| 2.4 Selection persists during scroll | Select items, scroll away, scroll back | Selections remain intact | [ ] |

### 3. Select All / Deselect All

| Test | Steps | Expected Result | Status |
|------|-------|-----------------|--------|
| 3.1 Select all with none selected | Click header checkbox when none selected | All items selected, checkbox shows checkmark | [ ] |
| 3.2 Deselect all with all selected | Click header checkbox when all selected | All items deselected, checkbox empty | [ ] |
| 3.3 Partial selection indicator | Select some (not all) items | Header checkbox shows minus/dash icon | [ ] |
| 3.4 Click partial to select all | Click header checkbox when partially selected | All items become selected | [ ] |

### 4. Batch Size Limits

| Test | Steps | Expected Result | Status |
|------|-------|-----------------|--------|
| 4.1 Within limit (< 100) | Select 50 items, click batch action | Operation proceeds normally | [ ] |
| 4.2 At limit (exactly 100) | Select exactly 100 items, click batch action | Operation proceeds normally | [ ] |
| 4.3 Over limit (> 100) | Select 101+ items, click batch action | Warning notification: "Batch size exceeds limit" | [ ] |

### 5. Batch Operations

| Test | Steps | Expected Result | Status |
|------|-------|-----------------|--------|
| 5.1 Batch Approve | Select 3 items, click "Approve All" | All 3 approved, success notification, selection cleared | [ ] |
| 5.2 Batch Request Revision | Select 3 items, click "Revision All" | All 3 marked for revision, notification shown | [ ] |
| 5.3 Batch Reject | Select 3 items, click "Reject All" | All 3 rejected, notification shown | [ ] |
| 5.4 Empty selection guard | Click batch action with 0 selected | Nothing happens (buttons should be disabled) | [ ] |

### 6. Processing State

| Test | Steps | Expected Result | Status |
|------|-------|-----------------|--------|
| 6.1 Processing indicator | Start batch operation | Buttons show "Processing..." text | [ ] |
| 6.2 Buttons disabled during processing | Start operation, try clicking another button | Buttons are disabled, no duplicate operations | [ ] |
| 6.3 Double-click prevention | Rapidly double-click "Approve All" | Only one operation executes | [ ] |
| 6.4 Processing completes | Wait for batch operation to finish | Processing state clears, selection mode exits | [ ] |

### 7. Error Handling

| Test | Steps | Expected Result | Status |
|------|-------|-----------------|--------|
| 7.1 Partial failure | Batch operation where some fail | Shows "X approved, Y failed" message | [ ] |
| 7.2 Complete failure | All items in batch fail | Error notification displayed | [ ] |
| 7.3 Network error simulation | Disconnect network, try batch operation | Graceful error handling | [ ] |

### 8. State Consistency

| Test | Steps | Expected Result | Status |
|------|-------|-----------------|--------|
| 8.1 Approvals refresh during selection | Select items, wait for auto-refresh | Selections validated against new data | [ ] |
| 8.2 Tab switch during operation | Start operation, switch tabs, return | UI reflects correct final state | [ ] |
| 8.3 Filter change during selection | Select items in "All", change filter | Either: clear selection OR keep valid selections | [ ] |
| 8.4 Exit selection during processing | Try to exit selection mode while processing | Operation completes, then mode exits | [ ] |

### 9. Visual Design

| Test | Steps | Expected Result | Status |
|------|-------|-----------------|--------|
| 9.1 Light mode selection ring | Select item in light mode | Blue ring clearly visible | [ ] |
| 9.2 Dark mode selection ring | Select item in dark mode | Blue ring clearly visible, proper contrast | [ ] |
| 9.3 Hover states | Hover over batch action buttons | Proper hover feedback | [ ] |
| 9.4 Checkbox alignment | View checkboxes on cards | Properly aligned, not overlapping content | [ ] |
| 9.5 Sticky footer position | Scroll with items selected | Batch action bar stays visible at bottom | [ ] |

### 10. Internationalization

| Test | Steps | Expected Result | Status |
|------|-------|-----------------|--------|
| 10.1 Button labels | Check all batch button labels | Properly translated | [ ] |
| 10.2 Selection count | Select items, check count text | "{n} selected" properly pluralized | [ ] |
| 10.3 Success notifications | Complete batch operation | Notification message translated | [ ] |
| 10.4 Warning notifications | Exceed batch limit | Warning message translated with count | [ ] |
| 10.5 Processing text | Start operation | "Processing..." translated | [ ] |

### 11. Accessibility

| Test | Steps | Expected Result | Status |
|------|-------|-----------------|--------|
| 11.1 Keyboard navigation | Tab through selection controls | All controls focusable | [ ] |
| 11.2 Screen reader labels | Use screen reader on checkboxes | Proper aria-labels announced | [ ] |
| 11.3 Focus management | Complete batch operation | Focus moves appropriately | [ ] |

---

## Edge Case Scenarios

### Scenario A: Rapid User Actions
```
1. Enter selection mode
2. Quickly select 5 items
3. Immediately click "Approve All"
4. While processing, click "Cancel" to exit selection mode
5. Verify: Operation completes, UI returns to non-selection state
```

### Scenario B: Data Refresh During Selection
```
1. Enter selection mode
2. Select 3 approvals
3. Have another user/process approve one of the selected items
4. Wait for data refresh (or manually refresh)
5. Verify: Selected count updates, invalid selections removed
```

### Scenario C: Filter Interaction
```
1. Filter to show "Category A" approvals
2. Enter selection mode
3. Select all items in Category A
4. Change filter to "All Categories"
5. Verify: Either selections persist and are visible, or selection is cleared
```

### Scenario D: Long-Running Operation
```
1. Select 50+ items
2. Start batch approve
3. Wait for completion (may take several seconds)
4. Verify: Progress indication shown, final state correct
```

---

## Performance Benchmarks

| Scenario | Target | Actual | Pass/Fail |
|----------|--------|--------|-----------|
| Select 100 items | < 500ms | | |
| Batch approve 10 items | < 2s | | |
| Batch approve 50 items | < 5s | | |
| UI responsive during batch | No frame drops | | |

---

## Known Issues - FIXED

The following issues were identified and fixed in `App.tsx`:

### 1. Memory Leak in Fallback Timeout
**Problem**: The 10-second fallback timeout was never cleared when the operation completed early.
**Fix**: Added `batchTimeoutRef` to store timeout ID, cleared in `clearBatchOperationState()` helper and on component unmount.
**Lines**: 68-69, 192-202, 487-491

### 2. Race Condition - Exit Selection Mode During Processing
**Problem**: User could exit selection mode while a batch operation was still processing.
**Fix**: Added guard in `toggleSelectionMode()` to prevent exiting when `batchProcessing` is true.
**Lines**: 158-162

### 3. Stale Selections After Approvals Refresh
**Problem**: Selected IDs could reference approvals that no longer exist after data refresh.
**Fix**: Added validation in `approvals-updated` handler to filter out invalid selection IDs.
**Lines**: 380-392

### 4. Double-Submission on Rapid Clicks
**Problem**: Rapidly clicking batch action buttons could trigger multiple operations.
**Fix**: Added guard in `startBatchOperation()` to check both `batchProcessing` state and `pendingBatchOperation` ref.
**Lines**: 209-212

### Verification Tests
- [ ] Verify timeout is cleared when operation completes before 10 seconds
- [ ] Verify "Cancel" button is disabled/ignored during batch processing
- [ ] Verify stale selections are removed when approvals refresh
- [ ] Verify rapid double-clicks only trigger one operation

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Developer | | | |
| Tester | | | |
| Reviewer | | | |
