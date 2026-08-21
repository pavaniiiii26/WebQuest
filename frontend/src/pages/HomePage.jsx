import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  Star,
  ShieldCheck,
  TrendingDown,
  HeadphonesIcon,
  Share2,
  Link,
  Globe,
  Send,
  Compass,
  ArrowRight,
} from 'lucide-react';
import SkeletonCard from '../components/SkeletonCard.jsx';
import DestinationSlider from '../components/DestinationSlider.jsx';
import { DESTINATIONS_DATA } from '../data/destinationsData.js';
import { fetchDestinations, searchDestinations } from '../services/api.js';

const TRUST_FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Verified Live Data',
    description: 'Every hotel & attraction is sourced in real time via our self-healing Bright Data scraper engine — no stale listings.',
  },
  {
    icon: TrendingDown,
    title: 'Best Price Match',
    description: "We scan hundreds of providers on every search so you always see the sharpest rate, with zero hidden fees.",
  },
  {
    icon: HeadphonesIcon,
    title: '24/7 Expert Support',
    description: 'Dedicated travel specialists are available around the clock to help you plan, book, and adjust your itinerary.',
  },
];

export default function HomePage() {
  const navigate = useNavigate();

  const [destinations, setDestinations] = useState([]);
  const [selectedDestination, setSelectedDestination] = useState('Singapore');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2 Guests');
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formDest, setFormDest] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formMsg, setFormMsg] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    fetchDestinations()
      .then((data) => {
        setDestinations(data);
        handleSearch('Singapore');
      })
      .catch((err) => console.error('Error fetching destinations:', err));
  }, []);

  const handleSearch = async (targetDest = selectedDestination) => {
    setLoading(true);
    setError(null);
    try {
      const data = await searchDestinations({ destination: targetDest, checkIn, checkOut, guests });
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

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-cream-100 text-ink-800 font-sans flex flex-col">

      <section className="relative w-full">
        <DestinationSlider
          destinations={DESTINATIONS_DATA}
          onSelectDestination={(destName) => handleDestinationClick(destName)}
        />
      </section>

      {searchResults?.isStale && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-2">
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-3 flex items-center justify-between text-xs text-amber-800">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                Showing cached results — last live scrape:{' '}
                <strong className="text-ink-800">{new Date(searchResults.cachedAt).toLocaleString()}</strong>
              </span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold text-[10px]">
              Graceful Fallback
            </span>
          </div>
        </div>
      )}

      <main className="flex-1 w-full">

        <section id="destinations" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="mb-12 max-w-xl space-y-3">
            <h2 className="font-serif text-3xl sm:text-[2.4rem] font-medium text-ink-900 leading-snug">
              Everything you’ll see, hear, taste, and feel
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {destinations.slice(0, 8).map((dest, idx) => {
              const tall = idx === 0 || idx === 5;
              return (
                <div
                  key={dest.id}
                  onClick={() => handleDestinationClick(dest.name)}
                  className={`group relative rounded-[22px] overflow-hidden cursor-pointer ${
                    tall ? 'sm:row-span-2 min-h-[280px] sm:min-h-[360px]' : 'min-h-[168px] sm:min-h-[172px]'
                  }`}
                >
                  <img
                    src={dest.imageUrl}
                    alt={dest.name}
                    className="w-full h-full object-cover brightness-[0.92] group-hover:scale-[1.04] transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 space-y-0.5">
                    <span className="text-[10px] uppercase tracking-[0.18em] text-white/75">
                      {dest.country}
                    </span>
                    <h3 className="text-[15px] font-medium text-white">{dest.name}</h3>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section id="deals" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="mb-10 space-y-2">
            <h2 className="font-serif text-3xl sm:text-[2.2rem] font-medium text-ink-900">Last minute stays</h2>
            <p className="text-ink-700/60 text-sm">
              Curated hotel options for{' '}
              <span className="text-ink-800 font-medium">{searchResults?.destination || selectedDestination}</span>
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <SkeletonCard /><SkeletonCard /><SkeletonCard />
            </div>
          ) : searchResults?.hotels?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {searchResults.hotels.slice(0, 3).map((hotel, idx) => (
                <div
                  key={idx}
                  onClick={() => handleDestinationClick(searchResults.destination)}
                  className="group bg-white rounded-[22px] overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all duration-500"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={hotel.imageUrl}
                      alt={hotel.name}
                      className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out"
                    />
                    <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/90 text-ink-800 text-xs font-semibold">
                      ${hotel.pricePerNight}<span className="font-normal text-ink-700/50">/night</span>
                    </div>
                  </div>
                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-olive-600 text-xs font-semibold">
                        <Star className="w-3.5 h-3.5 fill-olive-500 text-olive-500" />
                        <span>{hotel.rating}</span>
                      </div>
                      <span className="text-xs text-ink-700/45 truncate ml-2">{hotel.address}</span>
                    </div>
                    <h3 className="font-medium text-ink-900 group-hover:text-olive-700 transition-colors duration-300 line-clamp-1">
                      {hotel.name}
                    </h3>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {hotel.amenities?.slice(0, 3).map((a, aIdx) => (
                        <span key={aIdx} className="px-2 py-0.5 rounded-md bg-cream-200 text-[10px] text-ink-700/70">
                          {a}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-10 rounded-[22px] bg-white text-center text-ink-700/50">
              No live hotel deals right now. Try clicking a destination above!
            </div>
          )}
        </section>

        {searchResults?.attractions?.length > 0 && (
          <section id="specials" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
            <div className="mb-10 space-y-2">
              <h2 className="font-serif text-3xl sm:text-[2.2rem] font-medium text-ink-900">Seasonal picks</h2>
              <p className="text-ink-700/60 text-sm">Handpicked icy mountain stays and seasonal retreats</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {searchResults.attractions.slice(0, 3).map((item, idx) => (
                <div
                  key={idx}
                  className="relative h-64 rounded-[22px] overflow-hidden group cursor-pointer"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700 ease-out brightness-[0.9]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-full bg-white/90 text-ink-800 text-xs font-medium">
                      {item.tag || 'Winter Special'}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-5 space-y-1">
                    <h3 className="font-medium text-white">{item.name}</h3>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-white/70">{item.location}</span>
                      <span className="text-olive-200 font-medium">From ${item.priceFrom}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section id="tours" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="mb-10 space-y-2">
            <h2 className="font-serif text-3xl sm:text-[2.2rem] font-medium text-ink-900">Tour packages</h2>
            <p className="text-ink-700/60 text-sm">All-inclusive packages backed by resilient scraper verification</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              {
                dest: 'Switzerland',
                badge: 'All-Inclusive',
                img: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=600&auto=format&fit=crop',
                title: 'Swiss Alpine & Glacier Express 7-Day Tour',
                desc: 'Scenic cogwheel railways, luxury chalet stays, and guided glacier hikes.',
                price: '$1,450',
              },
              {
                dest: 'Bali',
                badge: 'Wellness Retreat',
                img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=600&auto=format&fit=crop',
                title: 'Bali Sacred Cliffs & Ubud Jungle Experience',
                desc: 'Private cliffside villas, holistic spa therapy, and rice terrace photo tours.',
                price: '$980',
              },
            ].map((pkg) => (
              <div
                key={pkg.dest}
                onClick={() => handleDestinationClick(pkg.dest)}
                className="group bg-white rounded-[22px] p-4 sm:p-5 flex flex-col sm:flex-row gap-5 items-center cursor-pointer shadow-sm hover:shadow-md transition-all duration-500"
              >
                <img
                  src={pkg.img}
                  alt={pkg.title}
                  className="w-full sm:w-44 h-36 object-cover rounded-2xl group-hover:scale-[1.03] transition-transform duration-700 ease-out flex-shrink-0"
                />
                <div className="space-y-2 text-left flex-1">
                  <span className="inline-block px-2.5 py-1 rounded-full text-xs font-medium bg-olive-50 text-olive-700">
                    {pkg.badge}
                  </span>
                  <h3 className="font-medium text-ink-900 group-hover:text-olive-700 transition-colors duration-300 leading-snug">
                    {pkg.title}
                  </h3>
                  <p className="text-xs text-ink-700/60 leading-relaxed">{pkg.desc}</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-lg font-semibold text-olive-700">
                      {pkg.price} <span className="text-xs font-normal text-ink-700/45">/ person</span>
                    </span>
                    <span className="text-xs font-medium text-olive-700 flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-300">
                      Explore <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="about" className="py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14 space-y-3">
              <h2 className="font-serif text-3xl sm:text-[2.2rem] font-medium text-ink-900">Travel with confidence</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {TRUST_FEATURES.map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex flex-col items-center text-center space-y-4 px-4">
                  <div className="w-14 h-14 rounded-2xl bg-olive-50 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-olive-600" />
                  </div>
                  <h3 className="font-medium text-ink-900 text-base">{title}</h3>
                  <p className="text-sm text-ink-700/60 leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-[28px] p-8 sm:p-12 shadow-sm">
              <div className="text-center mb-10 space-y-2">
                <h2 className="font-serif text-3xl font-medium text-ink-900">Plan your journey</h2>
                <p className="text-ink-700/60 text-sm">Our travel experts will get back to you within 24 hours.</p>
              </div>

              {formSubmitted ? (
                <div className="text-center py-8 space-y-3">
                  <div className="w-14 h-14 rounded-full bg-olive-50 flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-7 h-7 text-olive-600" />
                  </div>
                  <h3 className="text-ink-900 font-medium">Inquiry sent!</h3>
                  <p className="text-ink-700/60 text-sm">We'll be in touch within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-ink-700/50 uppercase tracking-wider">Full name</label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="Jane Doe"
                        className="w-full bg-cream-50 border border-cream-300 hover:border-olive-300 focus:border-olive-500 focus:ring-2 focus:ring-olive-500/15 rounded-xl px-4 py-3 text-sm text-ink-800 placeholder:text-ink-700/30 outline-none transition-all duration-300"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-ink-700/50 uppercase tracking-wider">Phone</label>
                      <input
                        type="tel"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full bg-cream-50 border border-cream-300 hover:border-olive-300 focus:border-olive-500 focus:ring-2 focus:ring-olive-500/15 rounded-xl px-4 py-3 text-sm text-ink-800 placeholder:text-ink-700/30 outline-none transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-ink-700/50 uppercase tracking-wider">Destination / Tour</label>
                      <select
                        value={formDest}
                        onChange={(e) => setFormDest(e.target.value)}
                        className="w-full bg-cream-50 border border-cream-300 hover:border-olive-300 focus:border-olive-500 rounded-xl px-4 py-3 text-sm text-ink-800 outline-none transition-all duration-300 cursor-pointer"
                      >
                        <option value="">Select destination</option>
                        {destinations.map((d) => (
                          <option key={d.id} value={d.name}>{d.name}, {d.country}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-ink-700/50 uppercase tracking-wider">Preferred date</label>
                      <input
                        type="date"
                        value={formDate}
                        onChange={(e) => setFormDate(e.target.value)}
                        className="w-full bg-cream-50 border border-cream-300 hover:border-olive-300 focus:border-olive-500 rounded-xl px-4 py-3 text-sm text-ink-800 outline-none transition-all duration-300 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-ink-700/50 uppercase tracking-wider">Message (optional)</label>
                    <textarea
                      rows={3}
                      value={formMsg}
                      onChange={(e) => setFormMsg(e.target.value)}
                      placeholder="Tell us about your ideal trip..."
                      className="w-full bg-cream-50 border border-cream-300 hover:border-olive-300 focus:border-olive-500 focus:ring-2 focus:ring-olive-500/15 rounded-xl px-4 py-3 text-sm text-ink-800 placeholder:text-ink-700/30 outline-none transition-all duration-300 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-full bg-olive-600 hover:bg-olive-500 active:scale-[0.99] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-all duration-300 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                    Send inquiry
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>

      </main>

      <footer className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-between gap-10">
          <div className="flex flex-col items-center md:items-start space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-olive-600 flex items-center justify-center">
                <Compass className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-serif text-ink-900">Voyalette</span>
            </div>
            <p className="text-xs text-ink-700/50 max-w-[180px] text-center md:text-left leading-relaxed">
              Self-healing Bright Data travel engine. Real data, zero hallucinations.
            </p>
          </div>

          <nav className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-ink-700/55">
            <a href="#destinations" className="hover:text-ink-900 transition-colors duration-300">Destinations</a>
            <a href="#deals" className="hover:text-ink-900 transition-colors duration-300">Deals</a>
            <a href="#specials" className="hover:text-ink-900 transition-colors duration-300">Winter Specials</a>
            <a href="#tours" className="hover:text-ink-900 transition-colors duration-300">Tour Packages</a>
          </nav>

          <div className="flex items-center gap-3">
            {[Share2, Link, Globe].map((Icon, i) => (
              <button
                key={i}
                className="p-2.5 rounded-full bg-white hover:bg-cream-200 text-ink-700/50 hover:text-ink-800 transition-all duration-300"
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-6xl mx-auto mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-ink-700/40">
          <span>© 2026 Voyalette. Zero-LLM Architecture.</span>
          <span className="text-olive-600/70">Self-Healing Bright Data Engine</span>
        </div>
      </footer>
    </div>
  );
}
