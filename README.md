# ✈️ Voyalette — Self-Healing Bright Data Travel Discovery Platform

> Real scraped travel data. No hallucinations, just facts.

Voyalette is a travel discovery web app powered by a **Self-Healing Bright Data Scraper Engine (Zero-LLM)**. It pulls live hotel and attraction data via Bright Data, validates and repairs it in real time, and serves it through a premium travel UI — with a public dashboard showing exactly how healthy the scraper is at any moment.

**🔗 Live App:** [web-quest-iota.vercel.app](https://web-quest-iota.vercel.app/)
**💻 Repo:** [github.com/pavaniiiii26/WebQuest](https://github.com/pavaniiiii26/WebQuest)
**▶️ YouTube DemoVideo** [https://www.youtube.com/watch?v=BTOiCM9XXg8](https://www.youtube.com/watch?v=BTOiCM9XXg8)

<img width="640" height="416" alt="WhatsApp Image 2026-08-22 at 1 50 19 PM" src="https://github.com/user-attachments/assets/d47e3e87-257f-4c3e-9fd1-c756f23293fd" />
<!-- SCREENSHOT 1: Full landing page — hero + search bar. This is the first thing a judge sees, put your best shot here. -->

---

## 🏆 Judging Criteria — Where to Look

[#judging-criteria--where-to-look](#judging-criteria--where-to-look)

| # | Criterion | Where it's addressed |
|---|---|---|
| 01 | **Potential impact** | [The Problem](#the-problem) / [What Voyalette Does](#what-voyalette-does) — real, current travel data instead of paid APIs or AI hallucination |
| 02 | **Creativity & innovation** | [Self-Healing Scraper Pipeline](#self-healing-scraper-pipeline) — a Zero-LLM, deterministic recovery layer most scraping projects don't build |
| 03 | **Technical excellence** | [Bright Data Integration](#bright-data-integration), [Architecture](#architecture), [Project Structure](#project-structure) — full-stack, validated, retried, cached, monitored end-to-end |
| 04 | **Use of Scraper Studio** | [Use of Bright Data Scraper Studio](#use-of-bright-data-scraper-studio) — Scraper Studio was central to building the hotel/attraction collectors |
| 05 | **Reliability & self-healing** | [Self-Healing Scraper Pipeline](#self-healing-scraper-pipeline), [Scraper Health Monitor](#scraper-health-monitor), [See Self-Healing in Action](#see-self-healing-in-action) |
| 06 | **Presentation** | This README end-to-end, plus the live [Scraper Health Monitor](#scraper-health-monitor) dashboard as a demo aid |

---

## 📌 Table of Contents

- [The Problem](#the-problem)
- [What Voyalette Does](#what-voyalette-does)
- [What Is Web Scraping?](#what-is-web-scraping)
- [Why Web Scraping (Not an API, Not an LLM)](#why-web-scraping-not-an-api-not-an-llm)
- [Bright Data Integration](#bright-data-integration)
- [Use of Bright Data Scraper Studio](#use-of-bright-data-scraper-studio)
- [Self-Healing Scraper Pipeline](#self-healing-scraper-pipeline)
- [Scraper Health Monitor](#scraper-health-monitor)
- [See Self-Healing in Action](#see-self-healing-in-action)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Getting Started](#getting-started)
- [Challenges & What We Learned](#challenges--what-we-learned)
- [What's Next](#whats-next)
- [Screenshots](#screenshots)
- [Team](#team)

---

## The Problem

[#the-problem](#the-problem)

Travel prices, hotel availability, and attraction details change by the hour. Most travel apps either:
1. Use paid, gated travel APIs (expensive, rate-limited, restrictive), or
2. Use AI/LLMs to "generate" travel suggestions — which means hallucinated prices, fake hotel names, and made-up availability.

Neither gets you **real, current** data cheaply. Web scraping does — but scrapers are fragile. A single site redesign, a renamed field, or a blocked request can silently break the whole pipeline and nobody notices until the app is showing garbage.

## What Voyalette Does

[#what-voyalette-does](#what-voyalette-does)

Voyalette is a travel discovery platform where every listing — hotel, price, attraction, image — comes from a live or freshly cached scrape, never from a generative model. Users can:

- Browse **8 popular destinations** (Singapore, Australia, Thailand, Nepal, Tibet, Switzerland, South Korea, Bali) on the discovery page.
- See **Last Minute Deals**, **Winter Special Trips**, and curated **Tour Packages**.
- Search by destination, check-in/check-out dates, and guest count to trigger a live scrape.
- Open a **destination detail page** with a full-bleed hero, floating booking widget, and a gallery of real properties with real prices.
- (For judges/devs) View the scraper's live health at `/api/scraper-health` — see exactly which fields came from which fallback path, what got dropped, and why.

<img width="640" height="416" alt="WhatsApp Image 2026-08-22 at 1 51 37 PM" src="https://github.com/user-attachments/assets/62260c35-4d2c-4f19-a516-dd1910049ee6" />

<!-- SCREENSHOT 2: A destination page (e.g. Bali) showing hero image, booking widget, and property gallery. -->

## What Is Web Scraping?

[#what-is-web-scraping](#what-is-web-scraping)

Web scraping is the automated extraction of data from websites — a program visits a page (or requests its underlying HTML/JSON), reads the content, and pulls out specific pieces of information (like a hotel name, price, or rating) into a structured format such as JSON.

A basic scraper is just: **fetch the page → parse the HTML → find the data you want using selectors (CSS classes, IDs, tags) → save it.** In practice this is what makes scraping powerful but also fragile:

- **Powerful** — because it works on any public site, regardless of whether that site offers an official API. If a hotel booking site shows a price on the page, a scraper can extract it, even if the company never built a developer API for it.
- **Fragile** — because a scraper depends on the page's structure staying the same. If a site renames a CSS class, restructures its HTML, or starts blocking automated requests, a naive scraper breaks instantly and either crashes or silently returns wrong/empty data.

Websites also actively try to detect and block scrapers (rate limiting, CAPTCHAs, IP bans, bot-detection scripts), which is why production-grade scraping usually needs infrastructure like proxy rotation and headless browsers — this is exactly the problem Bright Data solves for us, and why we built the self-healing layer on top: to survive the *content* changing even when the *access* problem is solved.

## Why Web Scraping (Not an API, Not an LLM)

[#why-web-scraping-not-an-api-not-an-llm](#why-web-scraping-not-an-api-not-an-llm)

We chose scraping deliberately, for the hackathon's "scrapeverse" theme and for the product itself:

- **Freshness** — prices and availability change constantly; a scrape done minutes ago beats a stale API cache or a model's training-data guess.
- **Coverage** — no single travel API covers hotels + attractions + pricing for 8+ countries without a paid tier.
- **Trust** — an LLM asked "what hotels are in Bali under $100" will confidently invent names and prices. A scraper either returns a real listing or admits it has none.
- **Cost** — Bright Data's infrastructure (proxy network + Dataset API) handles the anti-bot/anti-block problem that makes scraping unreliable at scale, without us needing to run our own proxy farm.

The tradeoff is fragility — scrapers break when source sites change. That's the problem the self-healing layer below exists to solve.

## Bright Data Integration

[#bright-data-integration](#bright-data-integration)

Voyalette uses Bright Data across three layers, so the app never fully depends on one method succeeding:

| Layer | What it does |
|---|---|
| **Scraper Studio** | Used to visually build and configure the hotel and attraction collectors — defining the target fields, pagination, and extraction rules that back our Dataset IDs (`gd_l1v83015112o9h5h77`, `gd_l1v83015112o9h5h88`). This is where the scraping logic originates, before any of our own code runs. |
| **Dataset API** | Triggers a collection run (`trigger` → `snapshot_id`) then polls `progress` until the snapshot is ready, then downloads it. This is the primary runtime path — pulling from the collectors built in Scraper Studio. |
| **Web Unlocker (fallback)** | If a dataset isn't available or the trigger fails, the backend falls back to Bright Data's Web Unlocker, fetching raw HTML and parsing it server-side with Cheerio. |

```
BRIGHTDATA_API_TOKEN=your_brightdata_api_token_here
BRIGHTDATA_HOTELS_DATASET_ID=gd_l1v83015112o9h5h77
BRIGHTDATA_ATTRACTIONS_DATASET_ID=gd_l1v83015112o9h5h88
```

<img width="1883" height="607" alt="image" src="https://github.com/user-attachments/assets/51333a23-8fc3-48ee-8ffe-3255a72bbfeb" />

<!-- SCREENSHOT 3: Your Bright Data dashboard — dataset config, or a snapshot/collection run in progress. Proves you actually used the platform live. -->

## Use of Bright Data Scraper Studio

[#use-of-bright-data-scraper-studio](#use-of-bright-data-scraper-studio)

Scraper Studio was central to how this project's data pipeline was built, not just an afterthought — it's where we defined the collectors that our Dataset API calls run against:

- **Collector design** — used Scraper Studio's visual builder to define the target site structure for hotels and attractions per destination, rather than hand-writing brittle CSS-selector scrapers from scratch.
- **Field mapping** — configured which fields to extract (name, price, rating, image, location) directly in Scraper Studio, which is also *why* our self-healing field-fallback logic exists downstream — Scraper Studio gives us the primary extraction path, and our own code adds the fallback paths for when a site changes shape between collector runs.
- **Dataset IDs** — the two dataset IDs in our `.env` (`BRIGHTDATA_HOTELS_DATASET_ID`, `BRIGHTDATA_ATTRACTIONS_DATASET_ID`) are the collectors we configured in Scraper Studio, triggered at runtime via the Dataset API.


## Self-Healing Scraper Pipeline

[#self-healing-scraper-pipeline](#self-healing-scraper-pipeline)

This is the core engineering differentiator of the project: a **Zero-LLM, fully deterministic** pipeline that keeps working even when the scrape target changes shape.

| Layer | Strategy | Behavior |
|---|---|---|
| **Field Extraction** | Multi-key fallbacks | e.g. `pricePerNight` tries `price` → `price_per_night` → `rate` → `cost` → regex symbol match, in order, until one succeeds |
| **Validation** | Zod `safeParse` | Every record is validated against `HotelSchema` / `AttractionSchema`. Malformed records are dropped and logged, not silently passed through |
| **Retry** | Exponential backoff | Up to 3 retries (500ms → 1000ms → 1500ms) on network/timeout failures before giving up on a live fetch |
| **Cache Fallback** | Local JSON seed cache | If a live scrape returns 0 valid records, the API serves the last known-good cached data, flagged `isStale: true` with a timestamp |
| **Isolation** | Per-record try/catch | One malformed hotel record can't take down the rest of the batch — each record is processed independently |

The result: the app degrades gracefully instead of failing loudly. A user searching Bali during a scrape hiccup sees slightly-stale-but-real data with a "stale" flag, not a blank page or a fake AI-generated listing.

<img width="640" height="416" alt="image" src="https://github.com/user-attachments/assets/18ee0c62-f34d-403c-811c-f82bafb3d366" />

<!-- SCREENSHOT 4: If you have an architecture/flow diagram of the pipeline (trigger → validate → retry → cache), put it here. If not, consider adding one — it's a strong visual for judges. -->

## Scraper Health Monitor

[#scraper-health-monitor](#scraper-health-monitor)

Live at **`GET /api/scraper-health`** — this is the transparency layer that proves the self-healing claims aren't just marketing copy.

It shows, in real time:
- Which extraction method succeeded per field (primary key vs. which fallback)
- Count of valid vs. dropped records per scrape run
- Retry counts and backoff timing per request
- Whether the last response served was live or cache-degraded (`isStale`)
- A structured audit log of every scrape attempt

<img width="640" height="416" alt="image" src="https://github.com/user-attachments/assets/04088bb1-0a58-44ac-bc95-d9f56c59e0c4" />

<!-- SCREENSHOT 5: Screenshot of the actual /api/scraper-health JSON response or a rendered dashboard view of it. This is your #1 differentiator screenshot — make sure it's clear and legible, zoom in if it's raw JSON. -->

## See Self-Healing in Action

[#see-self-healing-in-action](#see-self-healing-in-action)

This is the section to walk judges through live during the demo — it's one thing to claim self-healing, another to show it failing and recovering in real time.

1. **Trigger a normal search** — e.g. search "Bali" on the discovery page. Note the response is fast and comes from a live scrape.
2. **Break something** — temporarily invalidate the `BRIGHTDATA_API_TOKEN` in `backend/.env`, or simulate a field-shape change (rename a key the scraper expects).
3. **Search again** — the app doesn't crash or show a blank page. Instead:
   - The self-healing engine tries field fallbacks and retries with exponential backoff.
   - If all live attempts fail, it degrades gracefully to `cache.json`, and the API response includes `isStale: true` with a timestamp.
4. **Open `/api/scraper-health`** (or the in-app `Dashboard.jsx` view) — the failure, the fallback path taken, and the retry attempts are all logged there, not hidden.
5. **Fix the token / field mapping** — search again and show the pipeline recovering to live data automatically, no restart needed.

<img width="1280" height="260" alt="WhatsApp Image 2026-08-22 at 4 23 10 PM" src="https://github.com/user-attachments/assets/563ffa04-87d4-4fec-a5e8-b6c8429ee9c4" />
<!-- SCREENSHOT 7 (or GIF): A short before/during/after sequence — normal search, a healing/failure state (RepairTimeline.jsx or LiveLogs.jsx catching the event), then recovery. A GIF here is worth more than any other single asset in this README for criterion #5. -->

## Tech Stack

[#tech-stack](#tech-stack)

- **Frontend:** React (Vite), Tailwind CSS, Framer Motion (shared-element transitions)
- **Backend:** Node.js, Express
- **Scraping:** Bright Data Scraper Studio (collector design) + Dataset API + Web Unlocker fallback, Cheerio (HTML parsing)
- **Validation:** Zod
- **Deployment:** Vercel (frontend + backend)

## Architecture

[#architecture](#architecture)

```
User search → Express API (/api/search)
                 │
                 ▼
        Bright Data Dataset API
        (trigger → snapshot_id → poll → download)
                 │
         success │ fail
                 ▼         ▼
        Zod validation   Web Unlocker + Cheerio fallback
                 │                  │
                 ▼                  ▼
        Valid records         Zod validation
                 │                  │
                 └────────┬─────────┘
                          ▼
              0 valid records? → serve cached JSON (isStale: true)
              else            → serve fresh records + log to /api/scraper-health
```

## Project Structure

[#project-structure](#project-structure)

```
WebQuest/
├── backend/
│   ├── config/
│   │   └── env.js                    # loads/validates env vars
│   ├── data/
│   │   ├── demo/                     # sample/seed data for offline demo
│   │   └── cache.json                # last-known-good cache (isStale fallback)
│   ├── models/                       # data models
│   ├── routes/
│   │   ├── destinations.js           # GET /api/destinations, /api/destinations/:name
│   │   ├── health.js                 # GET /api/scraper-health
│   │   └── search.js                 # POST /api/search
│   ├── schemas/
│   │   └── travelSchemas.js          # Zod HotelSchema / AttractionSchema
│   ├── services/
│   │   ├── brightdataService.js      # Dataset API trigger → snapshot → poll → download + Web Unlocker fallback
│   │   ├── cacheService.js           # reads/writes cache.json, staleness flagging
│   │   └── selfHealingEngine.js      # field fallbacks, retries, per-record isolation, audit logging
│   ├── .env / .env.example
│   ├── package.json
│   └── server.js                     # Express app entrypoint
│
├── frontend/
│   ├── public/
│   │   ├── favicon.png
│   │   └── icons.svg
│   ├── src/
│   │   ├── assets/
│   │   │   ├── hero.png
│   │   │   └── vite.svg
│   │   ├── components/
│   │   │   ├── AttractionCard.jsx
│   │   │   ├── BudgetChart.jsx
│   │   │   ├── ControlBar.jsx
│   │   │   ├── DestinationHero.jsx
│   │   │   ├── DestinationSlider.jsx
│   │   │   ├── ExtractedDataGrid.jsx
│   │   │   ├── FailurePanel.jsx      # shows dropped/failed scrape records
│   │   │   ├── GuideOutput.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── HealingPanel.jsx      # self-healing detail view
│   │   │   ├── HealingStatusBar.jsx  # live self-healing status indicator
│   │   │   ├── HistoryDrawer.jsx
│   │   │   ├── HotelCard.jsx
│   │   │   ├── ItineraryMap.jsx
│   │   │   ├── LiveLogs.jsx          # streams scraper audit logs
│   │   │   ├── PlaceCard.jsx
│   │   │   ├── PlaceLightbox.jsx
│   │   │   ├── ProgressPanel.jsx
│   │   │   ├── ProgressRail.jsx
│   │   │   ├── RepairTimeline.jsx    # visual timeline of fallback/retry events
│   │   │   ├── ScraperHealthModal.jsx
│   │   │   ├── SelectorComparison.jsx # primary vs fallback selector diff view
│   │   │   ├── SkeletonCard.jsx
│   │   │   └── StarRating.jsx
│   │   ├── data/
│   │   │   └── destinationsData.js
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx         # scraper health / monitoring dashboard
│   │   │   ├── DetailPage.jsx        # destination detail view
│   │   │   ├── ExperiencePage.jsx
│   │   │   ├── GuidePage.jsx
│   │   │   ├── HomePage.jsx
│   │   │   ├── ItineraryPage.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── SearchPage.jsx
│   │   │   └── SeasonalSpecialsPage.jsx
│   │   ├── services/
│   │   │   └── api.js                # fetch wrappers for backend endpoints
│   │   ├── utils/
│   │   │   └── trip.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   └── style.css
│   ├── .env.example
│   ├── index.html
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── vite.config.js
│   └── package.json
│
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

**Key files to highlight in your hackathon demo:**
- `backend/services/brightdataService.js` — Dataset API + Web Unlocker integration
- `backend/services/selfHealingEngine.js` — the core self-healing logic: field fallbacks, retries, isolation
- `backend/services/cacheService.js` + `backend/data/cache.json` — graceful degradation to stale cache
- `backend/schemas/travelSchemas.js` — Zod validation layer
- `frontend/src/pages/Dashboard.jsx` — the live scraper health / monitoring view
- `frontend/src/components/HealingPanel.jsx`, `HealingStatusBar.jsx`, `RepairTimeline.jsx`, `LiveLogs.jsx`, `SelectorComparison.jsx`, `FailurePanel.jsx` — the UI layer that visualizes self-healing in real time; great screenshot material for the "Scraper Health Monitor" section

## API Endpoints

[#api-endpoints](#api-endpoints)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/destinations` | List popular destinations (Singapore, Australia, Thailand, Nepal, Tibet, Switzerland, South Korea, Bali) |
| `GET` | `/api/destinations/:name` | Get cached/live detail for a specific destination |
| `POST` | `/api/search` | Trigger the self-healing hotel + attraction scrape pipeline for `{ destination, checkIn, checkOut, guests }` |
| `GET` | `/api/scraper-health` | Live audit logs and scraper health stats |

## Getting Started

[#getting-started](#getting-started)

### 1. Environment Setup

Create `backend/.env`:

```
BRIGHTDATA_API_TOKEN=your_brightdata_api_token_here
BRIGHTDATA_HOTELS_DATASET_ID=gd_l1v83015112o9h5h77
BRIGHTDATA_ATTRACTIONS_DATASET_ID=gd_l1v83015112o9h5h88
PORT=3001
NODE_ENV=development
```

### 2. Start Backend

```bash
cd backend
npm install
npm run dev
```
> Runs on `http://localhost:3001`

### 3. Start Frontend

```bash
cd frontend
npm install
npm run dev
```
> Runs on `http://localhost:5173`

## Challenges & What We Learned

[#challenges--what-we-learned](#challenges--what-we-learned)

- **Inconsistent field shapes across sources** — different sites/collectors expose price, rating, and location data under different keys. This is what pushed us toward the multi-key field-fallback design rather than a single hardcoded selector per field.
- **Retry cost vs. latency tradeoff** — retrying every failed fetch aggressively would slow down the user-facing search. We tuned the backoff (500ms → 1000ms → 1500ms, capped at 3 attempts) to fail fast enough to fall back to cache without making the user wait too long.
- **Silent failures are worse than loud ones** — early versions of the pipeline would return empty or partial data with no indication anything went wrong. Building `/api/scraper-health` and the audit logging forced us to surface every fallback and drop instead of hiding it.
- **Scraper Studio vs. custom fallback logic** — Scraper Studio handles the primary collection reliably, but real-world scraping still needs an application-level safety net for when a collector's output doesn't match the frontend's expectations (missing fields, stale runs, etc.) — that gap is exactly what `selfHealingEngine.js` fills.

## What's Next

[#whats-next](#whats-next)

- Expand beyond 8 destinations using additional Scraper Studio collectors.
- Real booking/checkout integration instead of discovery-only.
- Historical price tracking per destination (using repeated Dataset API snapshots over time) to power "best time to book" recommendations.
- Alerting on `/api/scraper-health` (e.g. notify if a collector's failure rate crosses a threshold) instead of requiring someone to check the dashboard manually.
- User accounts and saved itineraries.

## Screenshots

[#screenshots](#screenshots)

| # | File | What it shows | Where it's used above |
|---|---|---|---|
| 1 | `01-homepage-hero.png` | Landing page, hero + search bar | Top of README |
| 2 | `02-destination-detail.png` | A destination detail page (hero, booking widget, gallery) | "What Voyalette Does" |
| 3 | `03-brightdata-dashboard.png` | Bright Data dashboard / dataset / collection run | "Bright Data Integration" |
| 4 | `04-self-healing-diagram.png` | Pipeline/architecture diagram (optional but recommended) | "Self-Healing Scraper Pipeline" |
| 5 | `05-scraper-health.png` | `/api/scraper-health` response or dashboard | "Scraper Health Monitor" |
| 6 | `06-self-healing-demo.png` (or `.gif`) | Before/during/after: normal search → simulated failure → healing → recovery | "See Self-Healing in Action" |

**Priority order if you're short on time:** #6 (Scraper Studio) and #7 (self-healing demo, ideally a GIF) matter most — they directly prove judging criteria #4 and #5, which are otherwise the easiest to lose points on since they require *evidence*, not just a description.

**Placement rule of thumb:** put a screenshot directly under the section it proves, not all bunched at the top or bottom. Judges skim — each screenshot should back up the claim made in the text right above it. Save all images into a `/screenshots` folder in the repo root so the relative paths above resolve correctly on GitHub.

## Team

[#team](#team)

Built for the ScrapeVerse Hackathon BrightData, Team Members: Pavani Patel, Anurag Ghosh
