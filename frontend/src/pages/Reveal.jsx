import { useEffect, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { Clock, Mail, MapPin, PackageCheck, Send } from 'lucide-react';
import Button from '../components/Button';
import ItemArt from '../components/ItemArt';
import PageHeader from '../components/PageHeader';
import Sheet from '../components/Sheet';
import Stamp from '../components/Stamp';
import { TextArea } from '../components/Field';
import { useToast } from '../components/Toast';
import { useApp } from '../context/AppContext';
import { getRevealedItem, sendMessage } from '../services/api';
import { timeAgo } from '../lib/utils';

export default function Reveal() {
  const { id } = useParams();
  const { unlocked } = useApp();
  const toast = useToast();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [composeOpen, setComposeOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const allowed = unlocked.includes(id);

  useEffect(() => {
    if (!allowed) return;
    getRevealedItem(id).then((it) => {
      setItem(it);
      setLoading(false);
      if (it) setMessage(`Hi! I think the ${it.title} you found is mine. I answered the questions in the app. When can I pick it up?`);
    });
  }, [id, allowed]);

  if (!allowed) return <Navigate to={`/verify/${id}`} replace />;
  if (loading) return <div className="py-32 text-center font-semibold text-ink-soft">Unlocking your item…</div>;
  if (!item) return <Navigate to="/lost" replace />;

  const send = async () => {
    setSending(true);
    await sendMessage(id, message);
    setSending(false);
    setSent(true);
    setComposeOpen(false);
    toast('Message sent. Watch your college inbox for a reply.');
  };

  return (
    <div>
      <PageHeader title="It is yours" subtitle="Here is the photo and how to get it back." back="/lost" />
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Taped polaroid */}
        <div className="relative mx-auto w-full max-w-md pt-4">
          <span className="absolute left-1/2 top-0 z-10 h-7 w-24 -translate-x-1/2 -rotate-3 rounded-sm bg-butter/80" />
          <div className="rotate-[-1.5deg] rounded-3xl border-[1.5px] border-ink/80 bg-white p-3 pb-6 shadow-pop">
            {item.photo ? (
              <img src={item.photo} alt={item.title} className="aspect-square w-full rounded-2xl object-cover" />
            ) : (
              <ItemArt category={item.category} className="aspect-square w-full rounded-2xl" iconSize={96} />
            )}
            <p className="mt-4 px-2 text-center font-display text-xl font-bold capitalize">{item.title}</p>
          </div>
        </div>

        <div className="space-y-5">
          <section className="rounded-[2rem] border-[1.5px] border-line bg-white p-5">
            <h2 className="text-xl font-bold">Details</h2>
            <p className="mt-2 text-ink-soft">{item.description}</p>
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
              <span className="inline-flex items-center gap-1.5"><MapPin size={16} /> Found at {item.area}</span>
              <span className="inline-flex items-center gap-1.5"><Clock size={16} /> {timeAgo(item.postedAt)}</span>
            </div>
          </section>

          {item.handoff.type === 'email' ? (
            <section className="rounded-[2rem] border-[1.5px] border-ink/80 bg-sky-tint p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl border-[1.5px] border-ink/80 bg-white"><Mail size={22} /></span>
                <h2 className="text-xl font-bold">Contact the finder</h2>
              </div>
              <p className="mt-3 text-ink-soft">Send a short message by email. Say when you can collect it.</p>
              {sent ? (
                <div className="mt-4"><Stamp toneKey="mint">Message sent</Stamp></div>
              ) : (
                <Button className="mt-4 w-full sm:w-auto" onClick={() => setComposeOpen(true)}>
                  <Mail size={18} /> Email the finder
                </Button>
              )}
            </section>
          ) : (
            <section className="rounded-[2rem] border-[1.5px] border-ink/80 bg-mint-tint p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl border-[1.5px] border-ink/80 bg-white"><PackageCheck size={22} /></span>
                <h2 className="text-xl font-bold">Pick it up here</h2>
              </div>
              <p className="mt-3 text-lg font-bold">{item.handoff.place}</p>
              <p className="mt-1 text-sm text-ink-soft">The finder left it there and asked not to be contacted. Bring your student ID.</p>
            </section>
          )}

          <Button as={Link} to="/" variant="soft" className="w-full sm:w-auto">Back to home</Button>
        </div>
      </div>

      <Sheet open={composeOpen} onClose={() => setComposeOpen(false)} title="Email the finder">
        <TextArea label="Your message" rows={5} value={message} onChange={(e) => setMessage(e.target.value)} hint="Your college email is used for the reply." />
        <Button size="lg" className="mt-5 w-full" onClick={send} disabled={sending || !message.trim()}>
          <Send size={18} /> {sending ? 'Sending…' : 'Send message'}
        </Button>
      </Sheet>
    </div>
  );
}
