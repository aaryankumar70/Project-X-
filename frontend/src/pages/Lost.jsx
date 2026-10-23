import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Search, SearchX } from 'lucide-react';
import Button from '../components/Button';
import Chip from '../components/Chip';
import PageHeader from '../components/PageHeader';
import TagCard from '../components/TagCard';
import { Input, TextArea } from '../components/Field';
import { useApp } from '../context/AppContext';
import { searchItems } from '../services/api';
import { CAMPUS_SPOTS } from '../config';

const TIPS = [
  'Say the colour and what it is made of.',
  'Add a brand or model if you know it.',
  'Mention stickers, scratches or anything unusual.',
  'Pick the place you think you lost it, even if you are not sure.',
];

export default function Lost() {
  const navigate = useNavigate();
  const { addSearch } = useApp();
  const [what, setWhat] = useState('');
  const [colour, setColour] = useState('');
  const [brand, setBrand] = useState('');
  const [details, setDetails] = useState('');
  const [place, setPlace] = useState('');
  const [phase, setPhase] = useState('form');
  const [results, setResults] = useState([]);

  const summary = [colour, what, brand && `(${brand})`].filter(Boolean).join(' ');

  const submit = async (e) => {
    e.preventDefault();
    setPhase('loading');
    const query = [what, colour, brand, details, place].filter(Boolean).join(' ');
    const found = await searchItems(query);
    setResults(found);
    addSearch({ id: 's' + Date.now(), summary: summary || query, place, matches: found.length, createdAt: Date.now() });
    setPhase('results');
  };

  if (phase === 'loading') {
    return (
      <div className="flex flex-col items-center py-24 text-center">
        <motion.span animate={{ rotate: [-18, 18, -18], y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }} className="flex h-24 w-24 items-center justify-center rounded-[2rem] border-[1.5px] border-ink/80 bg-blush-tint">
          <Search size={44} />
        </motion.span>
        <h1 className="mt-8 text-3xl font-extrabold">Checking the lost-property shelf</h1>
        <p className="mt-2 text-ink-soft">Comparing your description with everything found this week.</p>
      </div>
    );
  }

  if (phase === 'results') {
    return (
      <div>
        <PageHeader
          title={results.length ? `${results.length} possible ${results.length === 1 ? 'match' : 'matches'}` : 'No match yet'}
          subtitle={results.length ? 'Photos stay locked. Tap one that sounds like yours to prove it is yours.' : undefined}
          action={<Button variant="soft" size="sm" onClick={() => setPhase('form')}>Search again</Button>}
        />
        {results.length ? (
          <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
            {results.map((r) => (
              <TagCard key={r.id} item={r} onClick={() => navigate(`/verify/${r.id}`)} />
            ))}
          </div>
        ) : (
          <div className="mx-auto flex max-w-md flex-col items-center rounded-[2rem] border-[1.5px] border-line bg-white p-8 text-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-3xl border-[1.5px] border-ink/80 bg-lilac-tint"><SearchX size={36} /></span>
            <h2 className="mt-5 text-2xl font-bold">Nothing matches yet</h2>
            <p className="mt-2 text-ink-soft">Items are added all the time. Try different words, or search again tomorrow.</p>
            <ul className="mt-4 space-y-1.5 text-left text-sm text-ink-soft">
              {TIPS.slice(0, 3).map((t) => <li key={t}>• {t}</li>)}
            </ul>
            <Button className="mt-6" onClick={() => setPhase('form')}>Change my description</Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="What did you lose?" subtitle="The more you tell us, the better the match." />
      <div className="grid gap-8 lg:grid-cols-[1fr_20rem] lg:gap-12">
        <form onSubmit={submit} className="space-y-5">
          <Input label="What is it?" placeholder="e.g. headphones, water bottle, keys" value={what} onChange={(e) => setWhat(e.target.value)} required />
          <div className="grid gap-5 sm:grid-cols-2">
            <Input label="Colour" placeholder="e.g. white" value={colour} onChange={(e) => setColour(e.target.value)} />
            <Input label="Brand or model" placeholder="e.g. Sony" value={brand} onChange={(e) => setBrand(e.target.value)} />
          </div>
          <TextArea label="Anything else?" placeholder="Stickers, scratches, what was inside…" rows={3} value={details} onChange={(e) => setDetails(e.target.value)} />
          <div>
            <div className="mb-2 text-sm font-bold">Where do you think you lost it?</div>
            <div className="flex flex-wrap gap-2">
              {CAMPUS_SPOTS.map((s) => (
                <Chip key={s} icon={MapPin} toneKey="blush" selected={place === s} onClick={() => setPlace(place === s ? '' : s)}>{s}</Chip>
              ))}
            </div>
          </div>
          <Button type="submit" variant="blush" size="lg" className="w-full sm:w-auto sm:min-w-[14rem]" disabled={!what.trim()}>
            <Search size={20} strokeWidth={2.5} /> Find my item
          </Button>
        </form>

        <aside className="hidden lg:block">
          <div className="sticky top-10 rounded-[2rem] border-[1.5px] border-line bg-white p-5">
            <h2 className="text-xl font-bold">Better descriptions, better matches</h2>
            <ul className="mt-3 space-y-2 text-sm text-ink-soft">
              {TIPS.map((t) => <li key={t}>• {t}</li>)}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
