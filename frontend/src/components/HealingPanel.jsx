import { Sparkles, ArrowRight, CheckCircle2, Award, Zap, Loader2 } from 'lucide-react';

export default function HealingPanel({
  diagnosisData,
  onApplyHeal,
  loading,
}) {
  if (!diagnosisData || !diagnosisData.proposedRepairs || diagnosisData.proposedRepairs.length === 0) {
    return null;
  }

  const primaryRepair = diagnosisData.primaryRepair || diagnosisData.proposedRepairs[0];
  const allRepairs = diagnosisData.proposedRepairs;

  const handleApply = () => {
    onApplyHeal(allRepairs);
  };

  return (
    <div className="card p-6 border-emerald-500/40 bg-emerald-950/20 shadow-2xl shadow-emerald-500/10 space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-500/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Sparkles className="h-5 w-5 animate-pulse-soft" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="badge border border-emerald-500/40 bg-emerald-500/20 text-emerald-300">
                REPAIR CANDIDATE READY
              </span>
              <span className="text-xs text-slate-400">Deterministic scoring</span>
            </div>
            <h3 className="font-display text-lg font-bold text-white mt-0.5">
              Proposed Self-Healing Selector Repair
            </h3>
          </div>
        </div>

        {/* Overall Confidence Badge */}
        <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/40 px-4 py-2 rounded-xl">
          <Award className="h-4 w-4 text-emerald-400" />
          <div>
            <div className="text-[10px] uppercase text-emerald-400 font-bold">CONFIDENCE</div>
            <div className="text-lg font-extrabold text-white font-mono leading-none">
              {primaryRepair.confidence}%
            </div>
          </div>
        </div>
      </div>

      {/* Primary Repair Selector Diff */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Failed Old Selector */}
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-950/30 space-y-2">
          <div className="flex items-center justify-between text-xs text-red-400 font-semibold uppercase">
            <span>OLD / BROKEN SELECTOR</span>
            <span className="font-mono text-[10px] text-red-400/80">0 MATCHES</span>
          </div>
          <div className="font-mono text-base text-red-200 bg-black/40 p-2.5 rounded-lg border border-red-500/20">
            {primaryRepair.oldSelector}
          </div>
          <p className="text-[11px] text-slate-400">
            Field: <strong className="text-white">{primaryRepair.field}</strong>
          </p>
        </div>

        {/* Candidate Replacement Selector */}
        <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/30 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold uppercase">
            <span className="flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 fill-current" />
              CANDIDATE REPLACEMENT
            </span>
            <span className="font-mono text-[10px] text-emerald-400/90 font-bold">
              {primaryRepair.matches} MATCHES (100% PARITY)
            </span>
          </div>
          <div className="font-mono text-base text-emerald-300 bg-black/40 p-2.5 rounded-lg border border-emerald-500/30 font-bold">
            {primaryRepair.candidateSelector}
          </div>
          {primaryRepair.sampleText && (
            <p className="text-[11px] text-slate-300 line-clamp-1">
              Sample: <span className="font-mono text-emerald-200">"{primaryRepair.sampleText}"</span>
            </p>
          )}
        </div>

      </div>

      {/* Multi-Factor Score Breakdown */}
      {primaryRepair.scoreBreakdown && (
        <div className="p-4 rounded-xl border border-white/10 bg-black/30 space-y-3">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            5-Factor Heuristic Score Breakdown
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
              <div className="text-slate-400 text-[10px]">Count Parity (30 max)</div>
              <div className="text-white font-mono font-bold mt-1">
                {primaryRepair.scoreBreakdown.countParity} / 30 pts
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
              <div className="text-slate-400 text-[10px]">Type Validity (25 max)</div>
              <div className="text-white font-mono font-bold mt-1">
                {primaryRepair.scoreBreakdown.typeValidity} / 25 pts
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
              <div className="text-slate-400 text-[10px]">Structure Match (20 max)</div>
              <div className="text-white font-mono font-bold mt-1">
                {primaryRepair.scoreBreakdown.structuralSimilarity} / 20 pts
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-white/5 border border-white/5">
              <div className="text-slate-400 text-[10px]">Lexical Similarity (15 max)</div>
              <div className="text-white font-mono font-bold mt-1">
                {primaryRepair.scoreBreakdown.lexicalSimilarity} / 15 pts
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action: Apply Heal */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="text-xs text-slate-400">
          Applying will update the scraper schema in MongoDB and automatically re-run the scraper.
        </div>
        <button
          onClick={handleApply}
          disabled={loading}
          className="btn-primary py-3.5 px-8 text-sm flex items-center justify-center gap-2 w-full sm:w-auto shadow-lg shadow-emerald-500/20"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Applying Repair & Re-Scraping...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4" />
              [ APPLY HEAL & RE-SCRAPE ]
            </>
          )}
        </button>
      </div>

    </div>
  );
}
