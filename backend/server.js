import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import guideRouter from './routes/guide.js';

const app = express();
const PORT = process.env.PORT || 3001;

// ── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
}));

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));

// ── Rate limiting ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 60 * 1000,     // 1 minute
  max: 10,                  // 10 guide requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests — please wait a moment before trying again.' },
  skip: (req) => req.path.includes('/guide-stream'), // don't rate-limit SSE polling
});

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api', limiter, guideRouter);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ ok: true, mode: process.env.DEMO_MODE === 'true' ? 'demo' : 'live' }));

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  const mode = process.env.DEMO_MODE === 'true' ? '🎭 DEMO MODE' : '🌐 LIVE MODE';
  console.log(`\n✈️  TravelGenie backend running on http://localhost:${PORT}`);
  console.log(`   ${mode}\n`);
});
