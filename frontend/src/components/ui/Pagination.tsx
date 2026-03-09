interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  pageSize: number;
}

export function Pagination({ page, totalPages, onPageChange, totalItems, pageSize }: PaginationProps) {
  if (totalPages <= 1) return null;

  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  const pages: (number | 'ellipsis')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('ellipsis');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) pages.push(i);
    if (page < totalPages - 2) pages.push('ellipsis');
    pages.push(totalPages);
  }

  const btnBase: React.CSSProperties = {
    minWidth: '1.5rem',
    height: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '0.375rem',
    fontSize: '0.7rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.15s',
    border: '1px solid var(--border-subtle)',
    background: 'var(--bg-surface)',
    color: 'var(--text-secondary)',
    padding: '0 0.3rem',
  };

  const activeStyle: React.CSSProperties = {
    ...btnBase,
    background: 'var(--accent)',
    borderColor: 'var(--accent)',
    color: '#fff',
    fontWeight: 600,
  };

  const disabledStyle: React.CSSProperties = {
    ...btnBase,
    opacity: 0.35,
    cursor: 'not-allowed',
  };

  return (
    <div className="flex items-center justify-between gap-4 pt-4 pb-2 mt-2 flex-wrap">
      <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>
        {from}–{to} of {totalItems}
      </span>

      <div className="flex items-center gap-1">
        {/* Prev */}
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          style={page === 1 ? disabledStyle : btnBase}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
          </svg>
        </button>

        {pages.map((p, idx) =>
          p === 'ellipsis' ? (
            <span key={`e${idx}`} style={{ color: 'var(--text-muted)', fontSize: '0.8125rem', padding: '0 0.25rem' }}>…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              style={p === page ? activeStyle : btnBase}
            >
              {p}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          style={page === totalPages ? disabledStyle : btnBase}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
