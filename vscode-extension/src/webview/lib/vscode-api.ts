// VSCode API types and utilities for webview communication

declare global {
  interface Window {
    acquireVsCodeApi?: () => VsCodeApi;
  }
}

interface VsCodeApi {
  postMessage(message: any): void;
  setState(state: any): void;
  getState(): any;
}

// Message types for communication between extension and webview
export type ExtensionMessage =
  | { type: 'specs-updated'; data: SpecData[] }
  | { type: 'tasks-updated'; data: TaskProgressData }
  | { type: 'approvals-updated'; data: ApprovalData[] }
  | { type: 'steering-updated'; data: SteeringStatus }
  | { type: 'spec-documents-updated'; data: DocumentInfo[] }
  | { type: 'steering-documents-updated'; data: DocumentInfo[] }
  | { type: 'selected-spec-updated'; data: string }
  | { type: 'config-updated'; data: SoundNotificationConfig }
  | { type: 'sound-uris-updated'; data: { [key: string]: string } }
  | { type: 'navigate-to-approvals'; data: { specName: string; approvalId: string } }
  | { type: 'archived-specs-updated'; data: SpecData[] }
  | { type: 'approval-categories-updated'; data: { value: string; label: string; count: number }[] }
  | { type: 'language-preference-updated'; data: string }
  | { type: 'logs-updated'; data: any }
  | { type: 'logs-search-results'; data: any }
  | { type: 'error'; message: string }
  | { type: 'notification'; message: string; level: 'info' | 'warning' | 'error' | 'success' };

export type WebviewMessage =
  | { type: 'get-specs' }
  | { type: 'get-tasks'; specName: string }
  | { type: 'get-approvals' }
  | { type: 'get-steering' }
  | { type: 'get-spec-documents'; specName: string }
  | { type: 'get-steering-documents' }
  | { type: 'open-document'; specName: string; docType: string }
  | { type: 'open-steering-document'; docType: string }
  | { type: 'update-task-status'; specName: string; taskId: string; status: TaskStatus }
  | { type: 'save-document'; specName: string; docType: string; content: string }
  | { type: 'approve-request'; id: string; response: string }
  | { type: 'reject-request'; id: string; response: string }
  | { type: 'request-revision-request'; id: string; response: string; annotations?: string; comments?: any[] }
  | { type: 'get-approval-content'; id: string }
  | { type: 'get-selected-spec' }
  | { type: 'set-selected-spec'; specName: string }
  | { type: 'get-config' }
  | { type: 'refresh-all' }
  | { type: 'get-archived-specs' }
  | { type: 'archive-spec'; specName: string }
  | { type: 'unarchive-spec'; specName: string }
  | { type: 'get-approval-categories' }
  | { type: 'get-language-preference' }
  | { type: 'set-language-preference'; language: string }
  | { type: 'open-external-url'; url: string }
  | { type: 'get-logs'; specName: string }
  | { type: 'search-logs'; specName: string; query: string };

export type TaskStatus = 'pending' | 'in-progress' | 'completed';

export interface SpecData {
  name: string;
  displayName: string;
  description?: string;
  createdAt: string;
  lastModified: string;
  isArchived?: boolean;
  phases: {
    requirements: PhaseStatus;
    design: PhaseStatus;
    tasks: PhaseStatus;
    implementation: PhaseStatus;
  };
  taskProgress?: {
    total: number;
    completed: number;
    pending: number;
  };
}

export interface PhaseStatus {
  exists: boolean;
  approved?: boolean;
  lastModified?: string;
  content?: string;
}

export interface TaskProgressData {
  specName: string;
  total: number;
  completed: number;
  progress: number;
  taskList: TaskInfo[];
  inProgress?: string;
}

export interface PromptSection {
  key: string;
  value: string;
}

export interface TaskInfo {
  id: string;
  description: string;
  status: TaskStatus;
  completed: boolean;
  isHeader?: boolean;
  files?: string[];
  implementationDetails?: string[];
  requirements?: string[];
  leverage?: string;
  purposes?: string[];
  prompt?: string;
  promptStructured?: PromptSection[];
  inProgress?: boolean; // For backward compatibility
}
export interface ApprovalComment {
  id: string;
  text: string;
  lineNumber?: number;
  timestamp: string;
  resolved?: boolean;
}

export interface ApprovalData {
  id: string;
  title: string;
  description?: string;
  filePath: string; // Path to the file to be reviewed
  type: 'document' | 'action';
  status: 'pending' | 'approved' | 'rejected' | 'needs-revision';
  createdAt: string;
  respondedAt?: string;
  response?: string;
  annotations?: string;
  comments?: ApprovalComment[];
  revisionHistory?: {
    version: number;
    content: string;
    timestamp: string;
    reason?: string;
  }[];
  metadata?: Record<string, any>;
  category: 'spec';
  categoryName: string; // spec name
}

export interface SteeringStatus {
  exists: boolean;
  documents: {
    product: boolean;
    tech: boolean;
    structure: boolean;
  };
  lastModified?: string;
}

export interface DocumentInfo {
  name: string;
  exists: boolean;
  path: string;
  lastModified?: string;
}

export interface SoundNotificationConfig {
  enabled: boolean;
  volume: number;
  approvalSound: boolean;
  taskCompletionSound: boolean;
}

// Implementation Log Types
export interface LogStatistics {
  linesAdded: number;
  linesRemoved: number;
  filesChanged: number;
}

