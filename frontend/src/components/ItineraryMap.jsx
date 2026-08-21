import { useMemo } from 'react';
import { motion } from 'framer-motion';

function projectStops(stops, width, height, padding = 40) {
  if (!stops?.length) return [];

  const lngs = stops.map((s) => s.lng);
  const lats = stops.map((s) => s.lat);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);

  const lngRange = maxLng - minLng || 1;
  const latRange = maxLat - minLat || 1;

  return stops.map((stop) => ({
    ...stop,
    x: padding + ((stop.lng - minLng) / lngRange) * (width  - padding * 2),
    y: padding + ((maxLat - stop.lat) / latRange) * (height - padding * 2),
  }));
}

const SVG_WIDTH  = 720;
const SVG_HEIGHT = 320;

export default function ItineraryMap({ stops }) {
  const projected = useMemo(
    () => projectStops(
      [...(stops || [])].sort((a, b) => a.order - b.order),
      SVG_WIDTH,
      SVG_HEIGHT,
    ),
    [stops],
  );

  if (!projected.length) return null;

  const polylinePoints = projected.map((s) => `${s.x},${s.y}`).join(' ');

  return (
    <div className="w-full rounded-[28px] overflow-hidden bg-white shadow-sm">
      <div className="px-6 pt-7 pb-2 flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-[1.65rem] font-serif font-medium text-ink-900 leading-snug">
            The escape starts here — see where we’re going
          </h3>
        </div>
        <div className="text-right text-xs text-ink-700/40 font-mono">
          {projected.length} stops
        </div>
      </div>

      <div className="relative w-full overflow-x-auto scrollbar-none px-4 pb-2">
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="w-full min-w-[340px]"
          style={{ maxHeight: '300px' }}
          aria-label="Route map"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <line
              key={`h-${i}`}
              x1="0" y1={(SVG_HEIGHT / 5) * i}
              x2={SVG_WIDTH} y2={(SVG_HEIGHT / 5) * i}
              stroke="rgba(60, 55, 45, 0.06)" strokeWidth="1"
            />
          ))}
          {Array.from({ length: 10 }).map((_, i) => (
            <line
              key={`v-${i}`}
              x1={(SVG_WIDTH / 9) * i} y1="0"
              x2={(SVG_WIDTH / 9) * i} y2={SVG_HEIGHT}
              stroke="rgba(60, 55, 45, 0.05)" strokeWidth="1"
            />
          ))}

          <motion.polyline
            points={polylinePoints}
            fill="none"
            stroke="rgba(95, 115, 73, 0.65)"
            strokeWidth="2"
            strokeDasharray="6 5"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          />

          {projected.map((stop, idx) => (
            <g key={stop.order}>
              <circle
                cx={stop.x} cy={stop.y} r={20}
                fill="rgba(95, 115, 73, 0.08)"
              />
              <motion.circle
                cx={stop.x} cy={stop.y} r={11}
                fill="#F5F2EC"
                stroke="rgba(95, 115, 73, 0.85)"
                strokeWidth="1.5"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 + idx * 0.1, type: 'spring', stiffness: 280, damping: 22 }}
              />
              <motion.text
                x={stop.x} y={stop.y + 4}
                textAnchor="middle"
                fontSize="8"
                fontWeight="700"
                fill="#4C5C3A"
                fontFamily="monospace"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.18 + idx * 0.1 }}
              >
                {stop.order}
              </motion.text>

              {(() => {
                const above = stop.y > SVG_HEIGHT / 2;
                const labelY = above ? stop.y - 22 : stop.y + 27;
                return (
                  <motion.g
                    initial={{ opacity: 0, y: above ? 6 : -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.28 + idx * 0.1, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <rect
                      x={stop.x - 34} y={labelY - 10}
                      width="68" height="16"
                      rx="8"
                      fill="#FFFFFF"
                      stroke="rgba(60, 55, 45, 0.08)"
                      strokeWidth="1"
                    />
                    <text
                      x={stop.x} y={labelY + 1}
                      textAnchor="middle"
                      fontSize="7"
                      fill="#3F3C36"
                      fontFamily="sans-serif"
                      fontWeight="600"
                    >
                      {stop.name}
                    </text>
                  </motion.g>
                );
              })()}
            </g>
          ))}
        </svg>
      </div>

      <div className="px-6 pb-6">
        <div className="flex flex-wrap gap-2 pt-2">
          {projected.map((stop) => (
            <div
              key={stop.order}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cream-100 text-xs text-ink-700"
            >
              <span className="w-4 h-4 rounded-full bg-olive-100 text-olive-700 flex items-center justify-center text-[9px] font-bold font-mono flex-shrink-0">
                {stop.order}
              </span>
              {stop.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
