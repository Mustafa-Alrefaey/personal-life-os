interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizes = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-2', lg: 'w-12 h-12 border-[3px]' };
  return (
    <div
      className={`${sizes[size]} rounded-full border-[var(--border-muted)] border-t-[var(--accent)] animate-spin ${className}`}
      style={{ borderColor: 'var(--bg-muted)', borderTopColor: 'var(--accent)' }}
      role="status"
      aria-label="Loading"
    />
  );
}

export function PageLoader({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4">
      <Spinner size="lg" />
      {message && <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{message}</p>}
    </div>
  );
}
