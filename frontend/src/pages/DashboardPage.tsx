import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { dashboardService } from '../services/dashboard.service';
import { CATEGORY_I18N_KEYS } from '../utils/categoryLabel';
import { formatDate, formatDateLong } from '../utils/formatDate';
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
  const { t, i18n } = useTranslation();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? t('dashboard.goodMorning') : hour < 18 ? t('dashboard.goodAfternoon') : t('dashboard.goodEvening');
  const todayLabel = formatDateLong(new Date(), i18n.language);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardService.getDashboard(),
    staleTime: 30_000,
    refetchOnWindowFocus: true,
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
        <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{greeting} 👋</h2>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{todayLabel}</p>
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

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Income vs Expenses bar chart */}
        <div className="card rounded-xl p-5" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            {t('dashboard.financialOverview')}
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={[
                { name: t('dashboard.totalIncome'),   value: d?.totalIncome ?? 0,   key: 'income' },
                { name: t('dashboard.totalExpenses'), value: d?.totalExpenses ?? 0, key: 'expense' },
                { name: t('dashboard.netBalance'),    value: Math.abs(d?.netBalance ?? 0), key: 'net' },
              ]}
              margin={{ top: 4, right: 8, left: -16, bottom: 0 }}
            >
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false}
                tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}k` : String(v)} />
              <Tooltip
                cursor={{ fill: 'var(--bg-subtle)', radius: 6 }}
                contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 8, fontSize: 12, color: 'var(--text-primary)' }}
                formatter={(v: number) => [`EGP ${v.toFixed(2)}`, '']}
              />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={52}>
                {[
                  { key: 'income',  color: 'var(--success)' },
                  { key: 'expense', color: 'var(--danger)' },
                  { key: 'net',     color: (d?.netBalance ?? 0) >= 0 ? 'var(--success)' : 'var(--danger)' },
                ].map((entry, i) => (
                  <Cell key={i} fill={entry.color} fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Task progress ring */}
        <div className="card rounded-xl p-5" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            {t('dashboard.taskProgress')}
          </h3>
          <div className="flex items-center gap-6">
            {/* SVG ring */}
            {(() => {
              const total = d?.totalTasks ?? 0;
              const done  = d?.completedTasks ?? 0;
              const pct   = total > 0 ? done / total : 0;
              const r = 52, cx = 64, cy = 64;
              const circ = 2 * Math.PI * r;
              const dash = pct * circ;
              return (
                <svg width="128" height="128" viewBox="0 0 128 128" className="shrink-0">
                  {/* Track */}
                  <circle cx={cx} cy={cy} r={r} fill="none" stroke="var(--bg-subtle)" strokeWidth="14" />
                  {/* Overdue arc */}
                  {(d?.overdueTasks ?? 0) > 0 && (
                    <circle cx={cx} cy={cy} r={r} fill="none"
                      stroke="var(--danger)" strokeWidth="14" strokeOpacity="0.5"
                      strokeDasharray={`${((d!.overdueTasks / total) * circ).toFixed(1)} ${circ}`}
                      strokeDashoffset="0"
                      transform={`rotate(-90 ${cx} ${cy})`}
                    />
                  )}
                  {/* Completed arc */}
                  <circle cx={cx} cy={cy} r={r} fill="none"
                    stroke="var(--success)" strokeWidth="14"
                    strokeDasharray={`${dash.toFixed(1)} ${circ}`}
                    strokeDashoffset="0"
                    strokeLinecap="round"
                    transform={`rotate(-90 ${cx} ${cy})`}
                    style={{ transition: 'stroke-dasharray 0.6s ease' }}
                  />
                  {/* Center text */}
                  <text x={cx} y={cy - 6} textAnchor="middle" fontSize="22" fontWeight="700" fill="var(--text-primary)">
                    {Math.round(pct * 100)}%
                  </text>
                  <text x={cx} y={cy + 14} textAnchor="middle" fontSize="10" fill="var(--text-muted)">
                    {t('dashboard.completed')}
                  </text>
                </svg>
              );
            })()}
            {/* Legend */}
            <div className="space-y-3 flex-1">
              {[
                { label: t('dashboard.completed'), value: d?.completedTasks ?? 0, color: 'var(--success)' },
                { label: t('dashboard.pending'),   value: d?.pendingTasks ?? 0,  color: 'var(--warning)' },
                { label: t('dashboard.overdue'),   value: d?.overdueTasks ?? 0,  color: 'var(--danger)'  },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                    <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                  </div>
                  <span className="text-sm font-bold" style={{ color }}>{value}</span>
                </div>
              ))}
              <div className="pt-1 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
                <div className="flex justify-between">
                  <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{t('dashboard.totalTasks')}</span>
                  <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{d?.totalTasks ?? 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
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
                    {task.category && <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{t(CATEGORY_I18N_KEYS[task.category] ?? task.category)}</p>}
                  </div>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0"
                    style={{
                      background: task.statusCode === 'COMPLETED' ? 'var(--success-bg)' : 'var(--accent-light)',
                      color:      task.statusCode === 'COMPLETED' ? 'var(--success)'    : 'var(--accent)',
                    }}
                  >
                    {task.statusCode === 'COMPLETED' ? t('tasks.filterCompleted') : t('tasks.filterPending')}
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
                      {t('common.due')}: {formatDate(bill.dueDate)}
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
