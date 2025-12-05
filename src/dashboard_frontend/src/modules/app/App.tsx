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
import { ActivitySidebar } from '../components/ActivitySidebar';
import { ChangelogModal } from '../modals/ChangelogModal';

interface HeaderProps {
  toggleSidebar: () => void;
  toggleActivitySidebar: () => void;
}

function Header({ toggleSidebar, toggleActivitySidebar }: HeaderProps) {
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
      <header className="sticky top-0 z-10 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-[#1e1b2e]/80 border-b border-gray-200 dark:border-[#2d2640]/50">
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
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />

          <div
            className="absolute right-0 top-0 h-full w-72 bg-white dark:bg-[#1e1b2e]/95 backdrop-blur-xl shadow-xl transform transition-transform border-l border-gray-200 dark:border-[#2d2640]/50 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Gradient accent at top */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500" />

            <div className="flex flex-col h-full">
              {/* Menu Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-[#2d2640]/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 gradient-icon flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <span className="text-lg font-semibold">{t('mobile.settings', 'Settings')}</span>
                </div>
                <button
                  onClick={closeMobileMenu}
                  className="p-2 rounded-xl text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 bg-transparent hover:bg-white/10 dark:hover:bg-white/5 backdrop-blur-sm transition-all duration-200"
                  aria-label={t('mobile.closeMenu')}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Controls Section */}
              <div className="flex-1 px-4 py-4 space-y-3 overflow-y-auto custom-scrollbar">
                {/* Volume Control Row */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-gray-200/50 dark:border-[#2d2640]/30">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 14.142M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{t('mobile.notificationVolume')}</span>
                  </div>
                  <VolumeControl />
                </div>

                {/* Language Selector Row */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-gray-200/50 dark:border-[#2d2640]/30">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                    </svg>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{t('language.select')}</span>
                  </div>
                  <LanguageSelector className="w-28" />
                </div>

                {/* Theme Toggle Row */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-gray-200/50 dark:border-[#2d2640]/30">
                  <div className="flex items-center gap-2">
                    {theme === 'dark' ? (
                      <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    )}
                    <span className="text-sm text-gray-700 dark:text-gray-300">{t('mobile.theme')}</span>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      theme === 'dark'
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-purple-500/25'
                        : 'bg-gradient-to-r from-amber-400 to-orange-400 text-amber-900 shadow-lg shadow-amber-500/25'
                    }`}
                  >
                    {theme === 'dark' ? t('theme.dark') : t('theme.light')}
                  </button>
                </div>

                {/* Support Button */}
                <div className="pt-2">
                  <a
                    href="https://buymeacoffee.com/pimzino"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-gradient-yellow w-full py-3"
                    title={t('support.project')}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {t('support.me')}
                  </a>
                </div>

                {/* Version Badge */}
                {info?.version && (
                  <div className="pt-3 mt-auto">
                    <button
                      onClick={() => {
                        setShowChangelog(true);
                        setMobileMenuOpen(false);
                      }}
                      className="w-full px-4 py-2.5 rounded-xl bg-white/50 dark:bg-white/5 backdrop-blur-sm border border-gray-200/50 dark:border-[#2d2640]/30 text-xs text-gray-600 dark:text-gray-400 hover:bg-white/70 dark:hover:bg-white/10 hover:border-purple-500/30 transition-all duration-200 flex items-center justify-center gap-2"
                      title={t('changelog.viewChangelog', 'View changelog')}
                    >
                      <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Spec-Workflow-MCP <span className="font-semibold text-purple-500 dark:text-purple-400">v{info.version}</span></span>
                    </button>
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
  const [activitySidebarOpen, setActivitySidebarOpen] = useState(false); // For mobile/tablet

  const SIDEBAR_COLLAPSE_KEY = 'spec-workflow-sidebar-collapsed';
  const ACTIVITY_SIDEBAR_KEY = 'spec-workflow-activity-sidebar-visible';

  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(SIDEBAR_COLLAPSE_KEY);
      return stored ? JSON.parse(stored) : false;
    } catch {
      return false;
    }
  });

  const [activitySidebarVisible, setActivitySidebarVisible] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(ACTIVITY_SIDEBAR_KEY);
      return stored ? JSON.parse(stored) : true; // Default visible on desktop
    } catch {
      return true;
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

  // Persist activity sidebar visibility to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ACTIVITY_SIDEBAR_KEY, JSON.stringify(activitySidebarVisible));
    } catch (error) {
      console.error('Failed to save activity sidebar state:', error);
    }
  }, [activitySidebarVisible]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleSidebarCollapse = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleActivitySidebar = () => {
    // On mobile, toggle the mobile sidebar
    setActivitySidebarOpen(!activitySidebarOpen);
    // On desktop, toggle visibility
    setActivitySidebarVisible(!activitySidebarVisible);
  };

  return (
    <ApiProvider initial={initial} projectId={currentProjectId}>
      <NotificationProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-[#0f0d1a] text-gray-900 dark:text-gray-100">
          {/* Page Navigation Sidebar */}
          <PageNavigationSidebar
            isOpen={sidebarOpen}
            isCollapsed={sidebarCollapsed}
            onClose={() => setSidebarOpen(false)}
            onToggleCollapse={toggleSidebarCollapse}
          />

          {/* Activity Sidebar - visible on xl screens, slide-in on smaller */}
          <div className={`hidden xl:block ${activitySidebarVisible ? '' : 'xl:hidden'}`}>
            <ActivitySidebar
              isOpen={true}
              onClose={() => setActivitySidebarVisible(false)}
            />
          </div>

          {/* Mobile/Tablet Activity Sidebar */}
          <div className="xl:hidden">
            <ActivitySidebar
              isOpen={activitySidebarOpen}
              onClose={() => setActivitySidebarOpen(false)}
            />
          </div>

          {/* Main content area - offset by sidebar width on desktop */}
          <div className={`flex-1 flex flex-col min-w-0 lg:ml-[72px] ${activitySidebarVisible ? 'xl:mr-[280px]' : ''}`}>
            <Header toggleSidebar={toggleSidebar} toggleActivitySidebar={toggleActivitySidebar} />
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


