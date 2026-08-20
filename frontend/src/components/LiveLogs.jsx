import { Terminal, Trash2 } from 'lucide-react';

export default function LiveLogs({ logs = [], onClear }) {
  const getBadgeStyle = (type) => {
    switch (type) {
      case 'SCRAPE':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      case 'FAILURE':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'HEAL':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'DIAGNOSE':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'DB':
        return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      default:
        return 'text-slate-400 bg-white/5 border-white/10';
    }
  };

  return (
    <div className="card p-4 space-y-3 font-mono">
      <div className="flex items-center justify-between border-b border-white/10 pb-2">
        <div className="flex items-center gap-2 text-xs text-slate-300 font-semibold">
          <Terminal className="h-4 w-4 text-brand-400" />
          <span>Live Engine Console</span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        {onClear && (
          <button
            onClick={onClear}
            className="text-[10px] text-slate-500 hover:text-slate-300 flex items-center gap-1"
          >
            <Trash2 className="h-3 w-3" /> Clear
          </button>
        )}
      </div>

      <div className="h-44 overflow-y-auto space-y-1.5 text-[11px] pr-1 scrollbar-thin">
        {logs.length === 0 ? (
          <div className="text-slate-600 italic py-2">Waiting for engine actions...</div>
        ) : (
          logs.map((log, index) => (
            <div key={index} className="flex items-start gap-2 leading-relaxed">
              <span className="text-slate-600 text-[10px] select-none">{log.time}</span>
              <span className={`px-1.5 py-0.2 rounded border text-[9px] font-bold ${getBadgeStyle(log.type)}`}>
                {log.type}
              </span>
              <span className="text-slate-300 flex-1">{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
