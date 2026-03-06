import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { receiptService } from '../services/receipt.service';
import type { Receipt, CreateReceiptRequest } from '../types/receipt';
import { MainLayout } from '../components/layout/MainLayout';
import { PageLoader, Spinner } from '../components/ui/Spinner';
import { AppDatePicker } from '../components/ui/AppDatePicker';
import { useToast } from '../components/ui/Toast';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

const today = new Date().toISOString().split('T')[0];
const emptyForm: CreateReceiptRequest = { title: '', amount: 0, date: today, category: '' };

const inputCls = 'w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all';
const inputStyle = { background: 'var(--bg-subtle)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' };
const focusIn  = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = 'var(--accent)');
const focusOut = (e: React.FocusEvent<HTMLInputElement>) => (e.target.style.borderColor = 'var(--border-default)');

export default function ReceiptsPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateReceiptRequest>(emptyForm);
  const [editingReceipt, setEditingReceipt] = useState<Receipt | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageChangeRef = useRef<HTMLInputElement>(null);

  const { data, isLoading } = useQuery({ queryKey: ['receipts'], queryFn: () => receiptService.getAllReceipts() });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['receipts'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingReceipt(null);
    setForm(emptyForm);
    setImageFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startEdit = (receipt: Receipt) => {
    setEditingReceipt(receipt);
    setForm({ title: receipt.title, amount: receipt.amount, date: receipt.date.split('T')[0], category: receipt.category ?? '' });
    setImageFile(null);
    setShowForm(true);
  };

  const createMutation = useMutation({
    mutationFn: () => receiptService.createReceipt(form, imageFile!),
    onSuccess: () => { invalidate(); closeForm(); showToast(t('receipts.uploaded'), 'success'); },
    onError: () => showToast(t('common.error'), 'error'),
  });

  const updateMutation = useMutation({
    mutationFn: () => receiptService.updateReceipt(editingReceipt!.id, { ...form, id: editingReceipt!.id }),
    onSuccess: () => { invalidate(); closeForm(); showToast(t('receipts.updated'), 'success'); },
    onError: () => showToast(t('common.error'), 'error'),
  });

  const updateImageMutation = useMutation({
    mutationFn: ({ id, file }: { id: number; file: File }) => receiptService.updateReceiptImage(id, file),
    onSuccess: () => { invalidate(); showToast(t('receipts.imageUpdated'), 'success'); },
    onError: () => showToast(t('common.error'), 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => receiptService.deleteReceipt(id),
    onSuccess: () => { invalidate(); setDeleteTarget(null); showToast(t('receipts.deleted'), 'success'); },
    onError: () => setDeleteTarget(null),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.amount || !form.date) {
      showToast(t('common.requiredField'), 'error');
      return;
    }
    if (editingReceipt) {
      updateMutation.mutate();
    } else {
      if (!imageFile) { showToast(t('common.requiredField'), 'error'); return; }
      createMutation.mutate();
    }
  };

  const handleImageChange = (receiptId: number, file: File) => {
    updateImageMutation.mutate({ id: receiptId, file });
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;
  const receipts = data?.data ?? [];
  const totalAmount = receipts.reduce((s, r) => s + r.amount, 0);

  return (
    <MainLayout>
      <div className="card rounded-xl px-6 py-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{t('receipts.title')}</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {receipts.length} · {t('receipts.total')}: EGP {totalAmount.toFixed(2)}
          </p>
        </div>
        {showForm ? (
          <button
            onClick={closeForm}
            className="px-4 py-2 rounded-lg text-sm font-semibold"
            style={{ background: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}
          >
            {t('receipts.cancel')}
          </button>
        ) : (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: 'var(--accent)' }}
          >
            {t('receipts.upload')}
          </button>
        )}
      </div>

      {showForm && (
        <div className="card rounded-xl p-6 mb-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <h3 className="text-sm font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
            {editingReceipt ? t('receipts.editReceipt') : t('receipts.upload')}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{t('receipts.receiptTitle')} *</label>
                <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={inputCls} style={{ ...inputStyle }} onFocus={focusIn} onBlur={focusOut} placeholder={t('receipts.titlePlaceholder')} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{t('receipts.amount')} *</label>
                <input type="number" required min="0" step="0.01" value={form.amount || ''}
                  onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                  className={inputCls} style={{ ...inputStyle }} onFocus={focusIn} onBlur={focusOut} placeholder="0.00" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{t('receipts.date')} *</label>
                <AppDatePicker value={form.date} onChange={(v) => setForm({ ...form, date: v })} required />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{t('receipts.category')}</label>
                <input type="text" value={form.category ?? ''} onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className={inputCls} style={{ ...inputStyle }} onFocus={focusIn} onBlur={focusOut} placeholder={t('receipts.categoryPlaceholder')} />
              </div>
            </div>
            {!editingReceipt && (
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{t('receipts.image')} *</label>
                <input
                  ref={fileInputRef} type="file" required accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                  className="w-full text-sm rounded-lg px-3 py-2"
                  style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
                />
              </div>
            )}
            <button type="submit" disabled={isSaving || (!editingReceipt && !imageFile)}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60"
              style={{ background: 'var(--accent)' }}>
              {isSaving ? <><Spinner size="sm" />{editingReceipt ? t('common.saving') : t('receipts.uploading')}</> : editingReceipt ? t('common.saveChanges') : t('receipts.upload')}
            </button>
          </form>
        </div>
      )}

      {isLoading ? <PageLoader message={t('receipts.loading')} /> : receipts.length === 0 ? (
        <div className="card rounded-xl p-12 text-center" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <p className="text-lg font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{t('receipts.noReceipts')}</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{t('receipts.noReceiptsHint')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...receipts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((receipt) => (
            <div key={receipt.id} className="interactive-card rounded-xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
              {receipt.imagePath && (
                <div className="relative group">
                  <img
                    src={`http://localhost:5207/uploads/receipts/${receipt.imagePath}`}
                    alt={receipt.title}
                    className="w-full h-40 object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                  <button
                    type="button"
                    onClick={() => imageChangeRef.current?.click()}
                    className="absolute bottom-2 end-2 px-2.5 py-1 rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: 'var(--bg-surface)', color: 'var(--text-primary)', border: '1px solid var(--border-subtle)' }}
                  >
                    {updateImageMutation.isPending ? <Spinner size="sm" /> : t('receipts.changeImage')}
                  </button>
                  <input
                    ref={imageChangeRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageChange(receipt.id, file);
                      e.target.value = '';
                    }}
                  />
                </div>
              )}
              <div className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{receipt.title}</p>
                  <span className="text-sm font-bold shrink-0 ms-2" style={{ color: 'var(--text-primary)' }}>EGP {receipt.amount.toFixed(2)}</span>
                </div>
                <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{new Date(receipt.date).toLocaleDateString()}</p>
                {receipt.category && (
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>
                    {receipt.category}
                  </span>
                )}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => startEdit(receipt)}
                    className="flex-1 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1"
                    style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                    {t('receipts.edit')}
                  </button>
                  <button
                    onClick={() => setDeleteTarget(receipt.id)}
                    className="flex-1 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1"
                    style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>
                    {t('receipts.delete')}
                  </button>
                </div>
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
