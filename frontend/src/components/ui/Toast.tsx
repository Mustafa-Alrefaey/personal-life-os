import { createContext, useContext, useState, useCallback, useEffect } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const icons: Record<ToastType, string> = {
  success: '✓',
  error: '✕',
  info: 'i',
};

const colors: Record<ToastType, { bg: string; icon: string }> = {
  success: { bg: 'var(--success)', icon: '#fff' },
  error: { bg: 'var(--danger)', icon: '#fff' },
  info: { bg: 'var(--info)', icon: '#fff' },
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: number) => void }) {
  const [visible, setVisible] = useState(false);
  const isRTL = document.documentElement.dir === 'rtl';

  useEffect(() => {
    const show = requestAnimationFrame(() => setVisible(true));
    const hide = setTimeout(() => setVisible(false), 2800);
    const remove = setTimeout(() => onRemove(toast.id), 3300);
    return () => { cancelAnimationFrame(show); clearTimeout(hide); clearTimeout(remove); };
  }, [toast.id, onRemove]);

  const c = colors[toast.type];
  const slideOut = isRTL ? 'translateX(-110%)' : 'translateX(110%)';
  return (
    <div
      style={{
        transform: visible ? 'translateX(0)' : slideOut,
        opacity: visible ? 1 : 0,
        transition: 'transform 0.3s ease, opacity 0.3s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 14px',
        borderRadius: '10px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        maxWidth: '320px',
        minWidth: '220px',
      }}
    >
      <div
        style={{
          width: '20px', height: '20px', borderRadius: '50%',
          background: c.bg, color: c.icon,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '11px', fontWeight: 700, flexShrink: 0,
        }}
      >
        {icons[toast.type]}
      </div>
      <span style={{ fontSize: '13px', color: 'var(--text-primary)', flex: 1 }}>{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: 1, background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px' }}
      >
        ×
      </button>
    </div>
  );
}

let nextId = 1;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType = 'success') => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        style={{
          position: 'fixed', bottom: '24px', insetInlineEnd: '24px',
          display: 'flex', flexDirection: 'column', gap: '8px',
          zIndex: 9999, pointerEvents: 'none',
        }}
      >
        {toasts.map((t) => (
          <div key={t.id} style={{ pointerEvents: 'auto' }}>
            <ToastItem toast={t} onRemove={remove} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
