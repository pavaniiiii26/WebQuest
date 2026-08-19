import { Star } from 'lucide-react';

export function StarRating({ rating, max = 5 }) {
  if (!rating) return <span className="text-xs text-slate-500">No rating</span>;

  const pct = Math.min((rating / max) * 100, 100);
  return (
    <div className="flex items-center gap-1">
      <div className="relative inline-flex">
        {/* Background stars */}
        <div className="flex text-slate-700">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-3.5 w-3.5 fill-current" />
          ))}
        </div>
        {/* Filled stars overlay */}
        <div className="absolute inset-0 overflow-hidden flex text-amber-400" style={{ width: `${pct}%` }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star key={i} className="h-3.5 w-3.5 fill-current flex-shrink-0" />
          ))}
        </div>
      </div>
      <span className="text-xs text-slate-400">{rating.toFixed(1)}</span>
    </div>
  );
}
