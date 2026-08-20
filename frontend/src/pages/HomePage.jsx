import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Calendar,
  Users,
  Sparkles,
  Tag,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Star,
} from 'lucide-react';
import Header from '../components/Header.jsx';
import SkeletonCard from '../components/SkeletonCard.jsx';
import { fetchDestinations, searchDestinations } from '../services/api.js';

export default function HomePage() {
  const navigate = useNavigate();

  // State
  const [destinations, setDestinations] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState('Singapore');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2 Guests');

  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initial load destinations
  useEffect(() => {
    fetchDestinations()
      .then((data) => {
        setDestinations(data);
        // Default search on load
        handleSearch('Singapore');
      })
      .catch((err) => console.error('Error fetching destinations:', err));
  }, []);

  const handleSearch = async (targetDest = selectedDestination) => {
    setLoading(true);
    setError(null);
    try {
      const data = await searchDestinations({
        destination: targetDest,
        checkIn,
        checkOut,
        guests,
      });
      setSearchResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDestinationClick = (name) => {
    setSelectedDestination(name);
    navigate(`/destination/${encodeURIComponent(name)}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* Navigation Header */}
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[580px] flex items-center justify-center pt-8 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Background Image with Dark Scrim */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2000&auto=format&fit=crop"
            alt="Travel Hero"
            className="w-full h-full object-cover object-center filter brightness-50"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-slate-950" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <span>Self-Healing Bright Data Travel Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
            Discover. Explore. <span className="text-blue-500">Go.</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-light leading-relaxed">
            Find luxury resorts, unique retreats, and curated tour deals across the globe—powered by real-time Bright Data scraper resilience.
          </p>

          {/* Floating Search Bar Overlapping Hero */}
          <div className="pt-4 max-w-4xl mx-auto">
            <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-4 sm:p-5 rounded-2xl sm:rounded-full shadow-2xl shadow-black/50 grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
              {/* Destination Input */}
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl sm:rounded-full bg-slate-950/60 border border-slate-800">
                <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <div className="flex flex-col text-left w-full">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Destination</span>
                  <select
                    value={selectedDestination}
                    onChange={(e) => setSelectedDestination(e.target.value)}
                    className="bg-transparent text-sm font-semibold text-white focus:outline-none cursor-pointer"
                  >
                    {destinations.map((d) => (
                      <option key={d.id} value={d.name} className="bg-slate-900 text-white">
                        {d.name}, {d.country}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Date Picker */}
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl sm:rounded-full bg-slate-950/60 border border-slate-800">
                <Calendar className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <div className="flex flex-col text-left w-full">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Dates</span>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
                  />
                </div>
              </div>

              {/* Guests Selector */}
              <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl sm:rounded-full bg-slate-950/60 border border-slate-800">
                <Users className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <div className="flex flex-col text-left w-full">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Guests</span>
                  <select
                    value={guests}
                    onChange={(e) => setGuests(e.target.value)}
                    className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
                  >
                    <option value="1 Guest" className="bg-slate-900">1 Guest</option>
                    <option value="2 Guests" className="bg-slate-900">2 Guests</option>
                    <option value="4 Guests" className="bg-slate-900">4 Guests (Family)</option>
                  </select>
                </div>
              </div>

              {/* Search Button */}
              <button
                onClick={() => handleSearch()}
                disabled={loading}
                className="w-full h-full py-3.5 px-6 rounded-xl sm:rounded-full bg-blue-600 hover:bg-blue-500 active:scale-98 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
              >
                <Search className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                <span>{loading ? 'Scraping...' : 'Search'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stale Cache Warning Badge */}
      {searchResults?.isStale && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 flex items-center justify-between text-xs text-amber-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
              <span>
                Showing recently cached results (Last live scrape timestamp:{' '}
                <strong className="text-white">{new Date(searchResults.cachedAt).toLocaleString()}</strong>)
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold text-[10px]">
              Graceful Scraper Fallback
            </span>
          </div>
        </div>
      )}

      {/* Main Content Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16 flex-1 w-full">

        {/* Section 1: Explore All Popular Locations */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Explore All Popular Locations
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Handpicked global destinations with real-time scraped hotel inventories
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {destinations.slice(0, 8).map((dest) => (
              <div
                key={dest.id}
                onClick={() => handleDestinationClick(dest.name)}
                className="group relative h-72 rounded-2xl overflow-hidden cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-800 hover:border-blue-500/50"
              >
                <img
                  src={dest.imageUrl}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                {/* Overlaid Title & Info */}
                <div className="absolute bottom-0 left-0 right-0 p-5 space-y-1">
                  <span className="text-xs uppercase font-bold text-blue-400 tracking-wider">
                    {dest.country}
                  </span>
                  <h3 className="text-xl font-extrabold text-white group-hover:text-blue-300 transition-colors">
                    {dest.name}
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-1 opacity-90">
                    {dest.tagline}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 2: Last Minute Deals in Unique Places */}
        <section id="deals" className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Last Minute Deals in Unique Places
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Curated hotel options for <span className="text-blue-400 font-semibold">{searchResults?.destination || selectedDestination}</span>
              </p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : searchResults?.hotels?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {searchResults.hotels.slice(0, 3).map((hotel, idx) => (
                <div
                  key={idx}
                  onClick={() => handleDestinationClick(searchResults.destination)}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-all cursor-pointer group shadow-xl"
                >
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={hotel.imageUrl}
                      alt={hotel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    {/* Price Pill Badge */}
                    <div className="absolute top-3 right-3 px-3 py-1.5 rounded-full bg-blue-600 text-white text-xs font-bold shadow-lg">
                      ${hotel.pricePerNight} <span className="text-[10px] font-normal">/ night</span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{hotel.rating}</span>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">{hotel.address}</span>
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">
                      {hotel.name}
                    </h3>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {hotel.amenities?.slice(0, 3).map((amenity, aIdx) => (
                        <span
                          key={aIdx}
                          className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-300"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 bg-slate-900 rounded-2xl text-center text-slate-400">
              No live hotel deals available right now. Click any popular location above!
            </div>
          )}
        </section>

        {/* Section 3: Winter Special Trips */}
        <section id="specials" className="space-y-6 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Winter Special Trips
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Handpicked icy mountain stays and seasonal retreats
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {searchResults?.attractions?.slice(0, 3).map((item, idx) => (
              <div
                key={idx}
                className="relative h-64 rounded-2xl overflow-hidden group cursor-pointer border border-slate-800 shadow-xl"
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />

                {/* Top Tag Pill */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/90 backdrop-blur-md text-white text-xs font-bold shadow-md">
                    {item.tag || 'Winter Special'}
                  </span>
                </div>

                {/* Bottom Title & Price */}
                <div className="absolute bottom-0 left-0 right-0 p-5 space-y-1">
                  <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
                    {item.name}
                  </h3>
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-300">{item.location}</span>
                    <span className="text-emerald-400 font-bold">From ${item.priceFrom}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Section 4: Our Tour Packages You'll Love */}
        <section id="tours" className="space-y-6 pt-4 pb-12">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Our Tour Packages You'll Love
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Complete all-inclusive packages backed by resilient scraper verification
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div
              onClick={() => handleDestinationClick('Switzerland')}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row gap-6 items-center group cursor-pointer hover:border-blue-500/50 transition-all shadow-xl"
            >
              <img
                src="https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=600&auto=format&fit=crop"
                alt="Swiss Alps Tour"
                className="w-full sm:w-48 h-40 object-cover rounded-xl group-hover:scale-105 transition-transform"
              />
              <div className="space-y-3 text-left flex-1">
                <span className="px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-400 text-xs font-bold">
                  All-Inclusive Tour
                </span>
                <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                  Swiss Alpine & Glacier Express 7-Day Tour
                </h3>
                <p className="text-xs text-slate-400">
                  Scenic cogwheel railways, luxury chalet stays, and guided glacier hikes.
                </p>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-lg font-bold text-emerald-400">$1,450 <span className="text-xs font-normal text-slate-400">/ person</span></span>
                  <span className="text-xs font-bold text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Explore Package <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>

            <div
              onClick={() => handleDestinationClick('Bali')}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row gap-6 items-center group cursor-pointer hover:border-blue-500/50 transition-all shadow-xl"
            >
              <img
                src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=600&auto=format&fit=crop"
                alt="Bali Sanctuary"
                className="w-full sm:w-48 h-40 object-cover rounded-xl group-hover:scale-105 transition-transform"
              />
              <div className="space-y-3 text-left flex-1">
                <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                  Wellness Retreat
                </span>
                <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                  Bali Sacred Cliffs & Ubud Jungle Experience
                </h3>
                <p className="text-xs text-slate-400">
                  Private cliffside villas, holistic spa therapy, and rice terrace photo tours.
                </p>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-lg font-bold text-emerald-400">$980 <span className="text-xs font-normal text-slate-400">/ person</span></span>
                  <span className="text-xs font-bold text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Explore Package <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-400 font-semibold">
            <span>GoExplore TravelGenie</span>
            <span>•</span>
            <span className="text-blue-400">Self-Healing Bright Data Engine</span>
          </div>
          <p>© 2026 GoExplore. Zero-LLM Architecture.</p>
        </div>
      </footer>
    </div>
  );
}
