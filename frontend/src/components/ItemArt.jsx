import { getCategory } from '../lib/categories';
import { tone } from '../lib/tones';
import { cn } from '../lib/utils';

// Stand-in picture used when an item has no photo (demo data).
export default function ItemArt({ category, className, iconSize = 64 }) {
  const cat = getCategory(category);
  const c = tone(cat.tone);
  const Icon = cat.icon;
  return (
    <div className={cn('relative flex items-center justify-center overflow-hidden', c.tint, className)}>
      <span className={cn('absolute -left-6 -top-6 h-24 w-24 rounded-full opacity-70', c.solid)} />
      <span className={cn('absolute -bottom-8 -right-4 h-28 w-28 rounded-full opacity-50', c.solid)} />
      <Icon size={iconSize} strokeWidth={1.75} className="relative text-ink" />
    </div>
  );
}
