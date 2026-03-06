import { forwardRef } from 'react';
import DatePicker from 'react-datepicker';

interface AppDatePickerProps {
  value: string;          // ISO date string YYYY-MM-DD
  onChange: (val: string) => void;
  placeholder?: string;
  required?: boolean;
  minDate?: Date;
}

const DateInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ value, onClick, placeholder, required, onFocus, onBlur }, ref) => (
    <input
      ref={ref}
      type="text"
      readOnly
      required={required}
      value={(value as string) || ''}
      onClick={onClick}
      onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--accent)'; onFocus?.(e); }}
      onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'var(--border-default)'; onBlur?.(e); }}
      placeholder={placeholder ?? 'Select date'}
      className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all cursor-pointer"
      style={{ background: 'var(--bg-subtle)', border: '1px solid var(--border-default)', color: 'var(--text-primary)' }}
    />
  )
);

DateInput.displayName = 'DateInput';

export function AppDatePicker({ value, onChange, placeholder, required, minDate }: AppDatePickerProps) {
  const selected = value ? new Date(value + 'T00:00:00') : null;

  return (
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
      customInput={<DateInput placeholder={placeholder} required={required} />}
      minDate={minDate}
      autoComplete="off"
      wrapperClassName="w-full"
    />
  );
}
