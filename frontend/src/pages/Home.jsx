import { Link } from 'react-router-dom';
import { ArrowRight, Camera, CheckCircle2, PartyPopper, Search, Unlock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { firstName, cn } from '../lib/utils';
import { RECENT_RETURNS, WEEKLY_RETURNED } from '../mocks/data';

const STEPS = [
  { icon: Camera, title: 'Snap it', text: 'Found something? Photo, place, done.', toneClass: 'bg-butter' },
  { icon: Search, title: 'Describe it', text: 'Lost something? Say what it looks like.', toneClass: 'bg-blush' },
  { icon: Unlock, title: 'Prove it', text: 'Answer a few questions and the photo unlocks.', toneClass: 'bg-mint' },
];

function ActionCard({ to, icon: Icon, title, text, bg, bubble }) {
  return (
    <Link
      to={to}
      className={cn(
        'group relative flex min-h-[11rem] flex-col justify-between overflow-hidden rounded-[2rem] border-[1.5px] border-ink/80 p-6 shadow-pop transition-[transform,box-shadow] duration-100 active:translate-y-[4px] active:shadow-none lg:min-h-[14rem] lg:p-8',
        bg
      )}
    >
      <span className={cn('flex h-14 w-14 items-center justify-center rounded-2xl border-[1.5px] border-ink/80', bubble)}>
        <Icon size={28} strokeWidth={2} />
      </span>
      <div className="mt-6 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold lg:text-3xl">{title}</h2>
          <p className="mt-1 max-w-[16rem] text-ink-soft">{text}</p>
        </div>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-[1.5px] border-ink/80 bg-white transition-transform group-hover:translate-x-1">
          <ArrowRight size={20} strokeWidth={2.5} />
        </span>
      </div>
    </Link>
  );
}

export default function Home() {
  const { user } = useApp();
  return (
    <div>
      <header className="mb-6 lg:mb-8">
        <h1 className="text-4xl font-extrabold leading-tight lg:text-5xl">Hi {firstName(user)}</h1>
        <p className="mt-1.5 text-lg text-ink-soft">Lost something or found something today?</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:gap-6">
        <ActionCard to="/found" icon={Camera} title="I found something" text="Snap a photo and leave the rest to us." bg="bg-butter-tint" bubble="bg-butter" />
        <ActionCard to="/lost" icon={Search} title="I lost something" text="Describe it and we will look for a match." bg="bg-blush-tint" bubble="bg-blush" />
      </div>

      <div className="mt-6 grid gap-4 lg:mt-8 lg:grid-cols-5 lg:gap-6">
        <section className="flex items-center gap-4 rounded-[2rem] border-[1.5px] border-ink/80 bg-mint-tint p-5 lg:col-span-2 lg:flex-col lg:items-start lg:justify-between lg:p-6">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-[1.5px] border-ink/80 bg-mint">
            <PartyPopper size={24} />
          </span>
          <div>
            <div className="text-4xl font-extrabold leading-none">{WEEKLY_RETURNED}</div>
            <p className="mt-1 font-semibold">things went home this week</p>
          </div>
        </section>

        <section className="rounded-[2rem] border-[1.5px] border-line bg-white p-5 lg:col-span-3 lg:p-6">
          <h2 className="text-xl font-bold">Recently returned</h2>
          <ul className="mt-3 divide-y divide-line">
            {RECENT_RETURNS.map((r) => (
              <li key={r.id} className="flex items-center gap-3 py-3">
                <CheckCircle2 size={20} className="shrink-0 text-mint-deep" strokeWidth={2.5} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{r.text}</div>
                  <div className="truncate text-sm text-ink-soft">{r.area}</div>
                </div>
                <span className="shrink-0 text-sm text-ink-faint">{r.when}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-8 lg:mt-10">
        <h2 className="mb-4 text-2xl font-bold">How it works</h2>
        <ol className="grid gap-3 md:grid-cols-3 lg:gap-5">
          {STEPS.map((s, n) => (
            <li key={s.title} className="flex items-start gap-4 rounded-3xl border-[1.5px] border-line bg-white p-5">
              <span className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border-[1.5px] border-ink/80', s.toneClass)}>
                <s.icon size={22} />
              </span>
              <div>
                <div className="font-bold">{n + 1}. {s.title}</div>
                <p className="mt-0.5 text-sm text-ink-soft">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
