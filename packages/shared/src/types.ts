// ============================================================================
// Shared Types — used by both server (Node.js) and dashboard (browser)
// ============================================================================

// ---- Automation ----

export interface AutomationJob {
  id: string;
  name: string;
  type: 'cleanup-approvals' | 'cleanup-specs' | 'cleanup-archived-specs';
  enabled: boolean;
  config: {
    daysOld: number;
  };
  schedule: string;
  lastRun?: string;
  nextRun?: string;
  createdAt: string;
}

// ---- Spec Data ----

export interface PhaseStatus {
  exists: boolean;
  approved?: boolean;
  lastModified?: string;
  content?: string;
}

export interface SpecData {
  name: string;
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

// ---- Tasks ----

export interface PromptSection {
  key: string;
  value: string;
}

export interface TaskInfo {
  id: string;
  description: string;
  leverage?: string;
  requirements?: string;
  completed: boolean;
  details?: string[];
  prompt?: string;
  promptStructured?: PromptSection[];
}

// ---- Implementation Logs ----

export interface ImplementationLogEntry {
  id: string;
  taskId: string;
  timestamp: string;
  summary: string;
  filesModified: string[];
  filesCreated: string[];
  statistics: {
    linesAdded: number;
    linesRemoved: number;
    filesChanged: number;
  };
  artifacts: {
    apiEndpoints?: Array<{
      method: string;
      path: string;
      purpose: string;
      requestFormat?: string;
      responseFormat?: string;
      location: string;
    }>;
    components?: Array<{
      name: string;
      type: string;
      purpose: string;
      location: string;
      props?: string;
      exports?: string[];
    }>;
    functions?: Array<{
      name: string;
      purpose: string;
      location: string;
      signature?: string;
      isExported: boolean;
    }>;
    classes?: Array<{
      name: string;
      purpose: string;
      location: string;
      methods?: string[];
      isExported: boolean;
    }>;
    integrations?: Array<{
      description: string;
      frontendComponent: string;
      backendEndpoint: string;
      dataFlow: string;
    }>;
  };
}

export interface ImplementationLog {
  entries: ImplementationLogEntry[];
  lastUpdated?: string;
}

// ---- Tool Response (server-side only, but types are pure) ----

export interface ToolResponse {
  success: boolean;
  message: string;
  data?: any;
  nextSteps?: string[];
  projectContext?: {
    projectPath: string;
    workflowRoot: string;
    specName?: string;
    currentPhase?: string;
    dashboardUrl?: string;
  };
}

export interface MCPToolResponse {
  content: Array<{
    type: "text";
    text: string;
  }>;
  isError?: boolean;
  _meta?: Record<string, any>;
}
