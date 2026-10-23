import { Undo2 } from 'lucide-react';
import { APP_NAME } from '../config';

export default function Logo({ size = 'md' }) {
  const box = size === 'lg' ? 'h-12 w-12' : 'h-10 w-10';
  return (
    <div className="flex items-center gap-2.5">
      <span
        className={`${box} flex items-center justify-center rounded-2xl border-[1.5px] border-ink/80 bg-butter shadow-[0_3px_0_0_rgba(38,43,82,.85)]`}
        aria-hidden="true"
      >
        <Undo2 size={size === 'lg' ? 26 : 22} strokeWidth={2.75} />
      </span>
      <span className={`font-display font-extrabold tracking-tight ${size === 'lg' ? 'text-3xl' : 'text-2xl'}`}>
        {APP_NAME}
      </span>
    </div>
  );
}
