import { useState } from 'react';
import { AlertOctagon, HelpCircle, ArrowRight, Stethoscope, Loader2 } from 'lucide-react';

export default function FailurePanel({
  failureData,
  onDiagnose,
  loading,
}) {
  const [hint, setHint] = useState('');

  if (!failureData) return null;

  const {
    brokenSelectors = [],
    expectedRecords = 20,
    recordsFound = 0,
    failureSummary = '',
  } = failureData;

  const primaryFailure = brokenSelectors[0] || {
    selector: '.hotel-name',
    field: 'name',
    reason: 'Selector returned zero elements.',
  };

  const handleDiagnose = () => {
    onDiagnose(hint);
  };

  return (
    <div className="card p-6 border-red-500/40 bg-red-950/20 shadow-2xl shadow-red-500/10 space-y-5 animate-fade-in">

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-red-500/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
            <AlertOctagon className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="badge border border-red-500/40 bg-red-500/20 text-red-300">
                CRITICAL FAILURE DETECTED
              </span>
              <span className="text-xs text-slate-400">Zero-element drop</span>
            </div>
            <h3 className="font-display text-lg font-bold text-white mt-0.5">
              Scraper Execution Broken
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono bg-black/40 px-3.5 py-2 rounded-xl border border-white/5">
          <div>
            <span className="text-slate-500 block text-[10px]">EXPECTED</span>
            <span className="text-slate-200 font-bold">{expectedRecords} items</span>
          </div>
          <div className="h-6 w-px bg-white/10" />
          <div>
            <span className="text-slate-500 block text-[10px]">FOUND</span>
            <span className="text-red-400 font-bold">{recordsFound} items</span>
          </div>
        </div>
      </div>

      {/* Broken Selectors Table */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
          Failed Selectors Breakdown
        </label>
        <div className="grid grid-cols-1 gap-2">
          {brokenSelectors.map((broken, i) => (
            <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-xl border border-red-500/25 bg-red-500/10 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="font-mono px-2 py-0.5 rounded bg-black/50 text-red-300 font-bold border border-red-500/30">
                  {broken.field}
                </span>
                <span className="font-mono text-red-200">{broken.selector}</span>
              </div>
              <span className="text-slate-400 italic text-[11px]">{broken.reason}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Optional Failure Description Input ("What changed?") */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <HelpCircle className="h-3.5 w-3.5 text-amber-400" />
            Failure Description / Hint (Optional):
          </label>
          <span className="text-[11px] text-slate-500">Deterministic lexical parsing</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={hint}
            onChange={(e) => setHint(e.target.value)}
            placeholder="e.g. The hotel cards were renamed to property-card and hotel-name was changed to property-title."
            className="input text-xs flex-1"
          />
          <button
            onClick={handleDiagnose}
            disabled={loading}
            className="btn-primary py-2.5 px-5 text-xs flex items-center justify-center gap-2 flex-shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Scoring Candidates...
              </>
            ) : (
              <>
                <Stethoscope className="h-3.5 w-3.5" />
                Diagnose & Score Candidates
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
