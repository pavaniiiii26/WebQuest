const COLORS = [
  { name: 'Accommodation', key: 'accommodation', color: '#0d90eb', light: '#37aaf8' },
  { name: 'Food', key: 'food', color: '#10b981', light: '#34d399' },
  { name: 'Activities', key: 'activities', color: '#6366f1', light: '#818cf8' },
  { name: 'Transport', key: 'transport', color: '#f59e0b', light: '#fbbf24' },
];

export default function BudgetChart({ breakdown }) {
  if (!breakdown) return null;

  const total = breakdown.total || 1;
  const segments = COLORS.map(c => ({
    ...c,
    value: breakdown[c.key] || 0,
    pct: ((breakdown[c.key] || 0) / total) * 100,
  })).filter(s => s.value > 0);

  // Build SVG donut
  const R = 70;
  const stroke = 22;
  const circumference = 2 * Math.PI * R;

  let cumPct = 0;
  const arcs = segments.map(seg => {
    const dash = (seg.pct / 100) * circumference;
    const gap = circumference - dash;
    const offset = circumference - (cumPct / 100) * circumference;
    cumPct += seg.pct;
    return { ...seg, dash, gap, offset };
  });

  return (
    <div className="card p-6">
      <h3 className="font-display text-lg font-semibold text-white mb-5">Budget Breakdown</h3>

      <div className="flex flex-col sm:flex-row items-center gap-8">
        {/* Donut */}
        <div className="relative flex-shrink-0">
          <svg width="180" height="180" viewBox="0 0 180 180">
            {/* Background ring */}
            <circle
              cx="90" cy="90" r={R}
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={stroke}
            />
            {/* Segments */}
            {arcs.map((arc, i) => (
              <circle
                key={i}
                cx="90" cy="90" r={R}
                fill="none"
                stroke={arc.color}
                strokeWidth={stroke}
                strokeDasharray={`${arc.dash} ${arc.gap}`}
                strokeDashoffset={arc.offset}
                strokeLinecap="round"
                style={{
                  transform: 'rotate(-90deg)',
                  transformOrigin: '90px 90px',
                  transition: 'stroke-dasharray 1s ease, stroke-dashoffset 1s ease',
                  filter: `drop-shadow(0 0 6px ${arc.color}60)`,
                }}
              />
            ))}
            {/* Center text */}
            <text x="90" y="84" textAnchor="middle" fill="white" fontSize="22" fontWeight="700" fontFamily="Sora">
              ${(total || 0).toLocaleString()}
            </text>
            <text x="90" y="104" textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="Inter">
              Total Est.
            </text>
          </svg>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-3 w-full">
          {segments.map(seg => (
            <div key={seg.key} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="h-3 w-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: seg.color, boxShadow: `0 0 6px ${seg.color}80` }}
                />
                <span className="text-sm text-slate-300">{seg.name}</span>
              </div>
              <div className="flex items-center gap-3 ml-auto">
                {/* Progress bar */}
                <div className="hidden sm:block w-24 h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${seg.pct}%`, backgroundColor: seg.color, transition: 'width 1s ease' }}
                  />
                </div>
                <span className="text-xs text-slate-500 w-10 text-right">{seg.pct.toFixed(0)}%</span>
                <span className="font-semibold text-white text-sm w-20 text-right">
                  ${seg.value.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
