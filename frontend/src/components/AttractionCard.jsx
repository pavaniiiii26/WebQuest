import { MapPin, Tag } from 'lucide-react';
import { StarRating } from './StarRating.jsx';

const CATEGORY_COLORS = {
  'Beach': 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25',
  'Museum': 'bg-purple-500/15 text-purple-400 border-purple-500/25',
  'Historical Site': 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  'Historical & Religious Site': 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  'Landmark': 'bg-brand-500/15 text-brand-400 border-brand-500/25',
  'Nature & Scenic': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  'Shopping & Market': 'bg-pink-500/15 text-pink-400 border-pink-500/25',
  'Experience & Sightseeing': 'bg-indigo-500/15 text-indigo-400 border-indigo-500/25',
  'Neighbourhood & Culture': 'bg-orange-500/15 text-orange-400 border-orange-500/25',
  'Attraction': 'bg-slate-500/15 text-slate-400 border-slate-500/25',
};

function getCategoryStyle(category) {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS['Attraction'];
}

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600',
  'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=600',
  'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600',
];

export default function AttractionCard({ attraction, index = 0 }) {
  const { name, category, rating, description, address, imageUrl } = attraction;
  const fallback = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];

  return (
    <div
      className="card-hover overflow-hidden flex flex-col"
      style={{ animation: `fadeUp 0.5s ease ${index * 0.08}s forwards`, opacity: 0 }}
    >
      {/* Image */}
      <div className="relative h-40 overflow-hidden rounded-t-2xl">
        <img
          src={imageUrl || fallback}
          alt={name}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
          onError={e => { e.target.src = fallback; }}
          loading="lazy"
        />
        {/* Category badge overlay */}
        <div className="absolute top-2.5 left-2.5">
          <span className={`badge border text-[10px] ${getCategoryStyle(category)}`}>
            {category}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <h4 className="font-display font-semibold text-white text-sm leading-snug line-clamp-2">
          {name}
        </h4>

        <StarRating rating={rating} />

        {description && (
          <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 flex-1">
            {description}
          </p>
        )}

        {address && (
          <div className="flex items-start gap-1 mt-auto pt-1">
            <MapPin className="h-3 w-3 text-slate-600 mt-0.5 flex-shrink-0" />
            <span className="text-xs text-slate-500 line-clamp-1">{address}</span>
          </div>
        )}
      </div>
    </div>
  );
}
