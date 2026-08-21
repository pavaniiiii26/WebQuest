import { motion } from 'framer-motion';

export default function ProgressRail({ destinations, activeIndex, onSelect }) {
  const prevDestination = destinations[(activeIndex - 1 + destinations.length) % destinations.length];
  const nextDestination = destinations[(activeIndex + 1) % destinations.length];

  return (
    <div className="hidden lg:flex flex-col items-center justify-between h-[80%] max-h-[580px] absolute left-8 top-1/2 -translate-y-1/2 z-30 select-none py-4 pointer-events-auto">
      {/* Top Faint Destination Name (e.g. AZORES) */}
      <motion.div
        key={`prev-${prevDestination.id}`}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 0.35, y: 0 }}
        transition={{ duration: 0.5 }}
        onClick={() => onSelect((activeIndex - 1 + destinations.length) % destinations.length)}
        className="font-serif-display uppercase text-xs tracking-[0.3em] text-white/40 font-bold hover:opacity-80 transition-opacity cursor-pointer transform -rotate-90 origin-center mb-8 whitespace-nowrap"
      >
        {prevDestination.country}
      </motion.div>

      {/* Vertical Line with Numbered Ticks */}
      <div className="relative flex flex-col items-center gap-6 my-auto">
        {/* Background Track Line */}
        <div className="absolute top-0 bottom-0 w-[1.5px] bg-white/20 -z-10" />

        {destinations.map((dest, idx) => {
          const isActive = idx === activeIndex;
          return (
            <button
              key={dest.id}
              onClick={() => onSelect(idx)}
              className="group relative flex items-center justify-center cursor-pointer focus:outline-none"
              title={`Go to ${dest.country}`}
            >
              {isActive ? (
                <motion.div
                  layoutId="activeRailBadge"
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="w-8 h-8 rounded-full bg-blue-500/30 border border-blue-400/60 backdrop-blur-md flex items-center justify-center shadow-lg shadow-blue-500/20"
                >
                  <span className="text-xs font-bold text-white font-mono">
                    {idx + 1}
                  </span>
                </motion.div>
              ) : (
                <div className="w-2.5 h-2.5 rounded-full bg-white/30 group-hover:bg-white/70 group-hover:scale-150 transition-all duration-300" />
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Counter (e.g. 4/5) */}
      <div className="text-[11px] font-mono text-white/50 tracking-wider font-semibold my-4">
        <span className="text-white font-bold">{activeIndex + 1}</span> / {destinations.length}
      </div>

      {/* Bottom Faint Destination Name (e.g. ITALY) */}
      <motion.div
        key={`next-${nextDestination.id}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 0.35, y: 0 }}
        transition={{ duration: 0.5 }}
        onClick={() => onSelect((activeIndex + 1) % destinations.length)}
        className="font-serif-display uppercase text-xs tracking-[0.3em] text-white/40 font-bold hover:opacity-80 transition-opacity cursor-pointer transform -rotate-90 origin-center mt-8 whitespace-nowrap"
      >
        {nextDestination.country}
      </motion.div>
    </div>
  );
}
