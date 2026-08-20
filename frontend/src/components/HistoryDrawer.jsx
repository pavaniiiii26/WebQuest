import { useState } from 'react';
import { History, Activity, Sparkles, CheckCircle2, XCircle } from 'lucide-react';

export default function HistoryDrawer({ runs = [], healings = [] }) {
  const [activeTab, setActiveTab] = useState('runs'); // 'runs' | 'healings'

  return (
    <div className="card p-5 space-y-4">
      {/* Tab Selector */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-brand-400" />
          <h3 className="font-display font-semibold text-sm text-white">Execution & Healing Audit Log</h3>
        </div>

        <div className="flex items-center gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setActiveTab('runs')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'runs'
                ? 'bg-brand-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Scrape Runs ({runs.length})
          </button>
          <button
            onClick={() => setActiveTab('healings')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'healings'
                ? 'bg-brand-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Repairs Applied ({healings.length})
          </button>
        </div>
      </div>

      {/* Runs Tab */}
      {activeTab === 'runs' && (
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {runs.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No scrape runs recorded yet.</p>
          ) : (
            runs.map((run, i) => (
              <div
                key={run._id || i}
                className="flex items-center justify-between p-2.5 rounded-xl border border-white/5 bg-black/20 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  {run.status === 'success' ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-400 flex-shrink-0" />
                  )}
                  <div>
                    <div className="font-semibold text-slate-200">
                      Run #{run.runNumber || runs.length - i} — {run.domVersion}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      {new Date(run.createdAt || Date.now()).toLocaleTimeString()} · {run.durationMs || 0}ms
                    </div>
                  </div>
                </div>

                <div className="text-right font-mono">
                  <span className={`font-bold ${run.status === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>
                    {run.recordsExtracted} / {run.expectedCount} items
                  </span>
                  <div className="text-[10px] text-slate-500">
                    {run.validationSummary?.scorePct || 0}% score
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Healings Tab */}
      {activeTab === 'healings' && (
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
          {healings.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No healing repairs applied yet.</p>
          ) : (
            healings.map((heal, i) => (
              <div
                key={heal._id || i}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl border border-emerald-500/20 bg-emerald-950/20 text-xs gap-2"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="font-mono text-slate-300">
                      <span className="text-red-400 line-through">{heal.failedSelector}</span>
                      <span className="mx-1 text-slate-500">➔</span>
                      <span className="text-emerald-300 font-bold">{heal.replacementSelector}</span>
                    </span>
                  </div>
                  {heal.failureDescription && (
                    <p className="text-[11px] text-slate-400 italic">"{heal.failureDescription}"</p>
                  )}
                </div>

                <div className="flex items-center gap-3 text-right">
                  <div className="bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 rounded text-[11px] font-mono text-emerald-300 font-bold">
                    {heal.confidence}% Conf.
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {new Date(heal.createdAt || Date.now()).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
