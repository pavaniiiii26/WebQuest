import { useState } from 'react';
import { Bookmark, Star } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PlaceCard({ place, index, isDesktop = false }) {
  const [bookmarked, setBookmarked] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.55,
        delay: 0.08 + index * 0.06,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{ y: -4 }}
      className={`group relative overflow-hidden rounded-[22px] shadow-sm transition-shadow duration-500 hover:shadow-md select-none flex-shrink-0 ${
        isDesktop
          ? 'w-full h-[280px]'
          : 'w-full h-[210px]'
      }`}
    >
      <img
        src={place.image}
        alt={place.name}
        className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

      <button
        onClick={(e) => { e.stopPropagation(); setBookmarked(!bookmarked); }}
        className="absolute top-3 left-3 z-10 p-1.5 rounded-full bg-black/25 hover:bg-black/40 backdrop-blur-sm border border-white/15 text-white transition-all duration-300 active:scale-90"
        title="Save"
      >
        <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-white' : ''}`} />
      </button>

      <div className="absolute bottom-0 left-0 right-0 p-3.5 space-y-0.5">
        <p className="text-[10px] uppercase tracking-[0.18em] text-white/70 line-clamp-1">
          {place.region}
        </p>
        <h4 className="text-sm font-medium text-white leading-snug line-clamp-1">
          {place.name}
        </h4>
        {place.rating && (
          <div className="flex items-center gap-1 pt-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < Math.floor(place.rating)
                    ? 'fill-olive-300 text-olive-300'
                    : 'text-white/25'
                }`}
              />
            ))}
            <span className="text-[10px] text-white/65 ml-1 font-mono">{place.rating}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
