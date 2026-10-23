import { cn } from '../lib/utils';

export default function ProgressBar({ step, total }) {
  return (
    <div
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={step + 1}
      className="flex gap-1.5"
    >
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            'h-2.5 flex-1 rounded-full border-[1.5px] transition-colors duration-300',
            i <= step ? 'border-ink/80 bg-butter' : 'border-line bg-white'
          )}
        />
      ))}
    </div>
  );
}
