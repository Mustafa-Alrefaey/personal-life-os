import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { transactionService } from '../services/transaction.service';
import type { Transaction, CreateTransactionRequest, UpdateTransactionRequest, TransactionType } from '../types/transaction';
import { MainLayout } from '../components/layout/MainLayout';
import { PageLoader, Spinner } from '../components/ui/Spinner';
import { AppDatePicker } from '../components/ui/AppDatePicker';
import { useToast } from '../components/ui/Toast';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

const today = new Date().toISOString().split('T')[0];
const emptyForm: CreateTransactionRequest = { amount: 0, type: 'Expense', category: '', date: today, notes: '' };

const inputCls = 'w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all';
const inputStyle = { background: 'var(--bg-subtle)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' };
const focusIn  = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.target.style.borderColor = 'var(--accent)');
const focusOut = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => (e.target.style.borderColor = 'var(--border-default)');

export default function TransactionsPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateTransactionRequest>(emptyForm);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [filter, setFilter] = useState<'All' | 'Income' | 'Expense'>('All');
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => transactionService.getAllTransactions(),
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const closeForm = () => { setShowForm(false); setEditingTx(null); setForm(emptyForm); };

  const startEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setForm({ amount: tx.amount, type: tx.type, category: tx.category ?? '', date: tx.date.split('T')[0], notes: tx.notes ?? '' });
    setShowForm(true);
  };

  const createMutation = useMutation({
    mutationFn: () => transactionService.createTransaction(form),
    onSuccess: () => { invalidate(); closeForm(); showToast(t('transactions.created'), 'success'); },
    onError: () => showToast(t('common.error'), 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: (req: UpdateTransactionRequest) => transactionService.updateTransaction(req.id, req),
    onSuccess: () => { invalidate(); closeForm(); showToast(t('transactions.updated'), 'success'); },
    onError: () => showToast(t('common.error'), 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => transactionService.deleteTransaction(id),
    onSuccess: () => { invalidate(); setDeleteTarget(null); showToast(t('transactions.deleted'), 'success'); },
    onError: () => setDeleteTarget(null),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.amount || !form.date) {
      showToast(t('common.requiredField'), 'error');
      return;
    }
    if (editingTx) {
      updateMutation.mutate({ ...form, id: editingTx.id });
    } else {
      createMutation.mutate();
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const all = data?.data ?? [];
  const filtered = filter === 'All' ? all : all.filter((tx) => tx.type === filter);
  const totalIncome  = all.filter((tx) => tx.type === 'Income').reduce((s, tx) => s + tx.amount, 0);
  const totalExpense = all.filter((tx) => tx.type === 'Expense').reduce((s, tx) => s + tx.amount, 0);
  const balance = totalIncome - totalExpense;

  return (
    <MainLayout>
      {/* Header */}
      <div className="card rounded-xl px-6 py-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{t('transactions.title')}</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{all.length} {t('transactions.entries')}</p>
        </div>
        {showForm ? (
          <button
            onClick={closeForm}
            className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ background: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}
          >
            {t('common.cancel')}
          </button>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: 'var(--accent)' }}
          >
            {t('transactions.addTransaction')}
          </button>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: t('transactions.income'),   value: totalIncome,  color: 'var(--success)', bg: 'var(--success-bg)' },
          { label: t('transactions.expenses'), value: totalExpense, color: 'var(--danger)',  bg: 'var(--danger-bg)'  },
          { label: t('transactions.balance'),  value: balance,      color: balance >= 0 ? 'var(--success)' : 'var(--danger)', bg: 'var(--bg-surface)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card rounded-xl p-4" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
            <p className="text-xs font-medium uppercase tracking-wide mb-1" style={{ color: 'var(--text-muted)' }}>{label}</p>
            <p className="text-xl font-bold" style={{ color }}>EGP {Math.abs(value).toFixed(2)}</p>
          </div>
        ))}
      </div>

      {/* Create / Edit form */}
      {showForm && (
        <div className="card rounded-xl p-6 mb-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            {editingTx ? t('transactions.editTransaction') : t('transactions.addTransaction')}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Type selector */}
            <div className="flex gap-2">
              {(['Income', 'Expense'] as TransactionType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm({ ...form, type })}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold"
                  style={{
                    background: form.type === type ? (type === 'Income' ? 'var(--success)' : 'var(--danger)') : 'var(--bg-subtle)',
                    color: form.type === type ? '#fff' : 'var(--text-secondary)',
                  }}
                >
                  {type === 'Income' ? t('transactions.income') : t('transactions.expense')}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{t('transactions.amount')} *</label>
                <input
                  type="number" required min="0.01" step="0.01" value={form.amount || ''}
                  onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                  className={inputCls} style={inputStyle} onFocus={focusIn} onBlur={focusOut} placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{t('transactions.date')} *</label>
                <AppDatePicker value={form.date} onChange={(v) => setForm({ ...form, date: v })} required />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{t('transactions.category')}</label>
                <input
                  type="text" value={form.category ?? ''}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className={inputCls} style={inputStyle} onFocus={focusIn} onBlur={focusOut}
                  placeholder={t('transactions.categoryPlaceholder')}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{t('transactions.notes')}</label>
                <input
                  type="text" value={form.notes ?? ''}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className={inputCls} style={inputStyle} onFocus={focusIn} onBlur={focusOut}
                  placeholder={t('transactions.notesPlaceholder')}
                />
              </div>
            </div>

            <button
              type="submit" disabled={isSaving}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: 'var(--accent)' }}
            >
              {isSaving ? <><Spinner size="sm" />{editingTx ? t('common.saving') : t('transactions.adding')}</> : editingTx ? t('common.saveChanges') : t('transactions.addTransaction')}
            </button>
          </form>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 mb-4">
        {(['All', 'Income', 'Expense'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold"
            style={{
              background: filter === f ? 'var(--accent-light)' : 'var(--bg-subtle)',
              color: filter === f ? 'var(--accent)' : 'var(--text-secondary)',
            }}
          >
            {f === 'All' ? t('transactions.all') : f === 'Income' ? t('transactions.income') : t('transactions.expense')}
          </button>
        ))}
      </div>

      {/* List */}
      {isLoading ? <PageLoader message={t('transactions.loading')} /> : filtered.length === 0 ? (
        <div className="card rounded-xl p-12 text-center" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <p className="text-lg font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{t('transactions.noTransactions')}</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('transactions.noTransactionsHint')}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {[...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((tx) => (
            <div
              key={tx.id}
              className="interactive-card flex items-center gap-4 px-4 py-3 rounded-xl"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                style={{
                  background: tx.type === 'Income' ? 'var(--success-bg)' : 'var(--danger-bg)',
                  color: tx.type === 'Income' ? 'var(--success)' : 'var(--danger)',
                }}
              >
                {tx.type === 'Income' ? '+' : '−'}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                  {tx.category || (tx.type === 'Income' ? t('transactions.income') : t('transactions.expense'))}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {new Date(tx.date).toLocaleDateString()}{tx.notes ? ` · ${tx.notes}` : ''}
                </p>
              </div>

              <span
                className="text-sm font-bold shrink-0"
                style={{ color: tx.type === 'Income' ? 'var(--success)' : 'var(--danger)' }}
              >
                {tx.type === 'Income' ? '+' : '−'}EGP {tx.amount.toFixed(2)}
              </span>

              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={() => startEdit(tx)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium"
                  style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
                >
                  {t('transactions.edit')}
                </button>
                <button
                  onClick={() => setDeleteTarget(tx.id)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium"
                  style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}
                >
                  {t('transactions.delete')}
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
