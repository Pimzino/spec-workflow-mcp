import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { ThemeProvider, useTheme } from '../theme/ThemeProvider';
import { WebSocketProvider, useWs } from '../ws/WebSocketProvider';
import { ApiProvider } from '../api/api';
import { HighlightStyles } from '../theme/HighlightStyles';
import { DashboardStatistics } from '../pages/DashboardStatistics';
import { SpecsPage } from '../pages/SpecsPage';
import { SteeringPage } from '../pages/SteeringPage';
import { TasksPage } from '../pages/TasksPage';
import { ApprovalsPage } from '../pages/ApprovalsPage';
import { SpecViewerPage } from '../pages/SpecViewerPage';
import { ProjectDocumentsPage } from '../pages/ProjectDocumentsPage';
import { NotificationProvider, useNotifications } from '../notifications/NotificationProvider';
import { VolumeControl } from '../notifications/VolumeControl';
import { useApi } from '../api/api';
import { LanguageSelector } from '../../components/LanguageSelector';
import { I18nErrorBoundary } from '../../components/I18nErrorBoundary';

function Header() {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const { connected } = useWs();
  const { info } = useApi();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
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
        <div className="max-w-[95vw] sm:max-w-[90vw] lg:max-w-[80vw] mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="text-lg font-semibold">Spec-Workflow-MCP</div>
              {info?.version && (
                <span className="hidden lg:inline text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                  v{info.version}
                </span>
              )}
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-2 text-sm">
              <NavLink to="/" end className={({ isActive }) => `px-3 py-1.5 rounded-lg ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                {t('nav.statistics')}
              </NavLink>
              <NavLink to="/steering" className={({ isActive }) => `px-3 py-1.5 rounded-lg ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                {t('nav.steering')}
              </NavLink>
              <NavLink to="/documents" className={({ isActive }) => `px-3 py-1.5 rounded-lg ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                {t('nav.documents', 'Documents')}
              </NavLink>
              <NavLink to="/specs" className={({ isActive }) => `px-3 py-1.5 rounded-lg ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                {t('nav.specs')}
              </NavLink>
              <NavLink to="/tasks" className={({ isActive }) => `px-3 py-1.5 rounded-lg ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                {t('nav.tasks')}
              </NavLink>
              <NavLink to="/approvals" className={({ isActive }) => `px-3 py-1.5 rounded-lg ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                {t('nav.approvals')}
              </NavLink>
            </nav>
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

            {/* Mobile/Tablet Hamburger Menu Button */}
            <button 
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title={t('mobile.menu')}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile/Tablet Slide-out Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-50 lg:hidden"
          onClick={closeMobileMenu}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black bg-opacity-50 transition-opacity" />
          
          {/* Sidebar */}
          <div 
            className="absolute right-0 top-0 h-full w-64 bg-white dark:bg-gray-900 shadow-xl transform transition-transform"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="text-lg font-semibold">{t('mobile.menu')}</div>
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

              {/* Navigation Links */}
              <nav className="flex-1 px-4 py-4 space-y-2">
                <NavLink 
                  to="/" 
                  end 
                  onClick={closeMobileMenu}
                  className={({ isActive }) => `flex items-center px-3 py-2 rounded-lg text-base font-medium transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  {t('nav.statistics')}
                </NavLink>
                
                <NavLink 
                  to="/steering" 
                  onClick={closeMobileMenu}
                  className={({ isActive }) => `flex items-center px-3 py-2 rounded-lg text-base font-medium transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                  {t('nav.steering')}
                </NavLink>

                <NavLink
                  to="/documents"
                  onClick={closeMobileMenu}
                  className={({ isActive }) => `flex items-center px-3 py-2 rounded-lg text-base font-medium transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-5l-2-2H5a2 2 0 00-2 2z" />
                  </svg>
                  {t('nav.documents', 'Documents')}
                </NavLink>
                
                <NavLink 
                  to="/specs" 
                  onClick={closeMobileMenu}
                  className={({ isActive }) => `flex items-center px-3 py-2 rounded-lg text-base font-medium transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {t('nav.specs')}
                </NavLink>
                
                <NavLink 
                  to="/tasks" 
                  onClick={closeMobileMenu}
                  className={({ isActive }) => `flex items-center px-3 py-2 rounded-lg text-base font-medium transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  {t('nav.tasks')}
                </NavLink>
                
                <NavLink 
                  to="/approvals" 
                  onClick={closeMobileMenu}
                  className={({ isActive }) => `flex items-center px-3 py-2 rounded-lg text-base font-medium transition-colors ${isActive ? 'bg-indigo-600 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t('nav.approvals')}
                </NavLink>
              </nav>

              {/* Mobile Controls */}
              <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
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
                
                {/* Support Button */}
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
                
                {/* Version */}
                {info?.version && (
                  <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Spec-Workflow-MCP v{info.version}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function AppInner() {
  const { initial } = useWs();
  return (
    <ApiProvider initial={initial}>
      <NotificationProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
          <Header />
          <HighlightStyles />
          <main className="max-w-[95vw] sm:max-w-[90vw] lg:max-w-[80vw] mx-auto px-4 py-6">
            <Routes>
              <Route path="/" element={<DashboardStatistics />} />
              <Route path="/steering" element={<SteeringPage />} />
              <Route path="/documents" element={<ProjectDocumentsPage />} />
              <Route path="/specs" element={<SpecsPage />} />
              <Route path="/specs/view" element={<SpecViewerPage />} />
              <Route path="/tasks" element={<TasksPage />} />
              <Route path="/approvals" element={<ApprovalsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </NotificationProvider>
    </ApiProvider>
  );
}

export default function App() {
  return (
    <I18nErrorBoundary>
      <ThemeProvider>
        <WebSocketProvider>
          <AppInner />
        </WebSocketProvider>
      </ThemeProvider>
    </I18nErrorBoundary>
  );
}


