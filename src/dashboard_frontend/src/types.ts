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
