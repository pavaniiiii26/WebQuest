import { useEffect, useState, useRef } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import ProgressPanel from '../components/ProgressPanel.jsx';
import GuideOutput from '../components/GuideOutput.jsx';
import { Globe, ArrowLeft } from 'lucide-react';

export default function GuidePage() {
  const { sessionId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const meta = location.state || {};

  const [events, setEvents] = useState([]);
  const [guide, setGuide] = useState(null);
  const [llmChunks, setLlmChunks] = useState('');
  const [fatalError, setFatalError] = useState('');
  const [phase, setPhase] = useState('progress'); // 'progress' | 'guide' | 'error'

  const esRef = useRef(null);

  useEffect(() => {
    if (!sessionId) return;

    const es = new EventSource(`http://localhost:3001/api/guide-stream/${sessionId}`);
    esRef.current = es;

    es.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data);
        handleEvent(event);
      } catch (_) {}
    };

    es.onerror = () => {
      // Only show error if we haven't completed yet
      setEvents(prev => {
        const hasComplete = prev.some(ev => ev.type === 'complete');
        if (!hasComplete) {
          setFatalError('Connection lost. Please try again.');
          setPhase('error');
        }
        return prev;
      });
      es.close();
    };

    return () => { es.close(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  function handleEvent(event) {
    setEvents(prev => [...prev, event]);

    if (event.type === 'llm_chunk') {
      setLlmChunks(prev => prev + event.content);
    }

    if (event.type === 'complete') {
      setGuide(event.guide);
      setPhase('guide');
      esRef.current?.close();
    }

    if (event.type === 'error' && event.stage !== 'scraping_hotels' && event.stage !== 'scraping_attractions') {
      // Fatal errors (non-scraping ones crash the whole pipeline)
      if (event.stage === 'no_data' || event.stage === 'llm' || event.stage === 'parse' || event.stage === 'pipeline') {
        setFatalError(event.message);
        setPhase('error');
        esRef.current?.close();
      }
    }
  }

  return (
    <div className="min-h-screen mesh-bg">

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 border-b border-white/6 bg-surface-950/80 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 rounded-lg border border-white/8 bg-white/4 px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-white/8 transition-all"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-500/20 border border-brand-500/30">
              <Globe className="h-4 w-4 text-brand-400" />
            </div>
            <span className="font-display font-bold text-white">
              Travel<span className="text-brand-400">Genie</span>
            </span>
          </div>
        </div>

        {meta.destinations && (
          <div className="hidden sm:flex items-center gap-2 flex-wrap">
            {meta.destinations.map(d => (
              <span key={d} className="chip text-xs">✈️ {d}</span>
            ))}
          </div>
        )}
      </nav>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-5xl px-4 py-8 md:px-8">

        {phase === 'error' && (
          <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
            <div className="text-5xl mb-4">😕</div>
            <h2 className="font-display text-2xl font-bold text-white mb-2">Something went wrong</h2>
            <p className="text-slate-400 max-w-md mb-6">{fatalError}</p>
            <button onClick={() => navigate('/')} className="btn-primary">
              Try Again
            </button>
          </div>
        )}

        {phase === 'progress' && (
          <ProgressPanel events={events} destinations={meta.destinations || []} llmChunks={llmChunks} />
        )}

        {phase === 'guide' && guide && (
          <GuideOutput guide={guide} meta={meta} />
        )}
      </main>
    </div>
  );
}
