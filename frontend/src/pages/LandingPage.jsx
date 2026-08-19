import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin, X, Plus, Plane, Calendar, Wallet,
  Sparkles, ChevronRight, Globe, Star, Zap
} from 'lucide-react';

const BUDGET_OPTIONS = [
  { value: 'budget', label: 'Budget', icon: '🎒', desc: 'Hostels & street food' },
  { value: 'mid', label: 'Mid-Range', icon: '✈️', desc: 'Comfortable hotels' },
  { value: 'luxury', label: 'Luxury', icon: '💎', desc: 'Premium resorts' },
];

const SUGGESTIONS = ['Goa', 'Paris', 'Bali', 'Tokyo', 'Barcelona', 'Santorini', 'New York'];

export default function LandingPage() {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [destinations, setDestinations] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('mid');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filtered = SUGGESTIONS.filter(
    s => s.toLowerCase().includes(inputVal.toLowerCase()) && !destinations.includes(s)
  );

  function addDestination(val) {
    const trimmed = val.trim();
    if (!trimmed || destinations.includes(trimmed) || destinations.length >= 5) return;
    setDestinations(prev => [...prev, trimmed]);
    setInputVal('');
    setShowSuggestions(false);
  }

  function removeDestination(dest) {
    setDestinations(prev => prev.filter(d => d !== dest));
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addDestination(inputVal);
    } else if (e.key === 'Backspace' && !inputVal && destinations.length > 0) {
      setDestinations(prev => prev.slice(0, -1));
    }
  }

  async function handleGenerate() {
    if (destinations.length === 0) {
      setError('Add at least one destination to get started.');
      inputRef.current?.focus();
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://localhost:3001/api/generate-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinations,
          dates: startDate ? { start: startDate, end: endDate } : undefined,
          budgetLevel: budget,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to start guide generation.');
      }

      const { sessionId } = await res.json();
      navigate(`/guide/${sessionId}`, { state: { destinations, dates: { start: startDate, end: endDate }, budgetLevel: budget } });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen mesh-bg overflow-hidden flex flex-col">

      {/* ── Floating orbs ─────────────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-brand-500/10 blur-3xl animate-pulse-soft" />
        <div className="absolute top-1/2 -right-24 h-72 w-72 rounded-full bg-indigo-500/8 blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-emerald-500/6 blur-3xl animate-pulse-soft" style={{ animationDelay: '2s' }} />
      </div>

      {/* ── Nav ───────────────────────────────────────────────────────────── */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 md:px-12">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/20 border border-brand-500/30">
            <Globe className="h-5 w-5 text-brand-400" />
          </div>
          <span className="font-display text-xl font-bold text-white tracking-tight">
            Travel<span className="text-brand-400">Genie</span>
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400">
          <Zap className="h-3 w-3 text-brand-400" />
          Powered by Bright Data + Claude AI
        </div>
      </nav>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-8 md:py-16">

        {/* Badge */}
        <div className="mb-6 inline-flex animate-fade-in items-center gap-2 rounded-full border border-brand-500/25 bg-brand-500/12 px-4 py-1.5 text-sm text-brand-300">
          <Sparkles className="h-3.5 w-3.5" />
          AI-powered. Scrape-verified. No hallucinations.
        </div>

        {/* Headline */}
        <h1 className="font-display text-center text-5xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl md:text-7xl animate-fade-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
          Your dream trip,{' '}
          <span className="bg-gradient-to-r from-brand-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
            built live.
          </span>
        </h1>

        <p className="mt-5 max-w-2xl text-center text-lg text-slate-400 animate-fade-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
          Enter your destinations. TravelGenie scrapes real hotel prices and attraction ratings,
          then uses Claude AI to build a personalised day-by-day itinerary — with zero guesswork.
        </p>

        {/* ── Input Card ─────────────────────────────────────────────────── */}
        <div className="mt-10 w-full max-w-2xl animate-fade-up" style={{ animationDelay: '0.3s', opacity: 0 }}>
          <div className="card p-6 space-y-5">

            {/* Destination chips input */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-300">
                <MapPin className="mr-1.5 inline h-3.5 w-3.5 text-brand-400" />
                Destinations
                <span className="ml-2 text-xs text-slate-500">(up to 5, press Enter to add)</span>
              </label>

              <div
                className="gradient-border min-h-[52px] cursor-text rounded-xl border border-white/10 bg-white/5 p-2 flex flex-wrap gap-2 focus-within:border-brand-500/60"
                onClick={() => inputRef.current?.focus()}
              >
                {destinations.map(d => (
                  <span key={d} className="chip">
                    <MapPin className="h-3 w-3" />
                    {d}
                    <button
                      onClick={(e) => { e.stopPropagation(); removeDestination(d); }}
                      className="ml-0.5 rounded-full hover:text-red-400 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {destinations.length < 5 && (
                  <div className="relative flex-1 min-w-32">
                    <input
                      ref={inputRef}
                      value={inputVal}
                      onChange={e => { setInputVal(e.target.value); setShowSuggestions(true); }}
                      onKeyDown={handleKeyDown}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                      placeholder={destinations.length === 0 ? 'e.g. Goa, Paris, Tokyo...' : 'Add another...'}
                      className="w-full bg-transparent text-slate-100 placeholder:text-slate-600 outline-none py-1 px-2 text-sm"
                    />
                    {/* Autocomplete dropdown */}
                    {showSuggestions && filtered.length > 0 && inputVal && (
                      <div className="absolute top-full left-0 mt-1 z-50 w-48 card py-1 shadow-xl">
                        {filtered.map(s => (
                          <button
                            key={s}
                            onMouseDown={() => addDestination(s)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-300 hover:bg-white/8 hover:text-white transition-colors"
                          >
                            <MapPin className="h-3.5 w-3.5 text-brand-400" />
                            {s}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Quick-add suggestions */}
              {destinations.length === 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {SUGGESTIONS.slice(0, 5).map(s => (
                    <button
                      key={s}
                      onClick={() => addDestination(s)}
                      className="rounded-full border border-white/8 bg-white/4 px-2.5 py-0.5 text-xs text-slate-400 hover:border-brand-500/30 hover:text-brand-300 transition-all"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">
                  <Calendar className="mr-1 inline h-3 w-3" />
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="input text-sm"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-400">
                  <Calendar className="mr-1 inline h-3 w-3" />
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  min={startDate}
                  className="input text-sm"
                  style={{ colorScheme: 'dark' }}
                />
              </div>
            </div>

            {/* Budget selector */}
            <div>
              <label className="mb-2 block text-xs font-medium text-slate-400">
                <Wallet className="mr-1 inline h-3 w-3" />
                Budget Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {BUDGET_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setBudget(opt.value)}
                    className={`rounded-xl border p-3 text-left transition-all duration-200 ${
                      budget === opt.value
                        ? 'border-brand-500/50 bg-brand-500/15 text-white'
                        : 'border-white/8 bg-white/3 text-slate-400 hover:border-white/16 hover:bg-white/6'
                    }`}
                  >
                    <div className="text-lg">{opt.icon}</div>
                    <div className="mt-1 text-xs font-semibold">{opt.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                {error}
              </p>
            )}

            {/* CTA */}
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 py-4 text-base"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Starting...
                </>
              ) : (
                <>
                  <Plane className="h-4 w-4" />
                  Generate My Travel Guide
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* ── Stats row ──────────────────────────────────────────────────── */}
        <div className="mt-8 flex flex-wrap justify-center gap-6 text-center animate-fade-up" style={{ animationDelay: '0.5s', opacity: 0 }}>
          {[
            { icon: <Globe className="h-4 w-4" />, label: 'Live web scraping', value: 'Real data' },
            { icon: <Star className="h-4 w-4" />, label: 'Hotels & attractions', value: 'Verified ratings' },
            { icon: <Sparkles className="h-4 w-4" />, label: 'Claude AI itinerary', value: 'No hallucinations' },
          ].map(stat => (
            <div key={stat.label} className="flex items-center gap-2 text-slate-400 text-sm">
              <span className="text-brand-400">{stat.icon}</span>
              <span><strong className="text-slate-200">{stat.value}</strong> · {stat.label}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
