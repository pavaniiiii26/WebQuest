import { useState } from 'react';
import { MapPin, Lightbulb, Calendar, Hotel, TrendingUp, CheckCircle2 } from 'lucide-react';
import AttractionCard from './AttractionCard.jsx';
import HotelCard from './HotelCard.jsx';
import BudgetChart from './BudgetChart.jsx';

export default function GuideOutput({ guide, meta }) {
  const [activeDay, setActiveDay] = useState(0);

  if (!guide) return null;

  const { summary, days = [], budgetBreakdown, tips = [], destinations: guideDests = [] } = guide;
  const currentDay = days[activeDay];

  return (
    <div className="space-y-8 animate-fade-in">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="card p-6 md:p-8">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/15 border border-brand-500/25">
            <MapPin className="h-6 w-6 text-brand-400" />
          </div>
          <div>
            <div className="flex flex-wrap gap-2 mb-2">
              {(guideDests.length > 0 ? guideDests : meta.destinations || []).map(d => (
                <span key={d} className="chip">✈️ {d}</span>
              ))}
              {meta.dates?.start && (
                <span className="chip">
                  <Calendar className="h-3 w-3" />
                  {meta.dates.start}{meta.dates.end ? ` → ${meta.dates.end}` : ''}
                </span>
              )}
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-white leading-snug">
              Your Personalised Travel Guide
            </h1>
            {summary && (
              <p className="mt-3 text-slate-400 leading-relaxed max-w-3xl">{summary}</p>
            )}
          </div>
        </div>
      </div>

      {/* ── Day selector tabs ───────────────────────────────────────────────── */}
      {days.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none">
            {days.map((day, i) => (
              <button
                key={i}
                onClick={() => setActiveDay(i)}
                className={`flex-shrink-0 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 ${
                  activeDay === i
                    ? 'bg-brand-500 text-white shadow-brand-500/30 shadow-md'
                    : 'border border-white/8 bg-white/4 text-slate-400 hover:bg-white/8 hover:text-white'
                }`}
              >
                <span className="block text-xs opacity-70">Day</span>
                {day.day}
              </button>
            ))}
          </div>

          {/* ── Day content ────────────────────────────────────────────────── */}
          {currentDay && (
            <div
              key={activeDay}
              className="day-card"
            >
              {/* Day header */}
              <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
                <div>
                  <div className="text-xs font-semibold text-brand-400 uppercase tracking-widest mb-1">
                    Day {currentDay.day}{currentDay.date ? ` · ${currentDay.date}` : ''}
                    {currentDay.location ? ` · ${currentDay.location}` : ''}
                  </div>
                  <h2 className="font-display text-xl font-bold text-white">
                    {currentDay.theme || 'Explore & Discover'}
                  </h2>
                  {currentDay.notes && (
                    <p className="mt-1 text-xs text-amber-400 flex items-center gap-1">
                      ⚠️ {currentDay.notes}
                    </p>
                  )}
                </div>
                {currentDay.estimatedDailyCost && (
                  <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2">
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                    <div>
                      <div className="text-xs text-emerald-400">Est. daily cost</div>
                      <div className="font-bold text-white">${currentDay.estimatedDailyCost}</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Attractions grid */}
              {currentDay.attractions?.length > 0 ? (
                <div>
                  <h3 className="font-semibold text-slate-300 text-sm mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-brand-400" />
                    Attractions & Experiences ({currentDay.attractions.length})
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentDay.attractions.map((attr, i) => (
                      <AttractionCard key={i} attraction={attr} index={i} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-white/6 bg-white/3 p-4 text-center text-sm text-slate-500">
                  No specific attractions listed for this day.
                </div>
              )}

              {/* Suggested hotel */}
              {currentDay.suggestedHotel && (
                <div className="mt-6">
                  <h3 className="font-semibold text-slate-300 text-sm mb-3 flex items-center gap-2">
                    <Hotel className="h-4 w-4 text-brand-400" />
                    Suggested Stay
                  </h3>
                  <HotelCard hotel={currentDay.suggestedHotel} highlighted />
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Budget breakdown ────────────────────────────────────────────────── */}
      {budgetBreakdown && (
        <div style={{ animation: 'fadeUp 0.6s ease 0.2s forwards', opacity: 0 }}>
          <BudgetChart breakdown={budgetBreakdown} />
        </div>
      )}

      {/* ── Tips ───────────────────────────────────────────────────────────── */}
      {tips.length > 0 && (
        <div className="card p-6" style={{ animation: 'fadeUp 0.6s ease 0.3s forwards', opacity: 0 }}>
          <h3 className="font-display text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-400" />
            Insider Tips
          </h3>
          <div className="space-y-2.5">
            {tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3">
                <CheckCircle2 className="h-4 w-4 text-brand-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-slate-300 leading-relaxed">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Footer note ─────────────────────────────────────────────────────── */}
      <div className="text-center text-xs text-slate-600 pb-8">
        ✅ All hotel prices, ratings, and attraction data are sourced from live web scraping via Bright Data.
        <br />
        No information was invented by AI.
      </div>
    </div>
  );
}
