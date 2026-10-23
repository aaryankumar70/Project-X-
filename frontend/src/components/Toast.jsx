import { createContext, useCallback, useContext, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Info } from 'lucide-react';
import { tone } from '../lib/tones';
import { cn } from '../lib/utils';

const ToastCtx = createContext(() => {});

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, toneKey = 'mint') => {
    const id = Math.random().toString(36).slice(2);
    setToasts((t) => [...t, { id, message, toneKey }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
  }, []);

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-28 z-[60] flex flex-col items-center gap-2 px-4 lg:bottom-8 lg:items-end lg:pr-8"
      >
        <AnimatePresence>
          {toasts.map((t) => {
            const c = tone(t.toneKey);
            const Icon = t.toneKey === 'mint' ? CheckCircle2 : Info;
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ y: 24, opacity: 0, scale: 0.96 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ type: 'spring', damping: 24, stiffness: 320 }}
                className={cn(
                  'pointer-events-auto flex max-w-sm items-center gap-3 rounded-2xl border-[1.5px] border-ink/80 bg-white px-4 py-3 shadow-soft'
                )}
              >
                <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', c.tint, c.deep)}>
                  <Icon size={18} strokeWidth={2.5} />
                </span>
                <span className="text-sm font-semibold">{t.message}</span>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

export const useToast = () => useContext(ToastCtx);
