import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { journalService } from '../services/journal.service';
import type { JournalEntry } from '../types/journal';
import { MainLayout } from '../components/layout/MainLayout';
import { PageLoader, Spinner } from '../components/ui/Spinner';
import { AppDatePicker } from '../components/ui/AppDatePicker';
import { useToast } from '../components/ui/Toast';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

const today = new Date().toISOString().split('T')[0];

export default function JournalPage() {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editEntry, setEditEntry] = useState<JournalEntry | null>(null);
  const [form, setForm] = useState({ date: today, notes: '' });
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const { data, isLoading } = useQuery({ queryKey: ['journal'], queryFn: () => journalService.getAllJournals() });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['journal'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const createMutation = useMutation({
    mutationFn: () => journalService.createJournal({ date: form.date, notes: form.notes }),
    onSuccess: () => { invalidate(); setShowForm(false); setForm({ date: today, notes: '' }); showToast(t('journal.saved'), 'success'); },
    onError: () => showToast(t('common.error'), 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: () => journalService.updateJournal(editEntry!.id, { id: editEntry!.id, date: form.date, notes: form.notes }),
    onSuccess: () => { invalidate(); setEditEntry(null); setShowForm(false); setForm({ date: today, notes: '' }); showToast(t('journal.updated'), 'success'); },
    onError: () => showToast(t('common.error'), 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => journalService.deleteJournal(id),
    onSuccess: () => { invalidate(); setDeleteTarget(null); showToast(t('journal.deleted'), 'success'); },
    onError: () => setDeleteTarget(null),
  });

  const handleEdit = (entry: JournalEntry) => {
    setEditEntry(entry);
    setForm({ date: entry.date.split('T')[0], notes: entry.notes });
    setShowForm(true);
  };

  const handleCancel = () => { setShowForm(false); setEditEntry(null); setForm({ date: today, notes: '' }); };

  const entries = data?.data ?? [];

  return (
    <MainLayout>
      <div className="card rounded-xl px-6 py-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{t('journal.title')}</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {t('journal.entries_count', { count: entries.length })}
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: 'var(--accent)' }}
          >
            {t('journal.newEntry')}
          </button>
        )}
      </div>

      {showForm && (
        <div className="card rounded-xl p-6 mb-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            {editEntry ? t('journal.editEntry') : t('journal.newEntry')}
          </h3>
          <form onSubmit={(e) => {
              e.preventDefault();
              if (!form.date || !form.notes.trim()) { showToast(t('common.requiredField'), 'error'); return; }
              editEntry ? updateMutation.mutate() : createMutation.mutate();
            }} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{t('journal.date')} *</label>
              <div className="w-full sm:w-56">
                <AppDatePicker value={form.date} onChange={(v) => setForm({ ...form, date: v })} required />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{t('journal.notes')} *</label>
              <textarea
                required rows={8} value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all resize-y"
                style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border-default)')}
                placeholder={t('journal.notesPlaceholder')}
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={createMutation.isPending || updateMutation.isPending}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: 'var(--accent)' }}>
                {(createMutation.isPending || updateMutation.isPending)
                  ? <><Spinner size="sm" />{t('journal.saving')}</>
                  : editEntry ? t('journal.saveChanges') : t('journal.save')}
              </button>
              <button type="button" onClick={handleCancel}
                className="px-6 py-2.5 rounded-lg text-sm font-semibold"
                style={{ background: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}>
                {t('journal.cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? <PageLoader message={t('journal.loading')} /> : entries.length === 0 ? (
        <div className="card rounded-xl p-12 text-center" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <p className="text-lg font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{t('journal.noEntries')}</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('journal.noEntriesHint')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {[...entries].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((entry) => (
            <div key={entry.id} className="interactive-card rounded-xl p-5" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              <div className="flex justify-between items-start gap-4 mb-3">
                <p className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                  {new Date(entry.date).toLocaleDateString(i18n.language, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => handleEdit(entry)}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium"
                    style={{ background: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}>
                    {t('journal.edit')}
                  </button>
                  <button
                    onClick={() => setDeleteTarget(entry.id)}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium"
                    style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>
                    {t('journal.delete')}
                  </button>
                </div>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-secondary)' }}>
                {entry.notes}
              </p>
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
