import React, { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react';
import { useWs } from '../ws/WebSocketProvider';

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
  reloadAll: () => Promise<void>;
  getAllSpecDocuments: (name: string) => Promise<Record<string, { content: string; lastModified: string } | null>>;
  getAllArchivedSpecDocuments: (name: string) => Promise<Record<string, { content: string; lastModified: string } | null>>;
  getSpecTasksProgress: (name: string) => Promise<any>;
  updateTaskStatus: (specName: string, taskId: string, status: 'pending' | 'in-progress' | 'completed') => Promise<{ ok: boolean; status: number; data?: any }>;
  approvalsAction: (id: string, action: 'approve' | 'reject' | 'needs-revision', payload: any) => Promise<{ ok: boolean; status: number }>;
  getApprovalContent: (id: string) => Promise<{ content: string; filePath?: string }>;
  saveSpecDocument: (name: string, document: string, content: string) => Promise<{ ok: boolean; status: number }>;
  saveArchivedSpecDocument: (name: string, document: string, content: string) => Promise<{ ok: boolean; status: number }>;
  archiveSpec: (name: string) => Promise<{ ok: boolean; status: number }>;
  unarchiveSpec: (name: string) => Promise<{ ok: boolean; status: number }>;
  getSteeringDocument: (name: string) => Promise<{ content: string; lastModified: string }>;
  saveSteeringDocument: (name: string, content: string) => Promise<{ ok: boolean; status: number }>;
  listCustomDocuments: () => Promise<string[]>;
  getCustomDocument: (path: string) => Promise<{ content: string; lastModified: string | null }>;
  saveCustomDocument: (path: string, content: string) => Promise<{ ok: boolean; status: number }>;
  saveTaskPrompt: (specName: string, taskId: string, prompt: string) => Promise<{ ok: boolean; status: number }>;
};

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export function ApiProvider({ initial, children }: { initial?: { specs?: SpecSummary[]; archivedSpecs?: SpecSummary[]; approvals?: Approval[] }; children: React.ReactNode }) {
  const { subscribe, unsubscribe } = useWs();
  const [specs, setSpecs] = useState<SpecSummary[]>(initial?.specs || []);
  const [archivedSpecs, setArchivedSpecs] = useState<SpecSummary[]>(initial?.archivedSpecs || []);
  const [approvals, setApprovals] = useState<Approval[]>(initial?.approvals || []);
  const [info, setInfo] = useState<ProjectInfo | undefined>(undefined);
  const [steeringDocuments, setSteeringDocuments] = useState<any>(undefined);

  const reloadAll = useCallback(async () => {
    const [s, as, a, i] = await Promise.all([
      getJson<SpecSummary[]>('/api/specs'),
      getJson<SpecSummary[]>('/api/specs/archived'),
      getJson<Approval[]>('/api/approvals'),
      getJson<ProjectInfo>('/api/info').catch(() => ({ projectName: 'Project' } as ProjectInfo)),
    ]);
    setSpecs(s);
    setArchivedSpecs(as);
    setApprovals(a);
    setInfo(i);
    setSteeringDocuments(i.steering);
  }, []);

  // Load initial data including info on mount
  useEffect(() => {
    reloadAll();
  }, [reloadAll]);

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
    // Only handle events that provide the updated data directly
    subscribe('spec-update', handleSpecUpdate);
    subscribe('approval-update', handleApprovalUpdate);
    subscribe('steering-update', handleSteeringUpdate);
    
    // Do NOT handle 'update' and 'task-update' events as they are just file change notifications
    // without updated data - let individual components handle their own updates via specific events

    return () => {
      unsubscribe('spec-update', handleSpecUpdate);
      unsubscribe('approval-update', handleApprovalUpdate);
      unsubscribe('steering-update', handleSteeringUpdate);
    };
  }, [subscribe, unsubscribe, reloadAll]);

  const value = useMemo<ApiContextType>(() => ({
    specs,
    archivedSpecs,
    approvals,
    info,
    steeringDocuments,
    reloadAll,
    getAllSpecDocuments: (name: string) => getJson(`/api/specs/${encodeURIComponent(name)}/all`),
    getAllArchivedSpecDocuments: (name: string) => getJson(`/api/specs/${encodeURIComponent(name)}/all/archived`),
    getSpecTasksProgress: (name: string) => getJson(`/api/specs/${encodeURIComponent(name)}/tasks/progress`),
    updateTaskStatus: (specName: string, taskId: string, status: 'pending' | 'in-progress' | 'completed') => putJson(`/api/specs/${encodeURIComponent(specName)}/tasks/${encodeURIComponent(taskId)}/status`, { status }),
    approvalsAction: (id, action, body) => postJson(`/api/approvals/${encodeURIComponent(id)}/${action}`, body),
    getApprovalContent: (id: string) => getJson(`/api/approvals/${encodeURIComponent(id)}/content`),
    saveSpecDocument: (name: string, document: string, content: string) => putJson(`/api/specs/${encodeURIComponent(name)}/${encodeURIComponent(document)}`, { content }),
    saveArchivedSpecDocument: (name: string, document: string, content: string) => putJson(`/api/specs/${encodeURIComponent(name)}/${encodeURIComponent(document)}/archived`, { content }),
    archiveSpec: (name: string) => postJson(`/api/specs/${encodeURIComponent(name)}/archive`, {}),
    unarchiveSpec: (name: string) => postJson(`/api/specs/${encodeURIComponent(name)}/unarchive`, {}),
    getSteeringDocument: (name: string) => getJson(`/api/steering/${encodeURIComponent(name)}`),
    saveSteeringDocument: (name: string, content: string) => putJson(`/api/steering/${encodeURIComponent(name)}`, { content }),
    listCustomDocuments: () => getJson('/api/documents'),
    getCustomDocument: (path: string) => getJson(`/api/documents/${path}`),
    saveCustomDocument: (path: string, content: string) => postJson(`/api/documents/${path}`, { content }),
    saveTaskPrompt: (specName: string, taskId: string, prompt: string) => postJson(`/api/specs/${encodeURIComponent(specName)}/tasks/${encodeURIComponent(taskId)}/prompt`, { prompt }),
  }), [specs, archivedSpecs, approvals, info, steeringDocuments, reloadAll]);

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
}

export function useApi(): ApiContextType {
  const ctx = useContext(ApiContext);
  if (!ctx) throw new Error('useApi must be used within ApiProvider');
  return ctx;
}


