import { useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Camera, ClipboardList, Home, Search, User } from 'lucide-react';
import Logo from './Logo';
import Button from './Button';
import { useApp } from '../context/AppContext';
import { cn } from '../lib/utils';

const NAV = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/lost', label: 'I lost something', short: 'Lost', icon: Search },
  { to: '/activity', label: 'My activity', short: 'Activity', icon: ClipboardList },
  { to: '/profile', label: 'Profile', icon: User },
];

function Sidebar() {
  const { user } = useApp();
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r-[1.5px] border-line bg-white/80 p-6 backdrop-blur lg:flex">
      <Logo />
      <Button as={Link} to="/found" variant="butter" size="lg" className="mt-8 w-full">
        <Camera size={22} strokeWidth={2.5} /> I found something
      </Button>
      <nav aria-label="Main" className="mt-6 flex flex-col gap-1.5">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-2xl px-4 py-3 text-base font-semibold transition-colors',
                isActive ? 'bg-sky-tint text-ink' : 'text-ink-soft hover:bg-paper'
              )
            }
          >
            <Icon size={20} strokeWidth={2.25} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto rounded-2xl border-[1.5px] border-line bg-paper p-4 text-sm">
        <div className="font-bold">Signed in</div>
        <div className="truncate text-ink-soft">{user?.email}</div>
      </div>
    </aside>
  );
}

function TabBar() {
  const cell = (isActive) =>
    cn(
      'flex flex-col items-center gap-1 pt-2 text-xs font-bold transition-colors',
      isActive ? 'text-ink' : 'text-ink-faint'
    );
  const pill = (isActive) =>
    cn('flex h-8 w-14 items-center justify-center rounded-full transition-colors', isActive && 'bg-sky');

  const renderTab = ({ to, label, short, icon: Icon, end }) => (
    <NavLink key={to} to={to} end={end} className={({ isActive }) => cell(isActive)}>
      {({ isActive }) => (
        <>
          <span className={pill(isActive)}><Icon size={22} strokeWidth={2.25} /></span>
          {short || label}
        </>
      )}
    </NavLink>
  );

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t-[1.5px] border-line bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden"
    >
      <div className="mx-auto grid max-w-md grid-cols-5 items-start">
        {renderTab(NAV[0])}
        {renderTab(NAV[1])}
        <Link to="/found" aria-label="I found something" className="flex flex-col items-center gap-1 text-xs font-bold">
          <span className="-mt-6 flex h-16 w-16 items-center justify-center rounded-full border-[1.5px] border-ink/80 bg-butter shadow-[0_3px_0_0_rgba(38,43,82,.85)] transition-[transform,box-shadow] active:translate-y-[3px] active:shadow-none">
            <Camera size={28} strokeWidth={2.25} />
          </span>
          Found
        </Link>
        {renderTab(NAV[2])}
        {renderTab(NAV[3])}
      </div>
    </nav>
  );
}

export default function AppShell() {
  const { pathname } = useLocation();
  // Flows take over the phone screen, so the tab bar steps aside.
  const focusMode = /^\/(found|verify)/.test(pathname);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="min-h-dvh">
      <Sidebar />
      <main className="lg:pl-72">
        <div
          className={cn(
            'mx-auto w-full max-w-5xl px-5 pt-[max(1.5rem,env(safe-area-inset-top))] lg:px-10 lg:pb-16 lg:pt-10',
            focusMode ? 'pb-10' : 'pb-32'
          )}
        >
          <motion.div key={pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.18 }}>
            <Outlet />
          </motion.div>
        </div>
      </main>
      {!focusMode && <TabBar />}
    </div>
  );
}
