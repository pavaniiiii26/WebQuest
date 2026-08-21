import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AUTO_ADVANCE_MS = 6000;

const SPRING = { type: 'spring', stiffness: 90, damping: 20, mass: 0.85 };

const textContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.18 } },
  exit: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
};

const textItem = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.62, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -14,
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
  },
};

function DestinationCard({ destination, onSelect, layoutEnabled }) {
  return (
    <motion.button
      type="button"
      layout
      onClick={onSelect}
      whileHover={{ y: -6 }}
      whileTap={{ scale: 0.98 }}
      transition={SPRING}
      className="group relative z-10 flex-shrink-0 w-[148px] sm:w-[168px] h-[210px] sm:h-[232px] rounded-[22px] cursor-pointer border border-white/20 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.55)] text-left"
    >
      <motion.img
        layoutId={layoutEnabled ? `hero-photo-${destination.id}` : undefined}
        src={destination.heroImage}
        alt={destination.country}
        className="absolute inset-0 w-full h-full object-cover"
        transition={SPRING}
        style={{ borderRadius: 22 }}
        layout
      />
      <div className="absolute inset-0 rounded-[22px] bg-gradient-to-t from-black/75 via-black/10 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 p-4 space-y-0.5 pointer-events-none">
        <p className="text-[10px] uppercase tracking-[0.22em] text-white/70 font-medium">
          {destination.eyebrow}
        </p>
        <h3 className="text-[15px] font-serif font-semibold text-white leading-snug">
          {destination.country}
        </h3>
      </div>
    </motion.button>
  );
}

