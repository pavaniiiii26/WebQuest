import * as cheerio from 'cheerio';
import { HotelSchema, AttractionSchema } from '../schemas/travelSchemas.js';
import { getCachedDestination, setCachedDestination } from './cacheService.js';
import {
  triggerDatasetRun,
  pollSnapshotStatus,
  fetchSnapshotData,
  fetchViaWebUnlocker,
} from './brightdataService.js';
import { config } from '../config/env.js';

// In-memory health log audit trail
const healthLogs = [];

export function getHealthLogs() {
  return healthLogs.slice(0, 50); // return last 50 attempts
}

function recordHealthLog(logEntry) {
  healthLogs.unshift({
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    ...logEntry,
  });
}

// ── Helper parsing functions ─────────────────────────────────────────────────

function parseNumber(val) {
  if (typeof val === 'number' && !isNaN(val)) return val;
  if (typeof val === 'string') {
    const cleaned = val.replace(/[^0-9.]/g, '');
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }
  return null;
}

function extractCurrency(val) {
  if (typeof val === 'string') {
    if (val.includes('$')) return 'USD';
    if (val.includes('€')) return 'EUR';
    if (val.includes('£')) return 'GBP';
    if (val.includes('₹')) return 'INR';
    if (val.includes('¥')) return 'JPY';
  }
  return 'USD';
}

function parseAmenities(val) {
  if (Array.isArray(val) && val.length > 0) {
    return val.map(s => String(s).trim());
  }
  if (typeof val === 'string' && val.length > 0) {
    return val.split(',').map(s => s.trim()).filter(Boolean);
  }
  return ['Free WiFi', 'Breakfast Included', 'Pool', 'Air Conditioning'];
}

// ── 1. Multi-strategy Extraction & Fallback for Hotels ───────────────────────

export function extractHotelWithFallbacks(rawRecord) {
  const fallbacksUsed = [];
  const fieldsFailed = [];

  // Name Strategy
  let name = rawRecord.name || rawRecord.title || rawRecord.hotel_name;
  if (!name) {
    name = rawRecord.header || rawRecord.h1 || rawRecord.propertyName;
    if (name) fallbacksUsed.push('name:header_fallback');
  }
  if (!name) fieldsFailed.push('name');

  // Price Strategy
  let price = parseNumber(rawRecord.pricePerNight ?? rawRecord.price ?? rawRecord.price_per_night);
  if (price === null) {
    price = parseNumber(rawRecord.rate ?? rawRecord.cost ?? rawRecord.price_amount);
    if (price !== null) fallbacksUsed.push('pricePerNight:cost_fallback');
  }
  if (price === null) fieldsFailed.push('pricePerNight');

  // Currency Strategy
  let currency = rawRecord.currency;
  if (!currency && typeof rawRecord.price === 'string') {
    currency = extractCurrency(rawRecord.price);
    fallbacksUsed.push('currency:regex_fallback');
  }
  currency = currency || 'USD';

  // Rating Strategy
  let rating = parseNumber(rawRecord.rating ?? rawRecord.stars ?? rawRecord.review_score);
  if (rating === null) {
    rating = 4.5;
    fallbacksUsed.push('rating:default_4.5_fallback');
  }

  // Address Strategy
  let address = rawRecord.address || rawRecord.location || rawRecord.city;
  if (!address) {
    address = rawRecord.neighborhood || 'Popular Tourist District';
    fallbacksUsed.push('address:neighborhood_fallback');
  }

  // Image URL Strategy
  let imageUrl = rawRecord.imageUrl || rawRecord.image || rawRecord.photo || rawRecord.thumbnail;
  if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
    imageUrl = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop';
    fallbacksUsed.push('imageUrl:stock_fallback');
  }

  // Amenities Strategy
  const amenities = parseAmenities(rawRecord.amenities || rawRecord.facilities || rawRecord.services);

  // Booking URL Strategy
  const url = (rawRecord.url || rawRecord.link || 'https://www.booking.com');

  const normalized = {
    name,
    pricePerNight: price ?? 250,
    currency,
    rating,
    address,
    imageUrl,
    amenities,
    url,
  };

  return { normalized, fallbacksUsed, fieldsFailed };
}

// ── 2. Multi-strategy Extraction & Fallback for Attractions ──────────────────

export function extractAttractionWithFallbacks(rawRecord) {
  const fallbacksUsed = [];
  const fieldsFailed = [];

  let name = rawRecord.name || rawRecord.title || rawRecord.heading;
  if (!name) fieldsFailed.push('name');

  let location = rawRecord.location || rawRecord.city || rawRecord.address;
  if (!location) fieldsFailed.push('location');

  let priceFrom = parseNumber(rawRecord.priceFrom ?? rawRecord.price ?? rawRecord.cost);
  if (priceFrom === null) {
    priceFrom = 50;
    fallbacksUsed.push('priceFrom:default_fallback');
  }

  let tag = rawRecord.tag;
  if (!['Winter Special', 'Last Minute', 'Tour Package'].includes(tag)) {
    tag = 'Tour Package';
    fallbacksUsed.push('tag:default_fallback');
  }

  let imageUrl = rawRecord.imageUrl || rawRecord.image || rawRecord.photo;
  if (!imageUrl || typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
    imageUrl = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop';
    fallbacksUsed.push('imageUrl:stock_fallback');
  }

  const normalized = {
    name: name || 'Scenic Guided Tour Experience',
    location: location || 'City Sightseeing District',
    priceFrom,
    currency: rawRecord.currency || 'USD',
    tag,
    imageUrl,
  };

  return { normalized, fallbacksUsed, fieldsFailed };
}

// ── 3. Server-side Cheerio HTML Parsing (Web Unlocker Fallback) ─────────────

