import { CheckCircle2, Circle, AlertCircle, Loader2, Sparkles, Hotel, MapPin, ChefHat } from 'lucide-react';

const STAGES = {
  started: { label: 'Initialising guide...', icon: Sparkles },
  scraping_hotels: { label: (dest) => `Scraping hotels in ${dest}...`, icon: Hotel },
  scraping_attractions: { label: (dest) => `Scraping attractions in ${dest}...`, icon: MapPin },
  scraping_restaurants: { label: (dest) => `Scraping restaurants in ${dest}...`, icon: ChefHat },
  llm_streaming: { label: 'Building your AI itinerary...', icon: Sparkles },
};

function getItemState(events, stage, destination) {
  const matching = events.filter(e =>
    e.type === 'progress' && e.stage === stage &&
    (!destination || e.destination === destination)
  );
  if (matching.length === 0) return 'pending';
  const last = matching[matching.length - 1];
  if (last.status === 'done') return 'done';
  if (last.status === 'empty') return 'empty';
  if (last.status === 'error') return 'error';
  if (last.status === 'started' || last.status === 'streaming') return 'active';
  return 'pending';
}

function getCount(events, stage, destination) {
  const done = events.find(e =>
    e.type === 'progress' && e.stage === stage && e.status === 'done' &&
    (!destination || e.destination === destination)
  );
  return done?.count ?? null;
}

function ProgressItem({ status, label, count }) {
  const stateClass = {
    done: 'done',
    empty: 'done',
    error: 'error',
    active: 'active',
    pending: '',
  }[status] || '';

  return (
    <div className={`progress-item ${stateClass}`}>
      <div className="flex-shrink-0">
        {status === 'done' || status === 'empty' ? (
          <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
        ) : status === 'error' ? (
          <AlertCircle className="h-4.5 w-4.5 text-red-400" />
        ) : status === 'active' ? (
          <Loader2 className="h-4.5 w-4.5 text-brand-400 animate-spin" />
        ) : (
          <Circle className="h-4.5 w-4.5 text-slate-600" />
        )}
      </div>
      <span className={`text-sm flex-1 ${
        status === 'done' || status === 'empty' ? 'text-slate-300' :
        status === 'active' ? 'text-white' :
        status === 'error' ? 'text-red-400' : 'text-slate-600'
      }`}>
        {label}
        {status === 'empty' && <span className="ml-1 text-amber-400 text-xs">(no data)</span>}
      </span>
      {count !== null && count > 0 && status === 'done' && (
        <span className="ml-auto text-xs text-emerald-400 font-semibold">{count} found ✓</span>
      )}
    </div>
  );
}

export default function ProgressPanel({ events, destinations, llmChunks }) {
  const hasStarted = events.some(e => e.type === 'progress' && e.stage === 'started');
  const llmStarted = events.some(e => e.type === 'progress' && e.stage === 'llm_streaming');

  return (
    <div className="mx-auto max-w-xl">

      {/* Header */}
      <div className="text-center mb-8 animate-fade-up">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500/15 border border-brand-500/25 mb-4">
          <Sparkles className="h-7 w-7 text-brand-400 animate-bounce-gentle" />
        </div>
        <h2 className="font-display text-2xl font-bold text-white">Building your guide</h2>
        <p className="mt-2 text-sm text-slate-400">
          Scraping live data and consulting Claude AI...
        </p>
      </div>

      {/* Progress items */}
      <div className="space-y-2">

        {/* Init */}
        <ProgressItem
          status={hasStarted ? 'done' : 'pending'}
          label="Initialising guide pipeline"
        />

        {/* Per-destination hotel + attraction scraping */}
        {destinations.map(dest => {
          const hotelStatus = getItemState(events, 'scraping_hotels', dest);
          const attrStatus = getItemState(events, 'scraping_attractions', dest);
          const hotelCount = getCount(events, 'scraping_hotels', dest);
          const attrCount = getCount(events, 'scraping_attractions', dest);

          return (
            <div key={dest} className="space-y-2">
              <div className="pl-2 text-xs font-semibold text-slate-500 uppercase tracking-widest mt-3 mb-1">
                📍 {dest}
              </div>
              <ProgressItem
                status={hotelStatus}
                label={`Hotels in ${dest}`}
                count={hotelCount}
              />
              <ProgressItem
                status={attrStatus}
                label={`Attractions in ${dest}`}
                count={attrCount}
              />
            </div>
          );
        })}

        {/* LLM */}
        <div className="mt-3">
          <ProgressItem
            status={llmStarted ? (events.some(e => e.type === 'complete') ? 'done' : 'active') : 'pending'}
            label="Claude AI building your itinerary"
          />
        </div>

        {/* Live LLM stream preview */}
        {llmChunks && (
          <div className="mt-4 rounded-xl border border-white/6 bg-white/3 p-4">
            <p className="mb-1.5 text-xs font-medium text-slate-500">✨ AI writing...</p>
            <p className="font-mono text-xs text-slate-400 leading-relaxed max-h-28 overflow-hidden">
              {llmChunks.slice(-300)}
              <span className="inline-block h-3 w-0.5 bg-brand-400 animate-pulse ml-0.5" />
            </p>
          </div>
        )}
      </div>

      {/* Warning for empty data */}
      {events.some(e => e.type === 'progress' && e.status === 'empty') && (
        <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/8 p-3 text-xs text-amber-400">
          ⚠️ Some categories had no data. The guide will note this honestly instead of guessing.
        </div>
      )}
    </div>
  );
}
