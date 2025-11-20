import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';

export interface Project {
  projectId: string;
  projectName: string;
  projectPath: string;
}

interface ProjectContextType {
  projects: Project[];
  currentProjectId: string | null;
  currentProject: Project | null;
  setCurrentProject: (projectId: string) => void;
  refreshProjects: () => Promise<void>;
  loading: boolean;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const STORAGE_KEY = 'spec-workflow-current-project';

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(() => {
    // Initialize from localStorage if available
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Use ref to track current project without dependency issues
  const currentProjectIdRef = useRef(currentProjectId);
  const hasInitializedRef = useRef(false);

  // Sync ref and localStorage when state changes
  useEffect(() => {
    currentProjectIdRef.current = currentProjectId;
    if (currentProjectId) {
      try {
        localStorage.setItem(STORAGE_KEY, currentProjectId);
      } catch (error) {
        console.error('Failed to save project selection:', error);
      }
    } else {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (error) {
        console.error('Failed to remove project selection:', error);
      }
    }
  }, [currentProjectId]);

  // Fetch projects from API
  const fetchProjects = useCallback(async () => {
    try {
      const response = await fetch('/api/projects/list');
      if (response.ok) {
        const data = await response.json() as Project[];
        setProjects(data);

        const currentId = currentProjectIdRef.current;

        // Only auto-select first project on INITIAL load (not during polling)
        if (!currentId && !hasInitializedRef.current && data.length > 0) {
          setCurrentProjectId(data[0].projectId);
        }

        // If current project no longer exists, select first available
        if (currentId && !data.find(p => p.projectId === currentId)) {
          console.warn('Current project no longer exists, selecting first available');
          setCurrentProjectId(data.length > 0 ? data[0].projectId : null);
        }

        // Mark as initialized after first successful fetch
        hasInitializedRef.current = true;
      }
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies - use refs instead

  // Initial fetch
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  // Poll for updates every 2.5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchProjects();
    }, 2500);

    return () => clearInterval(interval);
  }, [fetchProjects]);

  const setCurrentProject = useCallback((projectId: string) => {
    setCurrentProjectId(projectId);
  }, []);

  const currentProject = useMemo(() => {
    return projects.find(p => p.projectId === currentProjectId) || null;
  }, [projects, currentProjectId]);

  const value = useMemo<ProjectContextType>(() => ({
    projects,
    currentProjectId,
    currentProject,
    setCurrentProject,
    refreshProjects: fetchProjects,
    loading
  }), [projects, currentProjectId, currentProject, setCurrentProject, fetchProjects, loading]);

  return <ProjectContext.Provider value={value}>{children}</ProjectContext.Provider>;
}

export function useProjects(): ProjectContextType {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error('useProjects must be used within ProjectProvider');
  return ctx;
}
