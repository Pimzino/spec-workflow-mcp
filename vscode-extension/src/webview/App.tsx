import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
  Activity,
  CheckSquare,
  Square,
  AlertCircle,
  RefreshCw,
  BookOpen,
  Settings,
  Copy,
  ChevronUp,
  Coffee,
  Globe,
  ChevronDown,
  ChevronRight,
  Bot,
  FileText,
  Check,
  X,
  Minus,
  RotateCcw,
  Trash2,
  Undo2,
  FolderOpen
} from 'lucide-react';
import { vscodeApi, type SpecData, type TaskProgressData, type ApprovalData, type SteeringStatus, type DocumentInfo, type SoundNotificationConfig } from '@/lib/vscode-api';
import { cn, formatDistanceToNow } from '@/lib/utils';
import { useVSCodeTheme } from '@/hooks/useVSCodeTheme';
import { useSoundNotifications } from '@/hooks/useSoundNotifications';
import { LogsPage } from '@/pages/LogsPage';

// Constants for batch operations - matches dashboard limits
const BATCH_SIZE_LIMIT = 100;
const BATCH_OPERATION_FEEDBACK_DELAY = 2000;

function App() {
  const { t, i18n } = useTranslation();
  console.log('=== WEBVIEW APP.TSX STARTING ===');
  const theme = useVSCodeTheme();
  console.log('Current VS Code theme:', theme);
  const [specs, setSpecs] = useState<SpecData[]>([]);
  const [archivedSpecs, setArchivedSpecs] = useState<SpecData[]>([]);
  const [selectedSpec, setSelectedSpec] = useState<string | null>(null);
  const [taskData, setTaskData] = useState<TaskProgressData | null>(null);
  const [approvals, setApprovals] = useState<ApprovalData[]>([]);
  const [approvalCategories, setApprovalCategories] = useState<{ value: string; label: string; count: number }[]>([]);
  const [selectedApprovalCategory, setSelectedApprovalCategory] = useState<string>('all');
  const [specDocuments, setSpecDocuments] = useState<DocumentInfo[]>([]);
  const [steeringDocuments, setSteeringDocuments] = useState<DocumentInfo[]>([]);
  const [, setSteering] = useState<SteeringStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [notification, setNotification] = useState<{message: string, level: 'info' | 'warning' | 'error' | 'success'} | null>(null);
  const [processingApproval, setProcessingApproval] = useState<string | null>(null);
  const [copiedTaskId, setCopiedTaskId] = useState<string | null>(null);

  // Batch selection mode state
  const [selectionMode, setSelectionMode] = useState<boolean>(false);
  const [selectedApprovalIds, setSelectedApprovalIds] = useState<Set<string>>(new Set());
  const [batchProcessing, setBatchProcessing] = useState<boolean>(false);
  // Track if we're expecting a batch operation completion - used to detect backend confirmation
  const pendingBatchOperation = useRef<boolean>(false);
  // Store fallback timeout ID so we can clear it when operation completes early
  const batchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track details of the pending batch operation for undo
  const pendingBatchDetailsRef = useRef<{ ids: string[]; action: string } | null>(null);
  // Batch reject modal state
  const [batchRejectModalOpen, setBatchRejectModalOpen] = useState<boolean>(false);
  const [batchRejectFeedback, setBatchRejectFeedback] = useState<string>('');
  // Undo state
  const [lastBatchOperation, setLastBatchOperation] = useState<{ ids: string[]; action: string } | null>(null);
  const [showUndoToast, setShowUndoToast] = useState<boolean>(false);
  const undoTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [copiedSteering, setCopiedSteering] = useState<boolean>(false);
  const [expandedPrompts, setExpandedPrompts] = useState<Set<string>>(new Set());
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [soundConfig, setSoundConfig] = useState<SoundNotificationConfig>({
    enabled: true,
    volume: 0.3,
    approvalSound: true,
    taskCompletionSound: true
  });
  const [soundUris, setSoundUris] = useState<{ [key: string]: string } | null>(null);
  const [archiveView, setArchiveView] = useState<'active' | 'archived'>('active');
  const [selectedArchivedSpec, setSelectedArchivedSpec] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<string>('auto');
  const [workflowRoot, setWorkflowRoot] = useState<{ path: string; isDefault: boolean }>({ path: '', isDefault: true });
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  
  // Sound notifications - use config from VS Code settings
  const soundNotifications = useSoundNotifications({ 
    enabled: soundConfig.enabled, 
    volume: soundConfig.volume,
    soundUris: soundUris
  });
  
  // Previous state tracking for notifications (use refs to avoid triggering effects)
  const previousApprovals = useRef<ApprovalData[]>([]);
  const previousTaskData = useRef<TaskProgressData | null>(null);


  // Toggle prompt expansion
  const togglePromptExpansion = (taskId: string) => {
    setExpandedPrompts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  // Copy prompt function
  const copyTaskPrompt = (task: any) => {
    if (!selectedSpec) {
      return;
    }
    
    // Use custom prompt if available, otherwise fallback to default
    const command = task.prompt || t('task.copyPrompt', 'Please work on task {{taskId}} for spec "{{specName}}"', { taskId: task.id, specName: selectedSpec });
    
    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(command).then(() => {
        setCopiedTaskId(task.id);
        setTimeout(() => setCopiedTaskId(null), 2000);
      }).catch(() => {
        // Fallback to legacy method
        fallbackCopy(command, task.id);
      });
    } else {
      // Clipboard API not available
      fallbackCopy(command, task.id);
    }
  };

  const fallbackCopy = (text: string, taskId: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        setCopiedTaskId(taskId);
        setTimeout(() => setCopiedTaskId(null), 2000);
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
    
    document.body.removeChild(textArea);
  };

  // Batch selection mode handlers
  const toggleSelectionMode = () => {
    // Prevent exiting selection mode while batch operation is in progress
    if (selectionMode && batchProcessing) {
      return;
    }
    if (selectionMode) {
      // Exiting selection mode - clear selections
      setSelectedApprovalIds(new Set());
    }
    setSelectionMode(!selectionMode);
  };

  const toggleApprovalSelection = (id: string) => {
    setSelectedApprovalIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAllApprovals = (approvalIds: string[]) => {
    if (selectedApprovalIds.size === approvalIds.length) {
      // All selected, deselect all
      setSelectedApprovalIds(new Set());
    } else {
      // Select all
      setSelectedApprovalIds(new Set(approvalIds));
    }
  };

  // Helper to clear batch operation state and timeout
  const clearBatchOperationState = (showUndo: boolean = false, action?: string, ids?: string[]) => {
    pendingBatchOperation.current = false;
    setBatchProcessing(false);
    setSelectedApprovalIds(new Set());
    setSelectionMode(false);
    // Clear fallback timeout if it exists
    if (batchTimeoutRef.current) {
      clearTimeout(batchTimeoutRef.current);
      batchTimeoutRef.current = null;
    }

    // Set up undo state if operation was successful
    if (showUndo && action && ids && ids.length > 0) {
      // Clear any existing undo timeout
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
      }

      setLastBatchOperation({ ids, action });
      setShowUndoToast(true);

      // Set up 30-second undo window
      undoTimeoutRef.current = setTimeout(() => {
        setShowUndoToast(false);
        setLastBatchOperation(null);
      }, 30000);
    }
  };

  // Helper to start a batch operation with proper tracking
  const startBatchOperation = (
    apiCall: () => void,
    action: string,
    ids: string[]
  ) => {
    // Prevent double-submission if already processing
    if (batchProcessing || pendingBatchOperation.current) {
      return;
    }

    // Store the IDs and action for undo in ref so completion handlers can access it
    pendingBatchDetailsRef.current = { ids: [...ids], action };

    setBatchProcessing(true);
    pendingBatchOperation.current = true;
    apiCall();

    // Fallback timeout in case backend notification doesn't arrive (e.g., network issue)
    // The notification handler will clear state earlier if confirmation arrives
    // Store timeout ID so we can clear it when operation completes
    batchTimeoutRef.current = setTimeout(() => {
      if (pendingBatchOperation.current) {
        const details = pendingBatchDetailsRef.current;
        pendingBatchDetailsRef.current = null;
        clearBatchOperationState(true, details?.action, details?.ids);
      }
    }, BATCH_OPERATION_FEEDBACK_DELAY * 5); // 10 seconds fallback
  };

  // Handle undo operation
  const handleUndo = () => {
    if (!lastBatchOperation) { return; }

    // Clear the undo timeout
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
      undoTimeoutRef.current = null;
    }

    // Hide toast immediately
    setShowUndoToast(false);

    // Execute undo
    vscodeApi.batchUndo(lastBatchOperation.ids);

    // Clear last operation
    setLastBatchOperation(null);
  };

  const handleBatchApprove = () => {
    if (selectedApprovalIds.size === 0) {return;}
    if (selectedApprovalIds.size > BATCH_SIZE_LIMIT) {
      setNotification({ message: t('approvals.batch.tooMany', { limit: BATCH_SIZE_LIMIT }), level: 'warning' });
      return;
    }
    const ids = Array.from(selectedApprovalIds);
    startBatchOperation(
      () => vscodeApi.batchApprove(ids, t('approvals.response.approved')),
      'approve',
      ids
    );
  };

  const handleBatchReject = () => {
    if (selectedApprovalIds.size === 0) {return;}
    if (selectedApprovalIds.size > BATCH_SIZE_LIMIT) {
      setNotification({ message: t('approvals.batch.tooMany', { limit: BATCH_SIZE_LIMIT }), level: 'warning' });
      return;
    }
    // Always show feedback modal for reject - user must provide a reason
    setBatchRejectFeedback('');
    setBatchRejectModalOpen(true);
  };

  const handleBatchRejectWithFeedback = () => {
    if (!batchRejectFeedback.trim()) {
      setNotification({ message: t('approvals.batch.feedbackRequired'), level: 'warning' });
      return;
    }
    setBatchRejectModalOpen(false);
    const ids = Array.from(selectedApprovalIds);
    startBatchOperation(
      () => vscodeApi.batchReject(ids, batchRejectFeedback.trim()),
      'reject',
      ids
    );
  };

  const handleBatchRevision = () => {
    if (selectedApprovalIds.size === 0) {return;}
    if (selectedApprovalIds.size > BATCH_SIZE_LIMIT) {
      setNotification({ message: t('approvals.batch.tooMany', { limit: BATCH_SIZE_LIMIT }), level: 'warning' });
      return;
    }
    const ids = Array.from(selectedApprovalIds);
    startBatchOperation(
      () => vscodeApi.batchRequestRevision(ids, t('approvals.response.needsRevision')),
      'revision',
      ids
    );
  };

  // Language change handler
  const handleLanguageChange = (language: string) => {
    setCurrentLanguage(language);
    
    if (language === 'auto') {
      // Reset to auto-detection - remove from localStorage
      localStorage.removeItem('spec-workflow-language');
      i18n.changeLanguage(undefined);
    } else {
      // Set specific language - store in localStorage for i18next detector
      localStorage.setItem('spec-workflow-language', language);
      i18n.changeLanguage(language);
    }
    
    vscodeApi.setLanguagePreference(language);
    setNotification({ message: t('language.changed'), level: 'success' });
  };

  // Copy steering instructions function
  const copySteeringInstructions = () => {
    const instructions = `Please help me create or update the steering documents for my project. The steering documents include:

- product.md: Define the product vision, target users, key features, and business objectives
- tech.md: Document technical architecture decisions, technology stack, and development principles  
- structure.md: Describe the codebase organization, directory structure, and module architecture

Review the existing steering documents (if any) and help me improve or complete them based on my project requirements.`;
    
    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(instructions).then(() => {
        setCopiedSteering(true);
        setTimeout(() => setCopiedSteering(false), 2000);
      }).catch(() => {
        // Fallback to legacy method
        fallbackCopyGeneric(instructions);
      });
    } else {
      // Clipboard API not available
      fallbackCopyGeneric(instructions);
    }
  };

  const fallbackCopyGeneric = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        setCopiedSteering(true);
        setTimeout(() => setCopiedSteering(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
    
    document.body.removeChild(textArea);
  };

  // Scroll to top function
  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    // Subscribe to messages from extension
    const unsubscribes = [
      vscodeApi.onMessage('specs-updated', (message: any) => {
        setSpecs(message.data || []);
        setLoading(false);
      }),
      vscodeApi.onMessage('tasks-updated', (message: any) => {
        console.log('=== App.tsx tasks-updated message ===');
        console.log('Message data:', message.data);
        console.log('Selected spec:', selectedSpec);
        console.log('Message spec:', message.data?.specName);
        
        // Update task data if we have data
        if (message.data) {
          console.log('Setting taskData with taskList count:', message.data.taskList?.length);
          console.log('Sample task (2.2) from message:', message.data.taskList?.find((t: any) => t.id === '2.2'));
          console.log('Tasks with metadata:', message.data.taskList?.filter((t: any) => 
            t.requirements?.length || t.implementationDetails?.length || t.files?.length || t.purposes?.length || t.leverage
          ).map((t: any) => ({ id: t.id, requirements: t.requirements, implementationDetails: t.implementationDetails })));
          
          setTaskData(message.data);
          
          // If we don't have a selected spec yet, but we got task data, update the selected spec
          if (!selectedSpec && message.data.specName) {
            console.log('Setting selected spec from task data:', message.data.specName);
            setSelectedSpec(message.data.specName);
          }
        }
      }),
      vscodeApi.onMessage('approvals-updated', (message: any) => {
        console.log('=== Received approvals-updated message ===');
        console.log('Current tab:', activeTab);
        console.log('Approvals count:', message.data?.length || 0);
        console.log('Pending approvals:', message.data?.filter((a: any) => a.status === 'pending').length || 0);
        console.log('About to setApprovals - this should trigger badge counter update');

        const newApprovals = message.data || [];
        setApprovals(newApprovals);

        // If a batch operation was in progress, clear the state now that we have fresh data
        if (pendingBatchOperation.current) {
          const details = pendingBatchDetailsRef.current;
          pendingBatchDetailsRef.current = null;
          clearBatchOperationState(true, details?.action, details?.ids);
        }

        // Validate selected IDs - remove any that no longer exist in the new data
        // This handles the case where approvals were processed by another user/process
        if (selectedApprovalIds.size > 0) {
          const validIds = new Set(newApprovals.map((a: ApprovalData) => a.id));
          setSelectedApprovalIds(prev => {
            const filtered = new Set([...prev].filter(id => validIds.has(id)));
            // If all selections became invalid, exit selection mode
            if (filtered.size === 0 && selectionMode) {
              setSelectionMode(false);
            }
            return filtered;
          });
        }

        // Also refresh categories when approvals change
        vscodeApi.getApprovalCategories();
      }),
      vscodeApi.onMessage('approval-categories-updated', (message: any) => {
        console.log('=== Received approval-categories-updated message ===');
        console.log('Categories:', message.data);
        setApprovalCategories(message.data || []);
      }),
      vscodeApi.onMessage('steering-updated', (message: any) => {
        setSteering(message.data);
      }),
      vscodeApi.onMessage('spec-documents-updated', (message: any) => {
        setSpecDocuments(message.data || []);
      }),
      vscodeApi.onMessage('steering-documents-updated', (message: any) => {
        setSteeringDocuments(message.data || []);
      }),
      vscodeApi.onMessage('selected-spec-updated', (message: any) => {
        setSelectedSpec(message.data || null);
      }),
      vscodeApi.onMessage('error', (message: any) => {
        console.error('Extension error:', message.message);
        setLoading(false);
      }),
      vscodeApi.onMessage('notification', (message: any) => {
        setNotification({ message: message.message, level: message.level });
        // Auto-hide notification after 3 seconds
        setTimeout(() => setNotification(null), 3000);

        // Handle batch operation completion - detect by checking if we're expecting one
        // and if the notification indicates a batch result (contains "requests" or "failed")
        if (pendingBatchOperation.current &&
            (message.message.includes('requests') || message.message.includes('failed'))) {
          // Backend confirmed the batch operation - clear state and timeout with undo support
          const details = pendingBatchDetailsRef.current;
          pendingBatchDetailsRef.current = null;
          clearBatchOperationState(true, details?.action, details?.ids);
        }
      }),
      vscodeApi.onMessage('config-updated', (message: any) => {
        setSoundConfig(message.data || {
          enabled: true,
          volume: 0.3,
          approvalSound: true,
          taskCompletionSound: true
        });
      }),
      vscodeApi.onMessage('sound-uris-updated', (message: any) => {
        console.log('Received sound URIs from extension:', message.data);
        setSoundUris(message.data || null);
      }),
      vscodeApi.onMessage('navigate-to-approvals', (message: any) => {
        console.log('Navigating to approvals from native notification:', message.data);
        const { specName, approvalId: _approvalId } = message.data;
        
        // Switch to approvals tab
        setActiveTab('approvals');
        
        // Set the selected spec
        setSelectedSpec(specName);
        
        console.log('Switched to approvals tab, selected spec:', specName);
      }),
      vscodeApi.onMessage('archived-specs-updated', (message: any) => {
        console.log('=== Received archived-specs-updated message ===');
        console.log('Archived specs count:', message.data?.length || 0);
        setArchivedSpecs(message.data || []);
      }),
      vscodeApi.onMessage('language-preference-updated', (message: any) => {
        console.log('=== Received language-preference-updated message ===');
        console.log('Language preference:', message.data);
        const language = message.data || 'auto';
        setCurrentLanguage(language);

        if (language === 'auto') {
          // Reset to auto-detection - remove from localStorage
          localStorage.removeItem('spec-workflow-language');
          i18n.changeLanguage(undefined);
        } else {
          // Set specific language - store in localStorage for i18next detector
          localStorage.setItem('spec-workflow-language', language);
          i18n.changeLanguage(language);
        }
      }),
      vscodeApi.onMessage('workflow-root-updated', (message: any) => {
        console.log('=== Received workflow-root-updated message ===');
        console.log('Workflow root:', message.data);
        setWorkflowRoot(message.data || { path: '', isDefault: true });
      }),
    ];

    // Initial data load
    handleRefresh();
    // Explicitly get approvals for badge counter
    vscodeApi.getApprovals();
    // Get language preference
    vscodeApi.getLanguagePreference();
    // Get workflow root
    vscodeApi.getWorkflowRoot();

    return () => {
      unsubscribes.forEach(unsub => unsub());
      // Clean up batch operation timeout on unmount to prevent memory leak
      if (batchTimeoutRef.current) {
        clearTimeout(batchTimeoutRef.current);
        batchTimeoutRef.current = null;
      }
      // Clean up undo timeout on unmount
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
        undoTimeoutRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (selectedSpec) {
      vscodeApi.getTasks(selectedSpec);
      vscodeApi.getSpecDocuments(selectedSpec);
    }
  }, [selectedSpec]);

  useEffect(() => {
    if (selectedArchivedSpec) {
      vscodeApi.getSpecDocuments(selectedArchivedSpec);
    }
  }, [selectedArchivedSpec]);

  useEffect(() => {
    // Load steering documents on initial load
    vscodeApi.getSteeringDocuments();
  }, []);

  // Scroll event listener for FAB visibility
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }

    const handleScroll = () => {
      setShowScrollTop(container.scrollTop > 200);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Sound notification: Detect new pending approvals
  useEffect(() => {
    if (approvals.length === 0) {
      // No approvals yet, just update the ref
      previousApprovals.current = approvals;
      return;
    }

    const currentPendingCount = approvals.filter(approval => approval.status === 'pending').length;
    const previousPendingCount = previousApprovals.current.filter(approval => approval.status === 'pending').length;

    // Check if we have new pending approvals
    if (currentPendingCount > previousPendingCount && previousApprovals.current.length > 0 && soundConfig.approvalSound) {
      console.log(`New pending approval detected: ${currentPendingCount} vs ${previousPendingCount}`);
      soundNotifications.playApprovalPending();
    }

    // Update the ref for next comparison
    previousApprovals.current = approvals;
  }, [approvals, soundNotifications, soundConfig.approvalSound]);

  // Sound notification: Detect task completion
  useEffect(() => {
    if (!taskData || !taskData.taskList) {
      // No task data yet, just update the ref
      previousTaskData.current = taskData;
      return;
    }

    // Check if we have previous data to compare against
    if (!previousTaskData.current || !previousTaskData.current.taskList) {
      previousTaskData.current = taskData;
      return;
    }

    // Compare completed task count
    const currentCompletedCount = taskData.taskList.filter(task => task.status === 'completed').length;
    const previousCompletedCount = previousTaskData.current.taskList.filter(task => task.status === 'completed').length;

    // If completed count increased, play completion sound
    if (currentCompletedCount > previousCompletedCount && soundConfig.taskCompletionSound) {
      console.log(`Task completion detected: ${currentCompletedCount} vs ${previousCompletedCount}`);
      soundNotifications.playTaskCompleted();
    }

    // Update the ref for next comparison
    previousTaskData.current = taskData;
  }, [taskData, soundNotifications, soundConfig.taskCompletionSound]);

  // Fetch fresh data when switching tabs
  useEffect(() => {
    if (activeTab === 'approvals') {
      vscodeApi.getApprovals();
      vscodeApi.getApprovalCategories();
    } else if (activeTab === 'archives') {
      vscodeApi.getArchivedSpecs();
    }
  }, [activeTab]);

  const handleRefresh = () => {
    setLoading(true);
    vscodeApi.refreshAll();
    vscodeApi.getSelectedSpec();
    vscodeApi.getConfig();
    vscodeApi.getArchivedSpecs();
  };

  const handleSpecSelect = (specName: string) => {
    vscodeApi.setSelectedSpec(specName);
  };



  const handleTaskStatusUpdate = (taskId: string, status: 'pending' | 'in-progress' | 'completed') => {
    if (selectedSpec) {
      vscodeApi.updateTaskStatus(selectedSpec, taskId, status);
    }
  };

  // Calculate overall project statistics
  const projectStats = React.useMemo(() => {
    const activeSpecs = specs.filter(spec => !spec.isArchived).length;
    const archivedSpecsCount = archivedSpecs.length;
    const totalSpecs = activeSpecs + archivedSpecsCount;
    
    const completedSpecs = specs.filter(spec => 
      spec.taskProgress && spec.taskProgress.completed === spec.taskProgress.total && spec.taskProgress.total > 0
    ).length;
    const totalTasks = specs.reduce((sum, spec) => sum + (spec.taskProgress?.total || 0), 0);
    const completedTasks = specs.reduce((sum, spec) => sum + (spec.taskProgress?.completed || 0), 0);
    
    return { 
      activeSpecs, 
      archivedSpecs: archivedSpecsCount, 
      totalSpecs, 
      completedSpecs, 
      totalTasks, 
      completedTasks 
    };
  }, [specs, archivedSpecs]);

  // Calculate pending approvals count
  const pendingApprovalsCount = React.useMemo(() => {
    const count = approvals.filter(approval => approval.status === 'pending').length;
    console.log('Badge counter recalculated:', count, 'from', approvals.length, 'total approvals');
    return count;
  }, [approvals]);

  return (
    <div className={cn("sidebar-root", `vscode-${theme}`)}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full flex flex-col">
        {/* Sticky Header Section */}
        <div className="sidebar-sticky-header space-y-3">
          {/* Notification Banner */}
          {notification && (
            <div className={cn(
              "p-2 rounded text-xs font-medium",
              notification.level === 'success' && "bg-green-100 text-green-800 border border-green-200",
              notification.level === 'error' && "bg-red-100 text-red-800 border border-red-200",
              notification.level === 'warning' && "bg-yellow-100 text-yellow-800 border border-yellow-200",
              notification.level === 'info' && "bg-blue-100 text-blue-800 border border-blue-200"
            )}>
              <div className="flex items-center justify-between">
                <span>{notification.message}</span>
                <button
                  type="button"
                  onClick={() => setNotification(null)}
                  className="ml-2 hover:opacity-70"
                >
                  ×
                </button>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold">{t('header.title')}</h1>
            <div className="flex items-center space-x-2">
              {/* Language Selector */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-1"
                    title={t('language.selector')}
                  >
                    <Globe className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleLanguageChange('auto')}
                    className={cn(currentLanguage === 'auto' && "bg-accent")}
                  >
                    {t('language.auto')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleLanguageChange('en')}
                    className={cn(currentLanguage === 'en' && "bg-accent")}
                  >
                    {t('language.english')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleLanguageChange('ja')}
                    className={cn(currentLanguage === 'ja' && "bg-accent")}
                  >
                    {t('language.japanese')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleLanguageChange('zh')}
                    className={cn(currentLanguage === 'zh' && "bg-accent")}
                  >
                    {t('language.chinese')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleLanguageChange('es')}
                    className={cn(currentLanguage === 'es' && "bg-accent")}
                  >
                    {t('language.spanish')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleLanguageChange('pt')}
                    className={cn(currentLanguage === 'pt' && "bg-accent")}
                  >
                    {t('language.portuguese')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleLanguageChange('de')}
                    className={cn(currentLanguage === 'de' && "bg-accent")}
                  >
                    {t('language.german')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleLanguageChange('fr')}
                    className={cn(currentLanguage === 'fr' && "bg-accent")}
                  >
                    {t('language.french')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleLanguageChange('ru')}
                    className={cn(currentLanguage === 'ru' && "bg-accent")}
                  >
                    {t('language.russian')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleLanguageChange('it')}
                    className={cn(currentLanguage === 'it' && "bg-accent")}
                  >
                    {t('language.italian')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleLanguageChange('ko')}
                    className={cn(currentLanguage === 'ko' && "bg-accent")}
                  >
                    {t('language.korean')}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleLanguageChange('ar')}
                    className={cn(currentLanguage === 'ar' && "bg-accent")}
                  >
                    {t('language.arabic')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => vscodeApi.openExternalUrl('https://buymeacoffee.com/pimzino')}
                title={t('header.support')}
                className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
              >
                <Coffee className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={loading}
              >
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview" className="text-xs" title={t('tabs.overview')}>
              <Activity className="h-3 w-3" />
            </TabsTrigger>
            <TabsTrigger value="steering" className="text-xs" title={t('tabs.steering')}>
              <Settings className="h-3 w-3" />
            </TabsTrigger>
            <TabsTrigger value="specs" className="text-xs" title={t('tabs.specs')}>
              <BookOpen className="h-3 w-3" />
            </TabsTrigger>
            <TabsTrigger value="tasks" className="text-xs" title={t('tabs.tasks')}>
              <CheckSquare className="h-3 w-3" />
            </TabsTrigger>
            <TabsTrigger value="logs" className="text-xs" title={t('tabs.logs')}>
              <FileText className="h-3 w-3" />
            </TabsTrigger>
            <TabsTrigger value="approvals" className="text-xs relative" title={t('tabs.approvals')}>
              <AlertCircle className="h-3 w-3" />
              {pendingApprovalsCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs flex items-center justify-center rounded-full min-w-[16px]"
                >
                  {pendingApprovalsCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Scrollable Content Section */}
        <div className="sidebar-scrollable-content" ref={scrollContainerRef}>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t('overview.projectTitle')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <div className="text-muted-foreground">{t('overview.activeSpecs')}</div>
                  <div className="font-medium">
                    {projectStats.completedSpecs} / {projectStats.activeSpecs}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">{t('overview.archivedSpecs')}</div>
                  <div className="font-medium">
                    {projectStats.archivedSpecs}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <div className="text-muted-foreground">{t('overview.totalSpecs')}</div>
                  <div className="font-medium">
                    {projectStats.totalSpecs}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">{t('overview.tasks')}</div>
                  <div className="font-medium">
                    {projectStats.completedTasks} / {projectStats.totalTasks}
                  </div>
                </div>
              </div>
              
              {projectStats.totalTasks > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>{t('overview.overallProgress')}</span>
                    <span>{Math.round((projectStats.completedTasks / projectStats.totalTasks) * 100)}%</span>
                  </div>
                  <Progress 
                    value={(projectStats.completedTasks / projectStats.totalTasks) * 100} 
                    className="h-2"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t('overview.recentActivity')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {specs.slice(0, 3).map(spec => (
                  <div key={spec.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        spec.taskProgress && spec.taskProgress.completed === spec.taskProgress.total && spec.taskProgress.total > 0
                          ? "bg-green-500" : "bg-blue-500"
                      )} />
                      <span className="truncate">{spec.displayName}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {t('overview.modified', { time: formatDistanceToNow(spec.lastModified) })}
                    </span>
                  </div>
                ))}
                {specs.length === 0 && (
                  <div className="text-muted-foreground text-xs text-center py-2">
                    {t('overview.noSpecs')}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Workflow Root Configuration */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FolderOpen className="h-4 w-4" />
                {t('workflowRoot.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-xs text-muted-foreground">
                {t('workflowRoot.description')}
              </div>
              <div className="space-y-2">
                <div className="text-xs">
                  <span className="text-muted-foreground">{t('workflowRoot.current')}: </span>
                  <span className="font-mono text-[10px] break-all">
                    {workflowRoot.path || t('workflowRoot.notSet')}
                  </span>
                  {workflowRoot.isDefault && workflowRoot.path && (
                    <Badge variant="secondary" className="ml-2 text-[10px]">
                      {t('workflowRoot.default')}
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => vscodeApi.browseWorkflowRoot()}
                  >
                    <FolderOpen className="h-3 w-3 mr-1" />
                    {t('workflowRoot.browse')}
                  </Button>
                  {!workflowRoot.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs"
                      onClick={() => vscodeApi.resetWorkflowRoot()}
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      {t('workflowRoot.reset')}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>


        {/* Tasks Tab */}
        <TabsContent value="tasks" className="space-y-3">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">{t('tasks.specLabel')}:</label>
              <Select value={selectedSpec || ''} onValueChange={handleSpecSelect}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('tasks.specPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {specs.map(spec => (
                    <SelectItem key={spec.name} value={spec.name}>
                      {spec.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {selectedSpec ? (
            taskData ? (
              <>
                {/* Stats Card */}
                <Card>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="font-medium text-lg">{taskData.total}</div>
                        <div className="text-muted-foreground text-xs">{t('tasks.stats.total')}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-lg text-green-600">{taskData.completed}</div>
                        <div className="text-muted-foreground text-xs">{t('tasks.stats.done')}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-lg text-amber-600">{taskData.total - taskData.completed}</div>
                        <div className="text-muted-foreground text-xs">{t('tasks.stats.left')}</div>
                      </div>
                      <div className="text-center">
                        <div className="font-medium text-lg text-blue-600">{Math.round(taskData.progress)}%</div>
                        <div className="text-muted-foreground text-xs">{t('tasks.stats.progress')}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Progress Bar */}
                <Card>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{t('tasks.overallProgress')}</span>
                      <span className="text-sm">{Math.round(taskData.progress)}%</span>
                    </div>
                    <Progress value={taskData.progress} className="h-2" />
                  </CardContent>
                </Card>

                {/* Task List */}
                <div className="space-y-2">
                  {taskData.taskList?.map(task => {
                    // DEBUG: Log actual task properties
                    console.log(`🔍 TASK DEBUG [${task.id}]:`, {
                      id: task.id,
                      status: task.status,
                      completed: task.completed,
                      inProgress: task.inProgress,
                      hasInProgress: 'inProgress' in task,
                      allProps: Object.keys(task)
                    });
                    
                    return (
                    <Card key={task.id} className={cn(
                      "transition-colors",
                      task.isHeader && "border-purple-200 dark:border-slate-600 bg-purple-50 dark:bg-slate-800/60",
                      task.status === 'in-progress' && "border-orange-500",
                      task.completed && "border-green-500"
                    )}>
                      <CardContent className="p-3">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-sm flex-1",
                              task.isHeader 
                                ? "font-semibold text-purple-900 dark:text-purple-100" 
                                : "font-medium"
                            )}>
                              {task.isHeader ? t('tasks.section', 'Section') : t('tasks.task', 'Task')} {task.id}
                            </span>
                            {!task.isHeader && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className={cn(
                                    "h-6 w-6 p-0",
                                    copiedTaskId === task.id && "text-green-600"
                                  )}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copyTaskPrompt(task);
                                  }}
                                  title={copiedTaskId === task.id ? t('tasks.copied') : t('tasks.copyPromptTitle')}
                                  disabled={copiedTaskId === task.id}
                                >
                                  <Copy className="h-3 w-3" />
                                </Button>
                                <Select 
                                  value={task.completed ? 'completed' : (task.status || 'pending')} 
                                  onValueChange={(status: 'pending' | 'in-progress' | 'completed') => 
                                    handleTaskStatusUpdate(task.id, status)
                                  }
                                >
                                  <SelectTrigger className={cn(
                                    "w-auto h-6 px-2 text-xs border-0 focus:ring-0 focus:ring-offset-0",
                                    task.completed 
                                      ? "bg-green-500 text-white [&_svg]:!text-white [&_svg]:opacity-100" 
                                      : task.status === 'in-progress'
                                        ? "bg-orange-500 text-white [&_svg]:!text-white [&_svg]:opacity-100" 
                                        : "bg-transparent border border-border text-foreground [&_svg]:text-foreground"
                                  )}>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">{t('tasks.status.pending')}</SelectItem>
                                    <SelectItem value="in-progress">{t('tasks.status.inProgress')}</SelectItem>
                                    <SelectItem value="completed">{t('tasks.status.completed')}</SelectItem>
                                  </SelectContent>
                                </Select>
                              </>
                            )}
                            {task.isHeader && (
                              <Badge 
                                variant="secondary" 
                                className="text-xs bg-purple-100 dark:bg-slate-700 text-purple-700 dark:text-slate-200 border-purple-300 dark:border-slate-500"
                              >
                                {t('tasks.taskGroup')}
                              </Badge>
                            )}
                          </div>
                          
                          <p className={cn(
                            "text-xs",
                            task.isHeader 
                              ? "text-slate-600 dark:text-slate-300" 
                              : "text-muted-foreground"
                          )}>{task.description}</p>

                          {/* Task Metadata */}
                          <div className="space-y-2 border-t border-gray-100 dark:border-gray-700 pt-2">
                            {/* Files */}
                            {task.files && task.files.length > 0 && (
                              <div className="space-y-1">
                                <div className="text-xs font-medium text-purple-600 dark:text-purple-400 flex items-center gap-1">
                                  {t('tasks.meta.files')}:
                                </div>
                                <div className="task-files-container">
                                  <div className="task-files-list">
                                    {task.files.map((file, index) => (
                                      <span key={index} className="px-2 py-1 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300 text-xs rounded border border-purple-200 dark:border-purple-800 font-mono whitespace-nowrap flex-shrink-0">
                                        {file}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Implementation Details */}
                            {task.implementationDetails && task.implementationDetails.length > 0 && (
                              <div className="space-y-1">
                                <div className="text-xs font-medium text-blue-600 dark:text-blue-400 flex items-center gap-1">
                                  {t('tasks.meta.implementation')}:
                                </div>
                                <ul className="text-xs text-muted-foreground list-disc list-inside space-y-0.5 ml-2">
                                  {task.implementationDetails.map((detail, index) => (
                                    <li key={index} className="leading-relaxed">{detail}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Purposes */}
                            {task.purposes && task.purposes.length > 0 && (
                              <div className="space-y-1">
                                <div className="text-xs font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                                  {t('tasks.meta.purposes')}:
                                </div>
                                <ul className="text-xs text-muted-foreground list-disc list-inside space-y-0.5 ml-2">
                                  {task.purposes.map((purpose, index) => (
                                    <li key={index} className="leading-relaxed">{purpose}</li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Requirements */}
                            {task.requirements && task.requirements.length > 0 && (
                              <div className="space-y-1">
                                <div className="text-xs font-medium text-orange-600 dark:text-orange-400 flex items-center gap-1">
                                  {t('tasks.meta.requirements')}:
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {task.requirements.join(', ')}
                                </div>
                              </div>
                            )}

                            {/* Leverage */}
                            {task.leverage && (
                              <div className="space-y-1">
                                <div className="text-xs font-medium text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                                  {t('tasks.meta.leverage')}:
                                </div>
                                <div className="text-xs text-cyan-900 dark:text-cyan-100 bg-cyan-50 dark:bg-cyan-950/30 border border-cyan-200 dark:border-cyan-800 rounded px-2 py-1 font-mono">
                                  {task.leverage}
                                </div>
                              </div>
                            )}

                            {/* Prompt */}
                            {task.prompt && (
                              <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                  <div className="text-xs font-medium text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                                    <Bot className="w-3 h-3" />
                                    {t('tasks.meta.prompt', 'AI Prompt')}:
                                  </div>
                                  <button
                                    onClick={() => togglePromptExpansion(task.id)}
                                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 transition-colors"
                                    title={expandedPrompts.has(task.id) ? 'Collapse prompt' : 'Expand prompt'}
                                  >
                                    {expandedPrompts.has(task.id) ? (
                                      <ChevronDown className="w-3 h-3" />
                                    ) : (
                                      <ChevronRight className="w-3 h-3" />
                                    )}
                                  </button>
                                </div>
                                {expandedPrompts.has(task.id) && (
                                  <div className="text-xs text-indigo-900 dark:text-indigo-100 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded px-2 py-1.5 whitespace-pre-wrap break-words">
                                    {task.prompt}
                                  </div>
                                )}
                              </div>
                            )}                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="text-center text-muted-foreground text-sm py-8">
                {t('tasks.loading')}
              </div>
            )
          ) : (
            <div className="text-center text-muted-foreground text-sm py-8">
              {specs.length === 0 ? t('tasks.noSpecs') : t('tasks.selectSpec')}
            </div>
          )}
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-3">
          <LogsPage
            specs={specs}
            selectedSpec={selectedSpec}
            onSpecChange={(spec) => {
              setSelectedSpec(spec);
              vscodeApi.setSelectedSpec(spec);
            }}
          />
        </TabsContent>

        {/* Approvals Tab */}
        <TabsContent value="approvals" className="space-y-3 relative">
          <div className="space-y-3">
            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">{t('approvals.docLabel')}:</label>
              <Select value={selectedApprovalCategory} onValueChange={setSelectedApprovalCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('approvals.categoryPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {approvalCategories.map(category => (
                    <SelectItem key={category.value} value={category.value}>
                      <div className="flex items-center justify-between w-full">
                        <span>{category.label}</span>
                        {category.count > 0 && (
                          <Badge
                            variant="secondary"
                            className="ml-2 h-4 w-4 p-0 text-xs flex items-center justify-center rounded-full min-w-[16px]"
                          >
                            {category.count}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Selection Mode Header */}
            {selectedApprovalCategory && (() => {
              const pendingApprovals = selectedApprovalCategory === 'all'
                ? approvals.filter(approval => approval.status === 'pending')
                : approvals.filter(approval =>
                    approval.status === 'pending' && approval.categoryName === selectedApprovalCategory
                  );

              if (pendingApprovals.length === 0) {return null;}

              const allSelected = pendingApprovals.length > 0 &&
                pendingApprovals.every(a => selectedApprovalIds.has(a.id));
              const someSelected = pendingApprovals.some(a => selectedApprovalIds.has(a.id));

              return (
                <div className="flex items-center justify-between p-2 bg-muted rounded-md">
                  <div className="flex items-center gap-2">
                    {selectionMode && (
                      <button
                        onClick={() => selectAllApprovals(pendingApprovals.map(a => a.id))}
                        className="flex items-center justify-center w-4 h-4 rounded border border-gray-400 hover:border-primary transition-colors"
                        title={allSelected ? t('approvals.deselectAll') : t('approvals.selectAll')}
                      >
                        {allSelected ? (
                          <Check className="w-3 h-3 text-primary" />
                        ) : someSelected ? (
                          <Minus className="w-3 h-3 text-primary" />
                        ) : null}
                      </button>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {selectionMode
                        ? t('approvals.selectedCount', { count: selectedApprovalIds.size })
                        : t('approvals.pendingCount', { count: pendingApprovals.length })
                      }
                    </span>
                  </div>
                  <Button
                    variant={selectionMode ? 'outline' : 'secondary'}
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={toggleSelectionMode}
                  >
                    {selectionMode ? (
                      <>
                        <X className="w-3 h-3 mr-1" />
                        {t('approvals.cancel')}
                      </>
                    ) : (
                      <>
                        <Square className="w-3 h-3 mr-1" />
                        {t('approvals.select')}
                      </>
                    )}
                  </Button>
                </div>
              );
            })()}
          </div>

          {selectedApprovalCategory ? (
            (() => {
              // Filter approvals based on selected category
              const pendingApprovals = selectedApprovalCategory === 'all'
                ? approvals.filter(approval => approval.status === 'pending')
                : approvals.filter(approval =>
                    approval.status === 'pending' && approval.categoryName === selectedApprovalCategory
                  );

              return pendingApprovals.length > 0 ? (
                <div className={cn("space-y-2", selectionMode && selectedApprovalIds.size > 0 && "pb-16")}>
                  {pendingApprovals.map(approval => {
                    const isSelected = selectedApprovalIds.has(approval.id);

                    return (
                      <Card
                        key={approval.id}
                        className={cn(
                          "transition-colors cursor-pointer",
                          selectionMode && isSelected && "border-primary bg-primary/5"
                        )}
                        onClick={selectionMode ? () => toggleApprovalSelection(approval.id) : undefined}
                      >
                        <CardContent className="p-3">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              {/* Selection Checkbox */}
                              {selectionMode && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleApprovalSelection(approval.id);
                                  }}
                                  className={cn(
                                    "flex items-center justify-center w-4 h-4 rounded border transition-colors flex-shrink-0",
                                    isSelected
                                      ? "bg-primary border-primary"
                                      : "border-gray-400 hover:border-primary"
                                  )}
                                >
                                  {isSelected && <Check className="w-3 h-3 text-white" />}
                                </button>
                              )}
                              <div className="flex items-center justify-between flex-1 min-w-0">
                                <h3 className="font-medium text-sm truncate">{approval.title}</h3>
                                <Badge variant="secondary" className="text-xs flex-shrink-0 ml-2">
                                  {t('approvals.status.pending')}
                                </Badge>
                              </div>
                            </div>
                            {approval.description && (
                              <p className="text-xs text-muted-foreground">{approval.description}</p>
                            )}
                            {approval.filePath && (
                              <p className="text-xs text-muted-foreground font-mono truncate">
                                {approval.filePath}
                              </p>
                            )}
                            <div className="text-xs text-muted-foreground">
                              {t('approvals.created', { time: formatDistanceToNow(approval.createdAt) })}
                            </div>

                            {/* Individual action buttons - hidden in selection mode */}
                            {!selectionMode && (
                              <div className="flex gap-1 flex-wrap">
                                <Button
                                  size="sm"
                                  className="h-6 px-2 text-xs"
                                  disabled={processingApproval === approval.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setProcessingApproval(approval.id);
                                    vscodeApi.approveRequest(approval.id, t('approvals.response.approved'));
                                    setTimeout(() => setProcessingApproval(null), 2000);
                                  }}
                                >
                                  {processingApproval === approval.id ? t('approvals.processing') : t('approvals.approve')}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-6 px-2 text-xs"
                                  disabled={processingApproval === approval.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setProcessingApproval(approval.id);
                                    vscodeApi.rejectRequest(approval.id, t('approvals.response.rejected'));
                                    setTimeout(() => setProcessingApproval(null), 2000);
                                  }}
                                >
                                  {processingApproval === approval.id ? t('approvals.processing') : t('approvals.reject')}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-6 px-2 text-xs"
                                  disabled={processingApproval === approval.id}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setProcessingApproval(approval.id);
                                    vscodeApi.requestRevisionRequest(approval.id, t('approvals.response.needsRevision'));
                                    setTimeout(() => setProcessingApproval(null), 2000);
                                  }}
                                >
                                  {processingApproval === approval.id ? t('approvals.processing') : t('approvals.requestRevision')}
                                </Button>
                                {approval.filePath && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      vscodeApi.getApprovalContent(approval.id);
                                    }}
                                  >
                                    {t('approvals.openInEditor')}
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-muted-foreground text-sm py-8">
                  {t('approvals.noPending')}
                </div>
              );
            })()
          ) : (
            <div className="text-center text-muted-foreground text-sm py-8">
              {approvalCategories.length <= 1 ? t('approvals.noPendingDocuments') : t('approvals.selectCategory')}
            </div>
          )}

          {/* Sticky Footer for Batch Actions - Vertical Stack Design */}
          {selectionMode && selectedApprovalIds.size > 0 && (
            <div className="fixed bottom-0 left-0 right-0 p-3 bg-background border-t shadow-lg z-10">
              {/* Header row with count and clear */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted-foreground">
                  {t('approvals.selectedCount', { count: selectedApprovalIds.size })}
                </span>
                <button
                  className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                  onClick={() => setSelectedApprovalIds(new Set())}
                  disabled={batchProcessing}
                >
                  {t('approvals.clearSelection')}
                </button>
              </div>

              {/* Vertical stack of action buttons */}
              <div className="flex flex-col gap-1.5">
                {/* Approve - safe action first */}
                <Button
                  size="sm"
                  className="w-full h-7 text-xs justify-start bg-green-600 hover:bg-green-700"
                  disabled={batchProcessing}
                  onClick={handleBatchApprove}
                >
                  <Check className="w-3.5 h-3.5 mr-2 flex-shrink-0" aria-hidden="true" />
                  {batchProcessing ? t('approvals.processing') : t('approvals.approveAllCount', { count: selectedApprovalIds.size })}
                </Button>

                {/* Revise - secondary action */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-7 text-xs justify-start border-amber-400 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/30"
                  disabled={batchProcessing}
                  onClick={handleBatchRevision}
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-2 flex-shrink-0" aria-hidden="true" />
                  {batchProcessing ? t('approvals.processing') : t('approvals.revisionAllCount', { count: selectedApprovalIds.size })}
                </Button>

                {/* Reject - destructive action last */}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-7 text-xs justify-start border-red-400 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30"
                  disabled={batchProcessing}
                  onClick={handleBatchReject}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-2 flex-shrink-0" aria-hidden="true" />
                  {batchProcessing ? t('approvals.processing') : t('approvals.rejectAllCount', { count: selectedApprovalIds.size })}
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Specs Tab */}
        <TabsContent value="specs" className="space-y-3">
          <div className="space-y-3">
            {/* Sub-navigation for Active/Archived */}
            <div className="flex items-center justify-center">
              <div className="inline-flex items-center space-x-1 p-1 bg-muted rounded-md">
                <Button
                  variant={archiveView === 'active' ? 'default' : 'ghost'}
                  size="sm"
                  className={cn(
                    "h-7 px-3 text-xs font-medium transition-all",
                    archiveView === 'active' 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "hover:bg-muted-foreground/10"
                  )}
                  onClick={() => {
                    setArchiveView('active');
                    setSelectedArchivedSpec(null);
                  }}
                >
                  {t('specs.active')}
                </Button>
                <Button
                  variant={archiveView === 'archived' ? 'default' : 'ghost'}
                  size="sm"
                  className={cn(
                    "h-7 px-3 text-xs font-medium transition-all",
                    archiveView === 'archived' 
                      ? "bg-primary text-primary-foreground shadow-sm" 
                      : "hover:bg-muted-foreground/10"
                  )}
                  onClick={() => {
                    setArchiveView('archived');
                    setSelectedSpec(null);
                  }}
                >
                  {t('specs.archived')}
                </Button>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">{t('specs.specLabel')}:</label>
              <Select 
                value={archiveView === 'active' ? (selectedSpec || '') : (selectedArchivedSpec || '')} 
                onValueChange={archiveView === 'active' ? handleSpecSelect : setSelectedArchivedSpec}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t('specs.specPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {archiveView === 'active' 
                    ? specs.filter(spec => !spec.isArchived).map(spec => (
                        <SelectItem key={spec.name} value={spec.name}>
                          {spec.displayName}
                        </SelectItem>
                      ))
                    : archivedSpecs.map(spec => (
                        <SelectItem key={spec.name} value={spec.name}>
                          {spec.displayName}
                        </SelectItem>
                      ))
                  }
                </SelectContent>
              </Select>
              
              {/* Context-appropriate action button */}
              {archiveView === 'active' && selectedSpec && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-xs whitespace-nowrap"
                  onClick={() => vscodeApi.archiveSpec(selectedSpec)}
                >
                  {t('specs.archive')}
                </Button>
              )}
              
              {archiveView === 'archived' && selectedArchivedSpec && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 text-xs whitespace-nowrap"
                  onClick={() => vscodeApi.unarchiveSpec(selectedArchivedSpec)}
                >
                  {t('specs.unarchive')}
                </Button>
              )}
            </div>
          </div>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">{t('specs.docsTitle')}</CardTitle>
            </CardHeader>
            <CardContent>
              {(archiveView === 'active' ? selectedSpec : selectedArchivedSpec) && (
                <div className="space-y-2">
                  {specDocuments.length > 0 ? (
                    specDocuments.map((doc) => (
                      <div key={doc.name} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex-1 space-y-1">
                          <div className="font-medium text-sm"><span className="capitalize">{doc.name}</span>.md</div>
                          {doc.exists && doc.lastModified && (
                            <div className="text-xs text-muted-foreground">
                              {t('specs.modified', { time: formatDistanceToNow(doc.lastModified) })}
                            </div>
                          )}
                          {!doc.exists && (
                            <div className="text-xs text-muted-foreground">
                              {t('specs.fileNotFound')}
                            </div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          className="h-6 px-2 text-xs"
                          disabled={!doc.exists}
                          onClick={() => vscodeApi.openDocument(
                            archiveView === 'active' ? selectedSpec! : selectedArchivedSpec!, 
                            doc.name
                          )}
                        >
                          {t('specs.open')}
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-muted-foreground text-sm py-8">
                      {t('specs.noDocs')}
                    </div>
                  )}
                </div>
              )}
              {!(archiveView === 'active' ? selectedSpec : selectedArchivedSpec) && (
                <div className="text-center text-muted-foreground text-sm py-8">
                  {archiveView === 'active' 
                    ? (specs.filter(spec => !spec.isArchived).length === 0 ? t('specs.noActiveSpecs') : t('specs.selectSpec'))
                    : (archivedSpecs.length === 0 ? t('specs.noArchivedSpecs') : t('specs.selectSpec'))
                  }
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Steering Tab */}
        <TabsContent value="steering" className="space-y-3">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{t('steering.title')}</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={copySteeringInstructions}
                  title={copiedSteering ? t('steering.copied') : t('steering.copyInstructions')}
                >
                  <Copy className="h-3 w-3 mr-1" />
                  {copiedSteering ? t('steering.copied') : t('steering.copyInstructions')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {steeringDocuments.length > 0 ? (
                  steeringDocuments.map((doc) => (
                    <div key={doc.name} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex-1 space-y-1">
                        <div className="font-medium text-sm"><span className="capitalize">{doc.name}</span>.md</div>
                        {doc.exists && doc.lastModified && (
                          <div className="text-xs text-muted-foreground">
                            {t('steering.modified', { time: formatDistanceToNow(doc.lastModified) })}
                          </div>
                        )}
                        {!doc.exists && (
                          <div className="text-xs text-muted-foreground">
                            {t('steering.fileNotFound')}
                          </div>
                        )}
                      </div>
                      <Button
                        size="sm"
                        className="h-6 px-2 text-xs"
                        disabled={!doc.exists}
                        onClick={() => vscodeApi.openSteeringDocument(doc.name)}
                      >
                        {t('steering.open')}
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    {t('steering.noDocs')}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        </div>

        {/* Scroll to Top FAB */}
        {showScrollTop && (
          <Button
            className="fixed bottom-4 right-4 z-20 rounded-full w-10 h-10 p-0 shadow-lg"
            onClick={scrollToTop}
            title={t('common.scrollToTop')}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        )}

        {/* Undo Toast */}
        {showUndoToast && lastBatchOperation && (
          <div
            role="alert"
            aria-live="polite"
            className="fixed bottom-16 left-2 right-2 z-50 bg-foreground text-background rounded-lg shadow-lg overflow-hidden mx-auto max-w-[95%]"
          >
            {/* Progress bar for countdown */}
            <div className="h-1 bg-background/30">
              <div
                className="h-full bg-primary animate-[shrink_30s_linear]"
                style={{ animation: 'shrink 30s linear forwards' }}
              />
            </div>
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-400 flex-shrink-0" aria-hidden="true" />
                <span className="text-sm">
                  {lastBatchOperation.action === 'approve' && t('approvals.batch.undoApproved', { count: lastBatchOperation.ids.length })}
                  {lastBatchOperation.action === 'reject' && t('approvals.batch.undoRejected', { count: lastBatchOperation.ids.length })}
                  {lastBatchOperation.action === 'revision' && t('approvals.batch.undoRevision', { count: lastBatchOperation.ids.length })}
                </span>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  size="sm"
                  className="h-7 px-2 text-xs bg-background/20 hover:bg-background/30 text-background border border-background/40"
                  onClick={handleUndo}
                >
                  <Undo2 className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
                  {t('approvals.batch.undo')}
                </Button>
                <button
                  onClick={() => {
                    setShowUndoToast(false);
                    setLastBatchOperation(null);
                    if (undoTimeoutRef.current) {
                      clearTimeout(undoTimeoutRef.current);
                      undoTimeoutRef.current = null;
                    }
                  }}
                  className="p-1 hover:bg-background/20 rounded"
                  aria-label={t('common.dismiss')}
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Batch Reject Feedback Modal */}
        {batchRejectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setBatchRejectModalOpen(false)}
            />
            {/* Modal */}
            <div className="relative bg-background border rounded-lg shadow-lg p-4 w-[90%] max-w-md mx-4">
              <h3 className="text-sm font-semibold mb-3">
                {t('approvals.batch.rejectTitle', { count: selectedApprovalIds.size })}
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                {t('approvals.batch.rejectDescription')}
              </p>
              <textarea
                className="w-full h-24 p-2 text-sm border rounded bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={t('approvals.batch.rejectPlaceholder')}
                value={batchRejectFeedback}
                onChange={(e) => setBatchRejectFeedback(e.target.value)}
                autoFocus
              />
              <div className="flex justify-end gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setBatchRejectModalOpen(false)}
                >
                  {t('approvals.cancel')}
                </Button>
                <Button
                  size="sm"
                  className="bg-red-600 hover:bg-red-700"
                  onClick={handleBatchRejectWithFeedback}
                  disabled={!batchRejectFeedback.trim()}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" />
                  {t('approvals.batch.confirmReject')}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Tabs>
    </div>
  );
}

export default App;