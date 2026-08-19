/**
 * /api/generate-guide  — POST — Start a guide generation job
 * /api/guide-stream/:sessionId — GET — SSE stream of progress + LLM output
 */

import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';

import {
  createSession,
  getSession,
  pushEvent,
  attachListener,
  detachListener,
} from '../services/sessionStore.js';
import { scrapeDataset } from '../services/brightdata.js';
import { normalizeHotels, normalizeAttractions, topByRating } from '../services/normalizer.js';
import { streamItinerary, parseGuideJSON } from '../services/llm.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEMO_DATA_DIR = path.join(__dirname, '../data/demo');
const DEMO_MODE = process.env.DEMO_MODE === 'true';

const router = Router();

// ── POST /api/generate-guide ─────────────────────────────────────────────────
router.post('/generate-guide', async (req, res) => {
  const { destinations, dates, budgetLevel } = req.body;

  if (!destinations || !Array.isArray(destinations) || destinations.length === 0) {
    return res.status(400).json({ error: 'Please provide at least one destination.' });
  }

  if (destinations.length > 5) {
    return res.status(400).json({ error: 'Maximum 5 destinations allowed per guide.' });
  }

  const sessionId = uuidv4();
  createSession(sessionId);

  // Respond immediately with the session ID so the client can open SSE
  res.json({ sessionId });

  // Kick off the async pipeline (don't await — fire and forget)
  runGuidePipeline(sessionId, destinations, dates, budgetLevel).catch(err => {
    console.error(`[session ${sessionId}] Pipeline error:`, err.message);
    pushEvent(sessionId, {
      type: 'error',
      stage: 'pipeline',
      message: err.message || 'An unexpected error occurred.',
    });
  });
});

// ── GET /api/guide-stream/:sessionId ─────────────────────────────────────────
router.get('/guide-stream/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  const session = getSession(sessionId);

  if (!session) {
    return res.status(404).json({ error: 'Session not found or expired.' });
  }

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no'); // disable nginx buffering
  res.flushHeaders();

  // Send a heartbeat comment to keep the connection alive
  const heartbeat = setInterval(() => {
    try { res.write(': heartbeat\n\n'); } catch (_) {}
  }, 20000);

  attachListener(sessionId, res);

  req.on('close', () => {
    clearInterval(heartbeat);
    detachListener(sessionId, res);
  });
});

// ── Pipeline ─────────────────────────────────────────────────────────────────

