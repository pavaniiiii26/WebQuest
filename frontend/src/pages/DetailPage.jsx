import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  Users,
  Star,
  CheckCircle,
  ArrowLeft,
  Loader2,
  X,
} from 'lucide-react';
import Header from '../components/Header.jsx';
import ItineraryMap from '../components/ItineraryMap.jsx';
import PlaceCard from '../components/PlaceCard.jsx';
import { fetchDestinationDetail, searchDestinations } from '../services/api.js';
import { DESTINATIONS_DATA } from '../data/destinationsData.js';

export default function DetailPage() {
  const { name, hotelIndex } = useParams();
  const navigate = useNavigate();
  const destinationName = name || 'Singapore';
  const selectedHotelIndex = Number(hotelIndex);
  const isHotelPage = Number.isInteger(selectedHotelIndex) && selectedHotelIndex >= 0;

  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedHotel, setSelectedHotel] = useState(null);

  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [persons, setPersons] = useState('2 Persons');
  const [rateData, setRateData] = useState(null);
  const [ratesLoading, setRatesLoading] = useState(false);
  const [ratesError, setRatesError] = useState('');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [hotelInfoOpen, setHotelInfoOpen] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [ratingSaved, setRatingSaved] = useState(false);

  useEffect(() => {
    setLoading(true);
    setSelectedHotel(null);
    fetchDestinationDetail(destinationName)
      .then((data) => {
        setDetailData(data);
        if (data.hotels?.length > 0) {
          setSelectedHotel(data.hotels[isHotelPage] || data.hotels[0]);
          if (isHotelPage) {
            setTimeout(() => document.getElementById('selected-hotel')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
          }
        }
      })
      .catch((err) => console.error('Error fetching detail:', err))
      .finally(() => setLoading(false));
  }, [destinationName, hotelIndex, isHotelPage]);

  const curated = DESTINATIONS_DATA.find(
    (d) => d.country.toLowerCase() === destinationName.toLowerCase()
      || d.id.toLowerCase() === destinationName.toLowerCase(),
  );

  const routeHotel = isHotelPage ? detailData?.hotels?.[selectedHotelIndex] : null;
  const activeHotel = routeHotel || selectedHotel || detailData?.hotels?.[0] || {
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
  const today = new Date().toISOString().slice(0, 10);
  const quotedHotel = rateData?.hotels?.find((hotel) => hotel.name === selectedHotel?.name)
    || rateData?.hotels?.[0]
    || activeHotel;
  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0;
    const diff = new Date(`${checkOut}T00:00:00`) - new Date(`${checkIn}T00:00:00`);
    return diff > 0 ? Math.round(diff / 86_400_000) : 0;
  }, [checkIn, checkOut]);
  const roomSubtotal = nights * Number(quotedHotel.pricePerNight || 0);
  const taxesAndFees = nights ? Math.round(roomSubtotal * 0.12) + 25 : 0;
  const totalCost = roomSubtotal + taxesAndFees;
  const guests = Number.parseInt(persons, 10) || 1;
  const visitorReviews = [
    { name: 'Maya R.', rating: 5, text: 'The staff made every detail feel personal. The room and amenities were exactly as pictured.' },
    { name: 'Daniel K.', rating: 5, text: 'A beautiful stay in an excellent location. We especially loved the pool and breakfast.' },
    { name: 'Priya S.', rating: 4, text: 'Comfortable, polished, and easy to recommend. The concierge was incredibly helpful.' },
  ];

  const handleCheckRates = async () => {
    setBookingConfirmed(false);
    setRatesError('');
    if (!checkIn || !checkOut) {
      setRatesError('Choose both check-in and check-out dates to see your total.');
      return;
    }
    if (!nights) {
      setRatesError('Check-out must be at least one day after check-in.');
      return;
    }

    setRatesLoading(true);
    try {
      const data = await searchDestinations({
        destination: destinationName,
        checkIn,
        checkOut,
        guests,
      });
      setRateData(data);
      if (data.hotels?.length) {
        const matchingHotel = data.hotels.find((hotel) => hotel.name === selectedHotel?.name);
        setSelectedHotel(matchingHotel || data.hotels[0]);
      }
    } catch (error) {
      setRatesError('We could not refresh live rates. Please try again.');
    } finally {
      setRatesLoading(false);
    }
  };

  const handleConfirmBooking = () => {
    if (!rateData || !nights) return;
    setBookingConfirmed(true);
  };

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
          <button
            type="button"
            onClick={() => navigate(`/itinerary/${encodeURIComponent(destinationName)}`)}
            className="inline-flex items-center px-6 py-3 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 text-white text-sm font-medium backdrop-blur-md transition-all duration-300"
          >
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
                  <PlaceCard
                    place={place}
                    index={idx}
                    isDesktop={idx === 0 || idx === 5}
                    onOpen={detailData?.hotels?.[idx] ? () => navigate(`/hotel/${encodeURIComponent(destinationName)}/${idx}`) : undefined}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        {routeStops.length > 0 && (
          <section id="itinerary" className="space-y-6 scroll-mt-8">
            <ItineraryMap stops={routeStops} />
          </section>
        )}

        <section id="selected-hotel" className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center scroll-mt-8">
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
              <button
                type="button"
                onClick={() => { setHotelInfoOpen(true); setRatingSaved(false); }}
                className="px-6 py-3 rounded-full bg-olive-600 hover:bg-olive-500 text-white font-medium text-sm transition-all duration-300"
              >
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
                  onClick={() => navigate(`/hotel/${encodeURIComponent(destinationName)}/${idx}`)}
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

        <section aria-labelledby="booking-title" className="bg-white rounded-[28px] p-5 sm:p-6 shadow-sm scroll-mt-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-olive-700 font-semibold">Plan your stay</p>
              <h3 id="booking-title" className="font-serif text-2xl text-ink-900">Check your trip cost</h3>
            </div>
            {rateData && !bookingConfirmed && (
              <span className="rounded-full bg-olive-50 px-3 py-1 text-xs font-medium text-olive-700">
                Rates updated
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-center">
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-cream-50">
              <Calendar className="w-5 h-5 text-olive-600 flex-shrink-0" />
              <div className="flex flex-col text-left w-full">
                <span className="text-[10px] uppercase tracking-wider text-ink-700/45">Check-in</span>
                <input
                  type="date"
                  min={today}
                  value={checkIn}
                  onChange={(e) => {
                    setCheckIn(e.target.value);
                    setRateData(null);
                    setBookingConfirmed(false);
                  }}
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
                  min={checkIn || today}
                  value={checkOut}
                  onChange={(e) => {
                    setCheckOut(e.target.value);
                    setRateData(null);
                    setBookingConfirmed(false);
                  }}
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
                  onChange={(e) => {
                    setPersons(e.target.value);
                    setRateData(null);
                    setBookingConfirmed(false);
                  }}
                  className="bg-transparent text-xs font-medium text-ink-800 focus:outline-none cursor-pointer"
                >
                  <option value="1 Person">1 Person</option>
                  <option value="2 Persons">2 Persons</option>
                  <option value="4 Persons">4 Persons</option>
                </select>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCheckRates}
              disabled={ratesLoading}
              className="w-full py-3.5 px-6 rounded-full bg-olive-600 hover:bg-olive-500 disabled:bg-olive-600/60 disabled:cursor-wait active:scale-[0.99] text-white font-medium text-sm transition-all duration-300 cursor-pointer inline-flex items-center justify-center gap-2"
            >
              {ratesLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {ratesLoading ? 'Checking rates…' : 'Check rates'}
            </button>
          </div>

          {ratesError && (
            <p role="alert" className="mt-3 text-sm text-rose-700">{ratesError}</p>
          )}

          {rateData && !ratesError && (
            <div className="mt-5 rounded-2xl border border-cream-300 bg-cream-50 p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-cream-300 pb-4">
                <div>
                  <p className="font-medium text-ink-900">{quotedHotel.name}</p>
                  <p className="mt-1 text-xs text-ink-700/60">
                    {nights} {nights === 1 ? 'night' : 'nights'} · {guests} {guests === 1 ? 'guest' : 'guests'} · {checkIn} to {checkOut}
                  </p>
                </div>
                <p className="text-right text-sm text-ink-700/75">
                  ${quotedHotel.pricePerNight} <span className="text-xs">/ night</span>
                </p>
              </div>

              <dl className="space-y-2 py-4 text-sm text-ink-700/75">
                <div className="flex justify-between gap-4"><dt>Room rate</dt><dd>${roomSubtotal.toLocaleString()}</dd></div>
                <div className="flex justify-between gap-4"><dt>Taxes & fees</dt><dd>${taxesAndFees.toLocaleString()}</dd></div>
                <div className="flex justify-between gap-4 border-t border-cream-300 pt-3 font-semibold text-ink-900"><dt>Trip total</dt><dd>${totalCost.toLocaleString()} {quotedHotel.currency || 'USD'}</dd></div>
              </dl>

              {bookingConfirmed ? (
                <div role="status" className="flex items-start gap-3 rounded-xl bg-olive-100 p-3 text-sm text-olive-800">
                  <CheckCircle className="mt-0.5 h-4 w-4 flex-none" />
                  <span><strong>Hotel booked — trip planned.</strong> Your {nights}-night stay at {quotedHotel.name} is confirmed for ${totalCost.toLocaleString()} {quotedHotel.currency || 'USD'}.</span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleConfirmBooking}
                  className="w-full rounded-full bg-ink-800 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-ink-700"
                >
                  Confirm for ${totalCost.toLocaleString()} {quotedHotel.currency || 'USD'}
                </button>
              )}
            </div>
          )}
        </section>
      </main>

      {hotelInfoOpen && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-5">
          <button
            type="button"
            aria-label="Close hotel details"
            onClick={() => setHotelInfoOpen(false)}
            className="absolute inset-0 bg-ink-900/60 backdrop-blur-sm"
          />
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="hotel-details-title"
            className="relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-t-[28px] bg-white shadow-2xl sm:rounded-[28px]"
          >
            <div className="relative h-48 sm:h-60 overflow-hidden">
              <img src={activeHotel.imageUrl} alt={activeHotel.name} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
              <button type="button" aria-label="Close" onClick={() => setHotelInfoOpen(false)} className="absolute right-4 top-4 rounded-full bg-white/90 p-2 text-ink-800 hover:bg-white"><X className="h-4 w-4" /></button>
              <div className="absolute bottom-5 left-6 right-6 text-white"><p className="text-xs text-white/75">{activeHotel.address}</p><h2 id="hotel-details-title" className="mt-1 font-serif text-2xl sm:text-3xl">{activeHotel.name}</h2></div>
            </div>
            <div className="p-5 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cream-300 pb-5">
                <div><p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-olive-700">Guest rating</p><p className="mt-1 flex items-center gap-1.5 text-lg font-semibold text-ink-900"><Star className="h-5 w-5 fill-olive-500 text-olive-500" /> {activeHotel.rating} <span className="text-sm font-normal text-ink-700/55">Exceptional</span></p></div>
                <span className="rounded-full bg-olive-50 px-3 py-1.5 text-sm font-medium text-olive-700">${activeHotel.pricePerNight} / night</span>
              </div>

              <div className="mt-6"><h3 className="font-serif text-2xl text-ink-900">Amenity highlights</h3><div className="mt-3 flex flex-wrap gap-2">{activeHotel.amenities?.map((amenity) => <span key={amenity} className="inline-flex items-center gap-1.5 rounded-full bg-olive-50 px-3 py-2 text-sm text-olive-800"><CheckCircle className="h-4 w-4 text-olive-600" />{amenity}</span>)}</div></div>

              <div className="mt-7"><h3 className="font-serif text-2xl text-ink-900">Past visitor reviews</h3><div className="mt-3 space-y-3">{visitorReviews.map((review) => <article key={review.name} className="rounded-2xl bg-cream-50 p-4"><div className="flex items-center justify-between"><p className="font-medium text-ink-900">{review.name}</p><span className="flex items-center gap-0.5 text-xs text-olive-700"><Star className="h-3.5 w-3.5 fill-olive-500 text-olive-500" />{review.rating}.0</span></div><p className="mt-2 text-sm leading-relaxed text-ink-700/65">“{review.text}”</p></article>)}</div></div>

              <div className="mt-7 rounded-2xl border border-cream-300 p-4 sm:p-5"><h3 className="font-serif text-xl text-ink-900">How was your experience?</h3><p className="mt-1 text-sm text-ink-700/60">Choose a star rating for {activeHotel.name}.</p><div className="mt-3 flex items-center gap-1">{[1, 2, 3, 4, 5].map((rating) => <button key={rating} type="button" aria-label={`Rate ${rating} stars`} aria-pressed={userRating === rating} onClick={() => { setUserRating(rating); setRatingSaved(false); }} className="rounded-lg p-1 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-olive-500"><Star className={`h-7 w-7 ${rating <= userRating ? 'fill-olive-500 text-olive-500' : 'text-cream-300'}`} /></button>)}</div>{ratingSaved && <p role="status" className="mt-3 text-sm font-medium text-olive-700">Thanks — your {userRating}-star rating has been saved.</p>}<button type="button" disabled={!userRating} onClick={() => setRatingSaved(true)} className="mt-4 rounded-full bg-olive-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-olive-500 disabled:cursor-not-allowed disabled:bg-olive-600/45">Save rating</button></div>
            </div>
          </section>
        </div>
      )}

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
