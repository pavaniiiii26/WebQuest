import { Play, Flame, Stethoscope, RotateCcw, Loader2 } from 'lucide-react';

export default function ControlBar({
  onRun,
  onBreak,
  onDiagnose,
  onReset,
  loadingAction,
  scraperStatus,
}) {
  return (
    <div className="card p-4 flex flex-wrap items-center justify-between gap-3 shadow-xl">
      <div className="flex flex-wrap items-center gap-2.5">

        {/* Run Scraper Button */}
        <button
          onClick={onRun}
          disabled={Boolean(loadingAction)}
          className="btn-primary flex items-center gap-2 text-sm"
        >
          {loadingAction === 'run' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Scraping & Validating...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 fill-current" />
              Run Scraper
            </>
          )}
        </button>

        {/* Break Scraper Button */}
        <button
          onClick={onBreak}
          disabled={Boolean(loadingAction)}
          className="relative overflow-hidden rounded-xl border border-red-500/40 bg-red-500/15 px-5 py-3 text-sm font-semibold text-red-300 transition-all duration-200 hover:bg-red-500/25 hover:border-red-500/60 active:scale-95 flex items-center gap-2"
        >
          {loadingAction === 'break' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-red-300" />
              Breaking Website DOM...
            </>
          ) : (
            <>
              <Flame className="h-4 w-4 text-red-400" />
              Break Scraper (Simulate Site Change)
            </>
          )}
        </button>

        {/* Diagnose Button (visible/prominent when broken) */}
        {scraperStatus === 'broken' && (
          <button
            onClick={onDiagnose}
            disabled={Boolean(loadingAction)}
            className="rounded-xl border border-amber-500/40 bg-amber-500/20 px-5 py-3 text-sm font-semibold text-amber-300 transition-all duration-200 hover:bg-amber-500/30 active:scale-95 flex items-center gap-2 animate-bounce-gentle"
          >
            {loadingAction === 'diagnose' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-amber-300" />
                Analyzing DOM & Scoring...
              </>
            ) : (
              <>
                <Stethoscope className="h-4 w-4 text-amber-400" />
                Diagnose & Find Candidates
              </>
            )}
          </button>
        )}

      </div>

      {/* Reset Baseline Button */}
      <button
        onClick={onReset}
        disabled={Boolean(loadingAction)}
        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-medium text-slate-400 hover:bg-white/10 hover:text-white transition-all flex items-center gap-1.5"
      >
        <RotateCcw className="h-3.5 w-3.5" />
        Reset Baseline (V1)
      </button>
    </div>
  );
}
