import { ExternalLink, MapPin, DollarSign } from 'lucide-react';
import { StarRating } from './StarRating.jsx';

const HOTEL_FALLBACK = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600';

export default function HotelCard({ hotel, highlighted = false }) {
  if (!hotel) {
    return (
      <div className="card p-4 text-center text-sm text-slate-500">
        No hotel data available for this destination.
      </div>
    );
  }

  const { name, pricePerNight, currency, rating, address, url, imageUrl } = hotel;

  return (
    <div className={`card overflow-hidden ${highlighted ? 'border-brand-500/40 shadow-brand-500/10 shadow-lg' : ''}`}>
      <div className="flex gap-0 flex-col sm:flex-row">
        {/* Image */}
        <div className="relative sm:w-36 h-36 sm:h-auto flex-shrink-0 overflow-hidden rounded-t-2xl sm:rounded-l-2xl sm:rounded-tr-none">
          <img
            src={imageUrl || HOTEL_FALLBACK}
            alt={name}
            className="h-full w-full object-cover"
            onError={e => { e.target.src = HOTEL_FALLBACK; }}
            loading="lazy"
          />
          {highlighted && (
            <div className="absolute top-2 left-2">
              <span className="badge border bg-brand-500/30 text-brand-300 border-brand-500/40 text-[10px]">
                ⭐ Recommended
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col justify-between p-4 gap-2">
          <div>
            <h4 className="font-display font-semibold text-white leading-snug line-clamp-2">
              {name}
            </h4>
            <div className="mt-1">
              <StarRating rating={rating} max={10} />
            </div>
            {address && (
              <div className="mt-1.5 flex items-start gap-1">
                <MapPin className="h-3 w-3 text-slate-600 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-slate-500 line-clamp-1">{address}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-2">
            {pricePerNight ? (
              <div className="flex items-baseline gap-1">
                <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                <span className="font-bold text-white text-lg">
                  {pricePerNight.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400">{currency}/night</span>
              </div>
            ) : (
              <span className="text-xs text-slate-500">Price unavailable</span>
            )}

            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 rounded-lg border border-brand-500/30 bg-brand-500/15 px-3 py-1.5 text-xs font-medium text-brand-300 hover:bg-brand-500/25 hover:text-white transition-all"
              >
                View on Booking.com
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
