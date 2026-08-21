import { Link, useNavigate } from 'react-router-dom';
import { Compass, Phone, User, Search } from 'lucide-react';

export default function Header({ isTransparent = false }) {
  const navigate = useNavigate();
  return (
    <header
      className={`w-full z-40 transition-colors duration-500 ${
        isTransparent
          ? 'bg-gradient-to-b from-black/50 to-transparent text-white absolute top-0 left-0'
          : 'bg-cream-100/90 backdrop-blur-md text-ink-800 sticky top-0'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-[1.04] ${
            isTransparent ? 'bg-white/15' : 'bg-olive-600'
          }`}>
            <Compass className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className={`text-lg font-serif tracking-tight ${isTransparent ? 'text-white' : 'text-ink-900'}`}>
              Voyalette
            </span>
            <span className={`text-[10px] uppercase tracking-[0.16em] ${isTransparent ? 'text-white/60' : 'text-olive-600'}`}>
              Travel discovery
            </span>
          </div>
        </Link>

        <nav className={`hidden md:flex items-center gap-8 text-sm font-medium ${
          isTransparent ? 'text-white/80' : 'text-ink-700/70'
        }`}>
          <Link to="/" className="hover:opacity-100 opacity-90 transition-opacity duration-300">
            Destinations
          </Link>
          <Link to="/specials/summer" className="hover:opacity-100 opacity-90 transition-opacity duration-300">
            Summer Specials
          </Link>
          <Link to="/specials/winter" className="hover:opacity-100 opacity-90 transition-opacity duration-300">
            Winter Specials
          </Link>
          <a href="#tours" className="hover:opacity-100 opacity-90 transition-opacity duration-300">
            Tour Packages
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <a
            href="tel:+18005550199"
            className={`hidden lg:flex items-center gap-2 text-xs ${
              isTransparent ? 'text-white/75 hover:text-white' : 'text-ink-700/60 hover:text-ink-800'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>+1 (800) 555-0199</span>
          </a>

          <button
            type="button"
            onClick={() => navigate('/search')}
            className={`p-2.5 rounded-full transition-all duration-300 ${
              isTransparent
                ? 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                : 'bg-white text-ink-700 hover:bg-cream-200'
            }`}
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          <button className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full bg-olive-600 hover:bg-olive-500 text-white font-medium text-sm transition-all duration-300">
            <User className="w-4 h-4" />
            <span>Sign In</span>
          </button>
        </div>
      </div>
    </header>
  );
}
