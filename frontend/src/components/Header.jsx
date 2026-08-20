import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, ShieldCheck, Phone, User } from 'lucide-react';
import ScraperHealthModal from './ScraperHealthModal.jsx';

export default function Header({ isTransparent = false }) {
  const [showHealthModal, setShowHealthModal] = useState(false);

  return (
    <>
      <header
        className={`w-full z-40 transition-colors ${
          isTransparent
            ? 'bg-gradient-to-b from-black/70 to-transparent text-white absolute top-0 left-0'
            : 'bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-white sticky top-0'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30 group-hover:scale-105 transition-transform">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white font-sans">
                GoExplore<span className="text-blue-500">.</span>
              </span>
              <span className="text-[10px] uppercase font-semibold text-blue-400 tracking-wider">
                TravelGenie Scraper Engine
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link to="/" className="hover:text-blue-400 transition-colors">
              Destinations
            </Link>
            <a href="#deals" className="hover:text-blue-400 transition-colors">
              Last Minute Deals
            </a>
            <a href="#specials" className="hover:text-blue-400 transition-colors">
              Winter Specials
            </a>
            <a href="#tours" className="hover:text-blue-400 transition-colors">
              Tour Packages
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowHealthModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Scraper Health</span>
            </button>

            <a
              href="tel:+18005550199"
              className="hidden lg:flex items-center gap-2 text-xs text-slate-300 hover:text-white"
            >
              <Phone className="w-3.5 h-3.5 text-blue-400" />
              <span>+1 (800) 555-0199</span>
            </a>

            <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm shadow-md shadow-blue-600/20 hover:shadow-blue-600/40 transition-all">
              <User className="w-4 h-4" />
              <span>Sign In</span>
            </button>
          </div>
        </div>
      </header>

      {showHealthModal && (
        <ScraperHealthModal onClose={() => setShowHealthModal(false)} />
      )}
    </>
  );
}
