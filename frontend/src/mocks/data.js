import { DAY, HOUR } from '../lib/utils';

const ago = (ms) => Date.now() - ms;

// Items found by other students. In the real app these live on the server
// and are NEVER sent to the browser in full: the client only sees the public view.
export const FOUND_ITEMS = [
  {
    id: 'f1',
    category: 'headphones',
    title: 'white wireless over-ear headphones',
    description: 'White wireless over-ear headphones with a tan headband. Found on a study table.',
    tags: ['headphones', 'headphone', 'headset', 'over-ear', 'wireless', 'white', 'tan', 'sony', 'audio'],
    area: 'Central Library',
    postedAt: ago(5 * HOUR),
    handoff: { type: 'email' },
    questions: [
      { id: 'q1', type: 'choice', prompt: 'What colour is the padding on the headband?', options: ['Tan or light brown', 'Black', 'Navy', 'Red'], answer: 0 },
      { id: 'q2', type: 'choice', prompt: 'Is there anything stuck on the ear cups?', options: ['A small sticker on the left cup', 'Nothing, they are plain', 'Initials on the right cup', 'A name tag'], answer: 0 },
      { id: 'q3', type: 'text', prompt: 'Which brand or model are they?', placeholder: 'e.g. brand name', accept: ['sony', 'wh-1000', 'xm4', 'xm5', '1000x'] },
    ],
  },
  {
    id: 'f2',
    category: 'keys',
    title: 'three keys on a navy lanyard',
    description: 'Set of three keys on a navy lanyard with a hostel tag.',
    tags: ['keys', 'key', 'lanyard', 'navy', 'blue', 'hostel', 'tag'],
    area: 'Hostel Block B',
    postedAt: ago(22 * HOUR),
    handoff: { type: 'email' },
    questions: [
      { id: 'q1', type: 'choice', prompt: 'How many keys are on the ring?', options: ['2', '3', '4', '5'], answer: 1 },
      { id: 'q2', type: 'choice', prompt: 'What colour is the lanyard?', options: ['Navy', 'Green', 'Red', 'Black'], answer: 0 },
      { id: 'q3', type: 'text', prompt: 'What is written on the tag?', placeholder: 'A word or number you remember', accept: ['hostel', 'block', 'b-'] },
    ],
  },
  {
    id: 'f3',
    category: 'bottle',
    title: 'sage green steel water bottle',
    description: 'Sage green steel water bottle with two round stickers.',
    tags: ['bottle', 'water', 'steel', 'green', 'sage', 'stickers', 'flask'],
    area: 'Cafeteria',
    postedAt: ago(1 * DAY + 3 * HOUR),
    handoff: { type: 'dropoff', place: 'Cafeteria counter, ask for the lost-property shelf' },
    questions: [
      { id: 'q1', type: 'choice', prompt: 'What colour is the bottle?', options: ['Sage green', 'Matte black', 'Silver', 'Pink'], answer: 0 },
      { id: 'q2', type: 'choice', prompt: 'What is stuck on it?', options: ['Two round stickers', 'A band logo', 'A name label', 'Nothing'], answer: 0 },
      { id: 'q3', type: 'choice', prompt: 'Roughly how big is it?', options: ['500 ml', '750 ml', '1 litre', '350 ml'], answer: 1 },
    ],
  },
  {
    id: 'f4',
    category: 'bag',
    title: 'black backpack with a red keychain',
    description: 'Black backpack with a red pom-pom keychain on the main zip.',
    tags: ['bag', 'backpack', 'black', 'red', 'keychain', 'laptop', 'sleeve'],
    area: 'Engineering Block',
    postedAt: ago(2 * DAY + 6 * HOUR),
    handoff: { type: 'email' },
    questions: [
      { id: 'q1', type: 'choice', prompt: 'What colour is the keychain?', options: ['Red', 'Yellow', 'Blue', 'Green'], answer: 0 },
      { id: 'q2', type: 'choice', prompt: 'Is there a padded laptop sleeve inside?', options: ['Yes, padded', 'No sleeve at all', 'Only a folder pocket', 'Not sure'], answer: 0 },
      { id: 'q3', type: 'text', prompt: 'Name one thing that was inside.', placeholder: 'Anything you remember packing', accept: ['notebook', 'book', 'charger', 'file', 'bottle', 'pen', 'calculator'] },
    ],
  },
  {
    id: 'f5',
    category: 'card',
    title: 'student ID card in a clear holder',
    description: 'Student ID card in a clear plastic holder with a blue border.',
    tags: ['card', 'id', 'student', 'identity', 'holder', 'blue', 'clear'],
    area: 'Sports Ground',
    postedAt: ago(3 * DAY),
    handoff: { type: 'dropoff', place: 'Security desk at the main gate' },
    questions: [
      { id: 'q1', type: 'choice', prompt: 'What colour is the card border?', options: ['Blue', 'Green', 'Orange', 'Purple'], answer: 0 },
      { id: 'q2', type: 'choice', prompt: 'What kind of holder is it in?', options: ['Clear plastic', 'Pink leather', 'Black pouch', 'None'], answer: 0 },
      { id: 'q3', type: 'choice', prompt: 'Which way is the card held in the holder?', options: ['Portrait', 'Landscape', 'Folded', 'Not sure'], answer: 1 },
    ],
  },
  {
    id: 'f6',
    category: 'headphones',
    title: 'white earbuds case with a cracked lid',
    description: 'White wireless earbuds case with a small crack on the lid.',
    tags: ['earbuds', 'earphones', 'airpods', 'case', 'white', 'wireless', 'cracked', 'audio', 'headphones'],
    area: 'Auditorium',
    postedAt: ago(1 * DAY),
    handoff: { type: 'email' },
    questions: [
      { id: 'q1', type: 'choice', prompt: 'Where is the crack?', options: ['On the lid', 'On the hinge', 'On the base', 'There is no crack'], answer: 0 },
      { id: 'q2', type: 'choice', prompt: 'What colour is the case?', options: ['White', 'Black', 'Grey', 'Pink'], answer: 0 },
      { id: 'q3', type: 'choice', prompt: 'Is there a keychain loop on it?', options: ['Yes', 'No'], answer: 1 },
    ],
  },
  {
    id: 'f7',
    category: 'umbrella',
    title: 'yellow umbrella with white dots',
    description: 'Folding umbrella, yellow with white dots.',
    tags: ['umbrella', 'yellow', 'dots', 'folding', 'white'],
    area: 'Bus Stop, Gate 2',
    postedAt: ago(4 * DAY),
    handoff: { type: 'dropoff', place: 'Gate 2 security cabin' },
    questions: [
      { id: 'q1', type: 'choice', prompt: 'What is the pattern?', options: ['White dots', 'Stripes', 'Plain', 'Checks'], answer: 0 },
      { id: 'q2', type: 'choice', prompt: 'How does it open?', options: ['Manually', 'Automatic button'], answer: 1 },
      { id: 'q3', type: 'choice', prompt: 'What colour is the handle?', options: ['Black', 'Yellow', 'Wooden', 'White'], answer: 0 },
    ],
  },
];

