import { forwardRef } from 'react';
import DatePicker from 'react-datepicker';
import { useTranslation } from 'react-i18next';

interface AppDatePickerProps {
  value: string;          // ISO date string YYYY-MM-DD
  onChange: (val: string) => void;
  placeholder?: string;
  required?: boolean;
  minDate?: Date;
}

// Bare input — NO wrapper div so Popper can correctly anchor to the ref element
const DateInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ value, onClick, placeholder, required, onFocus, onBlur }, ref) => (
    <input
      ref={ref}
      type="text"
      readOnly
      required={required}
      value={(value as string) || ''}
      onClick={onClick}
      onFocus={(e) => {
        e.target.style.borderColor = 'var(--accent)';
        e.target.style.boxShadow = '0 0 0 3px color-mix(in srgb, var(--accent) 15%, transparent)';
        onFocus?.(e);
      }}
      onBlur={(e) => {
        e.target.style.borderColor = 'var(--border-default)';
        e.target.style.boxShadow = 'none';
        onBlur?.(e);
      }}
      placeholder={placeholder}
      className="w-full rounded-lg text-sm outline-none transition-all cursor-pointer"
      style={{
        background: 'var(--bg-input)',
        border: '1px solid var(--border-default)',
        color: 'var(--text-primary)',
        paddingInlineStart: '2.25rem',
        paddingInlineEnd: '0.75rem',
        paddingTop: '0.5625rem',
        paddingBottom: '0.5625rem',
      }}
    />
  )
);
DateInput.displayName = 'DateInput';

export function AppDatePicker({ value, onChange, placeholder, required, minDate }: AppDatePickerProps) {
  const { t } = useTranslation();
  const selected = value ? new Date(value + 'T00:00:00') : null;

  return (
    // Wrapper provides relative context for the calendar icon overlay
    <div className="relative w-full">
      {/* Calendar icon — absolute, does NOT affect the ref/Popper anchor */}
      <span
        className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none"
        style={{ zIndex: 1 }}
      >
        <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'var(--text-muted)' }}>
          <rect x="3" y="4" width="18" height="18" rx="2" strokeWidth="1.8"/>
          <path strokeLinecap="round" strokeWidth="1.8" d="M16 2v4M8 2v4M3 10h18"/>
        </svg>
      </span>

      <DatePicker
        selected={selected}
        onChange={(date) => {
          if (date) {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            onChange(`${y}-${m}-${d}`);
          }
        }}
        dateFormat="MMM d, yyyy"
        customInput={<DateInput placeholder={placeholder ?? t('common.selectDate')} required={required} />}
        minDate={minDate}
        autoComplete="off"
        wrapperClassName="w-full"
        popperPlacement="bottom-start"
        popperModifiers={[
          { name: 'offset', options: { offset: [0, 4] } },
          { name: 'preventOverflow', options: { padding: 8 } },
        ]}
      />
    </div>
  );
}
