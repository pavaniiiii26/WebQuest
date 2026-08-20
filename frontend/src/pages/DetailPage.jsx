import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Users,
  Star,
  CheckCircle,
  Phone,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import Header from '../components/Header.jsx';
import { fetchDestinationDetail } from '../services/api.js';

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

  const activeHotel = selectedHotel || detailData?.hotels?.[0] || {
    name: `${destinationName} Grand Resort & Spa`,
    pricePerNight: 380,
    currency: 'USD',
    rating: 4.9,
    address: `Central Waterfront District, ${destinationName}`,
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop',
    amenities: ['Infinity Pool', 'Beach Access', 'Spa Therapy', 'Fine Dining'],
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* Page 2 Hero Header */}
      <Header isTransparent={true} />

      {/* Full-Bleed Dark Hero Section */}
      <section className="relative min-h-[620px] flex items-center justify-center pt-24 pb-24 px-4 sm:px-6 lg:px-8">
        {/* Hero Background Image */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src={detailData?.imageUrl || activeHotel.imageUrl}
            alt={destinationName}
            className="w-full h-full object-cover object-center filter brightness-45"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-slate-950" />
        </div>

        {/* Hero Text Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-5 pt-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-600/30 border border-blue-400/40 text-blue-200 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>Resilient Scraped Property Inventory</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Experience a Vacation with Class.
          </h1>

          <p className="text-lg sm:text-xl text-slate-200 max-w-2xl mx-auto font-light leading-relaxed">
            {detailData?.description || `Explore handpicked luxury stays and curated travel experiences in ${destinationName}.`}
          </p>

          {/* Floating Booking Widget Inline */}
          <div className="pt-6 max-w-4xl mx-auto">
            <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-4 sm:p-5 rounded-2xl sm:rounded-full shadow-2xl shadow-black/80 grid grid-cols-1 sm:grid-cols-4 gap-3 items-center text-left">
              {/* Check-In */}
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl sm:rounded-full bg-slate-950/60 border border-slate-800">
                <Calendar className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <div className="flex flex-col text-left w-full">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Check-in</span>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Check-Out */}
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl sm:rounded-full bg-slate-950/60 border border-slate-800">
                <Calendar className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <div className="flex flex-col text-left w-full">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Check-out</span>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Persons */}
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl sm:rounded-full bg-slate-950/60 border border-slate-800">
                <Users className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <div className="flex flex-col text-left w-full">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Persons</span>
                  <select
                    value={persons}
                    onChange={(e) => setPersons(e.target.value)}
                    className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
                  >
                    <option value="1 Person" className="bg-slate-900">1 Person</option>
                    <option value="2 Persons" className="bg-slate-900">2 Persons</option>
                    <option value="4 Persons" className="bg-slate-900">4 Persons</option>
                  </select>
                </div>
              </div>

              {/* Check Button */}
              <button className="w-full h-full py-3.5 px-6 rounded-xl sm:rounded-full bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer">
                <span>Check Rates</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Detail Content Section Below Hero */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16 flex-1 w-full">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Destinations</span>
        </Link>

        {/* Feature Section: Celebrate in Paradise */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Hero-style Image Container */}
          <div className="relative h-[420px] rounded-3xl overflow-hidden shadow-2xl border border-slate-800 group">
            <img
              src={activeHotel.imageUrl}
              alt={activeHotel.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
              <div>
                <span className="text-xs uppercase font-bold text-blue-400 tracking-wider">
                  Scraped Verified Stay
                </span>
                <h4 className="text-xl font-bold text-white">{activeHotel.name}</h4>
              </div>
              <div className="px-3.5 py-1.5 rounded-full bg-emerald-500 text-white text-xs font-bold shadow-lg">
                ${activeHotel.pricePerNight} / night
              </div>
            </div>
          </div>

          {/* Description & Details */}
          <div className="space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{activeHotel.rating} / 5.0 Exceptional Rating</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-snug">
              Celebrate in Paradise.
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Nestled along the finest views in {destinationName}, {activeHotel.name} offers breathtaking oceanfront vistas, personalized concierge hospitality, and state-of-the-art spa wellness retreats.
            </p>

            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Included Key Amenities
              </h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                {activeHotel.amenities?.map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-slate-200">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{amenity}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 flex items-center gap-4">
              <button className="px-6 py-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all">
                More Info & Booking
              </button>
              <a
                href={activeHotel.url}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 rounded-full bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-sm font-semibold transition-all"
              >
                View Source Provider
              </a>
            </div>
          </div>
        </section>

        {/* Gallery Thumbnails of Scraped Properties */}
        <section className="space-y-6 pt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold text-white tracking-tight">
              Scraped Properties in {destinationName}
            </h3>
            <span className="text-xs text-slate-400">
              {detailData?.hotels?.length || 0} Hotels Available
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {detailData?.hotels?.map((hotel, idx) => (
              <div
                key={idx}
                onClick={() => setSelectedHotel(hotel)}
                className={`bg-slate-900 border rounded-2xl overflow-hidden p-4 cursor-pointer transition-all ${
                  selectedHotel?.name === hotel.name
                    ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-blue-500/20'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <img
                  src={hotel.imageUrl}
                  alt={hotel.name}
                  className="w-full h-44 object-cover rounded-xl mb-3"
                />
                <div className="flex items-center justify-between text-xs text-amber-400 font-bold mb-1">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{hotel.rating}</span>
                  </div>
                  <span className="text-emerald-400 font-bold">${hotel.pricePerNight} / night</span>
                </div>
                <h4 className="font-bold text-white text-sm line-clamp-1">{hotel.name}</h4>
                <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{hotel.address}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400 font-semibold">
            <span>GoExplore TravelGenie</span>
            <span>•</span>
            <span className="text-blue-400">Destination Detail View</span>
          </div>
          <p>© 2026 GoExplore. Zero-LLM Architecture.</p>
        </div>
      </footer>
    </div>
  );
}