function parseHtmlForHotels(html, destination) {
  const $ = cheerio.load(html);
  const hotels = [];

  $('.hotel-card, .property-card, [data-testid="property-card"]').each((_, el) => {
    try {
      const name = $(el).find('.hotel-name, .property-title, h3').first().text().trim();
      const priceText = $(el).find('.price, .bui-price-display__value').first().text().trim();
      const ratingText = $(el).find('.rating, .bui-review-score__badge').first().text().trim();
      const image = $(el).find('img').attr('src');
      const address = $(el).find('.address, .location').first().text().trim();

      if (name) {
        hotels.push({
          name,
          pricePerNight: parseNumber(priceText) || 280,
          currency: extractCurrency(priceText),
          rating: parseNumber(ratingText) || 4.7,
          address: address || `${destination} Tourist Center`,
          imageUrl: image && image.startsWith('http') ? image : 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800&auto=format&fit=crop',
          amenities: ['Free WiFi', 'Breakfast Included', 'Pool'],
          url: 'https://www.booking.com',
        });
      }
    } catch (_) {}
  });

  return hotels;
}

// ── 4. Main Self-Healing Scraper Pipeline ────────────────────────────────────

export async function executeSelfHealingScrape(searchQuery) {
  const startTime = Date.now();
  const { destination } = searchQuery;
  const destName = destination.trim();

  let liveHotels = [];
  let liveAttractions = [];
  let pipelineMethod = 'live_brightdata_dataset';
  let totalFallbacks = [];
  let totalFieldsFailed = [];
  let droppedCount = 0;
  let scrapeSuccess = false;

  // Attempt 1: Live Bright Data Dataset API with Retry and Backoff (up to 3 tries)
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      if (!config.brightDataApiToken) {
        throw new Error('Bright Data token missing, skipping to fallback');
      }

      // Trigger Bright Data Dataset runs
      const snapshotId = await triggerDatasetRun(config.hotelsDatasetId, { destination: destName });
      await pollSnapshotStatus(snapshotId, 5, 1000);
      const rawRecords = await fetchSnapshotData(snapshotId);

      // Normalize & validate raw hotel records with per-record try/catch
      rawRecords.forEach((raw) => {
        try {
          const { normalized, fallbacksUsed, fieldsFailed } = extractHotelWithFallbacks(raw);
          totalFallbacks.push(...fallbacksUsed);
          totalFieldsFailed.push(...fieldsFailed);

          const validationResult = HotelSchema.safeParse(normalized);
          if (validationResult.success) {
            liveHotels.push(validationResult.data);
          } else {
            droppedCount++;
          }
        } catch (_) {
          droppedCount++;
        }
      });

      if (liveHotels.length >= 1) {
        scrapeSuccess = true;
        break; // Success! Break retry loop
      }
    } catch (err) {
      console.warn(`[Self-Healing] Live Bright Data Attempt ${attempt} failed: ${err.message}`);
      if (attempt < 3) {
        // Exponential backoff delay
        await new Promise((r) => setTimeout(r, attempt * 500));
      }
    }
  }

  // Attempt 2: Fallback to Bright Data Web Unlocker HTML Parse if Dataset API yielded < 1 items
  if (!scrapeSuccess) {
    try {
      pipelineMethod = 'web_unlocker_cheerio';
      const targetUrl = `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(destName)}`;
      const html = await fetchViaWebUnlocker(targetUrl);
      const parsedHotels = parseHtmlForHotels(html, destName);

      parsedHotels.forEach((h) => {
        const validation = HotelSchema.safeParse(h);
        if (validation.success) {
          liveHotels.push(validation.data);
        }
      });

      if (liveHotels.length >= 1) {
        scrapeSuccess = true;
      }
    } catch (unlockerErr) {
      console.warn(`[Self-Healing] Web Unlocker fallback failed: ${unlockerErr.message}`);
    }
  }

  // Attempt 3: Graceful Degradation to Last-Known-Good Cache if live scrape failed or empty
  let isStale = false;
  let cachedAt = null;

  if (scrapeSuccess && liveHotels.length >= 1) {
    // Update local cache with live successful scrape results
    const cachedData = getCachedDestination(destName);
    liveAttractions = cachedData.attractions || [];
    
    setCachedDestination(destName, {
      destination: destName,
      country: cachedData.country || destName,
      tagline: cachedData.tagline || `Explore top spots in ${destName}`,
      description: cachedData.description || `Discover hotels and attractions in ${destName}`,
      imageUrl: cachedData.imageUrl || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop',
      hotels: liveHotels,
      attractions: liveAttractions,
    });
    cachedAt = new Date().toISOString();
  } else {
    // Live scrape failed or yielded 0 items -> Serve last known good cache!
    pipelineMethod = 'stale_cache_fallback';
    isStale = true;
    const cachedData = getCachedDestination(destName);
    liveHotels = cachedData.hotels || [];
    liveAttractions = cachedData.attractions || [];
    cachedAt = cachedData.cachedAt || new Date().toISOString();
  }

  const durationMs = Date.now() - startTime;

  // Record audit health log
  recordHealthLog({
    destination: destName,
    datasetUsed: config.hotelsDatasetId,
    method: pipelineMethod,
    fieldsFailed: [...new Set(totalFieldsFailed)],
    fallbacksUsed: [...new Set(totalFallbacks)],
    totalExtracted: liveHotels.length + droppedCount,
    validCount: liveHotels.length,
    droppedCount,
    isStale,
    cachedAt,
    durationMs,
  });

  return {
    destination: destName,
    hotels: liveHotels,
    attractions: liveAttractions,
    deals: liveAttractions.slice(0, 3),
    isStale,
    cachedAt,
    healthLog: getHealthLogs()[0],
  };
}
