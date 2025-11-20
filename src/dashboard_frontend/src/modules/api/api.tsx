import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import { useWs } from '../ws/WebSocketProvider';
import { ImplementationLogEntry } from '../../types';

export type SpecSummary = {
  name: string;
  displayName: string;
  status?: string;
  lastModified?: string;
  taskProgress?: { total: number; completed: number };
  phases?: any;
};

export type Approval = {
  id: string;
  title: string;
  status: string;
  type?: string;
  filePath?: string;
  content?: string;
  createdAt?: string;
};

export type ProjectInfo = {
  projectName: string;
  steering?: any;
  version?: string;
};

export interface DocumentSnapshot {
  id: string;
  approvalId: string;
  approvalTitle: string;
  version: number;
  timestamp: string;
  trigger: 'initial' | 'revision_requested' | 'approved' | 'manual';
  status: 'pending' | 'approved' | 'rejected' | 'needs-revision';
  content: string;
  fileStats: {
    size: number;
    lines: number;
    lastModified: string;
  };
  comments?: any[];
  annotations?: string;
}

export interface DiffResult {
  additions: number;
  deletions: number;
  changes: number;
  chunks: DiffChunk[];
}

export interface DiffChunk {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: DiffLine[];
}

export interface DiffLine {
  type: 'add' | 'delete' | 'normal';
  oldLineNumber?: number;
  newLineNumber?: number;
  content: string;
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
  return res.json();
}

async function postJson(url: string, body: any) {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return { ok: res.ok, status: res.status };
}

async function putJson(url: string, body: any) {
  const res = await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return { ok: res.ok, status: res.status, data: res.ok ? await res.json() : null };
}

// Split into two contexts to prevent unnecessary re-renders
// Data context contains state that changes frequently
type ApiDataContextType = {
  specs: SpecSummary[];
  archivedSpecs: SpecSummary[];
  approvals: Approval[];
  info?: ProjectInfo;
  steeringDocuments?: any;
  projectId: string | null;
};

// Actions context contains stable functions that rarely change
type ApiActionsContextType = {
  reloadAll: () => Promise<void>;
  getAllSpecDocuments: (name: string) => Promise<Record<string, { content: string; lastModified: string } | null>>;
  getAllArchivedSpecDocuments: (name: string) => Promise<Record<string, { content: string; lastModified: string } | null>>;
  getSpecTasksProgress: (name: string) => Promise<any>;
  updateTaskStatus: (specName: string, taskId: string, status: 'pending' | 'in-progress' | 'completed') => Promise<{ ok: boolean; status: number; data?: any }>;
  approvalsAction: (id: string, action: 'approve' | 'reject' | 'needs-revision', payload: any) => Promise<{ ok: boolean; status: number }>;
  getApprovalContent: (id: string) => Promise<{ content: string; filePath?: string }>;
  getApprovalSnapshots: (id: string) => Promise<DocumentSnapshot[]>;
  getApprovalSnapshot: (id: string, version: number) => Promise<DocumentSnapshot>;
  getApprovalDiff: (id: string, fromVersion: number, toVersion?: number | 'current') => Promise<DiffResult>;
  captureApprovalSnapshot: (id: string) => Promise<{ success: boolean; message: string }>;
  saveSpecDocument: (name: string, document: string, content: string) => Promise<{ ok: boolean; status: number }>;
  saveArchivedSpecDocument: (name: string, document: string, content: string) => Promise<{ ok: boolean; status: number }>;
  archiveSpec: (name: string) => Promise<{ ok: boolean; status: number }>;
  unarchiveSpec: (name: string) => Promise<{ ok: boolean; status: number }>;
  getSteeringDocument: (name: string) => Promise<{ content: string; lastModified: string }>;
  saveSteeringDocument: (name: string, content: string) => Promise<{ ok: boolean; status: number }>;
  addImplementationLog: (specName: string, logData: any) => Promise<{ ok: boolean; status: number; data?: any }>;
  getImplementationLogs: (specName: string, query?: { taskId?: string; search?: string }) => Promise<{ entries: ImplementationLogEntry[] }>;
  getImplementationLogStats: (specName: string, taskId: string) => Promise<any>;
  getChangelog: (version: string) => Promise<{ content: string }>;
};

