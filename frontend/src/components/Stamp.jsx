import { tone } from '../lib/tones';
import { cn } from '../lib/utils';

export default function Stamp({ children, toneKey = 'mint', icon: Icon, tilt = true, className }) {
  const c = tone(toneKey);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border-[1.5px] px-2.5 py-1 text-sm font-bold text-ink',
        c.tint,
        c.border,
        tilt && '-rotate-2',
        className
      )}
    >
      {Icon && <Icon size={14} strokeWidth={2.5} />}
      {children}
    </span>
  );
}
