import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { dashboardService } from '../services/dashboard.service';
import { MainLayout } from '../components/layout/MainLayout';
import { PageLoader } from '../components/ui/Spinner';

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="card rounded-xl p-5" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
      <p className="text-xs font-medium uppercase tracking-wide mb-2" style={{ color: 'var(--text-muted)' }}>{label}</p>
      <p className="text-3xl font-bold" style={{ color }}>{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardService.getDashboard(),
  });

  if (isLoading) return <MainLayout><PageLoader message={t('dashboard.loading')} /></MainLayout>;

  if (error) return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{t('dashboard.error')}</p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: 'var(--accent)' }}
        >
          {t('common.retry')}
        </button>
      </div>
    </MainLayout>
  );

  const d = data?.data;

  return (
    <MainLayout>
      <div className="card rounded-xl px-6 py-4 mb-6"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{t('dashboard.title')}</h2>
      </div>

      {/* Task stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label={t('dashboard.totalTasks')}  value={d?.totalTasks ?? 0}    color="var(--text-primary)" />
        <StatCard label={t('dashboard.completed')}    value={d?.completedTasks ?? 0} color="var(--success)" />
        <StatCard label={t('dashboard.pending')}      value={d?.pendingTasks ?? 0}  color="var(--warning)" />
        <StatCard label={t('dashboard.overdue')}      value={d?.overdueTasks ?? 0}  color="var(--danger)" />
      </div>

      {/* Financial stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <StatCard label={t('dashboard.totalIncome')}   value={`EGP ${(d?.totalIncome ?? 0).toFixed(2)}`}   color="var(--success)" />
        <StatCard label={t('dashboard.totalExpenses')} value={`EGP ${(d?.totalExpenses ?? 0).toFixed(2)}`} color="var(--danger)" />
        <StatCard
          label={t('dashboard.netBalance')}
          value={`EGP ${(d?.netBalance ?? 0).toFixed(2)}`}
          color={(d?.netBalance ?? 0) >= 0 ? 'var(--success)' : 'var(--danger)'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="card rounded-xl p-5" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>{t('dashboard.recentTasks')}</h3>
          {d?.recentTasks?.length ? (
            <div className="space-y-3">
              {d.recentTasks.map((task) => (
                <div key={task.id} className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{task.title}</p>
                    {task.category && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{task.category}</p>}
                  </div>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                    style={{
                      background: task.statusCode === 'Completed' ? 'var(--success-bg)' : 'var(--accent-light)',
                      color:      task.statusCode === 'Completed' ? 'var(--success)'    : 'var(--accent)',
                    }}
                  >
                    {task.statusCode === 'Completed' ? t('tasks.filterCompleted') : t('tasks.filterPending')}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('dashboard.noRecentTasks')}</p>
          )}
        </div>

        {/* Upcoming Bills */}
        <div className="card rounded-xl p-5" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>{t('dashboard.upcomingBills')}</h3>
          {d?.upcomingBills?.length ? (
            <div className="space-y-3">
              {d.upcomingBills.map((bill) => (
                <div key={bill.id} className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{bill.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {t('common.due')}: {new Date(bill.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-sm font-bold shrink-0" style={{ color: 'var(--danger)' }}>
                    EGP {bill.amount.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('dashboard.noUpcomingBills')}</p>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
