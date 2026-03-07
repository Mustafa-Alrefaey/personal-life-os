import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { receiptService } from '../services/receipt.service';
import { API_BASE_URL } from '../services/api';
import type { Receipt, CreateReceiptRequest } from '../types/receipt';
import { MainLayout } from '../components/layout/MainLayout';
import { PageLoader, Spinner } from '../components/ui/Spinner';
import { AppDatePicker } from '../components/ui/AppDatePicker';
import { AppSelect } from '../components/ui/AppSelect';
import { Modal } from '../components/ui/Modal';
import { CATEGORY_I18N_KEYS } from '../utils/categoryLabel';
import { useToast } from '../components/ui/Toast';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';

const today = new Date().toISOString().split('T')[0];
const emptyForm: CreateReceiptRequest = { title: '', amount: 0, date: today, category: '' };

const inputCls = 'w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all';
const inputStyle = { background: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' };
const focusIn  = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px color-mix(in srgb, var(--accent) 15%, transparent)'; };
const focusOut = (e: React.FocusEvent<HTMLInputElement>) => { e.target.style.borderColor = 'var(--border-default)'; e.target.style.boxShadow = 'none'; };

export default function ReceiptsPage() {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateReceiptRequest>(emptyForm);
  const [editingReceipt, setEditingReceipt] = useState<Receipt | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
  const [search, setSearch] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [previewImage, setPreviewImage] = useState<{ src: string; title: string } | null>(null);
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
  const filtered = receipts
    .filter((r) => !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.category?.toLowerCase().includes(search.toLowerCase()))
    .filter((r) => {
      if (!dateFrom && !dateTo) return true;
      const d = r.date.split('T')[0];
      if (dateFrom && d < dateFrom) return false;
      if (dateTo && d > dateTo) return false;
      return true;
    });

  return (
    <MainLayout>
      <div className="card rounded-xl px-6 py-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
        <div>
          <h2 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{t('receipts.title')}</h2>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
            {filtered.length} · {t('receipts.total')}: EGP {totalAmount.toFixed(2)}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: 'var(--accent)' }}
        >
          {t('receipts.upload')}
        </button>
      </div>

      <Modal
        open={showForm}
        onClose={closeForm}
        title={editingReceipt ? t('receipts.editReceipt') : t('receipts.upload')}
      >
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
              <AppSelect
                value={form.category ?? ''}
                onChange={(v) => setForm({ ...form, category: v })}
                placeholder={t('categories.placeholder')}
                options={[
                  { value: '', label: t('categories.placeholder') },
                  { value: 'Food & Dining', label: t('categories.foodDining') },
                  { value: 'Transport', label: t('categories.transport') },
                  { value: 'Shopping', label: t('categories.shopping') },
                  { value: 'Entertainment', label: t('categories.entertainment') },
                  { value: 'Health', label: t('categories.health') },
                  { value: 'Utilities', label: t('categories.utilities') },
                  { value: 'Education', label: t('categories.education') },
                  { value: 'Other', label: t('categories.other') },
                ]}
              />
            </div>
          </div>
          {!editingReceipt && (
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{t('receipts.image')} *</label>
              <input
                ref={fileInputRef} type="file" required accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm rounded-lg px-3 py-2"
                style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
              />
            </div>
          )}
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={closeForm}
              className="px-4 py-2 rounded-lg text-sm font-semibold"
              style={{ background: 'var(--bg-subtle)', color: 'var(--text-secondary)' }}>
              {t('receipts.cancel')}
            </button>
            <button type="submit" disabled={isSaving || (!editingReceipt && !imageFile)}
              className="px-5 py-2 rounded-lg text-sm font-semibold text-white flex items-center gap-2 disabled:opacity-60"
              style={{ background: 'var(--accent)' }}>
              {isSaving ? <><Spinner size="sm" />{editingReceipt ? t('common.saving') : t('receipts.uploading')}</> : editingReceipt ? t('common.saveChanges') : t('receipts.upload')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Search + Date Filter */}
      <div className="flex flex-col gap-3 mb-5">
        <div className="flex-1 relative">
          <svg className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-muted)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
          </svg>
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={t('receipts.search')}
            className="w-full rounded-lg text-sm outline-none transition-all"
            style={{ background: 'var(--bg-input)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', paddingInlineStart: '2.25rem', paddingInlineEnd: '0.75rem', paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--accent)'; e.target.style.boxShadow = '0 0 0 3px color-mix(in srgb, var(--accent) 15%, transparent)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--border-default)'; e.target.style.boxShadow = 'none'; }}
          />
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

      {isLoading ? <PageLoader message={t('receipts.loading')} /> : filtered.length === 0 ? (
        <div className="card rounded-xl p-12 text-center" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)' }}>
          <p className="text-lg font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            {search || dateFrom || dateTo ? t('receipts.noResults') : t('receipts.noReceipts')}
          </p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {search || dateFrom || dateTo ? t('receipts.noResultsHint') : t('receipts.noReceiptsHint')}
          </p>
        </div>
      ) : (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ background: 'var(--bg-surface)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-subtle)' }}>
                  <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)', width: '60px' }}>{t('receipts.image')}</th>
                  <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{t('receipts.receiptTitle')}</th>
                  <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide hidden sm:table-cell" style={{ color: 'var(--text-muted)' }}>{t('receipts.category')}</th>
                  <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wide hidden sm:table-cell" style={{ color: 'var(--text-muted)' }}>{t('receipts.date')}</th>
                  <th className="px-4 py-3 text-end text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{t('receipts.amount')}</th>
                  <th className="px-4 py-3 text-end text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)', width: '100px' }}>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {[...filtered].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((receipt, i) => (
                  <tr key={receipt.id} className="transition-colors hover:bg-[var(--bg-subtle)]" style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border-subtle)' : undefined }}>
                    <td className="px-4 py-2">
                      {receipt.imagePath ? (
                        <img
                          src={`${API_BASE_URL}/uploads/receipts/${receipt.imagePath}`}
                          alt={receipt.title}
                          className="w-10 h-10 rounded-lg object-cover cursor-pointer transition-opacity hover:opacity-80"
                          onClick={() => setPreviewImage({ src: `${API_BASE_URL}/uploads/receipts/${receipt.imagePath}`, title: receipt.title })}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-subtle)' }}>
                          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-muted)' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                          </svg>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{receipt.title}</span>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {receipt.category && (
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>
                          {t(CATEGORY_I18N_KEYS[receipt.category] ?? receipt.category)}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell text-xs" style={{ color: 'var(--text-muted)' }}>
                      {new Date(receipt.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-end">
                      <span className="font-bold" style={{ color: 'var(--text-primary)' }}>EGP {receipt.amount.toFixed(2)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-end">
                        <button type="button" onClick={() => startEdit(receipt)} title={t('receipts.edit')}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                          style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}>
                          <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                        </button>
                        <button type="button"
                          onClick={() => {
                            imageChangeRef.current?.click();
                            imageChangeRef.current?.setAttribute('data-receipt-id', String(receipt.id));
                          }}
                          title={t('receipts.changeImage')}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                          style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)' }}>
                          <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                          </svg>
                        </button>
                        <button type="button" onClick={() => setDeleteTarget(receipt.id)} title={t('receipts.delete')}
                          className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
                          style={{ background: 'var(--danger-bg)', color: 'var(--danger)' }}>
                          <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <input
            ref={imageChangeRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              const receiptId = parseInt(imageChangeRef.current?.getAttribute('data-receipt-id') ?? '0');
              if (file && receiptId) handleImageChange(receiptId, file);
              e.target.value = '';
            }}
          />
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

      {/* Image Preview Lightbox */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(4px)' }}
          onClick={() => setPreviewImage(null)}
        >
          <button
            className="absolute top-4 end-4 w-10 h-10 rounded-full flex items-center justify-center text-white bg-white/10 hover:bg-white/20 transition-colors"
            onClick={() => setPreviewImage(null)}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
          <div className="max-w-4xl max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <img
              src={previewImage.src}
              alt={previewImage.title}
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            />
            <p className="text-white text-sm font-medium mt-3 text-center">{previewImage.title}</p>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
