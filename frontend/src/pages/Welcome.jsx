import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Camera, ChevronRight, Search, Unlock } from 'lucide-react';
import Button from '../components/Button';
import Logo from '../components/Logo';
import { tone } from '../lib/tones';
import { cn } from '../lib/utils';
import { useApp } from '../context/AppContext';

const SLIDES = [
  { icon: Camera, tone: 'butter', title: 'Found something? Snap it.', text: 'Take a photo, tell us where you found it, and that is it. The photo stays private until the real owner shows up.' },
  { icon: Search, tone: 'blush', title: 'Lost something? Describe it.', text: 'Say what it looks like and where you were. We check every found item and show you the closest matches as text only.' },
  { icon: Unlock, tone: 'mint', title: 'Prove it is yours.', text: 'Answer a few quick questions about your item. Get them right and the photo unlocks, along with a way to get it back.' },
];

function Art({ slide }) {
  const c = tone(slide.tone);
  const Icon = slide.icon;
  return (
    <div className={cn('relative mx-auto flex aspect-square w-full max-w-xs items-center justify-center rounded-[2.5rem] border-[1.5px] border-ink/80', c.tint)}>
      <span className={cn('absolute left-6 top-8 h-14 w-14 rounded-full', c.solid)} />
      <span className="absolute bottom-10 right-8 h-9 w-9 rounded-full border-[1.5px] border-ink/80 bg-white" />
      <span className={cn('flex h-32 w-32 items-center justify-center rounded-[2rem] border-[1.5px] border-ink/80 bg-white shadow-pop')}>
        <Icon size={60} strokeWidth={1.75} />
      </span>
    </div>
  );
}

export default function Welcome() {
  const [i, setI] = useState(0);
  const navigate = useNavigate();
  const { finishOnboarding } = useApp();
  const last = i === SLIDES.length - 1;
  const slide = SLIDES[i];

  const finish = () => {
    finishOnboarding();
    navigate('/signin');
  };

  return (
    <div className="flex min-h-dvh items-center justify-center px-5 py-8 pt-[max(2rem,env(safe-area-inset-top))]">
      <div className="w-full max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <Logo />
          {!last && (
            <button type="button" onClick={finish} className="rounded-full px-3 py-2 text-sm font-bold text-ink-soft hover:bg-sky-tint">
              Skip
            </button>
          )}
        </div>

        <div className="overflow-hidden rounded-[2.5rem] border-[1.5px] border-ink/80 bg-white p-6 shadow-pop sm:p-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={i}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.25}
              onDragEnd={(_, info) => {
                if (info.offset.x < -70 && !last) setI(i + 1);
                if (info.offset.x > 70 && i > 0) setI(i - 1);
              }}
              initial={{ opacity: 0, x: 36 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -36 }}
              transition={{ duration: 0.22 }}
              className="grid items-center gap-8 md:grid-cols-2 md:gap-12"
            >
              <Art slide={slide} />
              <div className="text-center md:text-left">
                <h1 className="text-4xl font-extrabold leading-[1.05] sm:text-5xl">{slide.title}</h1>
                <p className="mt-4 text-lg text-ink-soft">{slide.text}</p>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-between gap-4">
            <div className="flex gap-2" aria-label={`Slide ${i + 1} of ${SLIDES.length}`}>
              {SLIDES.map((_, n) => (
                <button
                  key={n}
                  type="button"
                  aria-label={`Go to slide ${n + 1}`}
                  onClick={() => setI(n)}
                  className={cn('h-3 rounded-full border-[1.5px] border-ink/80 transition-all', n === i ? 'w-8 bg-butter' : 'w-3 bg-white')}
                />
              ))}
            </div>
            <Button size="lg" variant={last ? 'butter' : 'primary'} onClick={last ? finish : () => setI(i + 1)}>
              {last ? 'Get started' : 'Next'}
              <ChevronRight size={20} strokeWidth={2.75} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
