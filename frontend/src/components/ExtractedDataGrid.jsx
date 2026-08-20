import { useState } from 'react';
import { Building2, DollarSign, Star, MapPin, Search, CheckCircle2 } from 'lucide-react';

const FALLBACK_HOTEL_IMG = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500';

export default function ExtractedDataGrid({ items = [], validation }) {
  const [search, setSearch] = useState('');

  const filteredItems = items.filter(item =>
    (item.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (item.location || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="card p-5 space-y-4">
      {/* Top Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display font-semibold text-sm text-white flex items-center gap-2">
              <Building2 className="h-4 w-4 text-brand-400" />
              Extracted Hotel Records
            </h3>
            <span className="badge border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 font-mono text-[10px]">
              {items.length} Records
            </span>
          </div>
          {validation && (
            <p className="text-xs text-slate-400 mt-0.5">
              Validation Score: <strong className="text-emerald-400">{validation.scorePct}%</strong> ({validation.passedChecks}/{validation.totalChecks} checks passed)
            </p>
          )}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="h-3.5 w-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter records..."
            className="input text-xs pl-8 py-1.5"
          />
        </div>
      </div>

      {/* Cards Grid */}
      {items.length === 0 ? (
        <div className="rounded-xl border border-white/5 bg-black/20 p-8 text-center text-slate-500 text-sm">
          No records extracted. Run the scraper or diagnose repairs to extract data.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 max-h-[500px] overflow-y-auto pr-1">
          {filteredItems.map((item, idx) => (
            <div
              key={item.id || idx}
              className="card-hover overflow-hidden rounded-xl border border-white/8 bg-surface-900/80 flex flex-col justify-between"
            >
              {/* Media */}
              <div className="relative h-28 overflow-hidden">
                <img
                  src={item.image || FALLBACK_HOTEL_IMG}
                  alt={item.name || 'Hotel'}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  onError={(e) => { e.target.src = FALLBACK_HOTEL_IMG; }}
                  loading="lazy"
                />
                {item.price && (
                  <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 text-white font-mono text-[11px] font-bold">
                    {item.price}
                  </div>
                )}
                {item.rating && (
                  <div className="absolute top-2 left-2 bg-amber-500/80 backdrop-blur-md px-2 py-0.5 rounded-md text-slate-950 font-bold text-[10px]">
                    {item.rating}
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between">
                <h4 className="font-display font-semibold text-xs text-white line-clamp-1">
                  {item.name || <span className="text-red-400 italic">Missing Name</span>}
                </h4>

                {item.location && (
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 line-clamp-1">
                    <MapPin className="h-3 w-3 text-slate-500 flex-shrink-0" />
                    <span>{item.location}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
