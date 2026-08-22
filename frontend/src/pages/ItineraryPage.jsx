import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, CalendarDays, CheckCircle, ChevronLeft, Clock3, Loader2, MapPin } from 'lucide-react';
import Header from '../components/Header.jsx';
import ItineraryMap from '../components/ItineraryMap.jsx';
import { fetchDestinationDetail } from '../services/api.js';
import { DESTINATIONS_DATA } from '../data/destinationsData.js';

export default function ItineraryPage() {
  const { name } = useParams();
  const destinationName = name || 'Singapore';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDay, setActiveDay] = useState(1);

  useEffect(() => {
    setLoading(true);
    fetchDestinationDetail(destinationName)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [destinationName]);

  const curated = DESTINATIONS_DATA.find((item) => item.country.toLowerCase() === destinationName.toLowerCase() || item.id.toLowerCase() === destinationName.toLowerCase());
  const stops = useMemo(() => curated?.stops || data?.stops || [{ name: destinationName, order: 1, lat: 0, lng: 0 }], [curated, data, destinationName]);
  const hotel = data?.hotels?.[0];

  return (
    <div className="min-h-screen bg-cream-100 text-ink-800">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <Link to={`/destination/${encodeURIComponent(destinationName)}`} className="inline-flex items-center gap-1 text-sm text-olive-700 hover:text-olive-800"><ChevronLeft className="h-4 w-4" /> Back to {destinationName}</Link>
        <section className="mt-7 grid grid-cols-1 lg:grid-cols-[1fr_auto] items-end gap-6">
          <div><p className="text-[11px] uppercase tracking-[0.22em] font-semibold text-olive-700">Your travel plan</p><h1 className="mt-2 font-serif text-4xl sm:text-5xl text-ink-900">{destinationName}, day by day.</h1><p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-700/65">A flexible route through the places that make this journey unforgettable. Use it as your guide, then personalise each stop as you travel.</p></div>
          <div className="rounded-2xl bg-white px-4 py-3 text-sm shadow-sm"><span className="font-semibold text-ink-900">{stops.length} days</span><span className="mx-2 text-ink-700/30">•</span><span className="text-ink-700/60">Curated route</span></div>
        </section>

        {loading ? <div className="flex items-center gap-3 py-20 text-ink-700/60"><Loader2 className="h-5 w-5 animate-spin text-olive-600" /> Building your itinerary…</div> : <>
          <section className="mt-10"><ItineraryMap stops={stops} /></section>
          <section className="mt-12 grid grid-cols-1 lg:grid-cols-[0.75fr_1.25fr] gap-8 lg:gap-12">
            <aside className="h-fit rounded-[28px] bg-white p-5 sm:p-6 shadow-sm"><p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-olive-700">Stay recommendation</p>{hotel ? <><img src={hotel.imageUrl} alt={hotel.name} className="mt-4 h-40 w-full rounded-2xl object-cover" /><h2 className="mt-4 font-serif text-2xl text-ink-900">{hotel.name}</h2><p className="mt-2 text-sm text-ink-700/60">${hotel.pricePerNight} per night · {hotel.address}</p><Link to={`/hotel/${encodeURIComponent(destinationName)}/0`} className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-olive-700 hover:text-olive-800">View hotel <ArrowRight className="h-4 w-4" /></Link></> : <p className="mt-3 text-sm text-ink-700/60">Hotel recommendations load with the destination details.</p>}</aside>
            <div><h2 className="font-serif text-3xl text-ink-900">Your day-by-day route</h2><div className="mt-6 space-y-4">{stops.map((stop, index) => { const day = stop.order || index + 1; const isActive = activeDay === day; return <button key={`${stop.name}-${day}`} type="button" onClick={() => setActiveDay(day)} className={`w-full rounded-[22px] border p-5 text-left transition-all ${isActive ? 'border-olive-400 bg-white shadow-md' : 'border-transparent bg-white/65 hover:bg-white hover:shadow-sm'}`}><div className="flex gap-4"><span className={`flex h-10 w-10 flex-none items-center justify-center rounded-full text-sm font-semibold ${isActive ? 'bg-olive-600 text-white' : 'bg-cream-200 text-olive-700'}`}>D{day}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-serif text-xl text-ink-900">{stop.name}</h3><span className="flex items-center gap-1 text-xs text-ink-700/50"><Clock3 className="h-3.5 w-3.5" /> Full day</span></div><p className="mt-2 text-sm leading-relaxed text-ink-700/65">{index === 0 ? `Arrive in ${stop.name}, settle in, and begin with a relaxed introduction to the destination.` : index === stops.length - 1 ? `Enjoy a final memorable day in ${stop.name} before your onward journey.` : `Explore ${stop.name} at an unhurried pace, with time for local highlights and favourite discoveries.`}</p>{isActive && <div className="mt-4 flex flex-wrap gap-3 text-xs font-medium text-olive-700"><span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Guided stop</span><span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> Day {day}</span><span className="flex items-center gap-1"><CheckCircle className="h-3.5 w-3.5" /> Flexible schedule</span></div>}</div></div></button>; })}</div></div>
          </section>
        </>}
      </main>
    </div>
  );
}