const ApiDataContext = createContext<ApiDataContextType | undefined>(undefined);
const ApiActionsContext = createContext<ApiActionsContextType | undefined>(undefined);

interface ApiProviderProps {
  initial?: { specs?: SpecSummary[]; archivedSpecs?: SpecSummary[]; approvals?: Approval[] };
  projectId: string | null;
  children: React.ReactNode;
}

export function ApiProvider({ initial, projectId, children }: ApiProviderProps) {
  const { subscribe, unsubscribe } = useWs();
  const [specs, setSpecs] = useState<SpecSummary[]>(initial?.specs || []);
  const [archivedSpecs, setArchivedSpecs] = useState<SpecSummary[]>(initial?.archivedSpecs || []);
  const [approvals, setApprovals] = useState<Approval[]>(initial?.approvals || []);
  const [info, setInfo] = useState<ProjectInfo | undefined>(undefined);
  const [steeringDocuments, setSteeringDocuments] = useState<any>(undefined);

  const reloadAll = useCallback(async () => {
    if (!projectId) return;

    const [s, as, a, i] = await Promise.all([
      getJson<SpecSummary[]>(`/api/projects/${encodeURIComponent(projectId)}/specs`),
      getJson<SpecSummary[]>(`/api/projects/${encodeURIComponent(projectId)}/specs/archived`),
      getJson<Approval[]>(`/api/projects/${encodeURIComponent(projectId)}/approvals`),
      getJson<ProjectInfo>(`/api/projects/${encodeURIComponent(projectId)}/info`).catch(() => ({ projectName: 'Project' } as ProjectInfo)),
    ]);
    setSpecs(s);
    setArchivedSpecs(as);
    setApprovals(a);
    setInfo(i);
    setSteeringDocuments(i.steering);
  }, [projectId]);

  // Load initial data when projectId changes
  useEffect(() => {
    if (projectId) {
      reloadAll();
    } else {
      // Clear data when no project selected
      setSpecs([]);
      setArchivedSpecs([]);
      setApprovals([]);
      setInfo(undefined);
      setSteeringDocuments(undefined);
    }
  }, [projectId, reloadAll]);

  // Update state when initial websocket data arrives
  useEffect(() => {
    if (initial?.specs) setSpecs(initial.specs);
    if (initial?.archivedSpecs) setArchivedSpecs(initial.archivedSpecs);
    if (initial?.approvals) setApprovals(initial.approvals);
  }, [initial]);

  // Handle websocket updates for real-time data changes
  useEffect(() => {
    const handleSpecUpdate = (data: { specs?: SpecSummary[]; archivedSpecs?: SpecSummary[] }) => {
      // Only update if data actually changed (deep equality check)
      if (data.specs) {
        setSpecs(prevSpecs => {
          // Check if arrays are identical to avoid unnecessary updates
          if (prevSpecs.length !== data.specs!.length) return data.specs!;

          // Check if any spec changed by comparing key properties
          const hasChanges = data.specs!.some((newSpec, index) => {
            const prevSpec = prevSpecs[index];
            return !prevSpec ||
                   prevSpec.name !== newSpec.name ||
                   prevSpec.displayName !== newSpec.displayName ||
                   prevSpec.status !== newSpec.status ||
                   prevSpec.lastModified !== newSpec.lastModified ||
                   JSON.stringify(prevSpec.taskProgress) !== JSON.stringify(newSpec.taskProgress);
          });

          return hasChanges ? data.specs! : prevSpecs;
        });
      }

      if (data.archivedSpecs) {
        setArchivedSpecs(prevArchived => {
          if (prevArchived.length !== data.archivedSpecs!.length) return data.archivedSpecs!;

          const hasChanges = data.archivedSpecs!.some((newSpec, index) => {
            const prevSpec = prevArchived[index];
            return !prevSpec || prevSpec.name !== newSpec.name;
          });

          return hasChanges ? data.archivedSpecs! : prevArchived;
        });
      }
    };

    const handleApprovalUpdate = (data: Approval[]) => {
      setApprovals(prevApprovals => {
        // Only update if approvals changed
        if (prevApprovals.length !== data.length) return data;

        const hasChanges = data.some((newApproval, index) => {
          const prevApproval = prevApprovals[index];
          return !prevApproval ||
                 prevApproval.id !== newApproval.id ||
                 prevApproval.status !== newApproval.status;
        });

        return hasChanges ? data : prevApprovals;
      });
    };

    const handleSteeringUpdate = (data: any) => {
      setSteeringDocuments(prevDocs => {
        // Simple deep equality check for steering documents
        if (JSON.stringify(prevDocs) === JSON.stringify(data)) {
          return prevDocs;
        }
        return data;
      });
    };

    // Subscribe to websocket events that contain actual data
    subscribe('spec-update', handleSpecUpdate);
    subscribe('approval-update', handleApprovalUpdate);
    subscribe('steering-update', handleSteeringUpdate);

    return () => {
      unsubscribe('spec-update', handleSpecUpdate);
      unsubscribe('approval-update', handleApprovalUpdate);
      unsubscribe('steering-update', handleSteeringUpdate);
    };
  }, [subscribe, unsubscribe]);

  // Memoize data context - changes when state updates
  const dataValue = useMemo<ApiDataContextType>(() => ({
    specs,
    archivedSpecs,
    approvals,
    info,
    steeringDocuments,
    projectId,
  }), [specs, archivedSpecs, approvals, info, steeringDocuments, projectId]);

  // Memoize actions context - stable functions that rarely change
  const actionsValue = useMemo<ApiActionsContextType>(() => {
    if (!projectId) {
      // Return empty API functions when no project selected
      return {
        reloadAll: async () => {},
        getAllSpecDocuments: async () => ({}),
        getAllArchivedSpecDocuments: async () => ({}),
        getSpecTasksProgress: async () => ({}),
        updateTaskStatus: async () => ({ ok: false, status: 400 }),
        approvalsAction: async () => ({ ok: false, status: 400 }),
        getApprovalContent: async () => ({ content: '' }),
        getApprovalSnapshots: async () => [],
        getApprovalSnapshot: async () => ({} as any),
        getApprovalDiff: async () => ({} as any),
        captureApprovalSnapshot: async () => ({ success: false, message: 'No project selected' }),
        saveSpecDocument: async () => ({ ok: false, status: 400 }),
        saveArchivedSpecDocument: async () => ({ ok: false, status: 400 }),
        archiveSpec: async () => ({ ok: false, status: 400 }),
        unarchiveSpec: async () => ({ ok: false, status: 400 }),
        getSteeringDocument: async () => ({ content: '', lastModified: '' }),
        saveSteeringDocument: async () => ({ ok: false, status: 400 }),
        addImplementationLog: async () => ({ ok: false, status: 400 }),
        getImplementationLogs: async () => ({ entries: [] }),
        getImplementationLogStats: async () => ({}),
        getChangelog: async () => ({ content: '' }),
      };
    }

    const prefix = `/api/projects/${encodeURIComponent(projectId)}`;

    return {
      reloadAll,
      getAllSpecDocuments: (name: string) => getJson(`${prefix}/specs/${encodeURIComponent(name)}/all`),
      getAllArchivedSpecDocuments: (name: string) => getJson(`${prefix}/specs/${encodeURIComponent(name)}/all/archived`),
      getSpecTasksProgress: (name: string) => getJson(`${prefix}/specs/${encodeURIComponent(name)}/tasks/progress`),
      updateTaskStatus: (specName: string, taskId: string, status: 'pending' | 'in-progress' | 'completed') =>
        putJson(`${prefix}/specs/${encodeURIComponent(specName)}/tasks/${encodeURIComponent(taskId)}/status`, { status }),
      approvalsAction: (id, action, body) => postJson(`${prefix}/approvals/${encodeURIComponent(id)}/${action}`, body),
      getApprovalContent: (id: string) => getJson(`${prefix}/approvals/${encodeURIComponent(id)}/content`),
      getApprovalSnapshots: (id: string) => getJson(`${prefix}/approvals/${encodeURIComponent(id)}/snapshots`),
      getApprovalSnapshot: (id: string, version: number) => getJson(`${prefix}/approvals/${encodeURIComponent(id)}/snapshots/${version}`),
      getApprovalDiff: (id: string, fromVersion: number, toVersion?: number | 'current') => {
        const to = toVersion === undefined ? 'current' : toVersion;
        return getJson(`${prefix}/approvals/${encodeURIComponent(id)}/diff?from=${fromVersion}&to=${to}`);
      },
      captureApprovalSnapshot: (id: string) => postJson(`${prefix}/approvals/${encodeURIComponent(id)}/snapshot`, {}),
      saveSpecDocument: (name: string, document: string, content: string) =>
        putJson(`${prefix}/specs/${encodeURIComponent(name)}/${encodeURIComponent(document)}`, { content }),
      saveArchivedSpecDocument: (name: string, document: string, content: string) =>
        putJson(`${prefix}/specs/${encodeURIComponent(name)}/${encodeURIComponent(document)}/archived`, { content }),
      archiveSpec: (name: string) => postJson(`${prefix}/specs/${encodeURIComponent(name)}/archive`, {}),
      unarchiveSpec: (name: string) => postJson(`${prefix}/specs/${encodeURIComponent(name)}/unarchive`, {}),
      getSteeringDocument: (name: string) => getJson(`${prefix}/steering/${encodeURIComponent(name)}`),
      saveSteeringDocument: (name: string, content: string) => putJson(`${prefix}/steering/${encodeURIComponent(name)}`, { content }),
      addImplementationLog: (specName: string, logData: any) => postJson(`${prefix}/specs/${encodeURIComponent(specName)}/implementation-log`, logData),
      getImplementationLogs: (specName: string, query?: { taskId?: string; search?: string }) => {
        let url = `${prefix}/specs/${encodeURIComponent(specName)}/implementation-log`;
        const params = new URLSearchParams();
        if (query?.taskId) params.append('taskId', query.taskId);
        if (query?.search) params.append('search', query.search);
        if (params.toString()) url += `?${params.toString()}`;
        return getJson(url);
      },
      getImplementationLogStats: (specName: string, taskId: string) => getJson(`${prefix}/specs/${encodeURIComponent(specName)}/implementation-log/task/${encodeURIComponent(taskId)}/stats`),
      getChangelog: (version: string) => getJson(`${prefix}/changelog/${encodeURIComponent(version)}`),
    };
  }, [projectId, reloadAll]);

  return (
    <ApiActionsContext.Provider value={actionsValue}>
      <ApiDataContext.Provider value={dataValue}>
        {children}
      </ApiDataContext.Provider>
    </ApiActionsContext.Provider>
  );
}

// Hook for accessing API actions (stable, won't re-render when data changes)
export function useApiActions(): ApiActionsContextType {
  const ctx = useContext(ApiActionsContext);
  if (!ctx) throw new Error('useApiActions must be used within ApiProvider');
  return ctx;
}

// Hook for accessing API data (will re-render when data changes)
export function useApiData(): ApiDataContextType {
  const ctx = useContext(ApiDataContext);
  if (!ctx) throw new Error('useApiData must be used within ApiProvider');
  return ctx;
}

// Legacy hook for backward compatibility - returns both data and actions
// Components should migrate to using useApiActions() or useApiData() for better performance
export function useApi(): ApiDataContextType & ApiActionsContextType {
  const data = useApiData();
  const actions = useApiActions();
  return { ...data, ...actions };
}


