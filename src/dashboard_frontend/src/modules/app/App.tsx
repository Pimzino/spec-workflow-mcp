import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, useTheme } from '../theme/ThemeProvider';
import { WebSocketProvider, useWs } from '../ws/WebSocketProvider';
import { ProjectProvider, useProjects } from '../projects/ProjectProvider';
import { ApiProvider } from '../api/api';
import { HighlightStyles } from '../theme/HighlightStyles';
import { DashboardStatistics } from '../pages/DashboardStatistics';
import { SpecsPage } from '../pages/SpecsPage';
import { SteeringPage } from '../pages/SteeringPage';
import { TasksPage } from '../pages/TasksPage';
import { LogsPage } from '../pages/LogsPage';
import { ApprovalsPage } from '../pages/ApprovalsPage';
import { SpecViewerPage } from '../pages/SpecViewerPage';
import { SettingsPage } from '../pages/SettingsPage';
import { NotificationProvider } from '../notifications/NotificationProvider';
import { VolumeControl } from '../notifications/VolumeControl';
import { useApi } from '../api/api';
import { LanguageSelector } from '../../components/LanguageSelector';
import { I18nErrorBoundary } from '../../components/I18nErrorBoundary';
import { ProjectDropdown } from '../components/ProjectDropdown';
import { PageNavigationSidebar } from '../components/PageNavigationSidebar';
import { ChangelogModal } from '../modals/ChangelogModal';

function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { connected } = useWs();
  const { currentProject } = useProjects();
  const { info } = useApi();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);

  // Update the browser tab title when project info is loaded
  useEffect(() => {
    if (info?.projectName) {
      document.title = t('documentTitle', { projectName: info.projectName });
    }
  }, [info?.projectName, t]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-10 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60 border-b border-gray-200 dark:border-gray-800">
        <div className="w-full px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Page Navigation Sidebar Toggle Button */}
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={t('nav.toggleSidebar', 'Toggle navigation sidebar')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Project Dropdown */}
            <ProjectDropdown />

            {/* Version Badge */}
            {info?.version && (
              <button
                onClick={() => setShowChangelog(true)}
                className="hidden lg:inline text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                title={t('changelog.viewChangelog', 'View changelog')}
              >
                v{info.version}
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${connected ? 'bg-emerald-500' : 'bg-rose-500'}`} title={connected ? t('connectionStatus.connected') : t('connectionStatus.disconnected')} />

            {/* Desktop Controls */}
            <div className="hidden lg:flex items-center gap-3">
              <VolumeControl />

              <LanguageSelector />

              <button onClick={toggleTheme} className="btn-secondary" title={t('theme.toggle')}>
                {theme === 'dark' ? t('theme.dark') : t('theme.light')}
              </button>

              <a
                href="https://buymeacoffee.com/pimzino"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 text-sm font-medium rounded-lg transition-colors"
                title={t('support.project')}
              >
                {t('support.me')}
              </a>
            </div>

            {/* Mobile/Tablet Settings Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={t('mobile.settings', 'Settings')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile/Tablet Slide-out Controls Menu */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          onClick={closeMobileMenu}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" />

          <div
            className="absolute right-0 top-0 h-full w-64 bg-white dark:bg-gray-900 shadow-xl transform transition-transform"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="text-lg font-semibold">{t('mobile.settings', 'Settings')}</div>
                <button
                  onClick={closeMobileMenu}
                  className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label={t('mobile.closeMenu')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Controls Section */}
              <div className="flex-1 px-4 py-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">{t('mobile.notificationVolume')}</span>
                  <VolumeControl />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">{t('language.select')}</span>
                  <LanguageSelector className="w-32" />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-300">{t('mobile.theme')}</span>
                  <button onClick={toggleTheme} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                    {theme === 'dark' ? t('theme.dark') : t('theme.light')}
                  </button>
                </div>

                <div className="pt-2">
                  <a
                    href="https://buymeacoffee.com/pimzino"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center px-4 py-3 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 text-sm font-medium rounded-lg transition-colors"
                    title={t('support.project')}
                  >
                    {t('support.me')}
                  </a>
                </div>

                {info?.version && (
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <button
                        onClick={() => {
                          setShowChangelog(true);
                          setMobileMenuOpen(false);
                        }}
                        className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
                        title={t('changelog.viewChangelog', 'View changelog')}
                      >
                        Spec-Workflow-MCP v{info.version}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Changelog Modal */}
      <ChangelogModal
        isOpen={showChangelog}
        onClose={() => setShowChangelog(false)}
        version={info?.version || ''}
        projectId={currentProject?.projectId}
      />
    </>
  );
}

function AppInner() {
  const { initial } = useWs();
  const { currentProjectId } = useProjects();
  const [sidebarOpen, setSidebarOpen] = useState(true); // Default open on desktop

  const SIDEBAR_COLLAPSE_KEY = 'spec-workflow-sidebar-collapsed';
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_COLLAPSE_KEY);
      return stored ? JSON.parse(stored) : false;
    } catch {
      return false;
    }
  });

  // Persist sidebar collapse state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_COLLAPSE_KEY, JSON.stringify(sidebarCollapsed));
    } catch (error) {
      console.error('Failed to save sidebar collapse state:', error);
    }
  }, [sidebarCollapsed]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <ApiProvider initial={initial} projectId={currentProjectId}>
      <NotificationProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 lg:flex">
          {/* Page Navigation Sidebar */}
          <PageNavigationSidebar
            isOpen={sidebarOpen}
            isCollapsed={sidebarCollapsed}
            onClose={() => setSidebarOpen(false)}
            onToggleCollapse={toggleSidebarCollapse}
          />
          <div className="flex-1 flex flex-col min-w-0">
            <Header toggleSidebar={toggleSidebar} />
            <HighlightStyles />
            <main className="w-full px-6 py-6">
            {currentProjectId ? (
              <Routes>
                <Route path="/" element={<DashboardStatistics />} />
                <Route path="/steering" element={<SteeringPage />} />
                <Route path="/specs" element={<SpecsPage />} />
                <Route path="/specs/view" element={<SpecViewerPage />} />
                <Route path="/tasks" element={<TasksPage />} />
                <Route path="/logs" element={<LogsPage />} />
                <Route path="/approvals" element={<ApprovalsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            ) : (
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    No Projects Available
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Start MCP servers to see projects here.
                  </p>
                  <div className="text-sm text-gray-500 dark:text-gray-500">
                    Run: <code className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded">npx @pimzino/spec-workflow-mcp /path/to/project</code>
                  </div>
                </div>
              </div>
            )}
            </main>
          </div>
        </div>
      </NotificationProvider>
    </ApiProvider>
  );
}

function AppWithProviders() {
  const { currentProjectId } = useProjects();

  return (
    <WebSocketProvider projectId={currentProjectId}>
      <AppInner />
    </WebSocketProvider>
  );
}

export default function App() {
  return (
    <I18nErrorBoundary>
      <ThemeProvider>
        <ProjectProvider>
          <AppWithProviders />
        </ProjectProvider>
      </ThemeProvider>
    </I18nErrorBoundary>
  );
}


