import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import Button from '../components/Button';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-20 text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-3xl border-[1.5px] border-ink/80 bg-lilac-tint">
        <Compass size={36} />
      </span>
      <h1 className="mt-6 text-3xl font-extrabold">That page wandered off</h1>
      <p className="mt-2 text-ink-soft">The link might be old, or the item has already been collected.</p>
      <Button as={Link} to="/" className="mt-6">Go home</Button>
    </div>
  );
}
