// Shared types between extension and webview
export interface SpecData {
  name: string;
  displayName: string;
  description?: string;
  createdAt: string;
  lastModified: string;
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
  isArchived?: boolean;
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
  lineNumber?: number;                 // Line number in the file (0-based)
  indentLevel?: number;                // Indentation level (for hierarchy)
  
  // Optional metadata
  files?: string[];                    // Files to modify/create
  implementationDetails?: string[];    // Implementation bullet points
  requirements?: string[];             // Referenced requirements
  leverage?: string;                   // Code to leverage
  purposes?: string[];                 // Purpose statements
  prompt?: string;                     // AI prompt for this task
  promptStructured?: PromptSection[];  // Structured prompt sections  
  // For backward compatibility
  inProgress?: boolean;                // true if status === 'in-progress'
}

export type TaskStatus = 'pending' | 'in-progress' | 'completed';

export interface HighlightColor {
  bg: string;
  border: string;
  name: string;
}

export interface ApprovalComment {
  id: string;
  text: string;
  // Support for multi-line selections
  startLine?: number;
  endLine?: number;
  selectedText?: string;
  highlightColor?: HighlightColor;
  // Backward compatibility - single line number (deprecated)
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
  category: 'spec' | 'steering';
  categoryName: string; // spec or steering document name
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

export interface LogsData {
  specName: string;
  entries: ImplementationLogEntry[];
  stats: {
    totalEntries: number;
    totalLinesAdded: number;
    totalLinesRemoved: number;
    totalFilesChanged: number;
  };
}