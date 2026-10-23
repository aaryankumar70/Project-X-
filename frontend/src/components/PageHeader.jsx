import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export default function PageHeader({ title, subtitle, back, action }) {
  const navigate = useNavigate();
  return (
    <header className="mb-6 flex items-start justify-between gap-4 lg:mb-8">
      <div className="min-w-0">
        {back && (
          <button
            type="button"
            onClick={() => navigate(typeof back === 'string' ? back : -1)}
            className="-ml-2 mb-2 inline-flex items-center gap-1 rounded-full px-2 py-1.5 text-sm font-bold text-ink-soft hover:bg-sky-tint"
          >
            <ChevronLeft size={18} strokeWidth={2.5} /> Back
          </button>
        )}
        <h1 className="text-3xl font-extrabold leading-tight lg:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1.5 max-w-xl text-base text-ink-soft">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}
