import { useState, useCallback, memo } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../stores/authStore';
import { useSidebarStore } from '../../stores/sidebarStore';
import { DarkModeToggle } from '../ui/DarkModeToggle';

interface MainLayoutProps { children: React.ReactNode }

const navItems = [
  {
    to: '/dashboard', key: 'dashboard' as const,
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect x="3" y="3" width="7" height="7" rx="1" strokeWidth="1.8"/>
        <rect x="14" y="3" width="7" height="7" rx="1" strokeWidth="1.8"/>
        <rect x="3" y="14" width="7" height="7" rx="1" strokeWidth="1.8"/>
        <rect x="14" y="14" width="7" height="7" rx="1" strokeWidth="1.8"/>
      </svg>
    ),
  },
  {
    to: '/tasks', key: 'tasks' as const,
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>
    ),
  },
  {
    to: '/bills', key: 'bills' as const,
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
      </svg>
    ),
  },
  {
    to: '/transactions', key: 'transactions' as const,
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4"/>
      </svg>
    ),
  },
  {
    to: '/receipts', key: 'receipts' as const,
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
      </svg>
    ),
  },
  {
    to: '/journal', key: 'journal' as const,
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
      </svg>
    ),
  },
  {
    to: '/profile', key: 'profile' as const,
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
      </svg>
    ),
  },
];

interface SidebarInnerProps {
  isCollapsed: boolean;
  onNavClick?: () => void;
}

const SidebarInner = memo(function SidebarInner({ isCollapsed, onNavClick }: SidebarInnerProps) {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';

  const handleLogout = () => { logout(); navigate('/login'); };
  const toggleLang = () => i18n.changeLanguage(isRTL ? 'en' : 'ar');

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className="shrink-0 flex items-center py-5"
        style={{
          borderBottom: '1px solid var(--border-subtle)',
          justifyContent: isCollapsed ? 'center' : undefined,
          gap: isCollapsed ? 0 : '0.75rem',
          paddingLeft: isCollapsed ? 0 : '1rem',
          paddingRight: isCollapsed ? 0 : '1rem',
        }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold select-none shrink-0"
          style={{ background: 'var(--accent)' }}
        >
          PL
        </div>
        {!isCollapsed && (
          <span className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
            {t('auth.appName')}
          </span>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, key, icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavClick}
            title={isCollapsed ? t(`nav.${key}`) : undefined}
            className={({ isActive }) =>
              `flex items-center py-2 rounded-lg text-sm font-medium transition-colors ${
                isCollapsed ? 'justify-center px-0' : 'gap-3 px-3'
              } ${
                isActive
                  ? 'text-[var(--accent)] bg-[var(--accent-light)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
              }`
            }
          >
            <span className="shrink-0">{icon}</span>
            {!isCollapsed && <span>{t(`nav.${key}`)}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom controls */}
      <div
        className="shrink-0"
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: isCollapsed ? '16px 8px' : '16px 12px',
        }}
      >
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-2.5">
            <button
              onClick={toggleLang}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold"
              style={{ background: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}
            >{isRTL ? 'EN' : 'ع'}</button>
            <DarkModeToggle />
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: 'var(--accent-light)', color: 'var(--accent)', cursor: 'default' }}
              title={user?.fullName}
            >{user?.fullName?.charAt(0)?.toUpperCase() ?? 'U'}</div>
            <button
              onClick={handleLogout}
              title={t('nav.logout')}
              className="w-8 h-8 flex items-center justify-center rounded-lg"
              style={{ color: 'var(--text-muted)', background: 'var(--bg-subtle)' }}
            >
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <button
                onClick={toggleLang}
                className="text-xs font-semibold px-2.5 py-1.5 rounded-lg"
                style={{ background: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}
              >{isRTL ? 'EN' : 'ع'}</button>
              <DarkModeToggle />
            </div>
            <div className="flex items-center gap-3 px-1 py-2 rounded-lg" style={{ background: 'var(--bg-subtle)' }}>
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
              >{user?.fullName?.charAt(0)?.toUpperCase() ?? 'U'}</div>
              <span className="text-xs font-medium truncate flex-1" style={{ color: 'var(--text-secondary)' }}>
                {user?.fullName}
              </span>
              <button
                onClick={handleLogout}
                title={t('nav.logout')}
                className="shrink-0"
                style={{ color: 'var(--text-muted)' }}
              >
                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export const MainLayout = ({ children }: MainLayoutProps) => {
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { collapsed, toggle } = useSidebarStore();
  const isRTL = i18n.language === 'ar';

  const closeMobile = useCallback(() => setSidebarOpen(false), []);
  const chevronRotate = (collapsed !== isRTL) ? '180deg' : '0deg';

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg-base)', color: 'var(--text-primary)' }}>

      {/* Desktop sidebar wrapper (animates width) */}
      <div
        className="hidden md:block relative shrink-0"
        style={{
          width: collapsed ? '60px' : '224px',
          transition: 'width 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        <aside
          className="sticky top-0 h-screen flex flex-col overflow-hidden"
          style={{
            background: 'var(--bg-sidebar)',
            borderInlineEnd: '1px solid var(--border-subtle)',
            width: '100%',
          }}
        >
          <SidebarInner isCollapsed={collapsed} />
        </aside>

        {/* Collapse toggle button */}
        <button
          onClick={toggle}
          className="sidebar-collapse-btn w-5 h-5 rounded-full flex items-center justify-center shadow-sm"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            color: 'var(--text-muted)',
          }}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <svg
            width="9" height="9" fill="none" stroke="currentColor" viewBox="0 0 24 24"
            style={{ transform: `rotate(${chevronRotate})`, transition: 'transform 0.28s' }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 flex mobile-overlay"
          style={{ background: 'rgba(0,0,0,0.45)' }}
          onClick={closeMobile}
        >
          <aside
            className="h-full flex flex-col mobile-sidebar-panel"
            style={{ background: 'var(--bg-sidebar)', width: '224px', flexShrink: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <SidebarInner isCollapsed={false} onNavClick={closeMobile} />
          </aside>
        </div>
      )}

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <header
          className="md:hidden sticky top-0 z-40 h-12 flex items-center justify-between px-4"
          style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)' }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-8 h-8 flex items-center justify-center rounded-lg"
            style={{ background: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
          <div className="flex items-center gap-2.5">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs font-bold"
              style={{ background: 'var(--accent)' }}
            >PL</div>
            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{t('auth.appName')}</span>
          </div>
          <DarkModeToggle />
        </header>

        {/* Page content — key re-triggers animation on route change */}
        <main key={location.pathname} className="flex-1 page-enter" style={{ padding: '1.5rem 1.25rem' }}>
          <div className="max-w-5xl mx-auto page-frame">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer
          className="py-3 text-center text-xs"
          style={{ color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)' }}
        >
          {t('common.copyright', { year: new Date().getFullYear() })}
        </footer>
      </div>
    </div>
  );
};