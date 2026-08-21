# ✈️ Voyalette — Self-Healing Bright Data Travel Discovery Platform

**Voyalette** is a high-performance travel discovery web application powered by a **Self-Healing Bright Data Scraper Engine (Zero-LLM)**. It features real-time hotel & attraction extraction, multi-level field fallbacks, Zod schema validation, exponential retry backoff, graceful cache degradation, structured audit logs, and a premium travel UI.

---

## 🌟 Key Features

1. **Zero-LLM Architecture**: 100% deterministic heuristic pipeline. No AI/LLM SDKs or external AI API costs.
2. **Bright Data Integration**:
   - **Dataset API**: Triggers collection runs (`trigger` -> `snapshot_id` -> `progress` polling -> `snapshot` download).
   - **Web Unlocker Fallback**: Server-side Cheerio parsing when pre-built datasets are unavailable or fail.
3. **Self-Healing Scraper Pipeline**:
   - **Multiple Field Extraction Paths**: Defines primary selectors/keys + fallback paths per field.
   - **Zod Schema Validation**: Validates every scraped object (`HotelSchema`, `AttractionSchema`). Malformed records are dropped and logged.
   - **Exponential Backoff Retries**: Up to 3 retry attempts before cache fallback.
   - **Graceful Cache Degradation**: Serves last-known-good local JSON seed cache with `isStale: true` and timestamp.
   - **Structured Failure Audit Logging**: Accessible live at `/api/scraper-health`.
   - **Per-Record Isolation**: Try/catch around each record prevents 1 bad item from breaking the batch.
4. **Dual-Page Travel UI**:
   - **Discovery Page (`/`)**: Hero with floating horizontal search bar, "Explore All Popular Locations" grid, "Last Minute Deals", "Winter Special Trips", and "Our Tour Packages".
   - **Destination Detail View (`/destination/:name`)**: Full-bleed hero image, overlaid navbar, floating booking widget, "Celebrate in Paradise" content block, and thumbnail property gallery.

---

## 🚀 Quick Start

### 1. Environment Setup
Copy `backend/.env.example` to `backend/.env` and fill in your values:
```env
BRIGHTDATA_API_TOKEN=your_brightdata_api_token_here
BRIGHTDATA_HOTELS_DATASET_ID=gd_l1v83015112o9h5h77
BRIGHTDATA_ATTRACTIONS_DATASET_ID=gd_l1v83015112o9h5h88
PORT=3001
NODE_ENV=development
```

### 2. Start Backend Server
```bash
cd backend
npm install
npm run dev
```
> Running on `http://localhost:3001`

### 3. Start Frontend UI
```bash
cd frontend
npm install
npm run dev
```
> Running on `http://localhost:5173`

---

## 🛡️ Self-Healing Strategy Breakdown

| Layer | Strategy | Behavior |
|---|---|---|
| **Field Extraction** | Multi-key fallbacks | E.g. `pricePerNight` tries `price` -> `price_per_night` -> `rate` -> `cost` -> regex symbol match. |
| **Validation** | Zod `safeParse` | Rejects records missing required fields or invalid URLs. |
| **Retry** | Exponential backoff | Up to 3 retries (500ms, 1000ms, 1500ms) on network/timeout failures. |
| **Cache Fallback** | Local JSON Seed Cache | If live scrape returns 0 valid records, serves last successful cached data with `"stale": true`. |
| **Monitoring** | `/api/scraper-health` | Real-time audit logs of extraction methods, field fallbacks, and valid vs dropped counts. |

---

## 📡 API Endpoints

- `GET /api/destinations`: List popular destinations (Singapore, Australia, Thailand, Nepal, Tibet, Switzerland, South Korea, Bali).
- `GET /api/destinations/:name`: Get cached/live detail for a specific destination.
- `POST /api/search`: Trigger self-healing hotel + attraction scrape pipeline for `{ destination, checkIn, checkOut, guests }`.
- `GET /api/scraper-health`: Audit logs and scraper health stats.