export default function DestinationSlider({ destinations, onSelectDestination }) {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const [suppressLayoutId, setSuppressLayoutId] = useState(null);
  const timerRef = useRef(null);
  const suppressTimerRef = useRef(null);

  const currentDest = destinations[activeIndex];
  const underlayRef = useRef(currentDest);

  useEffect(() => {
    const t = setTimeout(() => {
      underlayRef.current = currentDest;
    }, 680);
    return () => clearTimeout(t);
  }, [currentDest]);

  const peekDestinations = useMemo(() => {
    if (!destinations?.length) return [];
    const count = Math.min(3, Math.max(0, destinations.length - 1));
    const list = [];
    for (let i = 1; i <= count; i += 1) {
      list.push(destinations[(activeIndex + i) % destinations.length]);
    }
    return list;
  }, [activeIndex, destinations]);

  const goTo = useCallback((idx) => {
    if (idx === activeIndex) return;
    setSuppressLayoutId(destinations[activeIndex]?.id ?? null);
    setActiveIndex(idx);
    setProgressKey((k) => k + 1);
    clearTimeout(suppressTimerRef.current);
    suppressTimerRef.current = setTimeout(() => setSuppressLayoutId(null), 720);
  }, [activeIndex, destinations]);

  const handleNext = useCallback(
    () => goTo((activeIndex + 1) % destinations.length),
    [activeIndex, destinations.length, goTo],
  );

  const handlePrev = useCallback(
    () => goTo((activeIndex - 1 + destinations.length) % destinations.length),
    [activeIndex, destinations.length, goTo],
  );

  useEffect(() => {
    if (isHovered) return;
    timerRef.current = setTimeout(handleNext, AUTO_ADVANCE_MS);
    return () => clearTimeout(timerRef.current);
  }, [activeIndex, isHovered, handleNext]);

  useEffect(() => () => clearTimeout(suppressTimerRef.current), []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleNext, handlePrev]);

  const touchStartX = useRef(0);
  const handleTouchStart = (e) => { touchStartX.current = e.targetTouches[0].clientX; };
  const handleTouchEnd = (e) => {
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    if (dx > 50) handleNext();
    if (dx < -50) handlePrev();
  };

  if (!currentDest) return null;

  return (
    <LayoutGroup>
      <div
        className="relative w-full min-h-[100dvh] overflow-hidden bg-stone-900 text-white select-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Underlay so the previous photo never flashes empty during the morph */}
        <img
          src={underlayRef.current?.heroImage || currentDest.heroImage}
          alt=""
          className="absolute inset-0 z-0 w-full h-full object-cover"
        />

        {/* Shared-element hero image — morphs from the clicked card */}
        <motion.img
          key={currentDest.id}
          layoutId={`hero-photo-${currentDest.id}`}
          src={currentDest.heroImage}
          alt={currentDest.country}
          className="absolute inset-0 z-[1] w-full h-full object-cover"
          transition={SPRING}
          style={{ borderRadius: 0 }}
          layout
        />

        <div className="absolute inset-0 z-[2] pointer-events-none bg-gradient-to-b from-black/55 via-black/20 to-black/70" />
        <div className="absolute inset-0 z-[2] pointer-events-none bg-gradient-to-r from-black/55 via-black/10 to-transparent" />

        {/* Top nav — static, not part of the transition */}
        <header className="absolute top-0 left-0 right-0 z-40 flex items-center justify-between px-5 sm:px-10 lg:px-14 py-5">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => navigate('/')}
          >
            <span className="font-serif text-[1.35rem] tracking-[0.18em] text-white lowercase">
              tra<span className="text-olive-300">vel</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-9 text-[13px] font-medium text-white/75 tracking-wide">
            <a href="#about" className="hover:text-white transition-colors duration-300">about</a>
            <a href="#destinations" className="hover:text-white transition-colors duration-300">explore</a>
            <a href="#tours" className="hover:text-white transition-colors duration-300">destinations</a>
          </nav>

          <button
            type="button"
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/15 backdrop-blur-md transition-all duration-300"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>
        </header>

        {/* Hero copy + peeking cards */}
        <div className="relative z-20 flex flex-col lg:flex-row lg:items-end min-h-[100dvh] pt-24 pb-28">
          <div className="flex-1 flex flex-col justify-end px-6 sm:px-10 lg:px-14 pb-10 lg:pb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentDest.id + '-text'}
                variants={textContainer}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="space-y-5 max-w-xl"
              >
                <motion.p
                  variants={textItem}
                  className="text-[11px] sm:text-xs uppercase tracking-[0.32em] text-white/70"
                >
                  {currentDest.eyebrow}
                </motion.p>

                <motion.h1
                  variants={textItem}
                  className="font-serif text-[3.4rem] sm:text-7xl lg:text-[5.6rem] font-medium text-white leading-[0.95] tracking-tight"
                >
                  {currentDest.country}
                </motion.h1>

                <motion.p
                  variants={textItem}
                  className="text-sm sm:text-[15px] text-white/78 font-light leading-relaxed max-w-md"
                >
                  {currentDest.description}
                </motion.p>

                <motion.div variants={textItem} className="pt-1">
                  <button
                    type="button"
                    onClick={() => onSelectDestination && onSelectDestination(currentDest.country)}
                    className="group inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/12 hover:bg-white/22 border border-white/25 text-white text-sm font-medium backdrop-blur-md transition-all duration-300 cursor-pointer"
                  >
                    <span>Discover Location</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </button>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="w-full lg:w-auto flex-shrink-0 pl-6 sm:pl-10 lg:pl-0 lg:pr-10 pb-6 lg:pb-8">
            <motion.div
              layout
              className="flex items-end gap-3 overflow-x-auto scrollbar-none pr-6 lg:pr-0"
              transition={SPRING}
            >
              {peekDestinations.map((dest) => (
                <DestinationCard
                  key={dest.id}
                  destination={dest}
                  layoutEnabled={suppressLayoutId !== dest.id}
                  onSelect={() => goTo(destinations.findIndex((d) => d.id === dest.id))}
                />
              ))}
            </motion.div>
          </div>
        </div>

        {/* Bottom-center arrows */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5">
          <button
            type="button"
            onClick={handlePrev}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/22 text-white backdrop-blur-md border border-white/15 transition-all duration-300 cursor-pointer"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/22 text-white backdrop-blur-md border border-white/15 transition-all duration-300 cursor-pointer"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Counter */}
        <div className="absolute bottom-9 right-6 sm:right-10 lg:right-14 z-30 font-mono text-sm text-white/50 tracking-wider">
          <span className="text-white font-semibold">{activeIndex + 1}</span>
          <span className="mx-1.5">/</span>
          <span>{destinations.length}</span>
        </div>

        {/* Progress */}
        <div className="absolute bottom-0 left-0 right-0 z-40 h-[2px] bg-white/15">
          <div
            key={progressKey}
            className="hero-progress-bar h-full bg-olive-300/90"
            style={{ animationDuration: `${AUTO_ADVANCE_MS}ms` }}
          />
        </div>

        {/* Wave into the light page below */}
        <div className="absolute -bottom-px left-0 right-0 z-30 pointer-events-none leading-none">
          <svg viewBox="0 0 1440 72" preserveAspectRatio="none" className="w-full h-12 sm:h-16 fill-[#F5F2EC]">
            <path d="M0,40 C240,72 480,8 720,32 C960,56 1200,16 1440,40 L1440,72 L0,72 Z" />
          </svg>
        </div>
      </div>
    </LayoutGroup>
  );
}
