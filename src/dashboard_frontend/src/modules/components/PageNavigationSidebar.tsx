import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation } from 'react-router-dom';

interface PageNavigationSidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  onClose: () => void;
  onToggleCollapse: () => void;
}

interface NavigationItem {
  path: string;
  labelKey: string;
  icon: React.ReactNode;
  end?: boolean;
}

// Logo component matching the reference design
function AppLogo({ collapsed }: { collapsed: boolean }) {
  return (
    <div className={`flex items-center justify-center ${collapsed ? 'p-3' : 'p-4'}`}>
      <div className="relative w-10 h-10 flex items-center justify-center">
        {/* Gradient circle background */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500 via-violet-500 to-pink-500 opacity-90" />
        {/* Logo icon - stylized "S" for Spec */}
        <svg
          className="relative w-6 h-6 text-white"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
        </svg>
      </div>
      {!collapsed && (
        <span className="ml-3 text-lg font-semibold text-white whitespace-nowrap">
          Spec Workflow
        </span>
      )}
    </div>
  );
}

// Navigation icon wrapper with active/hover states
function NavIconWrapper({
  isActive,
  children,
}: {
  isActive: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`
        relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200
        ${
          isActive
            ? 'bg-gradient-to-br from-purple-500 via-violet-500 to-pink-500 shadow-lg shadow-purple-500/25'
            : 'bg-transparent hover:bg-white/5 group-hover:shadow-lg group-hover:shadow-purple-500/10'
        }
      `}
    >
      <div
        className={`
          transition-colors duration-200
          ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}
        `}
      >
        {children}
      </div>
    </div>
  );
}

export function PageNavigationSidebar({
  isOpen,
  isCollapsed,
  onClose,
  onToggleCollapse,
}: PageNavigationSidebarProps) {
  const { t } = useTranslation();
  const location = useLocation();

  // Handle ESC key to close sidebar on mobile
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    if (isOpen && window.innerWidth < 1024) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Main navigation items (excluding settings)
  const mainNavigationItems: NavigationItem[] = [
    {
      path: '/',
      labelKey: 'nav.statistics',
      end: true,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      path: '/steering',
      labelKey: 'nav.steering',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
          />
        </svg>
      ),
    },
    {
      path: '/specs',
      labelKey: 'nav.specs',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      path: '/tasks',
      labelKey: 'nav.tasks',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      ),
    },
    {
      path: '/logs',
      labelKey: 'nav.logs',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16m-7 6h7"
          />
        </svg>
      ),
    },
    {
      path: '/approvals',
      labelKey: 'nav.approvals',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  // Settings item (rendered separately at bottom)
  const settingsItem: NavigationItem = {
    path: '/settings',
    labelKey: 'nav.settings',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  };

  // Render a navigation link
  const renderNavLink = (item: NavigationItem, isMobile: boolean = false) => {
    const isActive = item.end
      ? location.pathname === item.path
      : location.pathname.startsWith(item.path);

    return (
      <NavLink
        key={item.path}
        to={item.path}
        end={item.end}
        onClick={() => {
          if (window.innerWidth < 1024) {
            onClose();
          }
        }}
        className="group relative flex items-center"
        title={!isMobile ? t(item.labelKey) : undefined}
      >
        {/* Active indicator - vertical line on left */}
        <div
          className={`
            absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full transition-all duration-200
            ${isActive ? 'bg-gradient-to-b from-purple-400 to-pink-400 opacity-100' : 'opacity-0'}
          `}
        />

        <div className={`flex items-center gap-3 ${isMobile ? 'px-4 py-3' : 'px-2 py-2 lg:justify-center w-full'}`}>
          <NavIconWrapper isActive={isActive}>{item.icon}</NavIconWrapper>
          {isMobile && (
            <span
              className={`text-sm font-medium transition-colors duration-200 ${
                isActive ? 'text-white' : 'text-gray-400'
              }`}
            >
              {t(item.labelKey)}
            </span>
          )}
        </div>
      </NavLink>
    );
  };

  // Desktop sidebar - always collapsed (icon-only)
  const desktopSidebar = (
    <div
      className="
        hidden lg:flex flex-col
        fixed inset-y-0 left-0 z-40
        w-[72px]
        bg-[#0f0d1a] border-r border-[#2d2640]/50
      "
    >
      {/* App Logo */}
      <div className="py-4">
        <AppLogo collapsed={true} />
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 flex flex-col items-center py-4 space-y-2">
        {mainNavigationItems.map((item) => renderNavLink(item, false))}
      </nav>

      {/* Settings at bottom */}
      <div className="py-4 border-t border-[#2d2640]/50">
        {renderNavLink(settingsItem, false)}
      </div>
    </div>
  );

  // Mobile sidebar - slide-in drawer with full labels
  const mobileSidebar = (
    <>
      {/* Backdrop with blur */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Slide-in drawer */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 lg:hidden
          w-72
          bg-[#0f0d1a]/95 backdrop-blur-xl
          border-r border-[#2d2640]/50
          flex flex-col
          transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Header with close button */}
        <div className="flex items-center justify-between p-4 border-b border-[#2d2640]/50">
          <AppLogo collapsed={false} />
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
            aria-label={t('nav.close', 'Close sidebar')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4 space-y-1">
          {mainNavigationItems.map((item) => renderNavLink(item, true))}
        </nav>

        {/* Settings at bottom */}
        <div className="py-4 border-t border-[#2d2640]/50">
          {renderNavLink(settingsItem, true)}
        </div>
      </div>
    </>
  );

  return (
    <>
      {desktopSidebar}
      {mobileSidebar}
    </>
  );
}
