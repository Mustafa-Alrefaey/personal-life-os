import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { taskService } from '../services/task.service';
import type { Task, CreateTaskRequest, UpdateTaskRequest } from '../types/task';
import { MainLayout } from '../components/layout/MainLayout';
import { PageLoader, Spinner } from '../components/ui/Spinner';
import { AppDatePicker } from '../components/ui/AppDatePicker';
import { useToast } from '../components/ui/Toast';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

const emptyTask: CreateTaskRequest = { title: '', description: '', dueDate: '', category: '' };

const inputCls = 'w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all';
const inputStyle = { background: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' };
const focusIn  = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px color-mix(in srgb, var(--accent) 15%, transparent)'; };
const focusOut = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => { e.target.style.borderColor = 'var(--border-default)'; e.target.style.boxShadow = 'none'; };

export default function TasksPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateTaskRequest>(emptyTask);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Completed'>('All');
  const [completingId, setCompletingId] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ['tasks'], queryFn: () => taskService.getAllTasks() });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['tasks'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const closeForm = () => { setShowForm(false); setEditingTask(null); setForm(emptyTask); };

  const startEdit = (task: Task) => {
    setEditingTask(task);
    setForm({ title: task.title, description: task.description ?? '', dueDate: task.dueDate?.split('T')[0] ?? '', category: task.category ?? '' });
    setShowForm(true);
  };

  const createMutation = useMutation({
    mutationFn: (req: CreateTaskRequest) => taskService.createTask(req),
    onSuccess: () => { invalidate(); closeForm(); showToast(t('tasks.created'), 'success'); },
    onError: () => showToast(t('common.error'), 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: (req: UpdateTaskRequest) => taskService.updateTask(req),
    onSuccess: () => { invalidate(); closeForm(); showToast(t('tasks.updated'), 'success'); },
    onError: () => showToast(t('common.error'), 'error'),
  });

  const completeMutation = useMutation({
    mutationFn: (id: number) => taskService.completeTask(id),
    onSuccess: () => { invalidate(); setCompletingId(null); showToast(t('tasks.completedMsg'), 'success'); },
    onError: () => setCompletingId(null),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => taskService.deleteTask(id),
    onSuccess: () => { invalidate(); setDeleteTarget(null); showToast(t('tasks.deleted'), 'success'); },
    onError: () => setDeleteTarget(null),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) {
      showToast(t('common.requiredField'), 'error');
      return;
    }
    if (editingTask) {
      updateMutation.mutate({ ...form, id: editingTask.id, statusCode: editingTask.statusCode });
    } else {
      createMutation.mutate(form);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const tasks = data?.data ?? [];
  const filtered = tasks
    .filter((task) => statusFilter === 'All' || task.statusCode === statusFilter)
    .filter((task) => !search || task.title.toLowerCase().includes(search.toLowerCase()) || task.category?.toLowerCase().includes(search.toLowerCase()));

  return (
    <MainLayout>
      <div className="card rounded-xl px-6 py-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{t('tasks.title')}</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{tasks.length} {t('tasks.total')}</p>
        </div>
        {showForm ? (
          <button
            onClick={closeForm}
            className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ background: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}
          >
            {t('tasks.cancel')}
          </button>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: 'var(--accent)' }}
          >
            {t('tasks.createTask')}
          </button>
        )}
      </div>

      {showForm && (
        <div className="card rounded-xl p-6 mb-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            {editingTask ? t('tasks.editTask') : t('tasks.createTask')}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{t('tasks.taskTitle')} *</label>
              <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                className={inputCls} style={{ ...inputStyle }} onFocus={focusIn} onBlur={focusOut} placeholder={t('tasks.titlePlaceholder')} />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{t('tasks.description')}</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className={inputCls} style={{ ...inputStyle }} onFocus={focusIn} onBlur={focusOut} rows={3} placeholder={t('tasks.descriptionPlaceholder')} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{t('tasks.dueDate')}</label>
                <AppDatePicker value={form.dueDate ?? ''} onChange={(v) => setForm({ ...form, dueDate: v })} placeholder={t('tasks.dueDate')} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{t('tasks.category')}</label>
                <input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className={inputCls} style={{ ...inputStyle }} onFocus={focusIn} onBlur={focusOut} placeholder={t('tasks.categoryPlaceholder')} />
              </div>
            </div>
            <button type="submit" disabled={isSaving}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: 'var(--accent)' }}>
              {isSaving ? <><Spinner size="sm" />{editingTask ? t('common.saving') : t('tasks.creating')}</> : editingTask ? t('common.saveChanges') : t('tasks.createTask')}
            </button>
          </form>
        </div>
      )}

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="flex-1 relative">
          <svg className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-muted)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={t('tasks.search')}
            className="w-full ps-9 pe-3 py-2 rounded-lg text-sm outline-none transition-all"
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px color-mix(in srgb, var(--accent) 15%, transparent)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--border-default)'; e.target.style.boxShadow = 'none'; }}
          />
        </div>
        <div className="flex gap-1">
          {(['All', 'Pending', 'Completed'] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className="px-3 py-2 rounded-lg text-xs font-semibold"
              style={{
                background: statusFilter === s ? 'var(--accent-light)' : 'var(--bg-subtle)',
                color: statusFilter === s ? 'var(--accent)' : 'var(--text-secondary)',
              }}>
              {s === 'All' ? t('tasks.filterAll') : s === 'Pending' ? t('tasks.filterPending') : t('tasks.filterCompleted')}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? <PageLoader message={t('tasks.loading')} /> : filtered.length === 0 ? (
        <div className="card rounded-xl p-12 text-center" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <p className="text-lg font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            {search || statusFilter !== 'All' ? t('tasks.noResults') : t('tasks.noTasks')}
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {search || statusFilter !== 'All' ? t('tasks.noResultsHint') : t('tasks.noTasksHint')}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((task) => (
            <div key={task.id} className="interactive-card rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 justify-between items-start"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{task.title}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{
                      background: task.statusCode === 'Completed' ? 'var(--success-bg)' : 'var(--accent-light)',
                      color:      task.statusCode === 'Completed' ? 'var(--success)'    : 'var(--accent)',
                    }}>
                    {task.statusCode === 'Completed' ? t('tasks.filterCompleted') : t('tasks.filterPending')}
                  </span>
                  {task.category && (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>
                      {task.category}
                    </span>
                  )}
                </div>
                {task.description && <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{task.description}</p>}
                {task.dueDate && (
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    {t('tasks.dueDate')}: {new Date(task.dueDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => startEdit(task)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                  {t('tasks.edit')}
                </button>
                {task.statusCode !== 'Completed' && (
                  <button
                    onClick={() => { setCompletingId(task.id); completeMutation.mutate(task.id); }}
                    disabled={completingId === task.id}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-50"
                    style={{ background: 'var(--success)' }}>
                    {completingId === task.id ? <Spinner size="sm" /> : t('tasks.complete')}
                  </button>
                )}
                <button
                  onClick={() => setDeleteTarget(task.id)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold"
                  style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>
                  {t('tasks.delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={deleteTarget !== null}
        title={t('common.confirmDelete')}
        message={t('common.confirmDeleteMsg')}
        loading={deleteMutation.isPending}
        onConfirm={() => { if (deleteTarget !== null) deleteMutation.mutate(deleteTarget); }}
        onCancel={() => setDeleteTarget(null)}
      />
    </MainLayout>
  );
}
