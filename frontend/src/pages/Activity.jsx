import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, MapPin, Search, Camera, Hourglass } from 'lucide-react';
import Button from '../components/Button';
import ItemArt from '../components/ItemArt';
import PageHeader from '../components/PageHeader';
import Sheet from '../components/Sheet';
import Stamp from '../components/Stamp';
import { useToast } from '../components/Toast';
import { useApp } from '../context/AppContext';
import { celebrate } from '../lib/confetti';
import { cn, postStatus, timeAgo, timeLeft } from '../lib/utils';

const STATUS = {
  active: { label: 'Active', tone: 'mint' },
  expiring: { label: 'Expiring soon', tone: 'butter', icon: Hourglass },
  returned: { label: 'Returned', tone: 'sky', icon: CheckCircle2 },
  expired: { label: 'Expired', tone: 'lilac' },
};

function Empty({ icon: Icon, title, text, to, cta }) {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center rounded-[2rem] border-[1.5px] border-line bg-white p-8 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl border-[1.5px] border-ink/80 bg-butter-tint"><Icon size={30} /></span>
      <h2 className="mt-4 text-xl font-bold">{title}</h2>
      <p className="mt-1.5 text-ink-soft">{text}</p>
      <Button as={Link} to={to} className="mt-5">{cta}</Button>
    </div>
  );
}

export default function Activity() {
  const { posts, searches, markReturned } = useApp();
  const toast = useToast();
  const [tab, setTab] = useState('posted');
  const [confirm, setConfirm] = useState(null);

  const confirmReturn = () => {
    markReturned(confirm.id);
    setConfirm(null);
    celebrate();
    toast('Marked as returned. Thank you!');
  };

  return (
    <div>
      <PageHeader title="My activity" subtitle="Things you posted and things you are looking for." />

      <div role="tablist" aria-label="Activity" className="mb-6 inline-flex rounded-full border-[1.5px] border-ink/80 bg-white p-1">
        {[['posted', 'Items I posted'], ['searching', 'Items I am looking for']].map(([key, label]) => (
          <button
            key={key}
            role="tab"
            type="button"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
            className={cn('rounded-full px-4 py-2 text-sm font-bold transition-colors sm:px-5', tab === key ? 'bg-butter' : 'text-ink-soft hover:text-ink')}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === 'posted' ? (
        posts.length === 0 ? (
          <Empty icon={Camera} title="Nothing posted yet" text="Found something on campus? It takes under a minute." to="/found" cta="I found something" />
        ) : (
          <ul className="grid gap-4 lg:grid-cols-2 lg:gap-6">
            {posts.map((p) => {
              const st = postStatus(p);
              const meta = STATUS[st];
              return (
                <li key={p.id} className="flex flex-col gap-4 rounded-[2rem] border-[1.5px] border-line bg-white p-4 sm:flex-row">
                  <div className="h-40 w-full shrink-0 overflow-hidden rounded-2xl sm:h-32 sm:w-32">
                    {p.photo ? <img src={p.photo} alt="" className="h-full w-full object-cover" /> : <ItemArt category={p.category} className="h-full w-full" iconSize={44} />}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex flex-wrap items-center gap-2">
                      <Stamp toneKey={meta.tone} icon={meta.icon}>{meta.label}</Stamp>
                      {(st === 'active' || st === 'expiring') && (
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-ink-soft"><Clock size={14} /> {timeLeft(p.expiresAt)}</span>
                      )}
                    </div>
                    <p className="mt-2 font-semibold leading-snug">{p.description}</p>
                    <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-ink-soft"><MapPin size={14} /> {p.area} · {timeAgo(p.postedAt)}</p>
                    {(st === 'active' || st === 'expiring') && (
                      <Button size="sm" variant="mint" className="mt-3 self-start" onClick={() => setConfirm(p)}>
                        <CheckCircle2 size={16} /> Mark as returned
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )
      ) : searches.length === 0 ? (
        <Empty icon={Search} title="No searches yet" text="Lost something? Describe it and we will look for a match." to="/lost" cta="I lost something" />
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2 lg:gap-6">
          {searches.map((s) => (
            <li key={s.id} className="flex items-center gap-4 rounded-[2rem] border-[1.5px] border-line bg-white p-5">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-[1.5px] border-ink/80 bg-blush-tint"><Search size={22} /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold capitalize">{s.summary}</p>
                <p className="text-sm text-ink-soft">{s.matches} {s.matches === 1 ? 'match' : 'matches'} · {timeAgo(s.createdAt)}</p>
              </div>
              <Button as={Link} to="/lost" size="sm" variant="soft">Search again</Button>
            </li>
          ))}
        </ul>
      )}

      <Sheet open={!!confirm} onClose={() => setConfirm(null)} title="Did it get back to its owner?">
        <p className="text-ink-soft">We will take it off the app and add it to this week's returns.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
          <Button variant="mint" size="lg" className="flex-1" onClick={confirmReturn}>Yes, it is returned</Button>
          <Button variant="soft" size="lg" className="flex-1" onClick={() => setConfirm(null)}>Not yet</Button>
        </div>
      </Sheet>
    </div>
  );
}
