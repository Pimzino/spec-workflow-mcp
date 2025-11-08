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

type ApiContextType = {
  specs: SpecSummary[];
  archivedSpecs: SpecSummary[];
  approvals: Approval[];
  info?: ProjectInfo;
  steeringDocuments?: any;
  projectId: string | null;
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

const ApiContext = createContext<ApiContextType | undefined>(undefined);

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
      if (data.specs) setSpecs(data.specs);
      if (data.archivedSpecs) setArchivedSpecs(data.archivedSpecs);
    };

    const handleApprovalUpdate = (data: Approval[]) => {
      setApprovals(data);
    };

    const handleSteeringUpdate = (data: any) => {
      setSteeringDocuments(data);
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

  const value = useMemo<ApiContextType>(() => {
    if (!projectId) {
      // Return empty API when no project selected
      return {
        specs: [],
        archivedSpecs: [],
        approvals: [],
        info: undefined,
        steeringDocuments: undefined,
        projectId: null,
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
      specs,
      archivedSpecs,
      approvals,
      info,
      steeringDocuments,
      projectId,
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
  }, [specs, archivedSpecs, approvals, info, steeringDocuments, projectId, reloadAll]);

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}

export function useApi(): ApiContextType {
  const ctx = useContext(ApiContext);
  if (!ctx) throw new Error('useApi must be used within ApiProvider');
  return ctx;
}


