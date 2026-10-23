import { X } from 'lucide-react';
import { tone } from '../lib/tones';
import { cn } from '../lib/utils';

export default function Chip({ children, selected, onClick, onRemove, icon: Icon, toneKey = 'sky', className }) {
  const c = tone(toneKey);
  const base = cn(
    'inline-flex items-center gap-1.5 rounded-full border-[1.5px] px-3.5 py-2 text-sm font-semibold transition-colors',
    selected ? cn(c.tint, 'border-ink/80') : 'border-line bg-white hover:border-ink/40',
    className
  );

  if (onRemove) {
    return (
      <span className={base}>
        {Icon && <Icon size={15} />}
        {children}
        <button type="button" onClick={onRemove} aria-label={`Remove ${children}`} className="-mr-1 rounded-full p-0.5 hover:bg-ink/10">
          <X size={14} strokeWidth={2.5} />
        </button>
      </span>
    );
  }

  return (
    <button type="button" onClick={onClick} aria-pressed={!!selected} className={base}>
      {Icon && <Icon size={15} />}
      {children}
    </button>
  );
}
