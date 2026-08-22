import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';

import { config } from './config/env.js';
import destinationsRouter from './routes/destinations.js';
import searchRouter from './routes/search.js';
import healthRouter from './routes/health.js';
import { readCache } from './services/cacheService.js';

const app = express();
const PORT = config.port;

// Initialize cache seed on startup
readCache();

// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://web-quest-iota.vercel.app',
];

app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        /^https?:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)
      ) {
        callback(null, true);
        return;
      }

      callback(new Error('Origin is not allowed by CORS'));
    },
    credentials: true,
  })
);

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── Rate limiting ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests — please wait a moment before trying again.' },
});

app.use(limiter);

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/destinations', destinationsRouter);
app.use('/api/search', searchRouter);
app.use('/api/scraper-health', healthRouter);

// ── System Health Check ───────────────────────────────────────────────────────
app.get('/health', (_req, res) =>
  res.json({
    ok: true,
    app: 'Voyalette Discovery Platform',
    engine: 'Bright Data Self-Healing Engine (Zero-LLM)',
    cacheStorage: 'Local Seed JSON Cache',
  })
);

// ── Start Server ──────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✈️  Voyalette Backend running on http://localhost:${PORT}`);
  console.log(`   🌐 Bright Data Token: ${config.brightDataApiToken ? 'Configured ✅' : 'Missing ⚠️'}`);
  console.log(`   🛡️  Self-Healing Engine: Active (Zero-LLM)\n`);
});
