import {
  Headphones, KeyRound, Backpack, CreditCard, CupSoda, Smartphone,
  Laptop, Glasses, Watch, BookOpen, Umbrella, Package,
} from 'lucide-react';

export const CATEGORIES = {
  headphones: { label: 'Headphones', icon: Headphones, tone: 'sky' },
  keys: { label: 'Keys', icon: KeyRound, tone: 'butter' },
  bag: { label: 'Bag', icon: Backpack, tone: 'lilac' },
  card: { label: 'ID or card', icon: CreditCard, tone: 'mint' },
  bottle: { label: 'Bottle', icon: CupSoda, tone: 'blush' },
  phone: { label: 'Phone', icon: Smartphone, tone: 'sky' },
  laptop: { label: 'Laptop', icon: Laptop, tone: 'lilac' },
  glasses: { label: 'Glasses', icon: Glasses, tone: 'butter' },
  watch: { label: 'Watch', icon: Watch, tone: 'mint' },
  book: { label: 'Book', icon: BookOpen, tone: 'blush' },
  umbrella: { label: 'Umbrella', icon: Umbrella, tone: 'sky' },
  other: { label: 'Something else', icon: Package, tone: 'lilac' },
};

export const getCategory = (key) => CATEGORIES[key] || CATEGORIES.other;