export const WEEKLY_RETURNED = 42;

export const RECENT_RETURNS = [
  { id: 'r1', text: 'Grey hoodie', area: 'Sports Ground', when: 'Yesterday' },
  { id: 'r2', text: 'Scientific calculator', area: 'Engineering Block', when: '2 days ago' },
  { id: 'r3', text: 'Black wallet', area: 'Cafeteria', when: '3 days ago' },
];

// Starter posts so My activity is not empty on first launch.
export function seedPosts() {
  return [
    {
      id: 'p-seed-1',
      category: 'bottle',
      title: 'blue steel water bottle',
      description: 'Blue steel water bottle with a dented base.',
      tags: ['blue', 'steel', 'bottle'],
      area: 'Cafeteria',
      photo: null,
      handoff: { type: 'email' },
      status: 'active',
      postedAt: Date.now() - 2 * DAY,
      expiresAt: Date.now() + 5 * DAY,
    },
    {
      id: 'p-seed-2',
      category: 'keys',
      title: 'bike key with a green tag',
      description: 'Single bike key with a green tag.',
      tags: ['keys', 'bike', 'green'],
      area: 'Hostel Block A',
      photo: null,
      handoff: { type: 'dropoff', place: 'Hostel Block A warden office' },
      status: 'returned',
      postedAt: Date.now() - 6 * DAY,
      expiresAt: Date.now() + 1 * DAY,
    },
  ];
}