export interface ApiEndpoint {
  method: string;
  path: string;
  purpose: string;
  requestFormat?: string;
  responseFormat?: string;
  location: string;
}

export interface ComponentInfo {
  name: string;
  type: string;
  purpose: string;
  props?: string;
  exports?: string[];
  location: string;
}

export interface FunctionInfo {
  name: string;
  purpose: string;
  signature?: string;
  isExported: boolean;
  location: string;
}

export interface ClassInfo {
  name: string;
  purpose: string;
  methods?: string[];
  isExported: boolean;
  location: string;
}

export interface Integration {
  description: string;
  frontendComponent: string;
  backendEndpoint: string;
  dataFlow: string;
}

export interface LogArtifacts {
  apiEndpoints?: ApiEndpoint[];
  components?: ComponentInfo[];
  functions?: FunctionInfo[];
  classes?: ClassInfo[];
  integrations?: Integration[];
}

export interface ImplementationLogEntry {
  id: string;
  taskId: string;
  timestamp: string;
  summary: string;
  filesModified: string[];
  filesCreated: string[];
  statistics: LogStatistics;
  artifacts: LogArtifacts;
}

class VsCodeApiService {
  private api: VsCodeApi | null = null;
  private messageListeners: Map<string, Set<(data: any) => void>> = new Map();

  constructor() {
    // Get the VSCode API
    if (window.acquireVsCodeApi) {
      this.api = window.acquireVsCodeApi();
    }

    // Listen for messages from the extension
    window.addEventListener('message', (event) => {
      const message = event.data as ExtensionMessage;
      this.notifyListeners(message.type, message);
    });
  }

  // Send message to extension
  postMessage(message: WebviewMessage) {
    if (this.api) {
      this.api.postMessage(message);
    } else {
      console.warn('VSCode API not available, message not sent:', message);
    }
  }

  // Subscribe to messages from extension
  onMessage(type: string, callback: (data: any) => void) {
    if (!this.messageListeners.has(type)) {
      this.messageListeners.set(type, new Set());
    }
    this.messageListeners.get(type)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.messageListeners.get(type)?.delete(callback);
    };
  }

  private notifyListeners(type: string, message: ExtensionMessage) {
    const listeners = this.messageListeners.get(type);
    if (listeners) {
      listeners.forEach(callback => callback(message));
    }
  }

  // State management
  setState(state: any) {
    if (this.api) {
      this.api.setState(state);
    }
  }

  getState(): any {
    if (this.api) {
      return this.api.getState();
    }
    return null;
  }

  // Convenience methods for common operations
  refreshAll() {
    this.postMessage({ type: 'refresh-all' });
  }

  getSpecs() {
    this.postMessage({ type: 'get-specs' });
  }

  getTasks(specName: string) {
    this.postMessage({ type: 'get-tasks', specName });
  }

  updateTaskStatus(specName: string, taskId: string, status: TaskStatus) {
    this.postMessage({ type: 'update-task-status', specName, taskId, status });
  }

  saveDocument(specName: string, docType: string, content: string) {
    this.postMessage({ type: 'save-document', specName, docType, content });
  }

  getApprovals() {
    this.postMessage({ type: 'get-approvals' });
  }

  getApprovalCategories() {
    this.postMessage({ type: 'get-approval-categories' });
  }

  approveRequest(id: string, response: string) {
    this.postMessage({ type: 'approve-request', id, response });
  }

  rejectRequest(id: string, response: string) {
    this.postMessage({ type: 'reject-request', id, response });
  }

  requestRevisionRequest(id: string, response: string, annotations?: string, comments?: any[]) {
    this.postMessage({ type: 'request-revision-request', id, response, annotations, comments });
  }

  getApprovalContent(id: string) {
    this.postMessage({ type: 'get-approval-content', id });
  }

  getSteering() {
    this.postMessage({ type: 'get-steering' });
  }

  getSpecDocuments(specName: string) {
    this.postMessage({ type: 'get-spec-documents', specName });
  }

  getSteeringDocuments() {
    this.postMessage({ type: 'get-steering-documents' });
  }

  openDocument(specName: string, docType: string) {
    this.postMessage({ type: 'open-document', specName, docType });
  }

  openSteeringDocument(docType: string) {
    this.postMessage({ type: 'open-steering-document', docType });
  }

  getSelectedSpec() {
    this.postMessage({ type: 'get-selected-spec' });
  }

  setSelectedSpec(specName: string) {
    this.postMessage({ type: 'set-selected-spec', specName });
  }

  getConfig() {
    this.postMessage({ type: 'get-config' });
  }

  // Archive methods
  getArchivedSpecs() {
    this.postMessage({ type: 'get-archived-specs' });
  }

  archiveSpec(specName: string) {
    this.postMessage({ type: 'archive-spec', specName });
  }

  unarchiveSpec(specName: string) {
    this.postMessage({ type: 'unarchive-spec', specName });
  }

  openExternalUrl(url: string) {
    this.postMessage({ type: 'open-external-url', url });
  }

  getLanguagePreference() {
    this.postMessage({ type: 'get-language-preference' });
  }

  setLanguagePreference(language: string) {
    this.postMessage({ type: 'set-language-preference', language });
  }

  // Log methods
  getLogs(specName: string) {
    this.postMessage({ type: 'get-logs', specName });
  }

  searchLogs(specName: string, query: string) {
    this.postMessage({ type: 'search-logs', specName, query });
  }
}

// Export singleton instance
export const vscodeApi = new VsCodeApiService();