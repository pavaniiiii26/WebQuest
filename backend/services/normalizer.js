/**
 * Normalizes raw Bright Data records into the canonical shapes
 * used throughout the app.
 *
 * Hotel:      { name, pricePerNight, currency, rating, address, url, imageUrl }
 * Attraction: { name, category, rating, description, address, imageUrl }
 */

// ── Hotels (Booking.com dataset schema) ───────────────────────────────────────
export function normalizeHotels(rawRecords) {
  if (!Array.isArray(rawRecords)) return [];

  return rawRecords
    .map(r => {
      try {
        return {
          name: r.name || r.hotel_name || r.title || 'Unknown Hotel',
          pricePerNight:
            parseFloat(r.price_per_night ?? r.price ?? r.rate ?? r.min_price ?? 0) || null,
          currency: r.currency || r.price_currency || 'USD',
          rating: parseFloat(r.rating ?? r.review_score ?? r.stars ?? 0) || null,
          address: r.address || r.location || r.full_address || '',
          url: r.url || r.hotel_url || r.link || '',
          imageUrl: r.main_photo || r.image_url || r.photo || r.thumbnail || '',
          reviewCount: parseInt(r.review_count ?? r.number_of_reviews ?? 0, 10) || 0,
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .filter(h => h.name !== 'Unknown Hotel' || h.pricePerNight !== null);
}

// ── Attractions (TripAdvisor / Google Maps dataset schema) ────────────────────
export function normalizeAttractions(rawRecords) {
  if (!Array.isArray(rawRecords)) return [];

  return rawRecords
    .map(r => {
      try {
        return {
          name: r.name || r.title || r.attraction_name || 'Unknown Attraction',
          category:
            r.category ||
            r.type ||
            r.subcategory ||
            (Array.isArray(r.categories) ? r.categories[0] : null) ||
            'Attraction',
          rating: parseFloat(r.rating ?? r.review_score ?? r.stars ?? 0) || null,
          description:
            r.description ||
            r.snippet ||
            r.about ||
            r.overview ||
            '',
          address: r.address || r.location || r.full_address || '',
          imageUrl:
            r.main_photo ||
            r.image_url ||
            r.photo ||
            r.thumbnail ||
            (Array.isArray(r.photos) ? r.photos[0] : '') ||
            '',
          reviewCount: parseInt(r.review_count ?? r.number_of_reviews ?? 0, 10) || 0,
        };
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .filter(a => a.name !== 'Unknown Attraction');
}

// ── Utility: pick the top N records by rating ─────────────────────────────────
export function topByRating(records, n = 10) {
  return [...records]
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, n);
}
