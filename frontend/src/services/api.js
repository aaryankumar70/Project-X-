// MOCK API LAYER
// ---------------------------------------------------------------------------
// Every function below is a placeholder for a backend call. Replace the body
// with fetch()/axios and keep the return shape, and the UI will not change.
//
//   sendOtp         -> POST /auth/otp
//   verifyOtp       -> POST /auth/verify
//   analyzePhoto    -> POST /items/analyze        (AI metadata from the photo)
//   postItem        -> POST /items
//   searchItems     -> POST /search               (returns TEXT-ONLY public view)
//   getPublicItem   -> GET  /items/:id/public
//   getQuestions    -> GET  /items/:id/questions  (AI-generated, no answers)
//   checkAnswers    -> POST /items/:id/verify
//   getRevealedItem -> GET  /items/:id            (only after verification)
//   sendMessage     -> POST /items/:id/contact
// ---------------------------------------------------------------------------
import { FOUND_ITEMS } from '../mocks/data';
import { ALLOWED_EMAIL_DOMAINS, ITEM_LIFETIME_DAYS } from '../config';
import { DAY, capitalize } from '../lib/utils';
import { getCategory } from '../lib/categories';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const STOPWORDS = new Set(['the', 'a', 'an', 'my', 'i', 'it', 'is', 'of', 'in', 'on', 'at', 'and', 'with', 'lost', 'left', 'near', 'around', 'think']);
const stem = (w) => w.replace(/s$/, '');
const words = (s) => s.toLowerCase().match(/[a-z0-9-]+/g) || [];

export function isAllowedEmail(email) {
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return false;
  if (ALLOWED_EMAIL_DOMAINS.length === 0) return true;
  return ALLOWED_EMAIL_DOMAINS.some((d) => email.toLowerCase().endsWith('@' + d));
}

export async function sendOtp(email) {
  await sleep(700);
  if (!isAllowedEmail(email)) throw new Error('Use your college email address.');
  return { ok: true };
}

export async function verifyOtp(email, code) {
  await sleep(700);
  if (!/^\d{6}$/.test(code)) throw new Error('Enter the 6-digit code from your email.');
  return { user: { email, name: email.split('@')[0] } };
}

const SAMPLE_ANALYSES = [
  { category: 'bottle', tags: ['steel', 'blue', 'bottle'] },
  { category: 'headphones', tags: ['white', 'wireless', 'headphones'] },
  { category: 'keys', tags: ['keys', 'silver', 'keychain'] },
  { category: 'bag', tags: ['black', 'backpack', 'zip'] },
];

export async function analyzePhoto(file) {
  await sleep(1900);
  const pick = SAMPLE_ANALYSES[(file?.size || 0) % SAMPLE_ANALYSES.length];
  return { category: pick.category, tags: [...pick.tags] };
}

export async function postItem({ photo, area, details, category, tags, handoff }) {
  await sleep(900);
  const label = getCategory(category).label.toLowerCase();
  const title = [...tags.slice(0, 2), label].join(' ');
  const description = `${capitalize(title)}${details ? '. ' + details.trim() : ''}`;
  return {
    id: 'p' + Date.now(),
    category,
    title,
    description,
    tags,
    area,
    photo,
    handoff,
    status: 'active',
    postedAt: Date.now(),
    expiresAt: Date.now() + ITEM_LIFETIME_DAYS * DAY,
  };
}

const publicView = (item, extra = {}) => ({
  id: item.id,
  category: item.category,
  description: item.description,
  area: item.area,
  postedAt: item.postedAt,
  ...extra,
});

export async function searchItems(query) {
  await sleep(1500);
  const q = words(query).filter((w) => w.length > 1 && !STOPWORDS.has(w)).map(stem);
  if (q.length === 0) return [];
  return FOUND_ITEMS.map((item) => {
    const bag = new Set([...item.tags, ...words(item.description), ...words(item.title), ...words(item.area)].map(stem));
    const hit = q.filter((t) => bag.has(t) || (t.length >= 4 && [...bag].some((w) => w.startsWith(t))));
    const score = hit.length / q.length;
    const strength = score >= 0.6 ? 'strong' : score >= 0.4 ? 'likely' : 'possible';
    return publicView(item, { score, strength });
  })
    .filter((r) => r.score >= 0.25)
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
}

export async function getPublicItem(id) {
  await sleep(250);
  const item = FOUND_ITEMS.find((i) => i.id === id);
  return item ? publicView(item) : null;
}

export async function getQuestions(id) {
  await sleep(450);
  const item = FOUND_ITEMS.find((i) => i.id === id);
  if (!item) return [];
  // Strip the answers: the browser must never receive them.
  return item.questions.map(({ answer, accept, ...q }) => q);
}

export async function checkAnswers(id, answers) {
  await sleep(1100);
  const item = FOUND_ITEMS.find((i) => i.id === id);
  if (!item) return { passed: false, correct: 0, total: 0 };
  let correct = 0;
  item.questions.forEach((q) => {
    const given = answers[q.id];
    if (q.type === 'choice' && given === q.answer) correct += 1;
    if (q.type === 'text' && typeof given === 'string') {
      const text = given.toLowerCase();
      if (q.accept.some((a) => text.includes(a))) correct += 1;
    }
  });
  const total = item.questions.length;
  return { passed: correct >= Math.ceil(total * 0.67), correct, total };
}

export async function getRevealedItem(id) {
  await sleep(400);
  const item = FOUND_ITEMS.find((i) => i.id === id);
  if (!item) return null;
  return {
    id: item.id,
    category: item.category,
    title: item.title,
    description: item.description,
    area: item.area,
    postedAt: item.postedAt,
    handoff: item.handoff,
    photo: null, // TODO: real photo URL from the server
  };
}

export async function sendMessage() {
  await sleep(900);
  return { ok: true };
}
