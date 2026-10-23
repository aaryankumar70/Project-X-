import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Lock, ShieldAlert, Unlock } from 'lucide-react';
import Button from '../components/Button';
import PageHeader from '../components/PageHeader';
import ProgressBar from '../components/ProgressBar';
import { Input } from '../components/Field';
import { useApp } from '../context/AppContext';
import { checkAnswers, getPublicItem, getQuestions } from '../services/api';
import { MAX_ATTEMPTS } from '../config';
import { getCategory } from '../lib/categories';
import { celebrate } from '../lib/confetti';
import { cn } from '../lib/utils';

function Notice({ icon: Icon, bg, title, text, children }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-12 text-center lg:py-20">
      <span className={cn('flex h-24 w-24 items-center justify-center rounded-[2rem] border-[1.5px] border-ink/80', bg)}>
        <Icon size={44} />
      </span>
      <h1 className="mt-6 text-3xl font-extrabold">{title}</h1>
      <p className="mt-2 text-ink-soft">{text}</p>
      <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">{children}</div>
    </div>
  );
}

export default function Verify() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { unlocked, attempts, unlock, recordFail } = useApp();
  const [item, setItem] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [phase, setPhase] = useState('loading'); // loading | quiz | checking | passed | failed | locked | missing
  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState({});
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    let live = true;
    Promise.all([getPublicItem(id), getQuestions(id)]).then(([it, qs]) => {
      if (!live) return;
      if (!it) return setPhase('missing');
      setItem(it);
      setQuestions(qs);
      if (unlocked.includes(id)) setPhase('passed');
      else if ((attempts[id] || 0) >= MAX_ATTEMPTS) setPhase('locked');
      else setPhase('quiz');
    });
    return () => { live = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (phase !== 'passed') return undefined;
    const t = setTimeout(() => setOpened(true), 650);
    return () => clearTimeout(t);
  }, [phase]);

  const q = questions[i];
  const given = q ? answers[q.id] : undefined;
  const answered = q && (q.type === 'choice' ? given !== undefined : (given || '').trim().length > 0);
  const used = attempts[id] || 0;
  const left = Math.max(0, MAX_ATTEMPTS - used);

  const next = async () => {
    if (i < questions.length - 1) return setI(i + 1);
    setPhase('checking');
    const res = await checkAnswers(id, answers);
    if (res.passed) {
      unlock(id);
      setPhase('passed');
      celebrate();
    } else {
      recordFail(id);
      setPhase('failed');
    }
  };

  const retry = () => {
    setAnswers({});
    setI(0);
    setPhase(left <= 0 ? 'locked' : 'quiz');
  };

  if (phase === 'loading') {
    return <div className="py-32 text-center font-semibold text-ink-soft">Getting your questions…</div>;
  }

  if (phase === 'missing') {
    return (
      <Notice icon={ShieldAlert} bg="bg-lilac-tint" title="This item is gone" text="It may have been collected, or it expired. Try searching again.">
        <Button as={Link} to="/lost">Search again</Button>
      </Notice>
    );
  }

  if (phase === 'locked') {
    return (
      <Notice icon={Lock} bg="bg-blush-tint" title="No more tries for now" text="You have used all your attempts on this item. If it is really yours, try again later or ask campus security for help.">
        <Button as={Link} to="/lost">Back to search</Button>
      </Notice>
    );
  }

  if (phase === 'failed') {
    return (
      <Notice
        icon={ShieldAlert}
        bg="bg-blush-tint"
        title="Not quite"
        text={left > 0 ? `Some answers did not match. You have ${left} ${left === 1 ? 'try' : 'tries'} left.` : 'Some answers did not match, and you are out of tries.'}
      >
        {left > 0 ? <Button onClick={retry} size="lg">Try again</Button> : <Button as={Link} to="/lost" size="lg">Back to search</Button>}
        <Button variant="soft" size="lg" onClick={() => navigate('/lost')}>Not mine after all</Button>
      </Notice>
    );
  }

  if (phase === 'passed') {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center py-12 text-center lg:py-20">
        <motion.span
          key={opened ? 'open' : 'closed'}
          initial={{ scale: 0.7, rotate: opened ? -14 : 0 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', damping: 10, stiffness: 260 }}
          className={cn('flex h-28 w-28 items-center justify-center rounded-[2.25rem] border-[1.5px] border-ink/80 shadow-pop', opened ? 'bg-mint' : 'bg-white')}
        >
          {opened ? <Unlock size={52} strokeWidth={2} /> : <Lock size={52} strokeWidth={2} />}
        </motion.span>
        <h1 className="mt-8 text-4xl font-extrabold">{opened ? 'Unlocked. It is yours.' : 'Checking…'}</h1>
        <p className="mt-2 text-ink-soft">Nice memory. The photo and hand-off details are ready.</p>
        <Button as={Link} to={`/reveal/${id}`} size="lg" variant="butter" className="mt-8 w-full sm:w-auto sm:min-w-[14rem]">
          See my item <ArrowRight size={20} strokeWidth={2.75} />
        </Button>
      </div>
    );
  }

  if (!item || !q) {
    return (
      <Notice icon={ShieldAlert} bg="bg-lilac-tint" title="This item is gone" text="It may have been collected, or it expired. Try searching again.">
        <Button as={Link} to="/lost">Search again</Button>
      </Notice>
    );
  }

  const cat = getCategory(item.category);

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Prove it is yours" back="/lost" />
      <div className="mb-6 flex items-center gap-3 rounded-2xl border-[1.5px] border-line bg-white p-3.5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-tint"><cat.icon size={20} /></span>
        <p className="text-sm font-semibold">{item.description}</p>
      </div>

      <div className="mb-2 text-sm font-bold text-ink-soft">Question {i + 1} of {questions.length}</div>
      <ProgressBar step={i} total={questions.length} />

      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, x: 36 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -36 }}
          transition={{ duration: 0.2 }}
          className="mt-6 rounded-[2rem] border-[1.5px] border-ink/80 bg-white p-6 shadow-pop sm:p-8"
        >
          <h2 className="text-2xl font-extrabold leading-snug">{q.prompt}</h2>
          {q.type === 'choice' ? (
            <div role="radiogroup" aria-label={q.prompt} className="mt-5 grid gap-3">
              {q.options.map((opt, n) => (
                <button
                  key={opt}
                  type="button"
                  role="radio"
                  aria-checked={given === n}
                  onClick={() => setAnswers({ ...answers, [q.id]: n })}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl border-[1.5px] px-4 py-3.5 text-left text-base font-semibold transition-colors',
                    given === n ? 'border-ink/80 bg-sky-tint' : 'border-line bg-white hover:border-ink/40'
                  )}
                >
                  <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-[1.5px]', given === n ? 'border-ink/80 bg-sky' : 'border-line')}>
                    {given === n && <span className="h-2.5 w-2.5 rounded-full bg-ink" />}
                  </span>
                  {opt}
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-5">
              <Input
                aria-label={q.prompt}
                placeholder={q.placeholder}
                value={given || ''}
                onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && answered && next()}
                autoFocus
              />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 flex items-center justify-between gap-4">
        <span className="text-sm text-ink-soft">{left} {left === 1 ? 'try' : 'tries'} left</span>
        <Button size="lg" disabled={!answered || phase === 'checking'} onClick={next}>
          {phase === 'checking' ? 'Checking…' : i < questions.length - 1 ? 'Next question' : 'Check my answers'}
        </Button>
      </div>
    </div>
  );
}
