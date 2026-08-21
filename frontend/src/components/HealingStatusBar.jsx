import { useEffect, useState } from 'react';
import { fetchScraperHealth } from '../services/api.js';
import ScraperHealthModal from './ScraperHealthModal.jsx';

const POLL_MS = 20000;

function deriveStatus(health) {
  if (!health) {
    return { tone: 'unknown', label: 'Checking pipeline…' };
  }
  if (health.error) {
    return { tone: 'offline', label: 'Monitor offline' };
  }

  const latest = health.logs?.[0];
  if (!latest) {
    return {
      tone: health.brightDataConnected ? 'live' : 'unknown',
      label: health.brightDataConnected ? 'Ready · Bright Data' : 'Ready · awaiting scrape',
    };
  }

  if (latest.isStale) {
    return { tone: 'stale', label: 'Cache fallback active' };
  }

  const method = String(latest.method || '').toLowerCase();
  const isBrightData = method.includes('bright') || method.includes('dataset') || method.includes('unlocker') || method.includes('live');
  return {
    tone: 'live',
    label: isBrightData ? 'Live · Bright Data' : `Live · ${latest.method}`,
  };
}

export default function HealingStatusBar() {
  const [health, setHealth] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const data = await fetchScraperHealth();
        if (!cancelled) setHealth(data);
      } catch {
        if (!cancelled) setHealth({ error: true });
      }
    };

    load();
    const id = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const { tone, label } = deriveStatus(health);
  const dotClass =
    tone === 'live'
      ? 'bg-olive-400'
      : tone === 'stale'
        ? 'bg-amber-400'
        : tone === 'offline'
          ? 'bg-rose-400'
          : 'bg-cream-300';

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="sticky top-0 z-[70] w-full h-9 flex items-center justify-center gap-2 bg-ink-900 text-cream-100 text-[11px] sm:text-xs font-medium tracking-wide hover:bg-ink-800 transition-colors duration-300 cursor-pointer"
        aria-label="Open scraper health audit log"
      >
        <span className={`w-1.5 h-1.5 rounded-full ${dotClass} ${tone === 'live' ? 'animate-pulse' : ''}`} />
        <span>{label}</span>
        <span className="hidden sm:inline text-cream-100/40 font-normal">· self-healing pipeline</span>
      </button>

      {showModal && <ScraperHealthModal onClose={() => setShowModal(false)} />}
    </>
  );
}
