/**
 * MongoDB Central Service
 *
 * Handles database bootstrapping, seeding, and aggregate queries for AutoHeal Scraper.
 */

import Scraper from '../models/Scraper.js';

export async function ensureDefaultScraper() {
  try {
    const count = await Scraper.countDocuments();
    if (count === 0) {
      const defaultScraper = await Scraper.create({
        name: 'Luxury Hotel Listings Scraper',
        targetUrl: 'https://demo-hotels.brightdata-showcase.com/listings',
        targetDomVersion: 'v1_classic',
        status: 'healthy',
        expectedCount: 20,
        selectors: {
          card: '.hotel-card',
          name: '.hotel-name',
          price: '.price',
          rating: '.rating',
          location: '.location',
          image: '.hotel-img',
        },
        previousSelectors: {
          card: null,
          name: null,
          price: null,
          rating: null,
          location: null,
          image: null,
        },
      });
      console.log('🍃 Default demo scraper initialized in MongoDB Atlas:', defaultScraper._id);
      return defaultScraper;
    }
    return await Scraper.findOne();
  } catch (error) {
    console.error('❌ Error ensuring default scraper:', error.message);
    return null;
  }
}

export default { ensureDefaultScraper };
