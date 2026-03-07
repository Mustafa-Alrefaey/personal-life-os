import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { MainLayout } from '../components/layout/MainLayout';
import { useAuthStore } from '../stores/authStore';
import { useThemeStore } from '../stores/themeStore';
import { useRamadanStore } from '../stores/ramadanStore';
import { dashboardService } from '../services/dashboard.service';

export default function ProfilePage() {
  const { t, i18n } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const { isDarkMode, toggleTheme } = useThemeStore();
  const { enabled: ramadanEnabled, setEnabled: setRamadan } = useRamadanStore();
  const isRTL = i18n.language === 'ar';

  const { data } = useQuery({ queryKey: ['dashboard'], queryFn: () => dashboardService.getDashboard() });
  const stats = data?.data;

  const statCards = [
    { label: t('profile.totalTasks'),     value: stats?.totalTasks ?? 0,          color: 'var(--accent)'  },
    { label: t('profile.completed'),      value: stats?.completedTasks ?? 0,       color: 'var(--success)' },
    { label: t('profile.journalEntries'), value: stats?.totalJournalEntries ?? 0,  color: 'var(--info)'    },
    { label: t('profile.receipts'),       value: stats?.totalReceipts ?? 0,        color: 'var(--warning)' },
  ];

  return (
    <MainLayout>
      <div className="card rounded-xl px-6 py-4 mb-6"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{t('profile.title')}</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User info */}
        <div className="card rounded-xl p-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold"
              style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
              {user?.fullName?.charAt(0)?.toUpperCase() ?? 'U'}
            </div>
            <div>
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{user?.fullName}</p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
            </div>
          </div>
          <div className="space-y-0">
            {[
              [t('profile.fullName'), user?.fullName],
              [t('profile.email'),    user?.email],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{label}</span>
                <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{val ?? t('common.na')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Preferences */}
        <div className="card rounded-xl p-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>{t('profile.preferences')}</h3>

          {/* Dark mode */}
          <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t('profile.darkMode')}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('profile.darkModeDesc')}</p>
            </div>
            <button
              onClick={toggleTheme}
              className="relative inline-flex h-6 w-11 items-center rounded-full"
              style={{ background: isDarkMode ? 'var(--accent)' : 'var(--bg-muted)' }}
            >
              <span
                className="inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200"
                style={{
                  transform: isDarkMode
                    ? (isRTL ? 'translateX(-24px)' : 'translateX(24px)')
                    : (isRTL ? 'translateX(-4px)' : 'translateX(4px)'),
                }}
              />
            </button>
          </div>

          {/* Ramadan theme */}
          <div className="flex items-center justify-between py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t('profile.ramadanMode')}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('profile.ramadanModeDesc')}</p>
            </div>
            <button
              onClick={() => setRamadan(!ramadanEnabled)}
              className="relative inline-flex h-6 w-11 items-center rounded-full"
              style={{ background: ramadanEnabled ? '#c8881c' : 'var(--bg-muted)' }}
            >
              <span
                className="inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200"
                style={{
                  transform: ramadanEnabled
                    ? (isRTL ? 'translateX(-24px)' : 'translateX(24px)')
                    : (isRTL ? 'translateX(-4px)' : 'translateX(4px)'),
                }}
              />
            </button>
          </div>

          {/* Language */}
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t('profile.language')}</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('profile.languageDesc')}</p>
            </div>
            <button
              onClick={() => i18n.changeLanguage(isRTL ? 'en' : 'ar')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
            >
              {isRTL ? 'English' : 'العربية'}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="card rounded-xl p-6 lg:col-span-2" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>{t('profile.stats')}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {statCards.map(({ label, value, color }) => (
              <div key={label} className="text-center p-4 rounded-xl" style={{ background: 'var(--bg-subtle)' }}>
                <p className="text-2xl font-bold" style={{ color }}>{value}</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
