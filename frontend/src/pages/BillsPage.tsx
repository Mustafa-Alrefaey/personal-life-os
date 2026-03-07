import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { billService } from '../services/bill.service';
import type { Bill, CreateBillRequest, UpdateBillRequest } from '../types/bill';
import { MainLayout } from '../components/layout/MainLayout';
import { PageLoader, Spinner } from '../components/ui/Spinner';
import { AppDatePicker } from '../components/ui/AppDatePicker';
import { useToast } from '../components/ui/Toast';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

const emptyForm: CreateBillRequest = { name: '', amount: 0, dueDate: '', reminderDaysBefore: 3 };

const inputCls = 'w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all';
const inputStyle = { background: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' };
const focusIn  = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px color-mix(in srgb, var(--accent) 15%, transparent)'; };
const focusOut = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = 'var(--border-default)'; e.target.style.boxShadow = 'none'; };

export default function BillsPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateBillRequest>(emptyForm);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [payingId, setPayingId] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending' | 'Paid'>('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const { data, isLoading } = useQuery({ queryKey: ['bills'], queryFn: () => billService.getAllBills() });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['bills'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const closeForm = () => { setShowForm(false); setEditingBill(null); setForm(emptyForm); };

  const startEdit = (bill: Bill) => {
    setEditingBill(bill);
    setForm({ name: bill.name, amount: bill.amount, dueDate: bill.dueDate.split('T')[0], reminderDaysBefore: bill.reminderDaysBefore });
    setShowForm(true);
  };

  const createMutation = useMutation({
    mutationFn: (req: CreateBillRequest) => billService.createBill(req),
    onSuccess: () => { invalidate(); closeForm(); showToast(t('bills.created'), 'success'); },
    onError: () => showToast(t('common.error'), 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: (req: UpdateBillRequest) => billService.updateBill(req.id, req),
    onSuccess: () => { invalidate(); closeForm(); showToast(t('bills.updated'), 'success'); },
    onError: () => showToast(t('common.error'), 'error'),
  });

  const payMutation = useMutation({
    mutationFn: (id: number) => billService.markAsPaid(id),
    onSuccess: () => { invalidate(); setPayingId(null); showToast(t('bills.paid'), 'success'); },
    onError: () => setPayingId(null),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => billService.deleteBill(id),
    onSuccess: () => { invalidate(); setDeleteTarget(null); showToast(t('bills.deleted'), 'success'); },
    onError: () => setDeleteTarget(null),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.amount || !form.dueDate) {
      showToast(t('common.requiredField'), 'error');
      return;
    }
    if (editingBill) {
      updateMutation.mutate({ ...form, id: editingBill.id, statusCode: editingBill.statusCode });
    } else {
      createMutation.mutate(form);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const bills = data?.data ?? [];
  const pendingCount = bills.filter((b) => b.statusCode === 'Pending').length;
  const paidCount    = bills.filter((b) => b.statusCode === 'Paid').length;
  const filtered = bills
    .filter((b) => statusFilter === 'All' || b.statusCode === statusFilter)
    .filter((b) => !search || b.name.toLowerCase().includes(search.toLowerCase()))
    .filter((b) => {
      if (!dateFrom && !dateTo) return true;
      const d = b.dueDate.split('T')[0];
      if (dateFrom && d < dateFrom) return false;
      if (dateTo && d > dateTo) return false;
      return true;
    });

  return (
    <MainLayout>
      <div className="card rounded-xl px-6 py-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{t('bills.title')}</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {t('bills.pending_count', { count: pendingCount })} · {t('bills.paid_count', { count: paidCount })}
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: 'var(--accent)' }}
          >
            {t('bills.addBill')}
          </button>
        )}
      </div>

      {showForm && (
        <div className="card rounded-xl p-6 mb-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            {editingBill ? t('bills.editBill') : t('bills.addBill')}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{t('bills.name')} *</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={inputCls} style={{ ...inputStyle }} onFocus={focusIn} onBlur={focusOut} placeholder={t('bills.namePlaceholder')} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{t('bills.amount')} *</label>
                <input type="number" required min="0" step="0.01" value={form.amount || ''}
                  onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                  className={inputCls} style={{ ...inputStyle }} onFocus={focusIn} onBlur={focusOut} placeholder="0.00" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{t('bills.dueDate')} *</label>
                <AppDatePicker value={form.dueDate} onChange={(v) => setForm({ ...form, dueDate: v })} required />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{t('bills.reminder')}</label>
                <input type="number" min="0" max="30" value={form.reminderDaysBefore}
                  onChange={(e) => setForm({ ...form, reminderDaysBefore: parseInt(e.target.value) || 0 })}
                  className={inputCls} style={{ ...inputStyle }} onFocus={focusIn} onBlur={focusOut} />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={closeForm}
                className="px-4 py-2 rounded-lg text-sm font-semibold"
                style={{ background: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}>
                {t('bills.cancel')}
              </button>
              <button type="submit" disabled={isSaving || !form.dueDate}
                className="px-5 py-2 rounded-lg text-sm font-semibold text-white flex items-center gap-2 disabled:opacity-60"
                style={{ background: 'var(--accent)' }}>
                {isSaving ? <><Spinner size="sm" />{editingBill ? t('common.saving') : t('bills.adding')}</> : editingBill ? t('common.saveChanges') : t('bills.addBill')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search + filter */}
      <div className="flex flex-col gap-3 mb-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <svg className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-muted)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <input
              type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder={t('bills.search')}
              className="w-full rounded-lg text-sm outline-none transition-all"
              style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', paddingInlineStart: '2.25rem', paddingInlineEnd: '0.75rem', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
              onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px color-mix(in srgb, var(--accent) 15%, transparent)'; }}
              onBlur={(e) => { e.target.style.borderColor = 'var(--border-default)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>
          <div className="flex gap-1">
            {(['All', 'Pending', 'Paid'] as const).map((s) => (
              <button key={s} onClick={() => setStatusFilter(s)}
                className="px-3 py-2 rounded-lg text-xs font-semibold"
                style={{
                  background: statusFilter === s ? 'var(--accent-light)' : 'var(--bg-subtle)',
                  color: statusFilter === s ? 'var(--accent)' : 'var(--text-secondary)',
                }}>
                {s === 'All' ? t('bills.filterAll') : s === 'Pending' ? t('bills.filterPending') : t('bills.filterPaid')}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{t('common.dateFrom')}</span>
          <div className="w-36"><AppDatePicker value={dateFrom} onChange={setDateFrom} placeholder={t('common.dateFrom')} /></div>
          <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{t('common.dateTo')}</span>
          <div className="w-36"><AppDatePicker value={dateTo} onChange={setDateTo} placeholder={t('common.dateTo')} /></div>
          {(dateFrom || dateTo) && (
            <button onClick={() => { setDateFrom(''); setDateTo(''); }}
              className="px-2 py-1.5 rounded-lg text-xs font-semibold"
              style={{ background: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}>
              {t('common.clearFilters')}
            </button>
          )}
        </div>
      </div>

      {isLoading ? <PageLoader message={t('bills.loading')} /> : filtered.length === 0 ? (
        <div className="card rounded-xl p-12 text-center" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <p className="text-lg font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            {search || statusFilter !== 'All' || dateFrom || dateTo ? t('bills.noResults') : t('bills.noBills')}
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {search || statusFilter !== 'All' || dateFrom || dateTo ? t('bills.noResultsHint') : t('bills.noBillsHint')}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((bill) => {
            const isOverdue = bill.statusCode === 'Pending' && new Date(bill.dueDate) < new Date();
            const statusLabel = bill.statusCode === 'Paid' ? t('bills.status_paid') : isOverdue ? t('bills.status_overdue') : t('bills.status_pending');
            const statusColor = bill.statusCode === 'Paid' ? 'var(--success)' : isOverdue ? 'var(--danger)' : 'var(--warning)';
            const statusBg   = bill.statusCode === 'Paid' ? 'var(--success-bg)' : isOverdue ? 'var(--danger-bg)' : 'var(--warning-bg)';
            return (
              <div key={bill.id} className="interactive-card rounded-xl p-4 sm:p-5 flex gap-3 items-center"
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
                {/* Checkbox */}
                <button
                  onClick={() => { if (bill.statusCode !== 'Paid') { setPayingId(bill.id); payMutation.mutate(bill.id); } }}
                  disabled={bill.statusCode === 'Paid' || payingId === bill.id}
                  title={bill.statusCode === 'Paid' ? t('bills.status_paid') : t('bills.pay')}
                  className="w-5 h-5 rounded shrink-0 flex items-center justify-center border-2 transition-all disabled:cursor-default"
                  style={{
                    borderColor: bill.statusCode === 'Paid' ? 'var(--success)' : 'var(--border-default)',
                    background: bill.statusCode === 'Paid' ? 'var(--success)' : 'transparent',
                    color: '#fff',
                  }}
                  onMouseEnter={(e) => { if (bill.statusCode !== 'Paid') { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--success)'; (e.currentTarget as HTMLButtonElement).style.background = 'var(--success-bg)'; } }}
                  onMouseLeave={(e) => { if (bill.statusCode !== 'Paid') { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-default)'; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; } }}
                >
                  {payingId === bill.id
                    ? <Spinner size="sm" />
                    : bill.statusCode === 'Paid'
                      ? <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                      : null}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)', textDecoration: bill.statusCode === 'Paid' ? 'line-through' : 'none', opacity: bill.statusCode === 'Paid' ? 0.6 : 1 }}>{bill.name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: statusBg, color: statusColor }}>
                      {statusLabel}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {t('common.due')}: {new Date(bill.dueDate).toLocaleDateString()}
                    {bill.reminderDaysBefore > 0 && ` · ${bill.reminderDaysBefore}d ${t('bills.reminderLabel')}`}
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>EGP {bill.amount.toFixed(2)}</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => startEdit(bill)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold"
                      style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                      {t('bills.edit')}
                    </button>
                    <button
                      onClick={() => setDeleteTarget(bill.id)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold"
                      style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>
                      {t('bills.delete')}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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
