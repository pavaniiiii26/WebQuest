import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Calendar,
  Users,
  Star,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react';
import Header from '../components/Header.jsx';
import ItineraryMap from '../components/ItineraryMap.jsx';
import PlaceCard from '../components/PlaceCard.jsx';
import { fetchDestinationDetail } from '../services/api.js';
import { DESTINATIONS_DATA } from '../data/destinationsData.js';

export default function DetailPage() {
  const { name } = useParams();
  const destinationName = name || 'Singapore';

  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedHotel, setSelectedHotel] = useState(null);

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [persons, setPersons] = useState('2 Persons');

  useEffect(() => {
    setLoading(true);
    fetchDestinationDetail(destinationName)
      .then((data) => {
        setDetailData(data);
        if (data.hotels?.length > 0) {
          setSelectedHotel(data.hotels[0]);
        }
      })
      .catch((err) => console.error('Error fetching detail:', err))
      .finally(() => setLoading(false));
  }, [destinationName]);

  const curated = DESTINATIONS_DATA.find(
    (d) => d.country.toLowerCase() === destinationName.toLowerCase()
      || d.id.toLowerCase() === destinationName.toLowerCase(),
  );

  const activeHotel = selectedHotel || detailData?.hotels?.[0] || {
    name: `${destinationName} Grand Resort & Spa`,
    pricePerNight: 380,
    currency: 'USD',
    rating: 4.9,
    address: `Central Waterfront District, ${destinationName}`,
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop',
    amenities: ['Infinity Pool', 'Beach Access', 'Spa Therapy', 'Fine Dining'],
  };

  const heroImage = curated?.heroImage || detailData?.imageUrl || activeHotel.imageUrl;
  const heroDescription = curated?.description || detailData?.description || `Explore handpicked luxury stays and curated travel experiences in ${destinationName}.`;
  const mosaicPlaces = curated?.places || detailData?.hotels?.map((h) => ({
    name: h.name,
    region: h.address,
    image: h.imageUrl,
    rating: h.rating,
  })) || [];
  const routeStops = curated?.stops || detailData?.stops || [];

  return (
    <div className="min-h-screen bg-cream-100 text-ink-800 font-sans flex flex-col">
      <Header isTransparent={true} />

      <section className="relative min-h-[78vh] flex items-end pt-24 pb-0 px-0 overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src={heroImage}
            alt={destinationName}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/30" />
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto px-5 sm:px-8 pb-24 space-y-5">
          <p className="text-[11px] uppercase tracking-[0.32em] text-white/70">
            {curated?.eyebrow || 'Hidden corners of the world'}
          </p>
          <h1 className="font-serif text-5xl sm:text-7xl font-medium text-white tracking-tight leading-[0.95]">
            {curated?.country || destinationName}
          </h1>
          <p className="text-[15px] text-white/80 max-w-xl font-light leading-relaxed">
            {heroDescription}
          </p>
          <button className="inline-flex items-center px-6 py-3 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 text-white text-sm font-medium backdrop-blur-md transition-all duration-300">
            View the itinerary
          </button>
        </div>

        <div className="absolute -bottom-px left-0 right-0 z-20 leading-none pointer-events-none">
          <svg viewBox="0 0 1440 72" preserveAspectRatio="none" className="w-full h-12 sm:h-16 fill-[#F5F2EC]">
            <path d="M0,40 C240,72 480,8 720,32 C960,56 1200,16 1440,40 L1440,72 L0,72 Z" />
          </svg>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20 flex-1 w-full">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-olive-700 hover:text-olive-800 transition-colors duration-300"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all destinations</span>
        </Link>

        {mosaicPlaces.length > 0 && (
          <section className="space-y-8">
            <h2 className="font-serif text-3xl sm:text-[2.2rem] font-medium text-ink-900 max-w-lg leading-snug">
              Everything you’ll see, hear, taste, and feel
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {mosaicPlaces.map((place, idx) => (
                <div key={`${place.name}-${idx}`} className={idx === 0 || idx === 5 ? 'sm:row-span-2' : ''}>
                  <PlaceCard place={place} index={idx} isDesktop={idx === 0 || idx === 5} />
                </div>
              ))}
            </div>
          </section>
        )}

        {routeStops.length > 0 && (
          <section className="space-y-6">
            <ItineraryMap stops={routeStops} />
          </section>
        )}

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative h-[420px] rounded-[28px] overflow-hidden group">
            <img
              src={activeHotel.imageUrl}
              alt={activeHotel.name}
              className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-[0.18em] text-white/70">
                  Featured stay
                </span>
                <h4 className="text-xl font-medium text-white">{activeHotel.name}</h4>
              </div>
              <div className="px-3.5 py-1.5 rounded-full bg-white/90 text-ink-800 text-xs font-semibold">
                ${activeHotel.pricePerNight} / night
              </div>
            </div>
          </div>

          <div className="space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-olive-50 text-olive-700 text-xs font-medium">
              <Star className="w-3.5 h-3.5 fill-olive-500 text-olive-500" />
              <span>{activeHotel.rating} / 5.0 Exceptional</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-ink-900 tracking-tight leading-snug">
              Celebrate in paradise.
            </h2>

            <p className="text-ink-700/70 text-sm sm:text-base leading-relaxed">
              Nestled along the finest views in {destinationName}, {activeHotel.name} offers breathtaking oceanfront vistas, personalized concierge hospitality, and state-of-the-art spa wellness retreats.
            </p>

            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-medium uppercase tracking-wider text-ink-700/45">
                Included amenities
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {activeHotel.amenities?.map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-ink-800">
                    <CheckCircle className="w-4 h-4 text-olive-600 flex-shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex items-center gap-4">
              <button className="px-6 py-3 rounded-full bg-olive-600 hover:bg-olive-500 text-white font-medium text-sm transition-all duration-300">
                More info & booking
              </button>
              <a
                href={activeHotel.url}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 rounded-full bg-white hover:bg-cream-200 text-ink-800 text-sm font-medium transition-all duration-300"
              >
                View source
              </a>
            </div>
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex items-end justify-between gap-4">
            <h3 className="font-serif text-2xl sm:text-3xl font-medium text-ink-900 tracking-tight">
              Tour program
            </h3>
            <span className="text-xs text-ink-700/45">
              {detailData?.hotels?.length || 0} hotels available
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            <div className="space-y-0">
              {(routeStops.length ? routeStops : [{ name: destinationName, order: 1 }]).map((stop, idx, arr) => (
                <div key={`${stop.name}-${idx}`} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-olive-500 mt-2" />
                    {idx < arr.length - 1 && <span className="w-px flex-1 bg-cream-300 my-1" />}
                  </div>
                  <div className="pb-8">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-ink-700/40">Day {stop.order || idx + 1}</p>
                    <h4 className="font-serif text-xl text-ink-900 mt-1">{stop.name}</h4>
                    {idx < arr.length - 1 && (
                      <p className="text-sm text-ink-700/55 mt-1">
                        {stop.name} — {arr[idx + 1].name}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {detailData?.hotels?.slice(0, 4).map((hotel, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedHotel(hotel)}
                  className={`rounded-[20px] overflow-hidden cursor-pointer transition-all duration-500 ${
                    selectedHotel?.name === hotel.name
                      ? 'ring-2 ring-olive-500/40'
                      : ''
                  }`}
                >
                  <img
                    src={hotel.imageUrl}
                    alt={hotel.name}
                    className="w-full h-36 object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white rounded-[28px] p-5 sm:p-6 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-cream-50">
              <Calendar className="w-5 h-5 text-olive-600 flex-shrink-0" />
              <div className="flex flex-col text-left w-full">
                <span className="text-[10px] uppercase tracking-wider text-ink-700/45">Check-in</span>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="bg-transparent text-xs font-medium text-ink-800 focus:outline-none cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-cream-50">
              <Calendar className="w-5 h-5 text-olive-600 flex-shrink-0" />
              <div className="flex flex-col text-left w-full">
                <span className="text-[10px] uppercase tracking-wider text-ink-700/45">Check-out</span>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="bg-transparent text-xs font-medium text-ink-800 focus:outline-none cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-cream-50">
              <Users className="w-5 h-5 text-olive-600 flex-shrink-0" />
              <div className="flex flex-col text-left w-full">
                <span className="text-[10px] uppercase tracking-wider text-ink-700/45">Persons</span>
                <select
                  value={persons}
                  onChange={(e) => setPersons(e.target.value)}
                  className="bg-transparent text-xs font-medium text-ink-800 focus:outline-none cursor-pointer"
                >
                  <option value="1 Person">1 Person</option>
                  <option value="2 Persons">2 Persons</option>
                  <option value="4 Persons">4 Persons</option>
                </select>
              </div>
            </div>

            <button className="w-full py-3.5 px-6 rounded-full bg-olive-600 hover:bg-olive-500 active:scale-[0.99] text-white font-medium text-sm transition-all duration-300 cursor-pointer">
              Check rates
            </button>
          </div>
        </section>
      </main>

      <footer className="py-8 text-center text-xs text-ink-700/40">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-ink-700/60 font-medium">
            <span>Voyalette</span>
            <span>•</span>
            <span className="text-olive-700">Destination</span>
          </div>
          <p>© 2026 Voyalette. Zero-LLM Architecture.</p>
        </div>
      </footer>
    </div>
  );
}
