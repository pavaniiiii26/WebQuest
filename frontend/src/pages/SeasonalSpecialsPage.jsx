import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, ChevronLeft, Loader2, MapPin, Star, Sun, Snowflake } from 'lucide-react';
import Header from '../components/Header.jsx';
import { searchDestinations } from '../services/api.js';

const SEASONS = {
  summer: {
    title: 'Summer Specials',
    subtitle: 'Sun-soaked stays, island escapes, and warm-weather city breaks.',
    destinations: ['Bali', 'Australia', 'Thailand'],
    icon: Sun,
    accent: 'text-amber-700 bg-amber-50',
  },
  winter: {
    title: 'Winter Specials',
    subtitle: 'Snowy escapes, Himalayan views, and memorable cold-season stays.',
    destinations: ['Iceland', 'Switzerland', 'Nepal', 'Tibet'],
    icon: Snowflake,
    accent: 'text-sky-700 bg-sky-50',
  },
};

export default function SeasonalSpecialsPage() {
  const { season } = useParams();
  const config = SEASONS[season] || SEASONS.summer;
  const Icon = config.icon;
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all(config.destinations.map(async (destination) => {
      try {
        const data = await searchDestinations({ destination });
        return { destination, hotels: data.hotels || [] };
      } catch {
        return { destination, hotels: [] };
      }
    })).then((data) => {
      if (active) setOffers(data);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [season]);

  return (
    <div className="min-h-screen bg-cream-100 text-ink-800">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-olive-700 hover:text-olive-800"><ChevronLeft className="h-4 w-4" /> Back to explore</Link>
        <div className="mt-7 max-w-2xl">
          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${config.accent}`}><Icon className="h-3.5 w-3.5" /> Curated for the season</span>
          <h1 className="mt-4 font-serif text-4xl sm:text-5xl text-ink-900">{config.title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-700/65">{config.subtitle} Select a hotel to see the destination and plan your stay.</p>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 py-16 text-ink-700/60"><Loader2 className="h-5 w-5 animate-spin text-olive-600" /> Finding seasonal stays…</div>
        ) : (
          <div className="mt-10 space-y-12">
            {offers.map(({ destination, hotels }) => (
              <section key={destination}>
                <div className="mb-5 flex items-center justify-between gap-3">
                  <div><p className="text-[10px] uppercase tracking-[0.2em] text-olive-700 font-semibold">Featured destination</p><h2 className="mt-1 font-serif text-3xl text-ink-900">{destination}</h2></div>
                  <Link to={`/destination/${encodeURIComponent(destination)}`} className="text-sm font-medium text-olive-700 hover:text-olive-800">Explore {destination} →</Link>
                </div>
                {hotels.length ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {hotels.slice(0, 3).map((hotel, index) => (
                      <Link key={`${hotel.name}-${index}`} to={`/destination/${encodeURIComponent(destination)}`} className="group overflow-hidden rounded-[22px] bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
                        <div className="relative h-48 overflow-hidden"><img src={hotel.imageUrl} alt={hotel.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" /><span className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-ink-800">${hotel.pricePerNight}/night</span></div>
                        <div className="p-5"><div className="flex items-center gap-1 text-xs font-semibold text-olive-700"><Star className="h-3.5 w-3.5 fill-olive-500 text-olive-500" />{hotel.rating}</div><h3 className="mt-2 font-medium text-ink-900">{hotel.name}</h3><p className="mt-1 flex items-center gap-1 truncate text-xs text-ink-700/55"><MapPin className="h-3 w-3" />{hotel.address}</p><p className="mt-4 flex items-center gap-1 text-sm font-medium text-olive-700">View stay <ArrowRight className="h-3.5 w-3.5" /></p></div>
                      </Link>
                    ))}
                  </div>
                ) : <p className="rounded-2xl bg-white p-6 text-sm text-ink-700/60">No seasonal hotel offers are available right now.</p>}
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