async function runGuidePipeline(sessionId, destinations, dates, budgetLevel) {
  const emit = (event) => pushEvent(sessionId, event);

  emit({ type: 'progress', stage: 'started', message: 'Initialising your travel guide...' });

  // ── 1. Scrape data for each destination in parallel ────────────────────────
  const scrapedData = {};
  const dataFlags = {};

  await Promise.all(
    destinations.map(async (destination) => {
      const key = destination.trim().toLowerCase();
      scrapedData[destination] = { hotels: [], attractions: [] };
      dataFlags[destination] = { hotelsOk: false, attractionsOk: false };

      // ── Hotels ─────────────────────────────────────────────────────────────
      emit({ type: 'progress', stage: 'scraping_hotels', destination, status: 'started' });
      try {
        const rawHotels = await fetchData('hotels', destination, key);
        const hotels = topByRating(normalizeHotels(rawHotels), 8);
        scrapedData[destination].hotels = hotels;
        dataFlags[destination].hotelsOk = hotels.length > 0;
        emit({
          type: 'progress',
          stage: 'scraping_hotels',
          destination,
          status: hotels.length > 0 ? 'done' : 'empty',
          count: hotels.length,
        });
      } catch (err) {
        emit({
          type: 'progress',
          stage: 'scraping_hotels',
          destination,
          status: 'error',
          message: err.message,
        });
      }

      // ── Attractions ────────────────────────────────────────────────────────
      emit({ type: 'progress', stage: 'scraping_attractions', destination, status: 'started' });
      try {
        const rawAttractions = await fetchData('attractions', destination, key);
        const attractions = topByRating(normalizeAttractions(rawAttractions), 12);
        scrapedData[destination].attractions = attractions;
        dataFlags[destination].attractionsOk = attractions.length > 0;
        emit({
          type: 'progress',
          stage: 'scraping_attractions',
          destination,
          status: attractions.length > 0 ? 'done' : 'empty',
          count: attractions.length,
        });
      } catch (err) {
        emit({
          type: 'progress',
          stage: 'scraping_attractions',
          destination,
          status: 'error',
          message: err.message,
        });
      }
    })
  );

  // ── Check if we have any data at all ──────────────────────────────────────
  const totalHotels = Object.values(scrapedData).reduce((s, d) => s + d.hotels.length, 0);
  const totalAttractions = Object.values(scrapedData).reduce((s, d) => s + d.attractions.length, 0);

  if (totalHotels === 0 && totalAttractions === 0) {
    emit({
      type: 'error',
      stage: 'no_data',
      message:
        `Couldn't find any data for the requested destinations. ` +
        `Try a nearby major city, or enable DEMO_MODE for a cached demo.`,
    });
    return;
  }

  // ── 2. Stream LLM itinerary ────────────────────────────────────────────────
  emit({ type: 'progress', stage: 'llm_streaming', status: 'started' });

  let rawLLMOutput = '';

  try {
    rawLLMOutput = await streamItinerary(
      destinations,
      scrapedData,
      { dates, budgetLevel },
      (chunk) => {
        emit({ type: 'llm_chunk', content: chunk });
      }
    );
  } catch (err) {
    emit({
      type: 'error',
      stage: 'llm',
      message: `AI generation failed: ${err.message}`,
    });
    return;
  }

  emit({ type: 'progress', stage: 'llm_streaming', status: 'done' });

  // ── 3. Parse & validate JSON output ───────────────────────────────────────
  let guide = null;
  try {
    guide = parseGuideJSON(rawLLMOutput);
  } catch (_) {
    // Retry once with a stricter prompt — just re-use what we have
    try {
      guide = JSON.parse(rawLLMOutput.substring(
        rawLLMOutput.indexOf('{'),
        rawLLMOutput.lastIndexOf('}') + 1
      ));
    } catch (e) {
      emit({
        type: 'error',
        stage: 'parse',
        message: 'Failed to parse itinerary JSON. Please try again.',
      });
      return;
    }
  }

  // ── 4. Attach the raw scraped data too so the frontend can use real images ─
  guide._rawData = scrapedData;
  guide._dataFlags = dataFlags;

  emit({ type: 'complete', guide });
}

// ── Data fetching helper ──────────────────────────────────────────────────────

async function fetchData(type, destination, keyLower) {
  // DEMO MODE: serve cached data
  if (DEMO_MODE) {
    return getDemoData(type, keyLower);
  }

  // LIVE MODE: trigger Bright Data dataset job
  const datasetId =
    type === 'hotels'
      ? process.env.BRIGHTDATA_HOTELS_DATASET_ID
      : process.env.BRIGHTDATA_ATTRACTIONS_DATASET_ID;

  if (!datasetId) {
    throw new Error(`Dataset ID not configured for ${type}. Set BRIGHTDATA_${type.toUpperCase()}_DATASET_ID.`);
  }

  const inputParams =
    type === 'hotels'
      ? { keyword: `Hotels in ${destination}`, country: 'us' }
      : { keyword: `Top attractions in ${destination}` };

  const { records } = await scrapeDataset(datasetId, inputParams, 45000);
  return records;
}

// ── Demo data loader ─────────────────────────────────────────────────────────

const DEMO_CITY_MAP = {
  goa: 'goa',
  'north goa': 'goa',
  'south goa': 'goa',
  paris: 'paris',
  'paris, france': 'paris',
};

const _demoCache = {};

async function getDemoData(type, keyLower) {
  // Match to a known demo city
  const cityKey = DEMO_CITY_MAP[keyLower] || Object.keys(DEMO_CITY_MAP).find(k => keyLower.includes(k));

  if (!cityKey) {
    // Unknown city in demo mode — return empty (app handles gracefully)
    console.warn(`[DEMO] No cached data for "${keyLower}" — returning empty`);
    return [];
  }

  // Load JSON once and cache in memory
  if (!_demoCache[cityKey]) {
    const filePath = path.join(DEMO_DATA_DIR, `${cityKey}.json`);
    const raw = await readFile(filePath, 'utf-8');
    _demoCache[cityKey] = JSON.parse(raw);
  }

  return _demoCache[cityKey][type] || [];
}

export default router;
