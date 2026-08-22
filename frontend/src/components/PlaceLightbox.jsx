import { useEffect } from 'react';
import { Bookmark, Plus, Star, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function PlaceLightbox({ place, destination, inTrip, onToggleTrip, onClose }) {
  useEffect(() => {
    if (!place) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [place, onClose]);

  return (
    <AnimatePresence>
      {place && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Close"
            className="absolute inset-0 bg-ink-900/70 backdrop-blur-sm cursor-pointer"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="place-lightbox-title"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="relative z-10 w-full max-w-3xl overflow-hidden rounded-[28px] bg-white shadow-2xl"
          >
            <div className="relative h-[280px] sm:h-[360px]">
              <img
                src={place.image}
                alt={place.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-black/20" />
              <button
                type="button"
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/35 hover:bg-black/50 text-white border border-white/15 backdrop-blur-sm transition-colors"
                aria-label="Close lightbox"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 sm:p-8 space-y-4">
              <p className="text-[11px] uppercase tracking-[0.2em] text-ink-700/45">
                {place.region || destination}
              </p>
              <h3 id="place-lightbox-title" className="font-serif text-3xl text-ink-900 leading-tight">
                {place.name}
              </h3>

              {place.rating && (
                <div className="flex items-center gap-1.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < Math.floor(place.rating)
                          ? 'fill-olive-500 text-olive-500'
                          : 'text-cream-300'
                      }`}
                    />
                  ))}
                  <span className="text-sm font-medium text-ink-800 ml-1">{place.rating}</span>
                  <span className="text-xs text-ink-700/45">/ 5.0</span>
                </div>
              )}

              <p className="text-sm text-ink-700/70 leading-relaxed">
                A standout stop in {destination}. Save it to your trip to keep this place
                handy while you compare stays and build the itinerary.
              </p>

              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => onToggleTrip(place)}
                  className={`inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                    inTrip
                      ? 'bg-olive-600 text-white hover:bg-olive-500'
                      : 'bg-olive-600 text-white hover:bg-olive-500'
                  }`}
                >
                  {inTrip ? <Bookmark className="w-4 h-4 fill-white" /> : <Plus className="w-4 h-4" />}
                  {inTrip ? 'Saved to trip' : 'Add to trip'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-3 rounded-full bg-cream-100 hover:bg-cream-200 text-ink-800 text-sm font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
