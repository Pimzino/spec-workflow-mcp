import React, { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';

type InitialPayload = {
  specs: any[];
  approvals: any[];
};

type WsContextType = {
  connected: boolean;
  initial?: InitialPayload;
  subscribe: (eventType: string, handler: (data: any) => void) => void;
  unsubscribe: (eventType: string, handler: (data: any) => void) => void;
};

const WsContext = createContext<WsContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: React.ReactNode;
  projectId: string | null;
}

export function WebSocketProvider({ children, projectId }: WebSocketProviderProps) {
  const [connected, setConnected] = useState(false);
  const [initial, setInitial] = useState<InitialPayload | undefined>(undefined);
  const wsRef = useRef<WebSocket | null>(null);
  const eventHandlersRef = useRef<Map<string, Set<(data: any) => void>>>(new Map());
  const retryTimerRef = useRef<any>(null);
  const currentProjectIdRef = useRef<string | null>(null);

  const connectToWebSocket = useCallback((targetProjectId: string | null) => {
    // Close existing connection if any
    if (wsRef.current) {
      wsRef.current.onclose = null; // Prevent reconnection
      wsRef.current.close();
      wsRef.current = null;
    }

    // Clear any pending retry
    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }

    // Build WebSocket URL with projectId query parameter
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = targetProjectId
      ? `${protocol}//${location.host}/ws?projectId=${encodeURIComponent(targetProjectId)}`
      : `${protocol}//${location.host}/ws`;

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    currentProjectIdRef.current = targetProjectId;

    ws.onopen = () => setConnected(true);

    ws.onclose = () => {
      setConnected(false);
      // Only retry if we're still on the same project
      if (currentProjectIdRef.current === targetProjectId) {
        retryTimerRef.current = setTimeout(() => {
          connectToWebSocket(targetProjectId);
        }, 2000);
      }
    };

    ws.onerror = () => {
      // noop; close will handle retry
    };

    ws.onmessage = (ev) => {
      try {
        const msg = JSON.parse(ev.data);

        // Handle initial message
        if (msg.type === 'initial' && msg.projectId === targetProjectId) {
          setInitial({ specs: msg.data?.specs || [], approvals: msg.data?.approvals || [] });
        }
        // Handle projects-update (global message)
        else if (msg.type === 'projects-update') {
          const handlers = eventHandlersRef.current.get('projects-update');
          if (handlers) {
            handlers.forEach(handler => handler(msg.data));
          }
        }
        // Handle project-scoped messages
        else if (msg.projectId === targetProjectId) {
          const handlers = eventHandlersRef.current.get(msg.type);
          if (handlers) {
            handlers.forEach(handler => handler(msg.data));
          }
        }
      } catch {
        // ignore
      }
    };
  }, []);

  // Connect/reconnect when projectId changes
  useEffect(() => {
    if (projectId) {
      // Clear initial data when switching projects
      setInitial(undefined);
      connectToWebSocket(projectId);
    }

    return () => {
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
      }
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [projectId, connectToWebSocket]);

  const subscribe = useCallback((eventType: string, handler: (data: any) => void) => {
    if (!eventHandlersRef.current.has(eventType)) {
      eventHandlersRef.current.set(eventType, new Set());
    }
    eventHandlersRef.current.get(eventType)!.add(handler);
  }, []);

  const unsubscribe = useCallback((eventType: string, handler: (data: any) => void) => {
    const handlers = eventHandlersRef.current.get(eventType);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        eventHandlersRef.current.delete(eventType);
      }
    }
  }, []);

  const value = useMemo(() => ({
    connected,
    initial,
    subscribe,
    unsubscribe
  }), [connected, initial, subscribe, unsubscribe]);

  return <WsContext.Provider value={value}>{children}</WsContext.Provider>;
}

export function useWs(): WsContextType {
  const ctx = useContext(WsContext);
  if (!ctx) throw new Error('useWs must be used within WebSocketProvider');
  return ctx;
}


