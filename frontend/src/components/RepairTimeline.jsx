import { CheckCircle2, AlertOctagon, RefreshCw, Sparkles, ArrowRight, Zap, Globe } from 'lucide-react';

const TIMELINE_STEPS = [
  { id: 'run_1', title: '1. Scrape Run', desc: 'Baseline target extraction', icon: Globe },
  { id: 'site_changed', title: '2. Site Mutated', desc: 'DOM classes/tags renamed', icon: Zap },
  { id: 'failure_detected', title: '3. Failure Detected', desc: '0/20 records extracted', icon: AlertOctagon },
  { id: 'diagnosis', title: '4. Candidate Scoring', desc: '5-factor heuristic analysis', icon: RefreshCw },
  { id: 'repair_applied', title: '5. Repair Applied', desc: 'Schema updated in MongoDB', icon: Sparkles },
  { id: 'run_2_healed', title: '6. Auto-Recovered', desc: '20/20 items re-scraped', icon: CheckCircle2 },
];

export default function RepairTimeline({ currentStage = 'run_1', status }) {
  // Determine current active step index
  const stageIndices = {
    idle: 0,
    run_success: 0,
    broken: 2,
    diagnosed: 3,
    healing: 4,
    healed: 5,
  };

  const activeIndex = stageIndices[currentStage] ?? (status === 'broken' ? 2 : 0);

  return (
    <div className="card p-5 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold text-sm text-white flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-brand-400" />
          Autonomous Self-Healing Lifecycle
        </h3>
        <span className="text-xs text-slate-500 font-mono">Deterministic Recovery Pipeline</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {TIMELINE_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isDone = idx < activeIndex || (activeIndex === 5 && idx === 5);
          const isCurrent = idx === activeIndex;
          const isPending = idx > activeIndex;

          return (
            <div
              key={step.id}
              className={`relative rounded-xl p-3.5 border transition-all duration-300 flex flex-col justify-between ${
                isCurrent
                  ? status === 'broken'
                    ? 'border-red-500/50 bg-red-500/10 shadow-lg shadow-red-500/10'
                    : 'border-brand-500/50 bg-brand-500/15 shadow-lg shadow-brand-500/10'
                  : isDone
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : 'border-white/5 bg-white/2 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`h-7 w-7 rounded-lg flex items-center justify-center ${
                  isCurrent
                    ? status === 'broken' ? 'bg-red-500/20 text-red-400' : 'bg-brand-500/20 text-brand-400'
                    : isDone
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-white/5 text-slate-500'
                }`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>

                <span className={`text-[10px] font-mono font-bold ${
                  isCurrent
                    ? status === 'broken' ? 'text-red-400' : 'text-brand-400'
                    : isDone
                    ? 'text-emerald-400'
                    : 'text-slate-600'
                }`}>
                  {isDone ? 'DONE' : isCurrent ? 'ACTIVE' : `STEP ${idx + 1}`}
                </span>
              </div>

              <div>
                <h4 className={`text-xs font-semibold leading-snug ${
                  isCurrent ? 'text-white' : isDone ? 'text-slate-200' : 'text-slate-400'
                }`}>
                  {step.title}
                </h4>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
