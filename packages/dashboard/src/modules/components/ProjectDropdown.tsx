import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useProjects } from '../projects/ProjectProvider';

export function ProjectDropdown() {
  const { t } = useTranslation();
  const { projects, currentProject, setCurrentProject, loading } = useProjects();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown when clicking outside or pressing ESC
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsOpen(false);
        setSearchQuery('');
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      // Focus search input when dropdown opens
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Filter projects based on search query
  const filteredProjects = projects.filter(project =>
    project.projectName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProjectSelect = (projectId: string) => {
    setCurrentProject(projectId);
    setIsOpen(false);
    setSearchQuery('');
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setSearchQuery('');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        onClick={toggleDropdown}
        data-testid="project-dropdown-toggle"
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-[var(--surface-hover)] transition-colors text-[var(--text-primary)]"
        aria-label={t('projects.selectProject', 'Select project')}
      >
        <span className="text-sm font-medium">
          {t('projects.label', 'Projects')}:
        </span>
        <span className="text-sm font-semibold">
          {currentProject?.projectName || t('projects.none', 'No Project')}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          data-testid="project-dropdown-menu"
          className="absolute left-0 mt-2 w-72 bg-[var(--surface-panel)] border border-[var(--border-default)] rounded-lg shadow-lg z-50 max-h-96 flex flex-col"
        >
          {/* Search Input */}
          <div className="p-3 border-b border-[var(--border-default)]">
            <input
              ref={searchInputRef}
              type="text"
              data-testid="project-dropdown-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('projects.search', 'Search projects...')}
              className="w-full px-3 py-2 text-sm bg-[var(--surface-inset)] border border-[var(--border-default)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] text-[var(--text-primary)]"
            />
          </div>

          {/* Project List */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="text-center text-[var(--text-muted)] py-6 text-sm">
                {t('projects.loading', 'Loading projects...')}
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="text-center text-[var(--text-muted)] py-6 text-sm">
                {searchQuery
                  ? t('projects.noResults', 'No projects found')
                  : t('projects.noProjects', 'No projects available')}
              </div>
            ) : (
              <div className="py-1">
                {filteredProjects.map((project) => {
                  const isCurrent = project.projectId === currentProject?.projectId;
                  return (
                    <button
                      key={project.projectId}
                      onClick={() => handleProjectSelect(project.projectId)}
                      data-testid={`project-dropdown-item-${project.projectId}`}
                      className={`w-full text-left px-4 py-2.5 hover:bg-[var(--surface-hover)] transition-colors flex items-center justify-between ${
                        isCurrent ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            isCurrent
                              ? 'bg-indigo-600 dark:bg-indigo-400'
                              : 'bg-[var(--text-muted)]'
                          }`}
                        />
                        <span
                          className={`text-sm truncate ${
                            isCurrent
                              ? 'font-semibold text-indigo-900 dark:text-indigo-100'
                              : 'text-[var(--text-primary)]'
                          }`}
                          title={project.projectName}
                        >
                          {project.projectName}
                          {project.instances?.length > 0 && (
                            <span className="text-[var(--text-muted)] ml-1 font-normal">
                              ({project.instances.length === 1
                                ? `PID: ${project.instances[0].pid}`
                                : `${project.instances.length} instances`})
                            </span>
                          )}
                        </span>
                      </div>
                      {isCurrent && (
                        <svg
                          className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {!loading && projects.length > 0 && (
            <div className="px-4 py-2 border-t border-[var(--border-default)] text-xs text-[var(--text-muted)]">
              {t('projects.count', {
                count: projects.length,
                defaultValue: `${projects.length} project(s)`,
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
