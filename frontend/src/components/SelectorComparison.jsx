import { Code2, ArrowRight } from 'lucide-react';

export default function SelectorComparison({ selectors, previousSelectors }) {
  if (!selectors) return null;

  const fields = ['card', 'name', 'price', 'rating', 'location', 'image'];

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-semibold text-sm text-white flex items-center gap-2">
          <Code2 className="h-4 w-4 text-brand-400" />
          Selector Schema Configuration
        </h3>
        <span className="text-xs text-slate-500 font-mono">Live Target Mapping</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {fields.map(field => {
          const current = selectors[field] || '—';
          const previous = previousSelectors ? previousSelectors[field] : null;
          const wasHealed = previous && previous !== current;

          return (
            <div
              key={field}
              className={`p-3 rounded-xl border text-xs flex flex-col justify-between gap-1.5 ${
                wasHealed
                  ? 'border-emerald-500/40 bg-emerald-500/10'
                  : 'border-white/8 bg-white/3'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
                  {field}
                </span>
                {wasHealed && (
                  <span className="badge border border-emerald-500/40 bg-emerald-500/20 text-emerald-300 text-[9px]">
                    HEALED
                  </span>
                )}
              </div>

              <div className="font-mono text-white text-xs truncate">
                {current}
              </div>

              {wasHealed && (
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono truncate">
                  <span className="text-red-400 line-through truncate">{previous}</span>
                  <ArrowRight className="h-2.5 w-2.5 flex-shrink-0 text-emerald-400" />
                  <span className="text-emerald-300 truncate">{current}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
