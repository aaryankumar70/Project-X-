import { cn } from '../lib/utils';

const VARIANTS = {
  primary: 'bg-sky hover:bg-[#9ACDFF]',
  butter: 'bg-butter hover:bg-[#FFE08F]',
  blush: 'bg-blush hover:bg-[#FFC6D1]',
  mint: 'bg-mint hover:bg-[#B0EBD0]',
  soft: 'bg-white hover:bg-sky-tint',
  ghost:
    'border-transparent bg-transparent shadow-none hover:bg-sky-tint active:translate-y-0',
};

const SIZES = {
  sm: 'h-10 px-4 text-sm',
  md: 'h-12 px-6 text-base',
  lg: 'h-14 px-8 text-lg',
};

export default function Button({
  as: Comp = 'button',
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}) {
  const extra = Comp === 'button' && !props.type ? { type: 'button' } : {};
  return (
    <Comp
      {...extra}
      {...props}
      className={cn(
        'inline-flex select-none items-center justify-center gap-2 rounded-full border-[1.5px] border-ink/80 font-bold text-ink',
        'shadow-[0_3px_0_0_rgba(38,43,82,.85)] transition-[transform,box-shadow,background-color] duration-100',
        'active:translate-y-[3px] active:shadow-none',
        'disabled:pointer-events-none disabled:opacity-45',
        VARIANTS[variant],
        SIZES[size],
        className
      )}
    >
      {children}
    </Comp>
  );
}
