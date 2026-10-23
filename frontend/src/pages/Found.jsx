import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight, Camera, CheckCircle2, ImagePlus, Mail, MapPin, PackageCheck, Plus, RefreshCw, Search, Sparkles, X,
} from 'lucide-react';
import Button from '../components/Button';
import Chip from '../components/Chip';
import ProgressBar from '../components/ProgressBar';
import Stamp from '../components/Stamp';
import { Input, TextArea } from '../components/Field';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/Toast';
import { analyzePhoto, postItem } from '../services/api';
import { CAMPUS_SPOTS, ITEM_LIFETIME_DAYS } from '../config';
import { CATEGORIES, getCategory } from '../lib/categories';
import { celebrate } from '../lib/confetti';
import { cn, fileToThumb } from '../lib/utils';

const STEPS = ['Photo', 'Place', 'Details', 'Hand-off'];
const OTHER = '__other__';

const stepVariants = {
  enter: (dir) => ({ opacity: 0, x: dir * 40 }),
  center: { opacity: 1, x: 0 },
  exit: (dir) => ({ opacity: 0, x: dir * -40 }),
};

function Heading({ title, text }) {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-extrabold leading-tight lg:text-4xl">{title}</h1>
      {text && <p className="mt-1.5 text-ink-soft">{text}</p>}
    </div>
  );
}

