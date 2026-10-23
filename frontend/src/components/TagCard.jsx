import { Clock, Lock, MapPin } from 'lucide-react';
import { getCategory } from '../lib/categories';
import { tone } from '../lib/tones';
import { cn, timeAgo } from '../lib/utils';
import Stamp from './Stamp';

const STRENGTH = {
  strong: { label: 'Strong match', tone: 'mint' },
  likely: { label: 'Likely match', tone: 'butter' },
  possible: { label: 'Possible match', tone: 'lilac' },
};

// A lost-property ticket: coloured stub, perforation, and the text-only details.
export default function TagCard({ item, onClick }) {
  const cat = getCategory(item.category);
  const c = tone(cat.tone);
  const Icon = cat.icon;
  const s = STRENGTH[item.strength] || STRENGTH.possible;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative flex w-full overflow-hidden rounded-3xl border-[1.5px] border-ink/80 bg-white text-left shadow-pop transition-[transform,box-shadow] duration-100 active:translate-y-[4px] active:shadow-none"
    >
      <div className={cn('flex w-20 shrink-0 flex-col items-center justify-center gap-2 sm:w-28', c.tint)}>
        <Icon size={34} strokeWidth={1.85} />
        <span className="px-1 text-center text-xs font-bold">{cat.label}</span>
      </div>
      <div className="relative flex-1 border-l-2 border-dashed border-ink/25 p-4 sm:p-5">
        <span className="absolute -left-[11px] -top-[11px] h-5 w-5 rounded-full border-[1.5px] border-ink/80 bg-paper" />
        <span className="absolute -bottom-[11px] -left-[11px] h-5 w-5 rounded-full border-[1.5px] border-ink/80 bg-paper" />
        <Stamp toneKey={s.tone}>{s.label}</Stamp>
        <p className="mt-3 text-base font-semibold leading-snug sm:text-lg">{item.description}</p>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-ink-soft">
          <span className="inline-flex items-center gap-1.5"><MapPin size={15} /> {item.area}</span>
          <span className="inline-flex items-center gap-1.5"><Clock size={15} /> {timeAgo(item.postedAt)}</span>
          <span className="inline-flex items-center gap-1.5"><Lock size={15} /> Photo locked</span>
        </div>
      </div>
    </button>
  );
}
