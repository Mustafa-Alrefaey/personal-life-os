import { useState, useRef, useEffect } from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

interface AppSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
}

export function AppSelect({ value, onChange, options, placeholder = 'Select…' }: AppSelectProps) {
  const [open, setOpen] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.value === value && o.value !== '');

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Sync highlighted index when opening
  useEffect(() => {
    if (open) {
      const idx = options.findIndex(o => o.value === value);
      setHighlightedIdx(idx >= 0 ? idx : 0);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === 'Escape') { setOpen(false); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setHighlightedIdx(i => Math.min(i + 1, options.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setHighlightedIdx(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIdx >= 0 && highlightedIdx < options.length) {
        onChange(options[highlightedIdx].value);
        setOpen(false);
      }
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        onKeyDown={handleKeyDown}
        className="w-full rounded-lg text-sm flex items-center justify-between gap-2 transition-all outline-none"
        style={{
          background: 'var(--bg-input)',
          border: `1px solid ${open ? 'var(--accent)' : 'var(--border-default)'}`,
          color: selectedOption ? 'var(--text-primary)' : 'var(--text-muted)',
          boxShadow: open ? '0 0 0 3px color-mix(in srgb, var(--accent) 15%, transparent)' : 'none',
          padding: '0.5625rem 0.75rem',
          textAlign: 'start',
        }}
      >
        <span className="truncate">{selectedOption?.label ?? placeholder}</span>
        <svg
          width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"
          style={{
            transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
            flexShrink: 0,
            color: 'var(--text-muted)',
          }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 9l6 6 6-6"/>
        </svg>
      </button>

      {open && (
        <div
          className="absolute z-50 w-full mt-1 rounded-xl py-1 overflow-auto"
          style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-lg)',
            maxHeight: '15rem',
          }}
        >
          {options.map((option, idx) => {
            const isSelected = option.value === value;
            const isHighlighted = idx === highlightedIdx;
            const isEmpty = option.value === '';
            return (
              <button
                key={option.value || '__placeholder__'}
                type="button"
                onMouseEnter={() => setHighlightedIdx(idx)}
                onClick={() => { onChange(option.value); setOpen(false); }}
                className="w-full px-3 py-2 text-sm flex items-center gap-2"
                style={{
                  background: isHighlighted && !isEmpty ? 'var(--bg-subtle)' : 'transparent',
                  color: isSelected && !isEmpty ? 'var(--accent)' : isEmpty ? 'var(--text-muted)' : 'var(--text-primary)',
                  fontWeight: isSelected && !isEmpty ? 600 : 400,
                  textAlign: 'start',
                }}
              >
                <span className="w-4 shrink-0 flex items-center justify-center">
                  {isSelected && !isEmpty && (
                    <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"/>
                    </svg>
                  )}
                </span>
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
