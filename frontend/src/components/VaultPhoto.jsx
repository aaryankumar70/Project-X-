import { Lock } from 'lucide-react';
import { cn } from '../lib/utils';

export default function VaultPhoto({ className, label = 'Photo is locked' }) {
  return (
    <div
      className={cn(
        'hatch flex flex-col items-center justify-center gap-2 rounded-2xl border-[1.5px] border-dashed border-ink/30 bg-white text-ink-soft',
        className
      )}
    >
      <Lock size={22} strokeWidth={2.25} />
      <span className="px-3 text-center text-sm font-semibold">{label}</span>
    </div>
  );
}
