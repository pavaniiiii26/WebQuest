import { useState, useEffect } from 'react';
import { X, Activity, RefreshCw, CheckCircle, AlertTriangle, ShieldCheck, Database } from 'lucide-react';
import { fetchScraperHealth } from '../services/api.js';

export default function ScraperHealthModal({ onClose }) {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadHealth = async () => {
    setLoading(true);
    try {
      const data = await fetchScraperHealth();
      setHealthData(data);
    } catch (err) {
      console.error('Failed to load health data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHealth();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl overflow-hidden text-slate-100 space-y-6 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Scraper Health & Pipeline Status
              </h3>
              <p className="text-xs text-slate-400">
                Zero-LLM Bright Data Heuristic Monitoring
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadHealth}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Refresh Health"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        {healthData && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
              <span className="text-xs text-slate-400 block mb-1">Total Scrapes</span>
              <span className="text-xl font-bold text-white">{healthData.stats?.totalScrapes || 0}</span>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
              <span className="text-xs text-slate-400 block mb-1">Live Bright Data</span>
              <span className="text-xl font-bold text-emerald-400">{healthData.stats?.liveScrapes || 0}</span>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
              <span className="text-xs text-slate-400 block mb-1">Stale Cache Fallbacks</span>
              <span className="text-xl font-bold text-amber-400">{healthData.stats?.staleCacheFallbacks || 0}</span>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80">
              <span className="text-xs text-slate-400 block mb-1">Valid Records</span>
              <span className="text-xl font-bold text-blue-400">{healthData.stats?.totalValidRecords || 0}</span>
            </div>
          </div>
        )}

        {/* Audit Log Table */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-400" />
            Recent Scrape Pipeline Audit Logs
          </h4>

          {loading ? (
            <div className="p-8 text-center text-slate-400 text-sm">
              Loading scraper audit trail...
            </div>
          ) : healthData?.logs?.length === 0 ? (
            <div className="p-6 bg-slate-950 rounded-xl text-center text-slate-400 text-sm">
              No live scrapes executed yet. Try searching for a destination on the homepage!
            </div>
          ) : (
            <div className="space-y-2.5">
              {healthData?.logs?.map((log) => (
                <div
                  key={log.id}
                  className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{log.destination}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                          log.isStale
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {log.isStale ? 'STALE CACHE' : 'LIVE SCRAPE'}
                      </span>
                    </div>
                    <span className="text-slate-500 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-400">
                    <div>
                      Method: <span className="text-slate-200 font-mono">{log.method}</span>
                    </div>
                    <div>
                      Valid: <span className="text-emerald-400 font-bold">{log.validCount}</span>
                    </div>
                    <div>
                      Dropped: <span className="text-rose-400 font-bold">{log.droppedCount}</span>
                    </div>
                    <div>
                      Duration: <span className="text-blue-400 font-mono">{log.durationMs}ms</span>
                    </div>
                  </div>

                  {log.fallbacksUsed?.length > 0 && (
                    <div className="flex items-start gap-1.5 text-amber-300/90 pt-1 border-t border-slate-900">
                      <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      <span>
                        Field Fallbacks Triggered: {log.fallbacksUsed.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 pt-3 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span>Local JSON Cache Active</span>
          </div>
          <span>API Endpoint: <code className="text-slate-300">/api/scraper-health</code></span>
        </div>
      </div>
    </div>
  );
}
