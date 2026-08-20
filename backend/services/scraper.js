/**
 * Scraper Service
 *
 * Core execution engine that extracts structured records from HTML using Cheerio and selector mappings.
 */

import * as cheerio from 'cheerio';

export function executeScrape(html, selectors) {
  const startTime = Date.now();
  const $ = cheerio.load(html);

  const cardSelector = selectors.card || '.hotel-card';
  const cardElements = $(cardSelector);
  const rawCardCount = cardElements.length;

  const fieldCounts = {
    name: 0,
    price: 0,
    rating: 0,
    location: 0,
    image: 0,
  };

  const items = [];

  cardElements.each((index, el) => {
    const card = $(el);

    // Extract Name
    let name = '';
    if (selectors.name) {
      const nameEl = card.is(selectors.name) ? card : card.find(selectors.name);
      name = nameEl.first().text().trim();
      if (name) fieldCounts.name++;
    }

    // Extract Price
    let price = '';
    let priceNumber = null;
    if (selectors.price) {
      const priceEl = card.is(selectors.price) ? card : card.find(selectors.price);
      price = priceEl.first().text().trim();
      if (price) {
        fieldCounts.price++;
        const parsed = parseFloat(price.replace(/[^0-9.]/g, ''));
        if (!isNaN(parsed)) priceNumber = parsed;
      }
    }

    // Extract Rating
    let rating = '';
    let ratingNumber = null;
    if (selectors.rating) {
      const ratingEl = card.is(selectors.rating) ? card : card.find(selectors.rating);
      rating = ratingEl.first().text().trim();
      if (rating) {
        fieldCounts.rating++;
        const parsed = parseFloat(rating.replace(/[^0-9.]/g, ''));
        if (!isNaN(parsed)) ratingNumber = parsed;
      }
    }

    // Extract Location
    let location = '';
    if (selectors.location) {
      const locEl = card.is(selectors.location) ? card : card.find(selectors.location);
      location = locEl.first().text().trim();
      if (location) fieldCounts.location++;
    }

    // Extract Image
    let image = '';
    if (selectors.image) {
      const imgEl = card.is(selectors.image) ? card : card.find(selectors.image);
      image = imgEl.first().attr('src') || imgEl.first().attr('data-src') || '';
      if (image) fieldCounts.image++;
    }

    items.push({
      id: index + 1,
      name,
      price,
      priceNumber,
      rating,
      ratingNumber,
      location,
      image,
    });
  });

  const durationMs = Date.now() - startTime;

  return {
    items,
    rawCardCount,
    fieldCounts,
    durationMs,
  };
}

export default { executeScrape };
