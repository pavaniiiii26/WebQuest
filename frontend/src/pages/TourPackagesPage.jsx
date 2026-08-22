import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowRight, MapPin, Users, Calendar } from 'lucide-react';

const TOUR_PACKAGES = [
  {
    id: 1,
    dest: 'Switzerland',
    badge: 'All-Inclusive',
    img: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?q=80&w=800&auto=format&fit=crop',
    title: 'Swiss Alpine & Glacier Express 7-Day Tour',
    desc: 'Scenic cogwheel railways, luxury chalet stays, and guided glacier hikes.',
    price: '$1,450',
    duration: '7 Days',
    groupSize: '2-15 people',
    highlights: ['Jungfrau Railway', 'Glacier Hiking', 'Luxury Chalets', 'Mountain Views'],
  },
  {
    id: 2,
    dest: 'Bali',
    badge: 'Wellness Retreat',
    img: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800&auto=format&fit=crop',
    title: 'Bali Sacred Cliffs & Ubud Jungle Experience',
    desc: 'Private cliffside villas, holistic spa therapy, and rice terrace photo tours.',
    price: '$980',
    duration: '5 Days',
    groupSize: '2-10 people',
    highlights: ['Cliffside Villas', 'Spa Therapy', 'Rice Terraces', 'Jungle Tours'],
  },
  {
    id: 3,
    dest: 'Japan',
    badge: 'Cultural Tour',
    img: 'https://images.unsplash.com/photo-1522383507254-57b14fcef66e?q=80&w=800&auto=format&fit=crop',
    title: 'Japan: Cherry Blossom & Temple Journey',
    desc: 'Experience traditional temples, gardens, and authentic Japanese cuisine.',
    price: '$1,280',
    duration: '8 Days',
    groupSize: '3-12 people',
    highlights: ['Cherry Blossoms', 'Temple Tours', 'Tea Ceremony', 'Local Cuisine'],
  },
  {
    id: 4,
    dest: 'Iceland',
    badge: 'Adventure',
    img: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe3e?q=80&w=800&auto=format&fit=crop',
    title: 'Iceland: Waterfalls, Glaciers & Northern Lights',
    desc: 'Explore dramatic landscapes, chase aurora, and experience Icelandic nature.',
    price: '$1,650',
    duration: '6 Days',
    groupSize: '2-12 people',
    highlights: ['Northern Lights', 'Waterfalls', 'Glacier Tours', 'Hot Springs'],
  },
  {
    id: 5,
    dest: 'Morocco',
    badge: 'Exotic Experience',
    img: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=800&auto=format&fit=crop',
    title: 'Morocco: Desert Dunes & Medina Magic',
    desc: 'Discover Sahara desert camps, bustling medinas, and Atlas Mountain trekking.',
    price: '$890',
    duration: '6 Days',
    groupSize: '4-15 people',
    highlights: ['Sahara Desert', 'Medina Exploration', 'Mountain Trekking', 'Camel Rides'],
  },
  {
    id: 6,
    dest: 'Greece',
    badge: 'Mediterranean',
    img: 'https://images.unsplash.com/photo-1613395877297-d5f46a4fae59?q=80&w=800&auto=format&fit=crop',
    title: 'Greece: Aegean Islands & Ancient Ruins',
    desc: 'Island hopping with pristine beaches, ancient temples, and sunset dinners.',
    price: '$1,120',
    duration: '7 Days',
    groupSize: '2-14 people',
    highlights: ['Island Hopping', 'Ancient Ruins', 'Beach Days', 'Local Wine Tasting'],
  },
];

export default function TourPackagesPage() {
  const navigate = useNavigate();

  const handlePackageClick = (dest) => {
    navigate(`/destination/${encodeURIComponent(dest)}`);
  };

  return (
    <div className="min-h-screen bg-cream-100 text-ink-800 font-sans flex flex-col">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-cream-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-olive-600 hover:text-olive-700 transition-colors duration-300 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </button>
        </div>
      </header>

      <main className="flex-1 w-full">
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="mb-16 space-y-3">
            <h1 className="font-serif text-4xl sm:text-5xl font-medium text-ink-900">Tour Packages</h1>
            <p className="text-ink-700/60 text-base sm:text-lg">
              All-inclusive packages backed by resilient scraper verification
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:gap-8">
            {TOUR_PACKAGES.map((pkg) => (
              <div
                key={pkg.id}
                onClick={() => handlePackageClick(pkg.dest)}
                className="group bg-white rounded-[22px] overflow-hidden cursor-pointer shadow-sm hover:shadow-lg transition-all duration-500"
              >
                <div className="flex flex-col sm:flex-row">
                  <div className="relative h-64 sm:h-80 sm:w-80 flex-shrink-0 overflow-hidden">
                    <img
                      src={pkg.img}
                      alt={pkg.title}
                      className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-700 ease-out"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-white/90 text-ink-800">
                        {pkg.badge}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 p-6 sm:p-8 space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <h2 className="font-medium text-ink-900 text-xl sm:text-2xl group-hover:text-olive-700 transition-colors duration-300 leading-snug">
                        {pkg.title}
                      </h2>
                      <p className="text-sm text-ink-700/70 leading-relaxed">{pkg.desc}</p>

                      <div className="flex flex-wrap gap-4 pt-4 text-sm text-ink-700/60">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-olive-600" />
                          <span>{pkg.duration}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-olive-600" />
                          <span>{pkg.groupSize}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-olive-600" />
                          <span>{pkg.dest}</span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <p className="text-xs text-ink-700/50 mb-2 font-medium uppercase tracking-wider">Highlights</p>
                        <div className="flex flex-wrap gap-2">
                          {pkg.highlights.map((h, idx) => (
                            <span key={idx} className="px-3 py-1 rounded-full text-xs bg-olive-50 text-olive-700 font-medium">
                              {h}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-cream-200">
                      <div>
                        <span className="text-2xl font-semibold text-olive-700">{pkg.price}</span>
                        <span className="text-xs font-normal text-ink-700/45"> / person</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePackageClick(pkg.dest);
                        }}
                        className="px-6 py-2.5 rounded-full bg-olive-600 hover:bg-olive-500 text-white font-medium text-sm flex items-center gap-2 transition-all duration-300 group-hover:translate-x-1"
                      >
                        Explore <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="py-12 px-4 sm:px-6 lg:px-8 mt-20">
        <div className="max-w-6xl mx-auto text-center text-xs text-ink-700/40">
          <span>© 2026 Voyalette. Zero-LLM Architecture.</span>
        </div>
      </footer>
    </div>
  );
}