export default function Found() {
  const navigate = useNavigate();
  const { addPost } = useApp();
  const toast = useToast();

  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [file, setFile] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [spot, setSpot] = useState('');
  const [customSpot, setCustomSpot] = useState('');
  const [details, setDetails] = useState('');
  const [analysis, setAnalysis] = useState({ status: 'idle', category: 'other', tags: [] });
  const [newTag, setNewTag] = useState('');
  const [handoff, setHandoff] = useState('email');
  const [dropoff, setDropoff] = useState('');
  const [posting, setPosting] = useState(false);
  const [posted, setPosted] = useState(null);
  const started = useRef(false);

  const area = spot === OTHER ? customSpot.trim() : spot;

  // Run the (mock) AI analysis the first time the Details step opens.
  useEffect(() => {
    if (step !== 2 || started.current) return;
    started.current = true;
    setAnalysis((a) => ({ ...a, status: 'loading' }));
    analyzePhoto(file).then((r) => setAnalysis({ status: 'done', category: r.category, tags: r.tags }));
  }, [step, file]);

  const go = (next) => {
    setDir(next > step ? 1 : -1);
    setStep(next);
  };

  const pickFile = async (f) => {
    if (!f || !f.type.startsWith('image/')) {
      toast('Please choose an image file.', 'blush');
      return;
    }
    const thumb = await fileToThumb(f);
    if (!thumb) {
      toast('We could not read that photo. Try another one.', 'blush');
      return;
    }
    setFile(f);
    setPhoto(thumb);
    started.current = false;
    setAnalysis({ status: 'idle', category: 'other', tags: [] });
  };

  const addTag = () => {
    const t = newTag.trim().toLowerCase();
    if (t && !analysis.tags.includes(t)) setAnalysis((a) => ({ ...a, tags: [...a.tags, t] }));
    setNewTag('');
  };

  const canNext = [
    !!photo,
    !!area,
    analysis.status === 'done',
    handoff === 'email' || dropoff.trim().length > 2,
  ][step];

  const submit = async () => {
    setPosting(true);
    try {
      const post = await postItem({
        photo,
        area,
        details,
        category: analysis.category,
        tags: analysis.tags,
        handoff: handoff === 'email' ? { type: 'email' } : { type: 'dropoff', place: dropoff.trim() },
      });
      addPost(post);
      setPosted(post);
      celebrate();
    } catch {
      toast('Something went wrong while posting. Please try again.', 'blush');
    } finally {
      setPosting(false);
    }
  };

  const reset = () => {
    setStep(0); setFile(null); setPhoto(null); setSpot(''); setCustomSpot(''); setDetails('');
    setAnalysis({ status: 'idle', category: 'other', tags: [] }); setHandoff('email'); setDropoff('');
    setPosted(null); started.current = false;
  };

  /* ---------- Success ---------- */
  if (posted) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center py-10 text-center lg:py-20">
        <motion.div
          initial={{ scale: 2.2, rotate: -18, opacity: 0 }}
          animate={{ scale: 1, rotate: -4, opacity: 1 }}
          transition={{ type: 'spring', damping: 14, stiffness: 220 }}
        >
          <Stamp toneKey="mint" icon={CheckCircle2} className="px-5 py-3 text-2xl">Posted</Stamp>
        </motion.div>
        <h1 className="mt-8 text-4xl font-extrabold">Thanks for being awesome</h1>
        <p className="mt-3 text-lg text-ink-soft">
          Your find is saved and hidden from everyone. If an owner proves it is theirs, we will let you know.
        </p>
        <p className="mt-3 rounded-2xl bg-butter-tint px-4 py-3 text-sm font-semibold">
          It stays up for {ITEM_LIFETIME_DAYS} days, then it is removed automatically.
        </p>
        <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
          <Button as={Link} to="/activity" size="lg" className="flex-1">See my activity</Button>
          <Button variant="soft" size="lg" className="flex-1" onClick={reset}>Post another</Button>
        </div>
      </div>
    );
  }

  const cat = getCategory(analysis.category);

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <button
          type="button"
          onClick={() => (step === 0 ? navigate(-1) : go(step - 1))}
          aria-label={step === 0 ? 'Close' : 'Previous step'}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-[1.5px] border-ink/80 bg-white hover:bg-sky-tint"
        >
          {step === 0 ? <X size={20} strokeWidth={2.5} /> : <ArrowRight size={20} strokeWidth={2.5} className="rotate-180" />}
        </button>
        <div className="flex-1">
          <div className="mb-2 text-sm font-bold text-ink-soft">Step {step + 1} of {STEPS.length}: {STEPS[step]}</div>
          <ProgressBar step={step} total={STEPS.length} />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_20rem] lg:gap-12">
        <div>
          <AnimatePresence mode="wait" custom={dir}>
            <motion.div
              key={step}
              custom={dir}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.2 }}
            >
              {step === 0 && (
                <>
                  <Heading title="Snap what you found" text="Put it on a plain surface so the details are easy to see." />
                  {photo ? (
                    <div className="space-y-4">
                      <div className="relative overflow-hidden rounded-[2rem] border-[1.5px] border-ink/80 bg-white p-2">
                        <img src={photo} alt="The item you found" className="max-h-[26rem] w-full rounded-[1.5rem] object-cover" />
                      </div>
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border-[1.5px] border-line bg-white px-4 py-2.5 text-sm font-bold hover:bg-sky-tint">
                        <RefreshCw size={16} /> Retake or replace
                        <input type="file" accept="image/*" className="sr-only" onChange={(e) => pickFile(e.target.files?.[0])} />
                      </label>
                    </div>
                  ) : (
                    <div
                      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={(e) => { e.preventDefault(); setDragging(false); pickFile(e.dataTransfer.files?.[0]); }}
                      className={cn(
                        'relative flex min-h-[18rem] flex-col items-center justify-center gap-5 rounded-[2rem] border-2 border-dashed p-6 text-center transition-colors',
                        dragging ? 'border-sky-deep bg-sky-tint' : 'border-ink/30 bg-white'
                      )}
                    >
                      <span className="pointer-events-none absolute left-5 top-5 h-6 w-6 rounded-tl-xl border-l-[3px] border-t-[3px] border-ink/70" />
                      <span className="pointer-events-none absolute right-5 top-5 h-6 w-6 rounded-tr-xl border-r-[3px] border-t-[3px] border-ink/70" />
                      <span className="pointer-events-none absolute bottom-5 left-5 h-6 w-6 rounded-bl-xl border-b-[3px] border-l-[3px] border-ink/70" />
                      <span className="pointer-events-none absolute bottom-5 right-5 h-6 w-6 rounded-br-xl border-b-[3px] border-r-[3px] border-ink/70" />
                      <span className="flex h-20 w-20 items-center justify-center rounded-3xl border-[1.5px] border-ink/80 bg-butter">
                        <Camera size={36} />
                      </span>
                      <div className="flex flex-col gap-3 sm:flex-row">
                        <label className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full border-[1.5px] border-ink/80 bg-butter px-6 font-bold shadow-[0_3px_0_0_rgba(38,43,82,.85)] active:translate-y-[3px] active:shadow-none">
                          <Camera size={18} /> Take a photo
                          <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(e) => pickFile(e.target.files?.[0])} />
                        </label>
                        <label className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full border-[1.5px] border-ink/80 bg-white px-6 font-bold shadow-[0_3px_0_0_rgba(38,43,82,.85)] active:translate-y-[3px] active:shadow-none">
                          <ImagePlus size={18} /> Choose from gallery
                          <input type="file" accept="image/*" className="sr-only" onChange={(e) => pickFile(e.target.files?.[0])} />
                        </label>
                      </div>
                      <p className="hidden text-sm text-ink-soft lg:block">Or drag a photo here</p>
                    </div>
                  )}
                </>
              )}

              {step === 1 && (
                <>
                  <Heading title="Where did you find it?" text="Pick the closest spot. Owners use this to check if it could be theirs." />
                  <div className="flex flex-wrap gap-2.5">
                    {CAMPUS_SPOTS.map((s) => (
                      <Chip key={s} selected={spot === s} onClick={() => setSpot(s)} icon={MapPin} toneKey="butter" className="px-4 py-2.5 text-base">{s}</Chip>
                    ))}
                    <Chip selected={spot === OTHER} onClick={() => setSpot(OTHER)} icon={Plus} toneKey="butter" className="px-4 py-2.5 text-base">Somewhere else</Chip>
                  </div>
                  {spot === OTHER && (
                    <div className="mt-5 max-w-md">
                      <Input label="Where exactly?" placeholder="e.g. Behind the physics lab" value={customSpot} onChange={(e) => setCustomSpot(e.target.value)} autoFocus />
                    </div>
                  )}
                </>
              )}

              {step === 2 && (
                <>
                  <Heading title="Anything else worth knowing?" text="Optional. Scratches, stickers, what was nearby." />
                  <TextArea
                    label="Extra details"
                    placeholder="e.g. Left ear cup has a small sticker"
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    rows={3}
                  />
                  <div className="mt-6 rounded-[2rem] border-[1.5px] border-ink/80 bg-lilac-tint p-5">
                    <div className="flex items-center gap-2 font-bold">
                      <Sparkles size={18} /> What we spotted in your photo
                    </div>
                    {analysis.status !== 'done' ? (
                      <div className="mt-4 flex items-center gap-3 text-ink-soft">
                        <motion.span animate={{ rotate: [-14, 14, -14] }} transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }} className="inline-flex">
                          <Search size={26} />
                        </motion.span>
                        Reading your photo…
                      </div>
                    ) : (
                      <div className="mt-4 space-y-4">
                        <div>
                          <div className="mb-2 text-sm font-bold">Looks like</div>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(CATEGORIES).map(([key, c]) => (
                              <Chip key={key} selected={analysis.category === key} icon={c.icon} toneKey={c.tone} onClick={() => setAnalysis((a) => ({ ...a, category: key }))}>
                                {c.label}
                              </Chip>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="mb-2 text-sm font-bold">Tags (tap the x to remove)</div>
                          <div className="flex flex-wrap gap-2">
                            {analysis.tags.map((t) => (
                              <Chip key={t} toneKey="lilac" onRemove={() => setAnalysis((a) => ({ ...a, tags: a.tags.filter((x) => x !== t) }))}>{t}</Chip>
                            ))}
                          </div>
                          <div className="mt-3 flex max-w-sm gap-2">
                            <input
                              value={newTag}
                              onChange={(e) => setNewTag(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                              placeholder="Add a tag"
                              aria-label="Add a tag"
                              className="min-w-0 flex-1 rounded-full border-[1.5px] border-line bg-white px-4 py-2 text-sm focus:border-sky-deep focus:outline-none"
                            />
                            <Button size="sm" variant="soft" onClick={addTag} disabled={!newTag.trim()}>Add</Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <Heading title="How should the owner get it back?" text="You choose. Nobody sees your email address." />
                  <div role="radiogroup" aria-label="Hand-off" className="grid gap-4 md:grid-cols-2">
                    {[
                      { key: 'email', icon: Mail, title: 'They can email me', text: 'Messages reach you through the app. Your address stays private.', bg: 'bg-sky-tint' },
                      { key: 'dropoff', icon: PackageCheck, title: 'I left it somewhere', text: 'Tell us where. The owner collects it, and you are not contacted.', bg: 'bg-mint-tint' },
                    ].map((o) => (
                      <button
                        key={o.key}
                        type="button"
                        role="radio"
                        aria-checked={handoff === o.key}
                        onClick={() => setHandoff(o.key)}
                        className={cn(
                          'rounded-[2rem] border-[1.5px] p-5 text-left transition-all',
                          handoff === o.key ? cn('border-ink/80 shadow-pop', o.bg) : 'border-line bg-white hover:border-ink/40'
                        )}
                      >
                        <span className="flex h-12 w-12 items-center justify-center rounded-2xl border-[1.5px] border-ink/80 bg-white"><o.icon size={24} /></span>
                        <div className="mt-4 text-lg font-bold">{o.title}</div>
                        <p className="mt-1 text-sm text-ink-soft">{o.text}</p>
                      </button>
                    ))}
                  </div>
                  {handoff === 'dropoff' && (
                    <div className="mt-5 max-w-md">
                      <Input label="Where did you leave it?" placeholder="e.g. Security desk, main gate" value={dropoff} onChange={(e) => setDropoff(e.target.value)} autoFocus />
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="sticky bottom-0 -mx-5 mt-8 border-t-[1.5px] border-line bg-white/90 px-5 py-4 backdrop-blur lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
            <Button
              size="lg"
              variant={step === STEPS.length - 1 ? 'butter' : 'primary'}
              className="w-full lg:w-auto lg:min-w-[14rem]"
              disabled={!canNext || posting}
              onClick={() => (step === STEPS.length - 1 ? submit() : go(step + 1))}
            >
              {step === STEPS.length - 1 ? (posting ? 'Posting…' : 'Post it') : 'Continue'}
              {step < STEPS.length - 1 && <ArrowRight size={20} strokeWidth={2.75} />}
            </Button>
          </div>
        </div>

        {/* Live summary: only on wide screens, where there is room for it */}
        <aside className="hidden lg:block">
          <div className="sticky top-10 rounded-[2rem] border-[1.5px] border-line bg-white p-5">
            <div className="text-sm font-bold text-ink-soft">Your post so far</div>
            <div className="mt-3 overflow-hidden rounded-2xl border-[1.5px] border-line">
              {photo ? (
                <img src={photo} alt="" className="aspect-[4/3] w-full object-cover" />
              ) : (
                <div className="hatch flex aspect-[4/3] items-center justify-center text-ink-faint"><Camera size={32} /></div>
              )}
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="font-bold">Found at</dt>
                <dd className="text-ink-soft">{area || 'Not set yet'}</dd>
              </div>
              <div>
                <dt className="font-bold">Looks like</dt>
                <dd className="text-ink-soft">{analysis.status === 'done' ? `${cat.label}: ${analysis.tags.join(', ') || 'no tags'}` : 'Waiting for the photo'}</dd>
              </div>
              <div>
                <dt className="font-bold">Hand-off</dt>
                <dd className="text-ink-soft">{handoff === 'email' ? 'Owner can email you' : dropoff || 'Left at a drop-off spot'}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
