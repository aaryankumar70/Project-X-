import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, LogOut, RotateCcw } from 'lucide-react';
import Button from '../components/Button';
import PageHeader from '../components/PageHeader';
import Sheet from '../components/Sheet';
import { useToast } from '../components/Toast';
import { useApp } from '../context/AppContext';
import { ITEM_LIFETIME_DAYS, MAX_ATTEMPTS } from '../config';
import { cn, firstName } from '../lib/utils';

function Toggle({ on, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={cn('relative h-8 w-14 shrink-0 rounded-full border-[1.5px] border-ink/80 transition-colors', on ? 'bg-mint' : 'bg-white')}
    >
      <span className={cn('absolute top-0.5 h-6 w-6 rounded-full border-[1.5px] border-ink/80 bg-white transition-all', on ? 'left-[1.625rem]' : 'left-0.5')} />
    </button>
  );
}

export default function Profile() {
  const { user, signOut, notifications, setNotifications, resetDemo } = useApp();
  const navigate = useNavigate();
  const toast = useToast();
  const [confirmOut, setConfirmOut] = useState(false);

  return (
    <div className="max-w-2xl">
      <PageHeader title="Profile" />

      <section className="flex items-center gap-4 rounded-[2rem] border-[1.5px] border-line bg-white p-5">
        <span className="flex h-16 w-16 items-center justify-center rounded-full border-[1.5px] border-ink/80 bg-lilac font-display text-3xl font-extrabold">
          {firstName(user).charAt(0)}
        </span>
        <div className="min-w-0">
          <div className="text-xl font-bold">{firstName(user)}</div>
          <div className="truncate text-ink-soft">{user?.email}</div>
        </div>
      </section>

      <section className="mt-4 divide-y divide-line rounded-[2rem] border-[1.5px] border-line bg-white px-5">
        <div className="flex items-center gap-4 py-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-tint"><Bell size={20} /></span>
          <div className="flex-1">
            <div className="font-bold">Email me about matches</div>
            <div className="text-sm text-ink-soft">Replies and unlocks show up in your college inbox.</div>
          </div>
          <Toggle on={notifications} onChange={setNotifications} label="Email notifications" />
        </div>
        <div className="py-4 text-sm text-ink-soft">
          Found items disappear after {ITEM_LIFETIME_DAYS} days. You get {MAX_ATTEMPTS} tries to answer an item's questions.
        </div>
      </section>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button variant="soft" onClick={() => setConfirmOut(true)}><LogOut size={18} /> Sign out</Button>
        <Button variant="ghost" onClick={() => { resetDemo(); toast('Demo data reset.', 'sky'); }}>
          <RotateCcw size={18} /> Reset demo data
        </Button>
      </div>

      <Sheet open={confirmOut} onClose={() => setConfirmOut(false)} title="Sign out?">
        <p className="text-ink-soft">You can sign back in any time with a new email code.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
          <Button size="lg" className="flex-1" onClick={() => { signOut(); navigate('/signin', { replace: true }); }}>Sign out</Button>
          <Button variant="soft" size="lg" className="flex-1" onClick={() => setConfirmOut(false)}>Stay signed in</Button>
        </div>
      </Sheet>
    </div>
  );
}
