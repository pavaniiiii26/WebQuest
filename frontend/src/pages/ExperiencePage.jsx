import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calendar, CheckCircle, ChevronLeft, Loader2, MapPin, Star, Users } from 'lucide-react';
import Header from '../components/Header.jsx';
import { fetchDestinationDetail } from '../services/api.js';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?q=80&w=1200&auto=format&fit=crop';
const today = new Date().toISOString().slice(0, 10);

export default function ExperiencePage() {
  const { destination, experienceIndex } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState('');
  const [guests, setGuests] = useState('2');
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchDestinationDetail(destination)
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [destination]);

  const experience = data?.attractions?.[Number(experienceIndex)] || null;
  const total = useMemo(() => (experience?.priceFrom || 0) * Number(guests), [experience, guests]);

  if (loading) {
    return <div className="min-h-screen bg-cream-100"><Header /><div className="max-w-6xl mx-auto px-6 py-24 flex items-center gap-3 text-ink-700/60"><Loader2 className="h-5 w-5 animate-spin text-olive-600" /> Loading experience…</div></div>;
  }

  if (!experience) {
    return <div className="min-h-screen bg-cream-100"><Header /><div className="max-w-6xl mx-auto px-6 py-24"><Link to="/" className="text-olive-700">← Back to explore</Link><h1 className="mt-5 font-serif text-4xl text-ink-900">Experience unavailable</h1><p className="mt-3 text-ink-700/60">This seasonal experience is no longer available.</p></div></div>;
  }

  return (
    <div className="min-h-screen bg-cream-100 text-ink-800">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-olive-700 hover:text-olive-800"><ChevronLeft className="h-4 w-4" /> Back to seasonal picks</Link>
        <div className="mt-7 grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr] gap-8 lg:gap-12">
          <section>
            <div className="relative h-[330px] sm:h-[440px] overflow-hidden rounded-[28px] bg-cream-200">
              <img src={experience.imageUrl} alt={experience.name} onError={(e) => { e.currentTarget.src = FALLBACK_IMAGE; }} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
              <span className="absolute left-5 top-5 rounded-full bg-white/90 px-3 py-1 text-xs font-medium text-ink-800">{experience.tag || 'Seasonal pick'}</span>
              <div className="absolute bottom-6 left-6 right-6"><p className="flex items-center gap-1 text-sm text-white/75"><MapPin className="h-4 w-4" /> {experience.location}</p><h1 className="mt-2 font-serif text-3xl sm:text-4xl text-white">{experience.name}</h1></div>
            </div>
            <div className="mt-8 max-w-2xl">
              <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-olive-700">A handpicked experience</p>
              <h2 className="mt-2 font-serif text-3xl text-ink-900">Make a day of it in {destination}.</h2>
              <p className="mt-3 leading-relaxed text-ink-700/65">Reserve this featured local experience with a clear per-person price. Pick a date and the number of travellers, then review the final amount before confirming.</p>
              <div className="mt-5 flex items-center gap-1 text-sm font-medium text-olive-700"><Star className="h-4 w-4 fill-olive-500 text-olive-500" /> Curated seasonal experience</div>
            </div>
          </section>

          <aside className="h-fit rounded-[28px] bg-white p-5 sm:p-6 shadow-sm">
            {confirmed ? (
              <div className="py-5 text-center"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-olive-100"><CheckCircle className="h-7 w-7 text-olive-700" /></span><h2 className="mt-5 font-serif text-3xl text-ink-900">Experience booked.</h2><p className="mt-3 text-sm leading-relaxed text-ink-700/65">{experience.name} is confirmed for {guests} {guests === '1' ? 'person' : 'people'} on {date}. Total: <strong className="text-ink-900">${total.toLocaleString()} {experience.currency || 'USD'}</strong>.</p><Link to="/" className="mt-6 inline-flex rounded-full bg-olive-600 px-6 py-3 text-sm font-medium text-white hover:bg-olive-500">Keep exploring</Link></div>
            ) : (
              <>
                <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-olive-700">Reserve this experience</p>
                <p className="mt-2 text-2xl font-semibold text-ink-900">From ${experience.priceFrom} <span className="text-sm font-normal text-ink-700/55">per person</span></p>
                <div className="mt-6 space-y-3">
                  <label className="flex items-center gap-3 rounded-2xl bg-cream-50 px-4 py-3"><Calendar className="h-5 w-5 text-olive-600" /><span className="flex flex-col"><span className="text-[10px] uppercase tracking-wider text-ink-700/45">Date</span><input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)} className="bg-transparent text-sm font-medium outline-none" /></span></label>
                  <label className="flex items-center gap-3 rounded-2xl bg-cream-50 px-4 py-3"><Users className="h-5 w-5 text-olive-600" /><span className="flex flex-col w-full"><span className="text-[10px] uppercase tracking-wider text-ink-700/45">Travellers</span><select value={guests} onChange={(e) => setGuests(e.target.value)} className="w-full bg-transparent text-sm font-medium outline-none">{[1, 2, 3, 4, 5, 6].map((count) => <option key={count} value={count}>{count} {count === 1 ? 'person' : 'people'}</option>)}</select></span></label>
                </div>
                <div className="mt-5 rounded-2xl bg-cream-50 p-4 text-sm"><div className="flex justify-between text-ink-700/65"><span>${experience.priceFrom} × {guests} travellers</span><span>${total.toLocaleString()}</span></div><div className="mt-3 flex justify-between border-t border-cream-300 pt-3 text-base font-semibold text-ink-900"><span>Total</span><span>${total.toLocaleString()} {experience.currency || 'USD'}</span></div></div>
                <button type="button" disabled={!date} onClick={() => setConfirmed(true)} className="mt-5 w-full rounded-full bg-olive-600 px-6 py-3.5 text-sm font-medium text-white hover:bg-olive-500 disabled:cursor-not-allowed disabled:bg-olive-600/45">{date ? `Confirm for $${total.toLocaleString()}` : 'Choose a date to continue'}</button>
              </>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}
