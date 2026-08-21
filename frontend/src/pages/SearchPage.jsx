import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, CheckCircle, ChevronLeft, Loader2, MapPin, Search, Star, Users, X } from 'lucide-react';
import Header from '../components/Header.jsx';
import { searchDestinations } from '../services/api.js';

const today = new Date().toISOString().slice(0, 10);
const AVAILABLE_DESTINATIONS = [
  'Australia',
  'Bali',
  'Azores',
  'Iceland',
  'Japan',
  'Nepal',
  'Singapore',
  'South Korea',
  'Switzerland',
  'Thailand',
  'Tibet',
];

function getNights(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const difference = new Date(`${checkOut}T00:00:00`) - new Date(`${checkIn}T00:00:00`);
  return difference > 0 ? Math.round(difference / 86_400_000) : 0;
}

export default function SearchPage() {
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  const nights = useMemo(() => getNights(checkIn, checkOut), [checkIn, checkOut]);
  const roomSubtotal = selectedHotel ? selectedHotel.pricePerNight * nights : 0;
  const taxesAndFees = selectedHotel && nights ? Math.round(roomSubtotal * 0.12) + 25 : 0;
  const total = roomSubtotal + taxesAndFees;

  const clearQuote = () => {
    setSelectedHotel(null);
    setConfirmed(false);
  };

  const handleSearch = async (event) => {
    event.preventDefault();
    setError('');
    clearQuote();
    if (!destination) {
      setError('Choose one of our available destinations.');
      return;
    }
    if (!checkIn || !checkOut) {
      setError('Select your check-in and check-out dates.');
      return;
    }
    if (!nights) {
      setError('Check-out must be at least one day after check-in.');
      return;
    }

    setLoading(true);
    try {
      const data = await searchDestinations({
        destination: destination.trim(),
        checkIn,
        checkOut,
        guests: Number(guests),
      });
      setResults({ ...data, hotels: [...(data.hotels || [])].sort((a, b) => a.pricePerNight - b.pricePerNight) });
    } catch {
      setError('We could not find rates right now. Please try again.');
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-100 text-ink-800">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-olive-700 hover:text-olive-800">
          <ChevronLeft className="h-4 w-4" /> Back to explore
        </Link>

        <div className="mt-6 max-w-2xl">
          <p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-olive-700">Travel search</p>
          <h1 className="mt-2 font-serif text-4xl sm:text-5xl text-ink-900">Find your best stay.</h1>
          <p className="mt-3 text-sm leading-relaxed text-ink-700/65">Choose a country, dates, and traveller count. We’ll show the best available hotel matches and a clear total before you confirm.</p>
        </div>

        <form onSubmit={handleSearch} className="mt-8 rounded-[28px] bg-white p-5 sm:p-6 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <label className="flex items-center gap-3 rounded-2xl bg-cream-50 px-4 py-3">
              <MapPin className="h-5 w-5 flex-none text-olive-600" />
              <span className="flex min-w-0 flex-col w-full">
                <span className="text-[10px] uppercase tracking-wider text-ink-700/45">Available destination</span>
                <select value={destination} onChange={(e) => { setDestination(e.target.value); clearQuote(); }} className="w-full bg-transparent text-sm font-medium text-ink-800 outline-none cursor-pointer">
                  <option value="" disabled>Choose a country</option>
                  {AVAILABLE_DESTINATIONS.map((country) => <option key={country} value={country}>{country}</option>)}
                </select>
              </span>
            </label>
            <label className="flex items-center gap-3 rounded-2xl bg-cream-50 px-4 py-3">
              <Calendar className="h-5 w-5 flex-none text-olive-600" />
              <span className="flex min-w-0 flex-col">
                <span className="text-[10px] uppercase tracking-wider text-ink-700/45">Check-in</span>
                <input type="date" min={today} value={checkIn} onChange={(e) => { setCheckIn(e.target.value); clearQuote(); }} className="bg-transparent text-xs font-medium text-ink-800 outline-none" />
              </span>
            </label>
            <label className="flex items-center gap-3 rounded-2xl bg-cream-50 px-4 py-3">
              <Calendar className="h-5 w-5 flex-none text-olive-600" />
              <span className="flex min-w-0 flex-col">
                <span className="text-[10px] uppercase tracking-wider text-ink-700/45">Check-out</span>
                <input type="date" min={checkIn || today} value={checkOut} onChange={(e) => { setCheckOut(e.target.value); clearQuote(); }} className="bg-transparent text-xs font-medium text-ink-800 outline-none" />
              </span>
            </label>
            <label className="flex items-center gap-3 rounded-2xl bg-cream-50 px-4 py-3">
              <Users className="h-5 w-5 flex-none text-olive-600" />
              <span className="flex min-w-0 flex-col w-full">
                <span className="text-[10px] uppercase tracking-wider text-ink-700/45">Travellers</span>
                <select value={guests} onChange={(e) => { setGuests(e.target.value); clearQuote(); }} className="w-full bg-transparent text-sm font-medium text-ink-800 outline-none">
                  {[1, 2, 3, 4, 5, 6].map((count) => <option key={count} value={count}>{count} {count === 1 ? 'person' : 'people'}</option>)}
                </select>
              </span>
            </label>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button type="submit" disabled={loading} className="inline-flex items-center gap-2 rounded-full bg-olive-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-olive-500 disabled:cursor-wait disabled:bg-olive-600/60">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              {loading ? 'Searching best matches…' : 'Search stays'}
            </button>
            {nights > 0 && <span className="text-xs text-ink-700/55">{nights} {nights === 1 ? 'night' : 'nights'} · {guests} {guests === '1' ? 'person' : 'people'}</span>}
          </div>
          {error && <p role="alert" className="mt-3 text-sm text-rose-700">{error}</p>}
        </form>

        {results && (
          <section className="mt-12">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-olive-700 font-semibold">Best matches</p>
                <h2 className="mt-1 font-serif text-3xl text-ink-900">Stays in {results.destination || destination}</h2>
              </div>
              <p className="text-sm text-ink-700/55">Sorted by best nightly rate</p>
            </div>
            {results.hotels?.length ? (
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {results.hotels.map((hotel, index) => (
                  <button key={`${hotel.name}-${index}`} type="button" onClick={() => { setSelectedHotel(hotel); setConfirmed(false); }} className="group overflow-hidden rounded-[22px] bg-white text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-olive-500">
                    <div className="relative h-48 overflow-hidden">
                      <img src={hotel.imageUrl} alt={hotel.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <span className="absolute right-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-ink-800">${hotel.pricePerNight}/night</span>
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-1 text-xs font-semibold text-olive-700"><Star className="h-3.5 w-3.5 fill-olive-500 text-olive-500" /> {hotel.rating}</div>
                      <h3 className="mt-2 font-medium text-ink-900">{hotel.name}</h3>
                      <p className="mt-1 truncate text-xs text-ink-700/55">{hotel.address}</p>
                      <p className="mt-4 text-sm font-medium text-olive-700">View full trip cost →</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : <p className="mt-6 rounded-2xl bg-white p-8 text-center text-ink-700/60">No stays matched this search. Try another destination.</p>}
          </section>
        )}
      </main>

      {selectedHotel && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-5">
          <button type="button" aria-label="Close bill" onClick={clearQuote} className="absolute inset-0 bg-ink-900/55 backdrop-blur-sm" />
          <section role="dialog" aria-modal="true" aria-labelledby="booking-title" className="relative z-10 w-full max-w-lg rounded-t-[28px] sm:rounded-[28px] bg-white p-6 shadow-2xl">
            <button type="button" aria-label="Close" onClick={clearQuote} className="absolute right-4 top-4 rounded-full p-2 text-ink-700/55 hover:bg-cream-100"><X className="h-4 w-4" /></button>
            {confirmed ? (
              <div className="py-6 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-olive-100"><CheckCircle className="h-7 w-7 text-olive-700" /></span>
                <h2 id="booking-title" className="mt-5 font-serif text-3xl text-ink-900">Your trip is planned.</h2>
                <p className="mt-3 text-sm leading-relaxed text-ink-700/65">{selectedHotel.name} is confirmed for {nights} {nights === 1 ? 'night' : 'nights'}, {checkIn} to {checkOut}. Total: <strong className="text-ink-900">${total.toLocaleString()} {selectedHotel.currency || 'USD'}</strong>.</p>
                <button type="button" onClick={clearQuote} className="mt-6 rounded-full bg-olive-600 px-6 py-3 text-sm font-medium text-white hover:bg-olive-500">Done</button>
              </div>
            ) : (
              <>
                <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-olive-700">Your trip total</p>
                <h2 id="booking-title" className="mt-2 pr-8 font-serif text-2xl text-ink-900">{selectedHotel.name}</h2>
                <p className="mt-2 text-sm text-ink-700/60">{nights} {nights === 1 ? 'night' : 'nights'} · {guests} {guests === '1' ? 'person' : 'people'} · {checkIn} to {checkOut}</p>
                <dl className="mt-6 space-y-3 rounded-2xl bg-cream-50 p-4 text-sm text-ink-700/75">
                  <div className="flex justify-between"><dt>${selectedHotel.pricePerNight} × {nights} nights</dt><dd>${roomSubtotal.toLocaleString()}</dd></div>
                  <div className="flex justify-between"><dt>Taxes & fees</dt><dd>${taxesAndFees.toLocaleString()}</dd></div>
                  <div className="flex justify-between border-t border-cream-300 pt-3 text-base font-semibold text-ink-900"><dt>Total due</dt><dd>${total.toLocaleString()} {selectedHotel.currency || 'USD'}</dd></div>
                </dl>
                <button type="button" onClick={() => setConfirmed(true)} className="mt-5 w-full rounded-full bg-olive-600 px-6 py-3.5 text-sm font-medium text-white transition-colors hover:bg-olive-500">Confirm trip for ${total.toLocaleString()}</button>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
