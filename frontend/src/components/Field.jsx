import { forwardRef, useId } from 'react';
import { cn } from '../lib/utils';

const inputClass =
  'w-full rounded-2xl border-[1.5px] border-line bg-white px-4 py-3 text-base text-ink placeholder:text-ink-faint transition-colors focus:border-sky-deep focus:outline-none';

export function Field({ label, hint, error, children }) {
  return (
    <div className="space-y-1.5">
      {label && <div className="text-sm font-bold">{label}</div>}
      {children}
      {error ? (
        <p className="text-sm font-semibold text-blush-deep" role="alert">{error}</p>
      ) : (
        hint && <p className="text-sm text-ink-soft">{hint}</p>
      )}
    </div>
  );
}

export const Input = forwardRef(function Input({ label, hint, error, className, ...props }, ref) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={id} className="text-sm font-bold">{label}</label>}
      <input id={id} ref={ref} className={cn(inputClass, error && 'border-blush-deep', className)} {...props} />
      {error ? (
        <p className="text-sm font-semibold text-blush-deep" role="alert">{error}</p>
      ) : (
        hint && <p className="text-sm text-ink-soft">{hint}</p>
      )}
    </div>
  );
});

export const TextArea = forwardRef(function TextArea({ label, hint, className, rows = 4, ...props }, ref) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      {label && <label htmlFor={id} className="text-sm font-bold">{label}</label>}
      <textarea id={id} ref={ref} rows={rows} className={cn(inputClass, 'resize-none', className)} {...props} />
      {hint && <p className="text-sm text-ink-soft">{hint}</p>}
    </div>
  );
});
